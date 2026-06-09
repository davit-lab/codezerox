import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroBanner {
  id: string;
  page_key: string;
  page_label: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useHeroBanners = () =>
  useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("page_label");
      if (error) throw error;
      return data as HeroBanner[];
    },
  });

export const useHeroBanner = (pageKey: string) =>
  useQuery({
    queryKey: ["hero-banner", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();
      if (error) throw error;
      return data as HeroBanner | null;
    },
  });

export const useUpdateHeroBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, image_url }: { id: string; image_url: string | null }) => {
      const { error } = await supabase
        .from("hero_banners")
        .update({ image_url, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
      qc.invalidateQueries({ queryKey: ["hero-banner"] });
    },
  });
};
