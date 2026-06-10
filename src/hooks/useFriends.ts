import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Friendship {
  id: string;
  user_a: string;
  user_b: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface PendingRequest {
  requester_id: string;
  friendship_id: string;
  created_at: string;
}

// Get all friends for current user
export const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async (): Promise<Friend[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_user_friends', {
        _user_id: user.id
      });

      if (error) throw error;
      return data || [];
    }
  });
};

// Get pending friend requests
export const usePendingRequests = () => {
  return useQuery({
    queryKey: ['pending-requests'],
    queryFn: async (): Promise<PendingRequest[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_pending_requests', {
        _user_id: user.id
      });

      if (error) throw error;
      return data || [];
    }
  });
};

// Get requests sent BY current user (pending outbound)
export const useSentRequests = () => {
  return useQuery({
    queryKey: ['sent-requests'],
    queryFn: async (): Promise<{ target_user_id: string; friendship_id: string; created_at: string }[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.rpc('get_sent_requests', { _user_id: user.id });
      if (error) throw error;
      return data || [];
    }
  });
};

// Send friend request
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId: string): Promise<string> => {
      const { data, error } = await supabase.rpc('send_friend_request', {
        _target_user_id: targetUserId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
    }
  });
};

// Accept friend request
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('accept_friend_request', {
        _friendship_id: friendshipId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
    }
  });
};

// Decline friend request
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('decline_friend_request', {
        _friendship_id: friendshipId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
    }
  });
};

// Remove friend
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('remove_friend', {
        _friendship_id: friendshipId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });
};

// Block user
export const useBlockUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId: string): Promise<string> => {
      const { data, error } = await supabase.rpc('block_user', {
        _target_user_id: targetUserId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    }
  });
};

// Check if two users are friends
export const useAreFriends = (userId: string) => {
  return useQuery({
    queryKey: ['are-friends', userId],
    queryFn: async (): Promise<Friendship | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!userId
  });
};
