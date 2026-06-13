import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserXP {
  user_id: string;
  total_xp: number;
  level: number;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface XPTransaction {
  id: string;
  amount: number;
  action_type: string;
  reference_id: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  book_purchase: "წიგნის შეძენა",
  book_review: "რევიუ",
  hub_project: "Hub პროექტი",
  community_message: "კომუნიტი შეტყობინება",
  blog_comment: "ბლოგის კომენტარი",
};

export const getActionLabel = (action: string) => ACTION_LABELS[action] || action;

const LEVEL_TITLES = [
  "დამწყები", "მოწაფე", "შეგირდი", "კოდერი", "დეველოპერი",
  "ინჟინერი", "სენიორი", "ექსპერტი", "მასტერი", "ლეგენდა",
];

export const getLevelTitle = (level: number) => LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || "ლეგენდა";

export const getLevelProgress = (totalXp: number, currentLevel: number) => {
  if (currentLevel >= 100) return 100; // Max level reached
  const xpInLevel = totalXp % 200;
  return Math.round((xpInLevel / 200) * 100);
};

// Leaderboard: top users (up to 1000), admins excluded server-side
export const useLeaderboard = (limit = 1000) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", { _limit: limit });
      if (error) throw error;
      if (!data || data.length === 0) return [] as UserXP[];

      // Fetch profiles in chunks to avoid large IN queries
      const userIds = (data as any[]).map((d: any) => d.user_id);
      const chunkSize = 200;
      const allProfiles: { user_id: string; full_name: string | null; avatar_url: string | null }[] = [];
      
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", chunk);
        if (profiles) allProfiles.push(...profiles);
      }

      const profileMap = new Map(allProfiles.map(p => [p.user_id, p]));
      return (data as any[]).map((d: any) => ({
        user_id: d.user_id,
        total_xp: d.total_xp,
        level: d.level,
        profiles: profileMap.get(d.user_id) || null,
      })) as UserXP[];
    },
  });
};

// Current user's XP
export const useMyXP = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-xp", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as { user_id: string; total_xp: number; level: number } | null;
    },
    enabled: !!user,
  });
};

// User's XP history
export const useXPHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["xp-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as XPTransaction[];
    },
    enabled: !!user,
  });
};
