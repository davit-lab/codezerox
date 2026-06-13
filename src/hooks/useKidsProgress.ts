import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Check if child has active (paid) subscription
export const useKidsSubscription = (childId?: string) => {
  const { user } = useAuth();
  const id = childId || user?.id;

  return useQuery({
    queryKey: ['kids-subscription', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('kids_subscriptions')
        .select('id, status, expires_at')
        .eq('child_id', id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useKidsProgress = (childId?: string) => {
  const { user } = useAuth();
  const id = childId || user?.id;

  return useQuery({
    queryKey: ['kids-progress', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('kids_lesson_progress')
        .select('lesson_id, xp_earned, completed_at')
        .eq('child_id', id)
        .order('completed_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });
};

export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lessonId, xpReward }: { lessonId: string; xpReward: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('kids_lesson_progress')
        .upsert(
          { child_id: user.id, lesson_id: lessonId, xp_earned: xpReward },
          { onConflict: 'child_id,lesson_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids-progress'] });
    },
  });
};

// Admin: get all children with progress
export const useAdminAllChildren = () => {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-all-children'],
    queryFn: async () => {
      const { data: children, error } = await supabase
        .from('parent_children')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get subscriptions
      const childIds = (children || []).map(c => c.child_id);
      const { data: subs } = await supabase
        .from('kids_subscriptions')
        .select('*')
        .in('child_id', childIds.length > 0 ? childIds : ['00000000-0000-0000-0000-000000000000']);

      // Get progress counts
      const { data: progress } = await supabase
        .from('kids_lesson_progress')
        .select('child_id, lesson_id')
        .in('child_id', childIds.length > 0 ? childIds : ['00000000-0000-0000-0000-000000000000']);

      // Get parent profiles
      const parentIds = [...new Set((children || []).map(c => c.parent_id))];
      const { data: parentProfiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', parentIds.length > 0 ? parentIds : ['00000000-0000-0000-0000-000000000000']);

      const parentMap = new Map((parentProfiles || []).map(p => [p.user_id, p]));
      const subMap = new Map((subs || []).map(s => [s.child_id, s]));
      const progressMap = new Map<string, number>();
      (progress || []).forEach(p => {
        progressMap.set(p.child_id, (progressMap.get(p.child_id) || 0) + 1);
      });

      return (children || []).map(c => ({
        ...c,
        parent: parentMap.get(c.parent_id) || null,
        subscription: subMap.get(c.child_id) || null,
        lessonsCompleted: progressMap.get(c.child_id) || 0,
      }));
    },
    enabled: isAdmin,
  });
};

export const useAdminToggleChildActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, isActive }: { childId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('parent_children')
        .update({ is_active: isActive })
        .eq('child_id', childId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-children'] });
    },
  });
};

export const useAdminCreateChildAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password, displayName, parentId }: {
      username: string; password: string; displayName: string; parentId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-child-account', {
        body: {
          action: 'create',
          username,
          password,
          display_name: displayName || username,
          ...(parentId ? { parent_id: parentId } : {}),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-children'] });
    },
  });
};

export const useAdminDeleteChildAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childId: string) => {
      const { data, error } = await supabase.functions.invoke('create-child-account', {
        body: { action: 'delete', child_id: childId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-children'] });
    },
  });
};
