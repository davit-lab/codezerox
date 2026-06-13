import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useState, useCallback } from 'react';

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const MESSAGES_PER_PAGE = 50;

// Get user's conversations with real message counts
export const useAIConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ai-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: conversations, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (convError) throw convError;
      if (!conversations) return [];

      const conversationsWithCounts = await Promise.all(
        conversations.map(async (conv) => {
          const { count, error: countError } = await supabase
            .from('ai_chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);
          
          if (countError) console.error('Count error:', countError);
          
          return {
            id: conv.id,
            title: conv.title,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            message_count: count || 0,
          } as AIConversation;
        })
      );
      
      return conversationsWithCounts;
    },
    enabled: !!user,
  });
};

// Get messages for a specific conversation with pagination (loads latest messages first)
export const useConversationMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversation-messages', user?.id, conversationId],
    queryFn: async () => {
      if (!user || !conversationId) return [];
      
      // First get total count
      const { count } = await supabase
        .from('ai_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId);

      const totalMessages = count || 0;
      
      if (totalMessages === 0) return [];

      // For conversations with many messages, load all in batches
      // Supabase has a 1000 row limit per query
      const allMessages: AIMessage[] = [];
      const batchSize = 1000;
      let offset = 0;

      while (offset < totalMessages) {
        const { data, error } = await supabase
          .from('ai_chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .range(offset, offset + batchSize - 1);
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        
        allMessages.push(...data.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id || conversationId,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at,
        })));
        
        offset += batchSize;
      }

      return allMessages;
    },
    enabled: !!user && !!conversationId,
  });
};

// Paginated message loading for very large conversations (UI display)
export const usePaginatedMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [loadedMessages, setLoadedMessages] = useState<AIMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const loadInitial = useCallback(async () => {
    if (!user || !conversationId) return;
    
    // Get total count
    const { count } = await supabase
      .from('ai_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    const total = count || 0;
    setTotalCount(total);

    // Load the latest N messages (from the end)
    const startFrom = Math.max(0, total - MESSAGES_PER_PAGE);
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(startFrom, total - 1);

    if (error) throw error;

    const msgs = (data || []).map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id || conversationId,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      created_at: msg.created_at,
    }));

    setLoadedMessages(msgs);
    setHasMore(startFrom > 0);
  }, [user, conversationId]);

  const loadMore = useCallback(async () => {
    if (!user || !conversationId || !hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const currentOldest = loadedMessages[0]?.created_at;
      if (!currentOldest) return;

      // Load older messages
      const loadedSoFar = loadedMessages.length;
      const remainingCount = totalCount - loadedSoFar;
      const startFrom = Math.max(0, remainingCount - MESSAGES_PER_PAGE);
      const endAt = remainingCount - 1;

      if (endAt < 0) {
        setHasMore(false);
        return;
      }

      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(startFrom, endAt);

      if (error) throw error;

      const olderMsgs = (data || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id || conversationId,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at,
      }));

      setLoadedMessages(prev => [...olderMsgs, ...prev]);
      setHasMore(startFrom > 0);
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, conversationId, hasMore, isLoadingMore, loadedMessages, totalCount]);

  const reset = useCallback(() => {
    setLoadedMessages([]);
    setHasMore(true);
    setTotalCount(0);
  }, []);

  return {
    messages: loadedMessages,
    hasMore,
    isLoadingMore,
    totalCount,
    loadInitial,
    loadMore,
    reset,
  };
};

// Create a new conversation
export const useCreateConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (title?: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: title || 'ახალი საუბარი',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
};

// Rename a conversation
export const useRenameConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .update({ title })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
};

// Delete a conversation
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
};

// Save message to a conversation
export const useSaveMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      role, 
      content, 
      bookId 
    }: { 
      conversationId: string; 
      role: 'user' | 'assistant'; 
      content: string; 
      bookId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          role,
          content,
          book_id: bookId || null,
          credits_used: role === 'user' ? 1 : 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
};

// Legacy: Save assistant message (for backward compatibility)
export const useSaveAssistantMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content, bookId }: { content: string; bookId?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: user.id,
          role: 'assistant',
          content,
          book_id: bookId || null,
          credits_used: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
};

// Clear all conversations
export const useClearAIHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
};
