import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { playSound } from '@/lib/sounds';
import { showBrowserNotification } from '@/lib/notifications';

export interface ChatRoom {
  id: string;
  user_id: string;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  is_read: boolean;
  created_at: string;
}

// User: Get or create their chat room
export const useChatRoom = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['chat-room', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // First try to get existing room
      const { data: existing, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (existing) return existing as ChatRoom;
      
      // Create new room if doesn't exist
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (createError) throw createError;
      return newRoom as ChatRoom;
    },
    enabled: !!user,
  });
  
  return query;
};

// Get messages for a room
export const useChatMessages = (roomId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!roomId,
  });
  
  // Real-time subscription
  useEffect(() => {
    if (!roomId) return;
    
    const channel = supabase
      .channel(`chat-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          queryClient.setQueryData<ChatMessage[]>(['chat-messages', roomId], (old) => {
            if (!old) return [newMsg];
            return [...old, newMsg];
          });
          // Play sound + browser notification for incoming messages (not sent by current user)
          if (newMsg.sender_id !== user?.id) {
            playSound('message');
            const isFromAdmin = newMsg.is_admin;
            showBrowserNotification({
              title: isFromAdmin ? '💬 პასუხი მხარდაჭერისგან' : '💬 ახალი შეტყობინება',
              body: newMsg.content.startsWith('[[attachment]]') ? '📎 ფაილი' : newMsg.content.slice(0, 120),
              tag: `chat-${roomId}`,
              onClick: () => { /* Will be handled by widget opening on focus */ },
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);
  
  return query;
};

// Send a message
export const useSendMessage = () => {
  const { user, isAdmin } = useAuth();
  
  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content,
          is_admin: isAdmin,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      playSound('messageSent');
    },
  });
};

// Admin: Get all chat rooms
export const useAdminChatRooms = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['admin-chat-rooms'],
    queryFn: async () => {
      // Get chat rooms first
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('last_message_at', { ascending: false });
      
      if (roomsError) throw roomsError;
      
      // Get profiles separately
      const userIds = rooms?.map(r => r.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, avatar_url')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      // Get unread counts for each room
      const roomsWithData = await Promise.all(
        (rooms || []).map(async (room) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_read', false)
            .eq('is_admin', false);
          
          return { 
            ...room, 
            profile: profileMap.get(room.user_id) || null,
            unread_count: count || 0 
          };
        })
      );
      
      return roomsWithData as ChatRoom[];
    },
    enabled: isAdmin,
  });
  
  // Real-time subscription for new rooms
  useEffect(() => {
    if (!isAdmin) return;
    
    const channel = supabase
      .channel('admin-chat-rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms'] });
          const msg = payload.new as ChatMessage;
          // Only notify admin when a non-admin (user) sends a message
          if (!msg.is_admin) {
            playSound('message');
            const isAttach = msg.content.startsWith('[[attachment]]');
            showBrowserNotification({
              title: '💬 ახალი მესიჯი მომხმარებლისგან',
              body: isAttach ? '📎 ფაილი გამოგზავნილია' : msg.content.slice(0, 140),
              tag: `admin-chat-${msg.room_id}`,
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

// ─── Quick-reply templates ──────────────────────────────────────────────────

export interface ChatQuickReply {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useChatQuickReplies = () =>
  useQuery({
    queryKey: ['chat-quick-replies'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('chat_quick_replies')
        .select('*')
        .order('category')
        .order('sort_order');
      if (error) throw error;
      return (data ?? []) as ChatQuickReply[];
    },
  });

export const useUpsertChatQuickReply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reply: Omit<Partial<ChatQuickReply>, 'id'> & { id?: string; category: string; question: string; answer: string }) => {
      const { data, error } = await (supabase as any)
        .from('chat_quick_replies')
        .upsert({ ...reply, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as ChatQuickReply;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat-quick-replies'] }),
  });
};

export const useDeleteChatQuickReply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('chat_quick_replies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat-quick-replies'] }),
  });
};

// Mark messages as read
export const useMarkMessagesRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms'] });
    },
  });
};
