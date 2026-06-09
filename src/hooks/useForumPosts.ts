import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ForumPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes_count: number;
  views_count: number;
  comments_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
  user_liked?: boolean;
}

export const useForumPosts = (category?: string) => {
  const { data: authData } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  return useQuery({
    queryKey: ["forum-posts", category],
    queryFn: async () => {
      let q = supabase
        .from("forum_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (category && category !== "all") q = q.eq("category", category);

      const { data: posts, error } = await q;
      if (error) throw error;
      if (!posts || posts.length === 0) return [] as ForumPost[];

      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", authorIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

      let likedSet = new Set<string>();
      if (authData?.id) {
        const { data: likes } = await supabase
          .from("forum_post_likes")
          .select("post_id")
          .eq("user_id", authData.id)
          .in("post_id", posts.map((p) => p.id));
        (likes ?? []).forEach((l) => likedSet.add(l.post_id));
      }

      return posts.map((p) => ({
        ...p,
        profile: profileMap.get(p.author_id) ?? null,
        user_liked: likedSet.has(p.id),
      })) as ForumPost[];
    },
  });
};

export const useMyForumPostCount = (userId?: string) => {
  return useQuery({
    queryKey: ["forum-post-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count } = await supabase
        .from("forum_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", userId)
        .eq("is_published", true);
      return count ?? 0;
    },
    enabled: !!userId,
  });
};

export const useCreateForumPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: {
      title: string;
      content: string;
      category: string;
      tags: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({ ...post, author_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum-posts"] });
      qc.invalidateQueries({ queryKey: ["forum-post-count"] });
    },
  });
};

export const useToggleForumLike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (liked) {
        await supabase.from("forum_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("forum_post_likes").insert({ post_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-posts"] }),
  });
};

export const useIncrementForumViews = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      await supabase.rpc("increment_forum_views", { _post_id: postId });
    },
  });
};
