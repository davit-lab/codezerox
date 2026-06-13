import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface HubProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  screenshot_url: string | null;
  live_url: string | null;
  github_url: string | null;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

export const useHubProjects = (sortBy: 'newest' | 'popular' = 'newest') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hub-projects', sortBy, user?.id],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from('hub_projects' as any)
        .select('*')
        .order(sortBy === 'popular' ? 'views' : 'created_at', { ascending: false });

      if (error) throw error;
      if (!projects || projects.length === 0) return [];

      const userIds = [...new Set((projects as any[]).map(p => p.user_id))];
      const projectIds = (projects as any[]).map(p => p.id);

      const [profilesRes, likesRes, commentsRes, userLikesRes] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', userIds),
        supabase.from('hub_project_likes' as any).select('project_id').in('project_id', projectIds),
        supabase.from('hub_project_comments' as any).select('project_id').in('project_id', projectIds),
        user
          ? supabase.from('hub_project_likes' as any).select('project_id').eq('user_id', user.id).in('project_id', projectIds)
          : { data: [] },
      ]);

      const profilesMap: Record<string, any> = {};
      (profilesRes.data || []).forEach((p: any) => { profilesMap[p.user_id] = p; });

      const likesCount: Record<string, number> = {};
      (likesRes.data || []).forEach((l: any) => { likesCount[l.project_id] = (likesCount[l.project_id] || 0) + 1; });

      const commentsCount: Record<string, number> = {};
      (commentsRes.data || []).forEach((c: any) => { commentsCount[c.project_id] = (commentsCount[c.project_id] || 0) + 1; });

      const userLikedSet = new Set((userLikesRes.data || []).map((l: any) => l.project_id));

      return (projects as any[]).map(p => ({
        ...p,
        tags: p.tags || [],
        profile: profilesMap[p.user_id] || null,
        likes_count: likesCount[p.id] || 0,
        comments_count: commentsCount[p.id] || 0,
        user_has_liked: userLikedSet.has(p.id),
      })) as HubProject[];
    },
  });
};

export const useProjectComments = (projectId: string | null) => {
  return useQuery({
    queryKey: ['hub-project-comments', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_project_comments' as any)
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data as any[]).map(c => c.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profilesMap[p.user_id] = p; });

      return (data as any[]).map(c => ({
        ...c,
        profile: profilesMap[c.user_id] || null,
      })) as ProjectComment[];
    },
  });
};

export const useCreateHubProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: {
      title: string;
      description?: string;
      screenshot_url?: string;
      live_url?: string;
      github_url?: string;
      tags?: string[];
    }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('hub_projects' as any).insert({
        ...project,
        user_id: session.session.user.id,
        tags: project.tags || [],
      } as any).select().single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hub-projects'] });
      toast.success('პროექტი წარმატებით დაემატა!');
    },
    onError: (err: any) => {
      toast.error(`პროექტის დამატება ვერ მოხერხდა: ${err.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteHubProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hub_projects' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hub-projects'] });
      toast.success('პროექტი წაიშალა');
    },
    onError: () => toast.error('წაშლა ვერ მოხერხდა'),
  });
};

export const useToggleProjectLike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');
      const userId = session.session.user.id;

      const { data: existing } = await supabase
        .from('hub_project_likes' as any)
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase.from('hub_project_likes' as any).delete().eq('id', (existing as any).id);
      } else {
        await supabase.from('hub_project_likes' as any).insert({ project_id: projectId, user_id: userId } as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hub-projects'] }),
    onError: () => toast.error('მოქმედება ვერ მოხერხდა'),
  });
};

export const useAddProjectComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, content }: { projectId: string; content: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { error } = await supabase.from('hub_project_comments' as any).insert({
        project_id: projectId,
        user_id: session.session.user.id,
        content,
      } as any);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hub-project-comments', vars.projectId] });
      qc.invalidateQueries({ queryKey: ['hub-projects'] });
    },
    onError: () => toast.error('კომენტარი ვერ გაიგზავნა'),
  });
};

export const useDeleteProjectComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, projectId }: { commentId: string; projectId: string }) => {
      const { error } = await supabase.from('hub_project_comments' as any).delete().eq('id', commentId);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ['hub-project-comments', projectId] });
      qc.invalidateQueries({ queryKey: ['hub-projects'] });
    },
    onError: () => toast.error('კომენტარის წაშლა ვერ მოხერხდა'),
  });
};
