import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  action_type: string;
  reference_id: string | null;
  created_at: string;
}

export interface ActivePromo {
  code: string;
  discount_value: number;
  expires_at: string;
  is_active: boolean;
  current_uses: number;
  max_uses: number;
}

// XP tiers for redemption
export const XP_TIERS = [
  { id: '500', cost: 500, discount: 20, label: '20% ფასდაკლება' },
  { id: '1000', cost: 1000, discount: 35, label: '35% ფასდაკლება' },
] as const;

// Fetch user's XP balance
export const useUserXPBalance = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-xp', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_xp' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return (data as UserXP | null) || { id: '', user_id: user.id, total_xp: 0, level: 1, balance: 0, total_earned: 0, total_spent: 0, created_at: '', updated_at: '' };
    },
    enabled: !!user,
  });
};

// Fetch user's XP transaction history
export const useXPTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['xp-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('xp_transactions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as XPTransaction[];
    },
    enabled: !!user,
  });
};

// Fetch user's active (non-expired, unused) XP promo codes
export const useActiveXPPromos = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['xp-active-promos', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get promo codes that were generated from XP redemptions
      const { data: transactions } = await supabase
        .from('xp_transactions' as any)
        .select('reference_id')
        .eq('user_id', user.id)
        .eq('action_type', 'promo_redeem')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!transactions || transactions.length === 0) return [];

      const codes = (transactions as any[]).map(t => t.reference_id).filter(Boolean);
      if (codes.length === 0) return [];

      const { data: promos } = await supabase
        .from('promo_codes' as any)
        .select('code, discount_value, expires_at, is_active, current_uses, max_uses')
        .in('code', codes);

      return (promos || []) as ActivePromo[];
    },
    enabled: !!user,
  });
};

// Redeem XP for a promo code
export const useRedeemXP = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (tier: '500' | '1000') => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('redeem_xp_for_promo', {
        _user_id: session.session.user.id,
        _tier: tier,
      });

      if (error) throw error;
      return data as string; // promo code
    },
    onSuccess: (code, tier) => {
      const discount = tier === '500' ? 20 : 35;
      qc.invalidateQueries({ queryKey: ['user-xp'] });
      qc.invalidateQueries({ queryKey: ['xp-transactions'] });
      qc.invalidateQueries({ queryKey: ['xp-active-promos'] });
      toast.success(`${discount}% პრომოკოდი: ${code}`, {
        description: 'ვადა: 48 საათი. დააკოპირე და გამოიყენე გადახდისას.',
        duration: 10000,
      });
    },
    onError: (err: any) => {
      const msg = err?.message || '';
      if (msg.includes('არასაკმარისი')) {
        toast.error('არასაკმარისი XP');
      } else {
        toast.error('პრომოკოდის გენერაცია ვერ მოხერხდა');
      }
    },
  });
};
