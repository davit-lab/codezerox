import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CyberCategory {
  id: string;
  slug: string;
  name_ka: string;
  name_en: string;
  description_ka: string | null;
  icon: string | null;
  color: string | null;
  sort: number | null;
  created_at: string;
}

export interface CyberChallenge {
  id: string;
  slug: string;
  category_id: string | null;
  title_ka: string;
  title_en: string | null;
  story_md: string;
  difficulty: string;
  engine: string;
  base_points: number;
  solves_count: number;
  status: string;
  tags: string[] | null;
  created_at: string;
  scenario: any;
  flag_hash?: string;
  flag_format?: string;
}

export interface CyberRank {
  id: string;
  slug: string;
  name_ka: string;
  name_en: string;
  min_points: number;
  badge_color: string | null;
  sort: number;
}

export interface CyberUserStats {
  user_id: string;
  total_points: number;
  rank_slug: string | null;
  solves_count: number;
  streak_days: number | null;
  last_solve_at: string | null;
  updated_at: string;
}

export interface CyberSolve {
  id: string;
  user_id: string;
  challenge_id: string;
  points_awarded: number;
  first_blood: boolean | null;
  solved_at: string;
}

export interface CyberInteractiveStep {
  id: string;
  challenge_id: string;
  step_order: number;
  step_type: string;
  content_ka: string;
  expected_answer: string | null;
  next_step_on_success: string | null;
  hint_ka: string | null;
}

export interface CyberQuizQuestion {
  id: string;
  challenge_id: string;
  question_ka: string;
  options: any;
  correct_option_index: number;
  explanation_ka: string | null;
  sort_order: number;
  points: number;
}

export interface CyberUserProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  current_step_id: string | null;
  quiz_score: number | null;
  quiz_answers: any;
  points_earned: number | null;
  started_at: string;
  completed_at: string | null;
}

// Categories
export const useCyberCategories = () => {
  return useQuery({
    queryKey: ['cyber-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cyberrange_categories')
        .select('*')
        .order('sort', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CyberCategory[];
    },
  });
};

// Challenges by category or all published
export const useCyberChallenges = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['cyber-challenges', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('cyberrange_challenges_public')
        .select('*')
        .order('difficulty', { ascending: true })
        .order('created_at', { ascending: false });
      if (categorySlug) {
        const { data: cat } = await supabase
          .from('cyberrange_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        if (cat) {
          query = supabase
            .from('cyberrange_challenges_public')
            .select('*')
            .eq('category_id', cat.id)
            .order('difficulty', { ascending: true })
            .order('created_at', { ascending: false });
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as CyberChallenge[];
    },
  });
};

export const useCyberChallenge = (slug: string) => {
  return useQuery({
    queryKey: ['cyber-challenge', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cyberrange_challenges_public')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CyberChallenge | null;
    },
    enabled: !!slug,
  });
};

export const useCyberChallengeSteps = (challengeId?: string) => {
  return useQuery({
    queryKey: ['cyber-steps', challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from('cyberrange_interactive_steps')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('step_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CyberInteractiveStep[];
    },
    enabled: !!challengeId,
  });
};

export const useCyberQuizQuestions = (challengeId?: string) => {
  return useQuery({
    queryKey: ['cyber-quiz', challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from('cyberrange_quiz_questions')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CyberQuizQuestion[];
    },
    enabled: !!challengeId,
  });
};

// User progress
export const useCyberUserProgress = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cyber-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cyberrange_user_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as unknown as CyberUserProgress[];
    },
    enabled: !!user,
  });
};

export const useCyberUserProgressForChallenge = (challengeId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cyber-progress-challenge', user?.id, challengeId],
    queryFn: async () => {
      if (!user || !challengeId) return null;
      const { data, error } = await supabase
        .from('cyberrange_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CyberUserProgress | null;
    },
    enabled: !!user && !!challengeId,
  });
};

// Solves
export const useCyberSolves = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cyber-solves', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cyberrange_solves')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as unknown as CyberSolve[];
    },
    enabled: !!user,
  });
};

// Stats
export const useCyberStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cyber-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('cyberrange_user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CyberUserStats | null;
    },
    enabled: !!user,
  });
};

// Leaderboard
export const useCyberLeaderboard = (limit = 100) => {
  return useQuery({
    queryKey: ['cyber-leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('cyberrange_leaderboard', { _limit: limit });
      if (error) throw error;
      return (data ?? []) as unknown as { user_id: string; total_points: number; solves_count: number; rank_slug: string }[];
    },
  });
};

// Ranks
export const useCyberRanks = () => {
  return useQuery({
    queryKey: ['cyber-ranks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cyberrange_ranks')
        .select('*')
        .order('min_points', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CyberRank[];
    },
  });
};

// Mutations
export const useSubmitCyberFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, flag }: { challengeId: string; flag: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/cyberrange-submit-flag`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ challengeId, flag }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Submission failed');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-solves'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-progress'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-challenges'] });
    },
  });
};

export const useSubmitCyberInteractive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, stepId, answer }: { challengeId: string; stepId: string; answer?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/cyberrange-submit-interactive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ challengeId, stepId, answer }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Submission failed');
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cyber-progress-challenge'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-progress'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-solves'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-steps', variables.challengeId] });
    },
  });
};

export const useSubmitCyberQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, answers }: { challengeId: string; answers: Record<string, number> }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/cyberrange-submit-quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ challengeId, answers }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Submission failed');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-progress'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-solves'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-challenges'] });
    },
  });
};

// Admin hooks
export const useAllCyberCategories = () => {
  return useQuery({
    queryKey: ['cyber-categories-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cyberrange_categories')
        .select('*')
        .order('sort', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CyberCategory[];
    },
  });
};

export const useAllCyberChallenges = () => {
  return useQuery({
    queryKey: ['cyber-challenges-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cyberrange_challenges')
        .select('*, cyberrange_categories(name_ka)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (CyberChallenge & { cyberrange_categories?: { name_ka: string } })[];
    },
  });
};

export const useUpsertCyberCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CyberCategory>) => {
      const { data, error } = await supabase
        .from('cyberrange_categories')
        .upsert(payload as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-categories'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-categories-all'] });
    },
  });
};

export const useDeleteCyberCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cyberrange_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-categories'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-categories-all'] });
    },
  });
};

export const useUpsertCyberChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CyberChallenge>) => {
      const { data, error } = await supabase
        .from('cyberrange_challenges')
        .upsert(payload as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-challenges-all'] });
    },
  });
};

export const useDeleteCyberChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cyberrange_challenges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['cyber-challenges-all'] });
    },
  });
};

export const useUpsertCyberStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CyberInteractiveStep>) => {
      const { data, error } = await supabase
        .from('cyberrange_interactive_steps')
        .upsert(payload as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cyber-steps', variables.challenge_id] });
    },
  });
};

export const useDeleteCyberStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cyberrange_interactive_steps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-steps'] });
    },
  });
};

export const useUpsertCyberQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CyberQuizQuestion>) => {
      const { data, error } = await supabase
        .from('cyberrange_quiz_questions')
        .upsert(payload as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cyber-quiz', variables.challenge_id] });
    },
  });
};

export const useDeleteCyberQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cyberrange_quiz_questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cyber-quiz'] });
    },
  });
};
