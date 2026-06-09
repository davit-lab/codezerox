import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_gel: number;
  description: string | null;
  is_popular: boolean;
  created_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

// Get user credits
export const useUserCredits = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-credits'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserCredits | null;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds to keep credits updated
  });
};

// Get credit packages
export const useCreditPackages = () => {
  return useQuery({
    queryKey: ['credit-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .order('credits', { ascending: true });
      
      if (error) throw error;
      return data as CreditPackage[];
    },
  });
};

// Check if user has purchased any book
export const useHasPurchasedBook = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['has-purchased-book', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user,
  });
};

// Purchase credits (simulate - in real app would go through payment)
export const usePurchaseCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packageId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Get package details
      const { data: pkg, error: pkgError } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('id', packageId)
        .single();
      
      if (pkgError) throw pkgError;
      
      // Get current credits
      const { data: currentCredits } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const newCredits = (currentCredits?.credits ?? 0) + pkg.credits;
      
      // Upsert credits
      const { error: creditsError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          credits: newCredits,
        }, {
          onConflict: 'user_id',
        });
      
      if (creditsError) throw creditsError;
      
      // Record purchase
      const { error: purchaseError } = await supabase
        .from('credit_purchases')
        .insert({
          user_id: user.id,
          package_id: packageId,
          credits: pkg.credits,
          amount_gel: pkg.price_gel,
          status: 'completed',
        });
      
      if (purchaseError) throw purchaseError;
      
      return pkg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  });
};
