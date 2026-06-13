import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSiteCreditsBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['site_credits_balance', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<number> => {
      const { data, error } = await (supabase as any)
        .from('site_credits_wallet')
        .select('balance')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data ? Number(data.balance) : 0;
    },
  });
};

export const useSiteCreditsHistory = (userId?: string) => {
  const { user } = useAuth();
  const id = userId ?? user?.id;
  return useQuery({
    queryKey: ['site_credits_history', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_credits_transactions')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
};

export const useGrantCredits = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, amount, reason, type = 'admin_grant' }:
      { userId: string; amount: number; reason: string; type?: 'refund' | 'admin_grant' | 'admin_deduct' }) => {
      const { data, error } = await (supabase as any).rpc('admin_grant_site_credits', {
        _user_id: userId, _amount: amount, _reason: reason, _type: type,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site_credits_balance'] });
      qc.invalidateQueries({ queryKey: ['site_credits_history'] });
    },
  });
};

export const useSpendCredits = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    onMutate: async ({ amount }) => {
      if (!user) return {};

      const balanceKey = ['site_credits_balance', user.id] as const;
      const historyKey = ['site_credits_history', user.id] as const;

      await qc.cancelQueries({ queryKey: balanceKey });
      await qc.cancelQueries({ queryKey: historyKey });

      const previousBalance = qc.getQueryData<number>(balanceKey);
      const previousHistory = qc.getQueryData<any[]>(historyKey);

      qc.setQueryData<number>(balanceKey, (current = 0) => Math.max(0, Number(current) - amount));

      return { previousBalance, previousHistory, balanceKey, historyKey };
    },
    mutationFn: async ({ amount, reason, refId }: { amount: number; reason: string; refId?: string }) => {
      if (!user) throw new Error('not authenticated');
      const { data, error } = await (supabase as any).rpc('spend_site_credits', {
        _user_id: user.id, _amount: amount, _reason: reason, _ref_id: refId ?? null,
      });
      if (error) throw error;
      return data as boolean;
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBalance !== undefined) {
        qc.setQueryData(context.balanceKey, context.previousBalance);
      }
      if (context?.previousHistory !== undefined) {
        qc.setQueryData(context.historyKey, context.previousHistory);
      }
    },
    onSuccess: (success, variables) => {
      if (!user) return;

      const balanceKey = ['site_credits_balance', user.id] as const;
      const historyKey = ['site_credits_history', user.id] as const;

      if (!success) {
        qc.invalidateQueries({ queryKey: balanceKey });
        qc.invalidateQueries({ queryKey: historyKey });
        return;
      }

      qc.setQueryData<any[]>(historyKey, (current = []) => [
        {
          id: `optimistic-${Date.now()}`,
          user_id: user.id,
          amount: -variables.amount,
          type: 'spend',
          reason: variables.reason,
          ref_id: variables.refId ?? null,
          created_by: user.id,
          created_at: new Date().toISOString(),
        },
        ...current,
      ]);

      qc.invalidateQueries({ queryKey: balanceKey });
      qc.invalidateQueries({ queryKey: historyKey });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['site_credits_balance'] });
      qc.invalidateQueries({ queryKey: ['site_credits_history'] });
    },
  });
};
