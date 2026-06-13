import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FreelancerReview {
  id: string;
  profile_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export const useFreelancerReviews = (profileId: string) => {
  return useQuery({
    queryKey: ['freelancer-reviews', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freelancer_reviews' as any)
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const reviews = data as any[];
      const enriched = await Promise.all(
        reviews.map(async (r) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', r.user_id)
            .single();
          return {
            ...r,
            reviewer_name: profile?.full_name || 'უცნობი',
            reviewer_avatar: profile?.avatar_url || null,
          } as FreelancerReview;
        })
      );
      return enriched;
    },
    enabled: !!profileId,
  });
};

export const useFreelancerAverageRating = (profileId: string) => {
  const { data: reviews } = useFreelancerReviews(profileId);
  if (!reviews || reviews.length === 0) return { average: 0, count: 0 };
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { average: Math.round(avg * 10) / 10, count: reviews.length };
};

export const useCreateFreelancerReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { profile_id: string; rating: number; review_text: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('freelancer_reviews' as any)
        .insert({ profile_id: review.profile_id, user_id: user.id, rating: review.rating, review_text: review.review_text })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['freelancer-reviews', vars.profile_id] });
    },
  });
};

export const useDeleteFreelancerReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, profileId }: { id: string; profileId: string }) => {
      const { error } = await supabase.from('freelancer_reviews' as any).delete().eq('id', id);
      if (error) throw error;
      return profileId;
    },
    onSuccess: (profileId) => {
      qc.invalidateQueries({ queryKey: ['freelancer-reviews', profileId] });
    },
  });
};
