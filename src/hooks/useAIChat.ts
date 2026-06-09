import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useAIChat = (bookId?: string) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSendingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);

  // Allow external setting of conversationId
  const setConversationId = useCallback((id: string | null) => {
    conversationIdRef.current = id;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isSendingRef.current) return;
    
    isSendingRef.current = true;

    const userMessage: AIMessage = { role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = '';

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('გთხოვთ გაიაროთ ავტორიზაცია');
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        isSendingRef.current = false;
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [userMessage], // Only send the new message
            conversationId: conversationIdRef.current, // Backend loads history from DB
            bookId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('სესია ვადაგასულია, გთხოვთ ხელახლა შეხვიდეთ');
        } else if (response.status === 402) {
          toast.error(errorData.error || 'არ გაქვთ საკმარისი კრედიტი');
        } else if (response.status === 403) {
          toast.error(errorData.error || 'AI ტუტორი ხელმისაწვდომია მხოლოდ წიგნის შეძენის შემდეგ');
        } else {
          toast.error(errorData.error || 'შეცდომა');
        }
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        isSendingRef.current = false;
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });

    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('შეცდომა AI-სთან კომუნიკაციაში');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [isLoading, bookId, queryClient]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    setMessages,
    setConversationId,
  };
};
