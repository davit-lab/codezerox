import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { playSound } from '@/lib/sounds';

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
  updated_at: string;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  is_voice_message?: boolean;
  voice_url?: string;
  voice_duration?: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['direct-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order('updated_at', { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all(
        (data as any[]).map(async (c) => {
          const otherId = c.participant_one === user.id ? c.participant_two : c.participant_one;
          const [profileRes, messagesRes, unreadRes] = await Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('user_id', otherId).single(),
            supabase.from('direct_messages').select('content, created_at').eq('conversation_id', c.id).order('created_at', { ascending: false }).limit(1),
            supabase.from('direct_messages').select('id', { count: 'exact' }).eq('conversation_id', c.id).eq('is_read', false).neq('sender_id', user.id),
          ]);
          const lastMsg = messagesRes.data?.[0];
          return {
            ...c,
            other_user_name: profileRes.data?.full_name || 'უცნობი',
            other_user_avatar: profileRes.data?.avatar_url,
            last_message: lastMsg?.content,
            last_message_at: lastMsg?.created_at,
            unread_count: unreadRes.count || 0,
          } as Conversation;
        })
      );
      return enriched;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['direct-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as DirectMessage[];
    },
    enabled: !!conversationId,
  });
};

export const useSendDirectMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      conversation_id, 
      content, 
      is_voice_message = false, 
      voice_url, 
      voice_duration 
    }: { 
      conversation_id: string; 
      content: string; 
      is_voice_message?: boolean; 
      voice_url?: string; 
      voice_duration?: number; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const insertData: any = { conversation_id, sender_id: user.id, content };
      if (is_voice_message) {
        insertData.is_voice_message = true;
        insertData.voice_url = voice_url;
        insertData.voice_duration = voice_duration;
      }
      
      const { data, error } = await supabase
        .from('direct_messages')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      // Update conversation timestamp
      await supabase.from('direct_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation_id);
      return data;
    },
    onSuccess: (_, vars) => {
      playSound('messageSent');
      qc.invalidateQueries({ queryKey: ['direct-messages', vars.conversation_id] });
      qc.invalidateQueries({ queryKey: ['direct-conversations'] });
    },
  });
};

export const useCreateOrGetConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check existing conversation in both directions
      const { data: existing } = await supabase
        .from('direct_conversations')
        .select('id')
        .or(`and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`)
        .maybeSingle();

      if (existing) return (existing as any).id as string;

      const { data, error } = await supabase
        .from('direct_conversations')
        .insert({ participant_one: user.id, participant_two: otherUserId })
        .select('id')
        .single();
      if (error) throw error;
      return (data as any).id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['direct-conversations'] });
    },
  });
};

export const useMarkMessagesRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['direct-conversations'] });
    },
  });
};

export const useRealtimeMessages = (conversationId: string) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ['direct-messages', conversationId] });
        qc.invalidateQueries({ queryKey: ['direct-conversations'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, qc]);
};

export const useTotalUnreadCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['total-unread', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      // Get all my conversation IDs
      const { data: convos } = await supabase
        .from('direct_conversations')
        .select('id')
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);
      if (!convos || convos.length === 0) return 0;
      const ids = (convos as any[]).map(c => c.id);
      const { count } = await supabase
        .from('direct_messages')
        .select('id', { count: 'exact' })
        .in('conversation_id', ids)
        .eq('is_read', false)
        .neq('sender_id', user.id);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });
};
