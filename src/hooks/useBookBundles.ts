import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BookBundle {
  id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  items?: BookBundleItem[];
}

export interface BookBundleItem {
  id: string;
  bundle_id: string;
  book_id: string;
  book?: {
    id: string;
    title: string;
    author: string;
    price: number;
    cover_url: string | null;
    is_free: boolean;
  };
}

// Fetch all bundles (admin)
export const useAdminBundles = () => {
  return useQuery({
    queryKey: ['admin-book-bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_bundles' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as BookBundle[];
    },
  });
};

// Fetch bundle items for a specific bundle
export const useBundleItems = (bundleId: string | null) => {
  return useQuery({
    queryKey: ['bundle-items', bundleId],
    queryFn: async () => {
      if (!bundleId) return [];
      const { data, error } = await supabase
        .from('book_bundle_items' as any)
        .select('*, book:book_id(id, title, author, price, cover_url, is_free)')
        .eq('bundle_id', bundleId);
      if (error) throw error;
      return (data || []) as BookBundleItem[];
    },
    enabled: !!bundleId,
  });
};

// Fetch active bundles with their items (user-facing)
export const useActiveBundles = () => {
  return useQuery({
    queryKey: ['active-book-bundles'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data: bundles, error } = await supabase
        .from('book_bundles' as any)
        .select('*')
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`expires_at.is.null,expires_at.gte.${now}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!bundles || bundles.length === 0) return [];

      const bundleIds = (bundles as any[]).map(b => b.id);
      const { data: items, error: itemsError } = await supabase
        .from('book_bundle_items' as any)
        .select('*, book:book_id(id, title, author, price, cover_url, is_free)')
        .in('bundle_id', bundleIds);

      if (itemsError) throw itemsError;

      return (bundles as BookBundle[]).map(bundle => ({
        ...bundle,
        items: ((items || []) as BookBundleItem[]).filter(i => i.bundle_id === bundle.id),
      }));
    },
  });
};

// Create bundle
export const useCreateBundle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      discount_type: 'percentage' | 'fixed';
      discount_value: number;
      starts_at?: string;
      expires_at?: string;
      book_ids: string[];
    }) => {
      const { book_ids, ...bundleData } = payload;

      const { data: bundle, error } = await supabase
        .from('book_bundles' as any)
        .insert(bundleData as any)
        .select()
        .single();
      if (error) throw error;

      if (book_ids.length > 0) {
        const items = book_ids.map(book_id => ({
          bundle_id: (bundle as any).id,
          book_id,
        }));
        const { error: itemsError } = await supabase
          .from('book_bundle_items' as any)
          .insert(items as any);
        if (itemsError) throw itemsError;
      }

      return bundle;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-book-bundles'] });
      qc.invalidateQueries({ queryKey: ['active-book-bundles'] });
      toast.success('ფასდაკლება შეიქმნა!');
    },
    onError: () => toast.error('ფასდაკლების შექმნა ვერ მოხერხდა'),
  });
};

// Update bundle
export const useUpdateBundle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      title?: string;
      description?: string;
      discount_type?: 'percentage' | 'fixed';
      discount_value?: number;
      is_active?: boolean;
      starts_at?: string | null;
      expires_at?: string | null;
      book_ids?: string[];
    }) => {
      const { id, book_ids, ...updates } = payload;

      const { error } = await supabase
        .from('book_bundles' as any)
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;

      if (book_ids !== undefined) {
        // Replace all items
        await supabase
          .from('book_bundle_items' as any)
          .delete()
          .eq('bundle_id', id);

        if (book_ids.length > 0) {
          const items = book_ids.map(book_id => ({ bundle_id: id, book_id }));
          const { error: itemsError } = await supabase
            .from('book_bundle_items' as any)
            .insert(items as any);
          if (itemsError) throw itemsError;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-book-bundles'] });
      qc.invalidateQueries({ queryKey: ['active-book-bundles'] });
      qc.invalidateQueries({ queryKey: ['bundle-items'] });
      toast.success('ფასდაკლება განახლდა!');
    },
    onError: () => toast.error('განახლება ვერ მოხერხდა'),
  });
};

// Delete bundle
export const useDeleteBundle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('book_bundles' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-book-bundles'] });
      qc.invalidateQueries({ queryKey: ['active-book-bundles'] });
      toast.success('ფასდაკლება წაიშალა');
    },
    onError: () => toast.error('წაშლა ვერ მოხერხდა'),
  });
};

// Toggle active status
export const useToggleBundle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('book_bundles' as any)
        .update({ is_active } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-book-bundles'] });
      qc.invalidateQueries({ queryKey: ['active-book-bundles'] });
    },
  });
};

// Helper: calculate bundle discount for a set of cart book IDs
export function calculateBundleDiscount(
  bundles: BookBundle[],
  cartBookIds: string[]
): { bundle: BookBundle; savings: number } | null {
  if (!bundles || bundles.length === 0 || cartBookIds.length === 0) return null;

  let bestMatch: { bundle: BookBundle; savings: number } | null = null;

  for (const bundle of bundles) {
    if (!bundle.items || bundle.items.length === 0) continue;

    const bundleBookIds = bundle.items.map(i => i.book_id);
    const allInCart = bundleBookIds.every(id => cartBookIds.includes(id));

    if (allInCart) {
      const bundleTotal = bundle.items.reduce((sum, item) => {
        return sum + (item.book?.price || 0);
      }, 0);

      const savings = bundle.discount_type === 'percentage'
        ? bundleTotal * (bundle.discount_value / 100)
        : Math.min(bundle.discount_value, bundleTotal);

      if (!bestMatch || savings > bestMatch.savings) {
        bestMatch = { bundle, savings };
      }
    }
  }

  return bestMatch;
}
