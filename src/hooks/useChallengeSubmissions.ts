import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  html_code: string;
  css_code: string;
  js_code: string;
  notes: string;
  status: 'submitted' | 'reviewed' | 'winner';
  admin_feedback: string | null;
  bonus_xp: number;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

// Fetch all submissions for a challenge
export const useChallengeSubmissions = (challengeId: string | null) => {
  return useQuery({
    queryKey: ['challenge-submissions', challengeId],
    queryFn: async () => {
      if (!challengeId) return [];

      const { data, error } = await supabase
        .from('challenge_submissions' as any)
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const submissions = (data || []) as any[];

      // Fetch profiles
      const userIds = [...new Set(submissions.map(s => s.user_id).filter(Boolean))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        (profiles || []).forEach((p: any) => { profilesMap[p.user_id] = p; });
      }

      return submissions.map(s => ({
        ...s,
        profile: profilesMap[s.user_id] || null,
      })) as ChallengeSubmission[];
    },
    enabled: !!challengeId,
  });
};

// Fetch current user's submission for a challenge
export const useMySubmission = (challengeId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-submission', challengeId, user?.id],
    queryFn: async () => {
      if (!challengeId || !user) return null;

      const { data, error } = await supabase
        .from('challenge_submissions' as any)
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ChallengeSubmission | null;
    },
    enabled: !!challengeId && !!user,
  });
};

// Submit code for a challenge
export const useSubmitCode = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      challengeId: string;
      html_code: string;
      css_code: string;
      js_code: string;
      notes: string;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_submissions' as any)
        .upsert({
          challenge_id: params.challengeId,
          user_id: session.session.user.id,
          html_code: params.html_code,
          css_code: params.css_code,
          js_code: params.js_code,
          notes: params.notes,
          status: 'submitted',
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'challenge_id,user_id' });

      if (error) throw error;
    },
    onSuccess: (_, params) => {
      qc.invalidateQueries({ queryKey: ['challenge-submissions', params.challengeId] });
      qc.invalidateQueries({ queryKey: ['my-submission', params.challengeId] });
      toast.success('კოდი წარმატებით გაიგზავნა!');
    },
    onError: () => toast.error('კოდის გაგზავნა ვერ მოხერხდა'),
  });
};

// Admin: pick a winner
export const usePickWinner = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      submissionId: string;
      bonusXp?: number;
      feedback?: string;
    }) => {
      const { error } = await supabase.rpc('pick_challenge_winner', {
        _submission_id: params.submissionId,
        _bonus_xp: params.bonusXp || 200,
        _feedback: params.feedback || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenge-submissions'] });
      qc.invalidateQueries({ queryKey: ['user-xp'] });
      qc.invalidateQueries({ queryKey: ['hub-challenge-leaderboard'] });
      toast.success('გამარჯვებული არჩეულია! ბონუს XP დაემატა.');
    },
    onError: () => toast.error('ვერ მოხერხდა'),
  });
};
