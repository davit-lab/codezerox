import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CourseSubscription {
  id: string;
  user_id: string;
  course_id: string;
  starts_at: string;
  expires_at: string;
  chapters_read_this_month: number;
  month_reset_at: string;
  last_chapter_generated_at: string | null;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

const MONTHLY_CHAPTER_LIMIT = 30;

export const useCourseSubscription = (courseId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['course-subscription', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_subscriptions')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as CourseSubscription | null;
    },
    enabled: !!courseId && !!user,
  });
};

export const useMySubscriptions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-subscriptions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_subscriptions')
        .select('*, courses(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAllSubscriptions = () => {
  return useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_subscriptions')
        .select('*, courses(title)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, months }: { courseId: string; months: number }) => {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);
      
      const { error } = await supabase
        .from('course_subscriptions')
        .upsert({
          user_id: user!.id,
          course_id: courseId,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          chapters_read_this_month: 0,
          month_reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
        }, { onConflict: 'user_id,course_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
    },
  });
};

// Admin: grant subscription to a user
export const useAdminGrantSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, courseId, months }: { userId: string; courseId: string; months: number }) => {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);
      
      const { error } = await supabase
        .from('course_subscriptions')
        .upsert({
          user_id: userId,
          course_id: courseId,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          chapters_read_this_month: 0,
          month_reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          granted_by: user!.id,
        }, { onConflict: 'user_id,course_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['course-subscription'] });
    },
  });
};

export const useRecordChapterRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, chapterId }: { courseId: string; chapterId: string }) => {
      // Record the read
      const { error: readError } = await supabase
        .from('course_chapter_reads')
        .upsert({
          user_id: user!.id,
          course_id: courseId,
          chapter_id: chapterId,
        }, { onConflict: 'user_id,chapter_id' });
      if (readError && !readError.message?.includes('duplicate')) throw readError;

      // Increment monthly counter
      const { data: sub } = await supabase
        .from('course_subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('course_id', courseId)
        .single();
      
      if (sub) {
        // Reset counter if new month
        const resetAt = new Date(sub.month_reset_at);
        const now = new Date();
        let newCount = sub.chapters_read_this_month + 1;
        let newResetAt = sub.month_reset_at;
        
        if (now >= resetAt) {
          newCount = 1;
          newResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        }

        await supabase
          .from('course_subscriptions')
          .update({ 
            chapters_read_this_month: newCount,
            month_reset_at: newResetAt,
          })
          .eq('id', sub.id);
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['course-subscription', vars.courseId] });
      queryClient.invalidateQueries({ queryKey: ['chapter-reads'] });
    },
  });
};

export const useChapterReads = (courseId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['chapter-reads', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_chapter_reads')
        .select('chapter_id')
        .eq('user_id', user!.id)
        .eq('course_id', courseId);
      if (error) throw error;
      return new Set(data.map(r => r.chapter_id));
    },
    enabled: !!courseId && !!user,
  });
};

export const useSubscriptionStatus = (courseId: string) => {
  const { data: subscription, isLoading } = useCourseSubscription(courseId);
  
  const isActive = subscription ? new Date(subscription.expires_at) > new Date() : false;
  
  // Check if monthly counter needs reset
  let chaptersReadThisMonth = subscription?.chapters_read_this_month ?? 0;
  if (subscription) {
    const resetAt = new Date(subscription.month_reset_at);
    if (new Date() >= resetAt) {
      chaptersReadThisMonth = 0;
    }
  }
  
  const canReadMore = chaptersReadThisMonth < MONTHLY_CHAPTER_LIMIT;
  const remainingReads = Math.max(0, MONTHLY_CHAPTER_LIMIT - chaptersReadThisMonth);
  
  const lastGenDate = subscription?.last_chapter_generated_at;
  const today = new Date().toISOString().split('T')[0];
  const canGenerateToday = !lastGenDate || lastGenDate !== today;
  
  const daysRemaining = subscription 
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    subscription,
    isActive,
    isLoading,
    chaptersReadThisMonth,
    canReadMore,
    remainingReads,
    canGenerateToday,
    daysRemaining,
    monthlyLimit: MONTHLY_CHAPTER_LIMIT,
  };
};
