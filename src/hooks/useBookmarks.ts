import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number;
  note: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useBookmarks = (bookId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookmarks", bookId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_bookmarks")
        .select("*")
        .eq("book_id", bookId)
        .eq("user_id", user!.id)
        .order("page_number", { ascending: true });
      if (error) throw error;
      return data as Bookmark[];
    },
    enabled: !!user && !!bookId,
  });
};

export const useAddBookmark = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bookId, pageNumber, note, color }: { bookId: string; pageNumber: number; note?: string; color?: string }) => {
      const { data, error } = await supabase
        .from("book_bookmarks")
        .insert({ user_id: user!.id, book_id: bookId, page_number: pageNumber, note: note || null, color: color || "gold" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["bookmarks", vars.bookId] });
    },
  });
};

export const useUpdateBookmark = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bookId, note, color }: { id: string; bookId: string; note?: string; color?: string }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (note !== undefined) updates.note = note;
      if (color !== undefined) updates.color = color;
      const { error } = await supabase.from("book_bookmarks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["bookmarks", vars.bookId] });
    },
  });
};

export const useDeleteBookmark = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bookId }: { id: string; bookId: string }) => {
      const { error } = await supabase.from("book_bookmarks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["bookmarks", vars.bookId] });
    },
  });
};
