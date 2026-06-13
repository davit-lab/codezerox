import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type VacancyPackageTier = 'basic' | 'normal' | 'premium' | 'depremium';

export const PACKAGE_TIER_ORDER: Record<VacancyPackageTier, number> = {
  depremium: 4,
  premium: 3,
  normal: 2,
  basic: 1,
};

export const PACKAGE_TIER_PRICE: Record<VacancyPackageTier, number> = {
  basic: 1,
  normal: 3,
  premium: 5,
  depremium: 10,
};

export interface Vacancy {
  id: string;
  user_id: string;
  title: string;
  company_name: string;
  description: string;
  requirements: string | null;
  location: string;
  job_type: string;
  salary_amount: number | null;
  salary_type: string | null;
  salary_currency: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  category: string;
  experience_level: string;
  package_tier: VacancyPackageTier;
  package_paid: boolean;
  package_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VacancyMessage {
  id: string;
  vacancy_id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  cv_url: string | null;
  is_read: boolean;
  created_at: string;
}

export const useVacancies = () => {
  return useQuery({
    queryKey: ['vacancies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const vacancies = (data as Vacancy[]) || [];
      // Sort by package tier (depremium=4 first), then by created_at
      return vacancies.sort((a, b) => {
        const tierA = PACKAGE_TIER_ORDER[a.package_tier || 'basic'] || 1;
        const tierB = PACKAGE_TIER_ORDER[b.package_tier || 'basic'] || 1;
        if (tierB !== tierA) return tierB - tierA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    },
  });
};

export const useVacancy = (id: string) => {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Vacancy;
    },
    enabled: !!id,
  });
};

export const useMyVacancies = () => {
  return useQuery({
    queryKey: ['my-vacancies'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Vacancy[];
    },
  });
};

export const useCreateVacancy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vacancy: Omit<Vacancy, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'package_paid' | 'package_expires_at'>) => {
      const { package_tier, ...insertData } = vacancy as any;

      // Step 1: Insert without package_tier (PostgREST schema cache safe)
      const { data, error } = await supabase
        .from('vacancies')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;

      // Step 2: Set tier via RPC function (bypasses schema cache)
      if (package_tier && data?.id) {
        const { error: rpcError } = await supabase.rpc('set_vacancy_package_tier', {
          p_vacancy_id: data.id,
          p_tier: package_tier,
        });
        if (rpcError) throw new Error(rpcError.message);
      }

      return data as Vacancy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['my-vacancies'] });
    },
  });
};

export const useUpdateVacancy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vacancy> & { id: string }) => {
      const { data, error } = await supabase
        .from('vacancies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['my-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['vacancy'] });
    },
  });
};

export const useDeleteVacancy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vacancies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['my-vacancies'] });
    },
  });
};

export const useVacancyMessages = (vacancyId: string) => {
  return useQuery({
    queryKey: ['vacancy-messages', vacancyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacancy_messages')
        .select('*')
        .eq('vacancy_id', vacancyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VacancyMessage[];
    },
    enabled: !!vacancyId,
  });
};

export const useAllMyVacancyMessages = () => {
  return useQuery({
    queryKey: ['all-vacancy-messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Get all my vacancies first
      const { data: myVacancies } = await supabase
        .from('vacancies')
        .select('id, title')
        .eq('user_id', user.id);
      
      if (!myVacancies || myVacancies.length === 0) return [];
      
      const vacancyIds = myVacancies.map(v => v.id);
      const { data, error } = await supabase
        .from('vacancy_messages')
        .select('*')
        .in('vacancy_id', vacancyIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Attach vacancy title
      const vacancyMap = Object.fromEntries(myVacancies.map(v => [v.id, v.title]));
      return (data as VacancyMessage[]).map(msg => ({
        ...msg,
        vacancy_title: vacancyMap[msg.vacancy_id] || 'უცნობი',
      }));
    },
  });
};

export const useSendVacancyMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (msg: Omit<VacancyMessage, 'id' | 'created_at' | 'is_read'>) => {
      const { data, error } = await supabase
        .from('vacancy_messages')
        .insert(msg)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vacancy-messages', variables.vacancy_id] });
      queryClient.invalidateQueries({ queryKey: ['all-vacancy-messages'] });
    },
  });
};

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('vacancy_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-vacancy-messages'] });
    },
  });
};
