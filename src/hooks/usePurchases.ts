import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Book } from './useBooks';
import { playSound } from '@/lib/sounds';

export interface Purchase {
  id: string;
  user_id: string;
  book_id: string;
  purchased_at: string;
  book?: Book;
}

export const usePurchases = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          book:books(
            *,
            category:categories(*)
          )
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });
      
      if (error) throw error;
      return data as Purchase[];
    },
    enabled: !!user,
  });
};

export const usePurchase = (bookId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['purchase', user?.id, bookId],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!bookId,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          book_id: bookId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, bookId) => {
      playSound('purchase');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', user?.id, bookId] });
    },
  });
};

// Helper: get a working URL for a book-pdf file
const getBookPdfBlobUrl = async (pdfPath: string): Promise<string> => {
  const path = pdfPath.includes('book-pdfs/')
    ? pdfPath.split('book-pdfs/')[1]
    : pdfPath;

  // Try signed URL first
  const { data: signedData, error: signedError } = await supabase.storage
    .from('book-pdfs')
    .createSignedUrl(path, 3600);

  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  // Fallback: download as blob
  const { data: blobData, error: blobError } = await supabase.storage
    .from('book-pdfs')
    .download(path);

  if (blobError || !blobData) {
    throw blobError || new Error('PDF ვერ ჩაიტვირთა');
  }

  return URL.createObjectURL(blobData);
};

// Get URL for PDF
export const useBookPdfUrl = (bookId: string, pdfPath: string | null, isFree: boolean = false) => {
  const { user } = useAuth();
  const { data: purchase } = usePurchase(bookId);
  
  const hasAccess = !!purchase || isFree;
  
  return useQuery({
    queryKey: ['book-pdf-url', bookId, pdfPath],
    queryFn: () => getBookPdfBlobUrl(pdfPath!),
    enabled: !!user && hasAccess && !!pdfPath,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Get URL for PDF preview (no purchase required)
export const useBookPreviewPdfUrl = (bookId: string, pdfPath: string | null) => {
  return useQuery({
    queryKey: ['book-preview-pdf-url', bookId, pdfPath],
    queryFn: () => getBookPdfBlobUrl(pdfPath!),
    enabled: !!pdfPath,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
