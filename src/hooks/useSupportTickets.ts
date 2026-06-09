import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { playSound } from '@/lib/sounds';
import { showBrowserNotification } from '@/lib/notifications';

export interface SupportTicket {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewSupportTicketInput {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
}

export const useCreateSupportTicket = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewSupportTicketInput) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id ?? null,
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone?.trim() || null,
          topic: input.topic.trim(),
          message: input.message.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as SupportTicket;
    },
  });
};

export const useAdminSupportTickets = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-support-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
          if (payload.eventType === 'INSERT') {
            const t = payload.new as SupportTicket;
            try { playSound('notification'); } catch { /* noop */ }
            showBrowserNotification({
              title: '📩 ახალი მხარდაჭერის ფორმა',
              body: `${t.name} – ${t.topic}`,
              tag: `ticket-${t.id}`,
              onlyWhenHidden: false,
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient]);

  return query;
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status?: SupportTicket['status']; admin_notes?: string }) => {
      const patch: Record<string, unknown> = {};
      if (status) patch.status = status;
      if (admin_notes !== undefined) patch.admin_notes = admin_notes;
      const { error } = await supabase
        .from('support_tickets')
        .update(patch)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('support_tickets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
  });
};
