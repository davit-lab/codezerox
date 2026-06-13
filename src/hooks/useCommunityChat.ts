import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { playSound } from '@/lib/sounds';

export type ChannelType = 'general' | 'projects' | 'help';

export interface CommunityMessage {
  id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'project' | 'question';
  project_url: string | null;
  channel: ChannelType;
  reply_to: string | null;
  upvote_count: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions?: MessageReaction[];
  replied_message?: {
    content: string;
    profile?: {
      full_name: string | null;
    };
  } | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'helpful' | 'fire';
  created_at: string;
}

export interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
}

// Presence hook for online users
export const useOnlineUsers = () => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('community-presence', {
      config: { presence: { key: user.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.entries(state).forEach(([userId, presences]) => {
          const presence = (presences as any[])[0];
          if (presence) {
            users.push({
              id: userId,
              name: presence.name || 'მომხმარებელი',
              avatar: presence.avatar
            });
          }
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: profile?.full_name || 'მომხმარებელი',
            avatar: profile?.avatar_url,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, profile]);

  return onlineUsers;
};

export const useCommunityMessages = (channel: ChannelType = 'general') => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['community-messages', channel],
    queryFn: async () => {
      // Get messages for channel
      const { data: messages, error: msgError } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel', channel)
        .order('created_at', { ascending: true })
        .limit(100);

      if (msgError) throw msgError;

      // Get profiles for all users
      const userIds = [...new Set(messages?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Get reactions
      const messageIds = messages?.map(m => m.id) || [];
      const { data: reactions } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      const reactionMap = new Map<string, MessageReaction[]>();
      reactions?.forEach(r => {
        const existing = reactionMap.get(r.message_id) || [];
        reactionMap.set(r.message_id, [...existing, r as MessageReaction]);
      });

      // Get replied messages
      const replyIds = messages?.filter(m => m.reply_to).map(m => m.reply_to) || [];
      const { data: repliedMessages } = replyIds.length > 0 
        ? await supabase
            .from('community_messages')
            .select('id, content, user_id')
            .in('id', replyIds)
        : { data: [] };

      const repliedMap = new Map<string, any>();
      if (repliedMessages) {
        for (const rm of repliedMessages) {
          repliedMap.set(rm.id, {
            content: rm.content,
            profile: profileMap.get(rm.user_id)
          });
        }
      }

      return messages?.map(msg => ({
        ...msg,
        channel: msg.channel as ChannelType,
        message_type: msg.message_type as 'text' | 'project' | 'question',
        profile: profileMap.get(msg.user_id) || null,
        reactions: reactionMap.get(msg.id) || [],
        replied_message: msg.reply_to ? repliedMap.get(msg.reply_to) : null
      })) as CommunityMessage[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const sub = supabase
      .channel(`community-messages-${channel}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_messages',
          filter: `channel=eq.${channel}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-messages', channel] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-messages', channel] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [user, queryClient, channel]);

  return query;
};

export const useSendCommunityMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      messageType = 'text',
      projectUrl,
      channel = 'general',
      replyTo
    }: {
      content: string;
      messageType?: 'text' | 'project' | 'question';
      projectUrl?: string;
      channel?: ChannelType;
      replyTo?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          content,
          message_type: messageType,
          project_url: projectUrl || null,
          channel,
          reply_to: replyTo || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      playSound('messageSent');
      queryClient.invalidateQueries({ queryKey: ['community-messages', variables.channel || 'general'] });
    },
  });
};

export const useToggleReaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      reactionType
    }: {
      messageId: string;
      reactionType: 'like' | 'helpful' | 'fire';
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction_type: reactionType,
          });
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-messages'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('community_messages')
        .delete()
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-messages'] });
    },
  });
};
