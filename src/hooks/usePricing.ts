import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingItem {
  key: string;
  label: string;
  amount_gel: number;
  description: string | null;
  updated_at: string;
}

export const usePricing = () => {
  return useQuery({
    queryKey: ['pricing_config'],
    queryFn: async (): Promise<PricingItem[]> => {
      const { data, error } = await (supabase as any)
        .from('pricing_config')
        .select('*')
        .order('key');
      if (error) throw error;
      return (data || []) as PricingItem[];
    },
    staleTime: 60_000,
  });
};

export const usePrice = (key: string, fallback = 0): number => {
  const { data } = usePricing();
  const item = data?.find(p => p.key === key);
  return item ? Number(item.amount_gel) : fallback;
};

export const useUpdatePrice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, amount_gel, label }: { key: string; amount_gel: number; label?: string }) => {
      const update: any = { amount_gel, updated_at: new Date().toISOString() };
      if (label) update.label = label;
      const { error } = await (supabase as any).from('pricing_config').update(update).eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing_config'] }),
  });
};
