import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface HubChallenge {
  id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  deadline: string | null;
  status: 'active' | 'upcoming' | 'completed';
  tasks: string[];
  created_at: string;
  updated_at: string;
  participants_count: number;
  user_has_joined: boolean;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
  completed: boolean;
  submission_url: string | null;
  profile?: { full_name: string | null; avatar_url: string | null };
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  challenges_completed: number;
}

export const useHubChallenges = (filter: 'all' | 'active' | 'upcoming' | 'completed' = 'all') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hub-challenges', filter, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('hub_challenges' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: challenges, error } = await query;
      if (error) throw error;
      if (!challenges || challenges.length === 0) return [];

      const challengeIds = (challenges as any[]).map(c => c.id);

      // Get participant counts
      const { data: allParticipants } = await supabase
        .from('hub_challenge_participants' as any)
        .select('challenge_id, user_id')
        .in('challenge_id', challengeIds);

      const countMap: Record<string, number> = {};
      const userJoinedSet = new Set<string>();
      (allParticipants || []).forEach((p: any) => {
        countMap[p.challenge_id] = (countMap[p.challenge_id] || 0) + 1;
        if (user && p.user_id === user.id) {
          userJoinedSet.add(p.challenge_id);
        }
      });

      return (challenges as any[]).map(c => ({
        ...c,
        tasks: c.tasks || [],
        participants_count: countMap[c.id] || 0,
        user_has_joined: userJoinedSet.has(c.id),
      })) as HubChallenge[];
    },
  });
};

export const useJoinChallenge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');
      const userId = session.session.user.id;

      const { error } = await supabase
        .from('hub_challenge_participants' as any)
        .insert({ challenge_id: challengeId, user_id: userId } as any);

      if (error) throw error;

      // Get challenge points and award XP
      const { data: challenge } = await supabase
        .from('hub_challenges' as any)
        .select('points')
        .eq('id', challengeId)
        .single();

      if (challenge) {
        await supabase.rpc('award_xp', {
          _user_id: userId,
          _amount: (challenge as any).points,
          _action: 'challenge_join',
          _ref: challengeId,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hub-challenges'] });
      qc.invalidateQueries({ queryKey: ['hub-challenge-leaderboard'] });
      qc.invalidateQueries({ queryKey: ['user-xp'] });
      qc.invalidateQueries({ queryKey: ['xp-transactions'] });
      toast.success('გამოწვევაში ჩაერთე! XP დაგემატა შენს ანგარიშზე.');
    },
    onError: () => toast.error('ვერ ჩაერთე გამოწვევაში'),
  });
};

export const useLeaveChallenge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('hub_challenge_participants' as any)
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hub-challenges'] });
      qc.invalidateQueries({ queryKey: ['hub-challenge-leaderboard'] });
      toast.success('გამოწვევიდან გამოხვედი');
    },
    onError: () => toast.error('გამოწვევიდან გამოსვლა ვერ მოხერხდა'),
  });
};

export const useChallengeLeaderboard = () => {
  return useQuery({
    queryKey: ['hub-challenge-leaderboard'],
    queryFn: async () => {
      // Get all participants with their completed challenges
      const { data: participants, error } = await supabase
        .from('hub_challenge_participants' as any)
        .select('user_id, challenge_id')
        .order('joined_at', { ascending: true });

      if (error) throw error;
      if (!participants || participants.length === 0) return [];

      // Get challenge points
      const challengeIds = [...new Set((participants as any[]).map(p => p.challenge_id))];
      const { data: challenges } = await supabase
        .from('hub_challenges' as any)
        .select('id, points')
        .in('id', challengeIds);

      const pointsMap: Record<string, number> = {};
      (challenges || []).forEach((c: any) => { pointsMap[c.id] = c.points; });

      // Aggregate per user
      const userStats: Record<string, { total_points: number; challenges_completed: number }> = {};
      (participants as any[]).forEach((p: any) => {
        if (!userStats[p.user_id]) {
          userStats[p.user_id] = { total_points: 0, challenges_completed: 0 };
        }
        userStats[p.user_id].total_points += pointsMap[p.challenge_id] || 0;
        userStats[p.user_id].challenges_completed += 1;
      });

      // Get profiles
      const userIds = Object.keys(userStats);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

      return userIds
        .map(uid => ({
          user_id: uid,
          full_name: profileMap[uid]?.full_name || null,
          avatar_url: profileMap[uid]?.avatar_url || null,
          total_points: userStats[uid].total_points,
          challenges_completed: userStats[uid].challenges_completed,
        }))
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 10) as LeaderboardEntry[];
    },
  });
};

export const useCreateChallenge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (challenge: {
      title: string;
      description?: string;
      difficulty: 'easy' | 'medium' | 'hard';
      category: string;
      points: number;
      deadline?: string;
      tasks?: string[];
    }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('hub_challenges' as any)
        .insert({
          ...challenge,
          created_by: session.session.user.id,
          tasks: challenge.tasks || [],
          status: 'active',
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hub-challenges'] });
      toast.success('გამოწვევა შეიქმნა!');
    },
    onError: () => toast.error('გამოწვევის შექმნა ვერ მოხერხდა'),
  });
};
