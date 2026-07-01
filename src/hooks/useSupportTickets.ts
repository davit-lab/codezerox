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
    // Support tickets are not broadcast via realtime (for privacy).
    // Poll every 20s so the admin panel stays up to date and notifies on new tickets.
    refetchInterval: isAdmin ? 20_000 : false,
    refetchIntervalInBackground: false,
  });

  // Notify admin on newly-arrived tickets (detected via polling diff)
  useEffect(() => {
    if (!isAdmin) return;
    const data = query.data;
    if (!data || data.length === 0) return;
    const seenKey = 'admin-support-tickets-seen-ids';
    let seen: Set<string>;
    try {
      seen = new Set<string>(JSON.parse(sessionStorage.getItem(seenKey) || '[]'));
    } catch {
      seen = new Set<string>();
    }
    const fresh = data.filter((t) => !seen.has(t.id));
    if (seen.size > 0) {
      for (const t of fresh) {
        try { playSound('notification'); } catch { /* noop */ }
        showBrowserNotification({
          title: '📩 ახალი მხარდაჭერის ფორმა',
          body: `${t.name} – ${t.topic}`,
          tag: `ticket-${t.id}`,
          onlyWhenHidden: false,
        });
      }
    }
    const nextSeen = new Set<string>(seen);
    for (const t of data) nextSeen.add(t.id);
    try {
      sessionStorage.setItem(seenKey, JSON.stringify(Array.from(nextSeen)));
    } catch { /* noop */ }
  }, [isAdmin, query.data]);

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
