import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole;
}

export const useUsers = () => {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, avatar_url, created_at')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));
      
      return (profiles || []).map((p) => ({
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        role: (roleMap.get(p.user_id) || 'user') as AppRole,
      }));
    },
    enabled: isAdmin,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Upsert: try update first, if no row exists, insert
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Assign or unassign a mentor to a specific mentoring course
export const useAssignCourseMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, mentorUserId }: { courseId: string; mentorUserId: string | null }) => {
      const { error } = await supabase
        .from('mentoring_courses' as any)
        .update({ mentor_user_id: mentorUserId } as any)
        .eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentoring-courses'] });
      queryClient.invalidateQueries({ queryKey: ['mentoring-courses-all'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete user's data in order (due to foreign key constraints)
      // 1. Delete from user_roles
      await supabase.from('user_roles').delete().eq('user_id', userId);
      // 2. Delete from user_credits
      await supabase.from('user_credits').delete().eq('user_id', userId);
      // 3. Delete from purchases
      await supabase.from('purchases').delete().eq('user_id', userId);
      // 4. Delete from reading_progress
      await supabase.from('reading_progress').delete().eq('user_id', userId);
      // 5. Delete from community_messages
      await supabase.from('community_messages').delete().eq('user_id', userId);
      // 6. Delete from message_reactions
      await supabase.from('message_reactions').delete().eq('user_id', userId);
      // 7. Delete from chat_messages
      await supabase.from('chat_messages').delete().eq('sender_id', userId);
      // 8. Delete from chat_rooms
      await supabase.from('chat_rooms').delete().eq('user_id', userId);
      // 9. Delete from ai_chat_messages
      await supabase.from('ai_chat_messages').delete().eq('user_id', userId);
      // 10. Delete from book_reviews
      await supabase.from('book_reviews').delete().eq('user_id', userId);
      // 11. Delete from credit_purchases
      await supabase.from('credit_purchases').delete().eq('user_id', userId);
      // 12. Finally delete from profiles
      const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const usePurchasesCount = () => {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['admin-purchases-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin,
  });
};

export const useTotalUsersCount = () => {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['admin-total-users-count'],
    queryFn: async () => {
      // Count profiles as total users count
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin,
  });
};

// Fetch all profiles for Forums/Find Friends
export const useAllProfiles = () => {
  return useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, bio, location, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });
};
