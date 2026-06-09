import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  scroll_position: number;
  last_page: number;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

export const useReadingProgress = (bookId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reading-progress', user?.id, bookId],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReadingProgress | null;
    },
    enabled: !!user && !!bookId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateReadingProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      bookId, 
      scrollPosition, 
      lastPage 
    }: { 
      bookId: string; 
      scrollPosition?: number; 
      lastPage?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          scroll_position: scrollPosition ?? 0,
          last_page: lastPage ?? 1,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,book_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['reading-progress', user?.id, variables.bookId] 
      });
    },
  });
};

export const useAllReadingProgress = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['all-reading-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });
      
      if (error) throw error;
      return data as ReadingProgress[];
    },
    enabled: !!user,
  });
};
