import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useBookReviews = (bookId: string) => {
  return useQuery({
    queryKey: ['reviews', bookId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('book_reviews')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately to avoid foreign key issues
      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return reviews.map(review => ({
        ...review,
        profile: profileMap.get(review.user_id) || null
      })) as Review[];
    },
    enabled: !!bookId,
  });
};

export const useUserReview = (bookId: string, userId?: string) => {
  return useQuery({
    queryKey: ['userReview', bookId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_reviews')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', userId!)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!bookId && !!userId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, rating, reviewText }: { bookId: string; rating: number; reviewText?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('book_reviews')
        .insert({
          book_id: bookId,
          user_id: user.id,
          rating,
          review_text: reviewText || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['userReview', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rating, reviewText, bookId }: { id: string; rating: number; reviewText?: string; bookId: string }) => {
      const { data, error } = await supabase
        .from('book_reviews')
        .update({
          rating,
          review_text: reviewText || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['userReview', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bookId }: { id: string; bookId: string }) => {
      const { error } = await supabase
        .from('book_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['userReview', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
