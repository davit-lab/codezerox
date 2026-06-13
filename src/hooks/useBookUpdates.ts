import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookUpdate {
  id: string;
  book_id: string;
  version_name: string;
  description: string | null;
  price: number;
  is_free: boolean;
  pdf_url: string | null;
  pages: number | null;
  created_at: string;
}

export interface UpdatePurchase {
  id: string;
  user_id: string;
  update_id: string;
  purchased_at: string;
}

export const useBookUpdates = (bookId: string) => {
  return useQuery({
    queryKey: ['book-updates', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_updates')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as BookUpdate[]) || [];
    },
    enabled: !!bookId,
  });
};

export const useUpdatePurchases = (bookId: string) => {
  return useQuery({
    queryKey: ['update-purchases', bookId],
    queryFn: async () => {
      // Get all updates for this book first
      const { data: updates } = await supabase
        .from('book_updates')
        .select('id')
        .eq('book_id', bookId);
      
      if (!updates || updates.length === 0) return [];
      
      const updateIds = updates.map(u => u.id);
      const { data, error } = await supabase
        .from('update_purchases')
        .select('*')
        .in('update_id', updateIds);
      
      if (error) throw error;
      return (data as UpdatePurchase[]) || [];
    },
    enabled: !!bookId,
  });
};

export const useCreateBookUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: Omit<BookUpdate, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('book_updates')
        .insert(update as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['book-updates', variables.book_id] });
    },
  });
};

export const useDeleteBookUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, bookId }: { id: string; bookId: string }) => {
      const { error } = await supabase.from('book_updates').delete().eq('id', id);
      if (error) throw error;
      return bookId;
    },
    onSuccess: (bookId) => {
      queryClient.invalidateQueries({ queryKey: ['book-updates', bookId] });
    },
  });
};

export const useCreateUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ updateId, userId }: { updateId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('update_purchases')
        .insert({ update_id: updateId, user_id: userId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['update-purchases'] });
    },
  });
};
