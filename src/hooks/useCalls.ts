import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CallStatus = 'initiated' | 'ringing' | 'connected' | 'ended' | 'rejected' | 'missed';
export type CallType = 'audio' | 'video';

export interface Call {
  id: string;
  caller_id: string;
  receiver_id: string;
  conversation_id: string;
  call_type: CallType;
  status: CallStatus;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
}

// Initiate a call
export const useInitiateCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ receiverId, conversationId, callType }: { 
      receiverId: string; 
      conversationId: string; 
      callType?: CallType 
    }): Promise<string> => {
      const { data, error } = await supabase.rpc('initiate_call', {
        _receiver_id: receiverId,
        _conversation_id: conversationId,
        _call_type: callType || 'audio'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-calls'] });
    }
  });
};

// Answer a call
export const useAnswerCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (callId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('answer_call', {
        _call_id: callId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-calls'] });
    }
  });
};

// Reject a call
export const useRejectCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (callId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('reject_call', {
        _call_id: callId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-calls'] });
    }
  });
};

// End a call
export const useEndCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (callId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('end_call', {
        _call_id: callId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-calls'] });
    }
  });
};

// Get active calls for current user
export const useActiveCalls = () => {
  return useQuery({
    queryKey: ['active-calls'],
    queryFn: async (): Promise<Call[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .in('status', ['initiated', 'ringing', 'connected'])
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 3000, // Poll every 3 seconds
  });
};

// Get call history
export const useCallHistory = (conversationId?: string) => {
  return useQuery({
    queryKey: ['call-history', conversationId],
    queryFn: async (): Promise<Call[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('calls')
        .select('*')
        .or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .in('status', ['ended', 'rejected', 'missed'])
        .order('started_at', { ascending: false })
        .limit(50);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });
};
