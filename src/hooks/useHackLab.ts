import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHackLabSettings = () =>
  useQuery({
    queryKey: ['hack_lab_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hack_lab_settings').select('*').single();
      if (error) throw error;
      return data;
    },
  });

export const useHackLabLessons = () =>
  useQuery({
    queryKey: ['hack_lab_lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hack_lab_lessons')
        .select('*')
        .eq('is_published', true)
        .order('order_index');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useHackLabAllLessons = () =>
  useQuery({
    queryKey: ['hack_lab_lessons_all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hack_lab_lessons').select('*').order('order_index');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useHackLabLesson = (id: string) =>
  useQuery({
    queryKey: ['hack_lab_lesson', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('hack_lab_lessons').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

export const useHackLabSubscription = (userId?: string) =>
  useQuery({
    queryKey: ['hack_lab_subscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('hack_lab_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

export const useHackLabProgress = (userId?: string) =>
  useQuery({
    queryKey: ['hack_lab_progress', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('hack_lab_progress')
        .select('lesson_id')
        .eq('user_id', userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

export const useCompleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, lessonId }: { userId: string; lessonId: string }) => {
      const { error } = await supabase
        .from('hack_lab_progress')
        .upsert({ user_id: userId, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' });
      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['hack_lab_progress', userId] });
    },
  });
};

export const useAllHackLabSubscriptions = () =>
  useQuery({
    queryKey: ['hack_lab_subscriptions_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hack_lab_subscriptions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useGrantHackLabAccess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId, grantedBy, months = 1, notes = ''
    }: { userId: string; grantedBy: string; months?: number; notes?: string }) => {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);
      const { error } = await supabase.from('hack_lab_subscriptions').upsert({
        user_id: userId,
        status: 'active',
        price_gel: 0,
        expires_at: expiresAt.toISOString(),
        granted_by: grantedBy,
        notes,
      }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hack_lab_subscriptions_all'] }),
  });
};

export const useRevokeHackLabAccess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('hack_lab_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hack_lab_subscriptions_all'] }),
  });
};

export const useUpsertHackLabLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lesson: Record<string, unknown>) => {
      const { error } = await supabase.from('hack_lab_lessons').upsert(lesson);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hack_lab_lessons'] });
      qc.invalidateQueries({ queryKey: ['hack_lab_lessons_all'] });
    },
  });
};

export const useDeleteHackLabLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hack_lab_lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hack_lab_lessons'] });
      qc.invalidateQueries({ queryKey: ['hack_lab_lessons_all'] });
    },
  });
};
