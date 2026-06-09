import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Realtime subscription with popup
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
        // Show popup for admin messages
        const newNotif = payload.new;
        if (newNotif) {
          toast(newNotif.title, {
            description: newNotif.message,
            duration: 10000,
            icon: '📬',
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as UserNotification[];
    },
    enabled: !!user,
  });
};

export const useUnreadCount = () => {
  const { data: notifications } = useNotifications();
  return notifications?.filter(n => !n.is_read).length || 0;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });
};
