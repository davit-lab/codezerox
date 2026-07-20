import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MarketplaceProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  price: number | null;
  price_negotiable: boolean;
  preview_url: string;
  zip_path?: string | null;
  photos: string[];
  status: string;
  is_multi_sale: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  seller_name?: string | null;
}

export interface MarketplaceSale {
  id: string;
  project_id: string;
  seller_id: string;
  buyer_id: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  buyer_profile?: { full_name: string | null; email: string | null };
  project?: { title: string; is_multi_sale: boolean };
}

export interface FoundUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

export interface MarketplaceFilter {
  tech?: string;
  search?: string;
  priceType?: 'free' | 'paid' | 'negotiable' | null;
  sortBy?: 'newest' | 'views';
}

const PROJECT_COLUMNS = 'id, user_id, title, description, tech_stack, price, price_negotiable, preview_url, photos, status, is_multi_sale, views, created_at, updated_at';

export const useMarketplaceProjects = (filter?: MarketplaceFilter) => {
  return useQuery({
    queryKey: ['marketplace', filter],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_projects')
        .select(PROJECT_COLUMNS)
        .eq('status', 'active');

      if (filter?.search) {
        query = query.ilike('title', `%${filter.search}%`);
      }
      if (filter?.tech) {
        query = query.contains('tech_stack', [filter.tech]);
      }
      if (filter?.priceType === 'negotiable') {
        query = query.eq('price_negotiable', true);
      } else if (filter?.priceType === 'free') {
        query = query.eq('price', 0);
      } else if (filter?.priceType === 'paid') {
        query = query.gt('price', 0);
      }
      if (filter?.sortBy === 'views') {
        query = query.order('views', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as MarketplaceProject[];
    },
  });
};

export const useMarketplaceProject = (id: string) => {
  return useQuery({
    queryKey: ['marketplace-project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_projects')
        .select(PROJECT_COLUMNS)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as MarketplaceProject;
    },
    enabled: !!id,
  });
};

export const useMyMarketplaceProjects = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['marketplace-mine', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('marketplace_projects')
        .select(PROJECT_COLUMNS)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as MarketplaceProject[];
    },
    enabled: !!user,
  });
};

export const useCreateMarketplaceProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: Omit<MarketplaceProject, 'id' | 'created_at' | 'updated_at' | 'views' | 'profile'>) => {
      const { data, error } = await supabase
        .from('marketplace_projects')
        .insert(project as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-mine'] });
    },
  });
};

export const useUpdateMarketplaceProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketplaceProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketplace_projects')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_: any, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-project', id] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-mine'] });
    },
  });
};

export const useDeleteMarketplaceProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketplace_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-mine'] });
    },
  });
};

// --- SALES ---

export const useSalesByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project-sales', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_sales')
        .select('*, buyer_profile:profiles!buyer_id(full_name, email)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MarketplaceSale[];
    },
    enabled: !!projectId,
  });
};

export const useMyPurchases = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('marketplace_sales')
        .select('*, project:marketplace_projects(title, is_multi_sale)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MarketplaceSale[];
    },
    enabled: !!user,
  });
};

export const useMyAccessForProject = (projectId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-access', projectId, user?.id],
    queryFn: async () => {
      if (!user || !projectId) return null;
      const { data } = await supabase
        .from('marketplace_sales')
        .select('*')
        .eq('project_id', projectId)
        .eq('buyer_id', user.id)
        .maybeSingle();
      return data as MarketplaceSale | null;
    },
    enabled: !!user && !!projectId,
  });
};

export const useSearchUserByEmail = () => {
  return useMutation({
    mutationFn: async (email: string): Promise<FoundUser | null> => {
      const { data, error } = await supabase
        .rpc('find_user_by_email', { search_email: email });
      if (error) throw error;
      if (!data || (data as any[]).length === 0) return null;
      return (data as any[])[0] as FoundUser;
    },
  });
};

export const useGrantAccess = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ projectId, buyerId }: { projectId: string; buyerId: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('marketplace_sales')
        .upsert({
          project_id: projectId,
          seller_id: user.id,
          buyer_id: buyerId,
          status: 'access_given',
        }, { onConflict: 'project_id,buyer_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_: any, { projectId }: { projectId: string; buyerId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['project-sales', projectId] });
    },
  });
};

export const useConfirmSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleId: string) => {
      const { error } = await supabase
        .rpc('confirm_marketplace_sale', { sale_id: saleId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['my-access'] });
      queryClient.invalidateQueries({ queryKey: ['project-sales'] });
    },
  });
};

export const useSendWarning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      const { error } = await supabase
        .from('user_warnings' as any)
        .insert({ user_id: userId, message });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-warnings'] });
    },
  });
};

export const useMyWarnings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-warnings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_warnings' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as { id: string; message: string; created_at: string }[];
    },
  });
};
