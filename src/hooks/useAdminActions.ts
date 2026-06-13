import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sendTransactionalEmail } from '@/lib/email';

// Admin: Give credits to a user
export const useAdminGiveCredits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      const { data: current } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();
      
      const newCredits = (current?.credits ?? 0) + credits;
      
      const { error } = await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newCredits,
        }, {
          onConflict: 'user_id',
        });
      
      if (error) throw error;
      return { userId, newCredits };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Admin: Deduct credits from a user
export const useAdminDeductCredits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      const { data: current } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();
      
      const currentCredits = current?.credits ?? 0;
      const newCredits = Math.max(0, currentCredits - credits);
      
      const { error } = await supabase
        .from('user_credits')
        .update({ credits: newCredits })
        .eq('user_id', userId);
      
      if (error) throw error;
      return { userId, newCredits };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Admin: Give book access to a user
export const useAdminGiveBookAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, bookId }: { userId: string; bookId: string }) => {
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();
      
      if (existing) {
        throw new Error('User already has access to this book');
      }
      
      const { error } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          book_id: bookId,
        });
      
      if (error) throw error;

      // Send email notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', userId)
        .single();

      const { data: bookData } = await supabase
        .from('books')
        .select('title')
        .eq('id', bookId)
        .single();

      if (userProfile?.email) {
        await sendTransactionalEmail({
          templateName: 'access-granted',
          recipientEmail: userProfile.email,
          idempotencyKey: `access-granted-${userId}-${bookId}`,
          templateData: { bookTitle: bookData?.title || '' },
        });
      }

      return { userId, bookId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Admin: Remove book access from a user
export const useAdminRemoveBookAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Admin: Get user's current credits
export const useAdminGetUserCredits = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.credits ?? 0;
    },
  });
};

// Admin: Get user's purchases
export const useAdminGetUserPurchases = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          purchased_at,
          book:books(id, title, cover_url)
        `)
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

