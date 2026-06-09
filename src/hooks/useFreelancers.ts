import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FreelancerProfile {
  id: string;
  user_id: string;
  title: string | null;
  bio: string | null;
  hourly_rate: number | null;
  availability: string;
  experience_level: string;
  languages: string[];
  created_at: string;
  updated_at: string;
  full_name?: string;
  avatar_url?: string;
  skills?: string[];
  projects?: FreelancerProject[];
}

export interface FreelancerProject {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  created_at: string;
}

export const useFreelancerProfiles = () => {
  return useQuery({
    queryKey: ['freelancer-profiles'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all(
        (profiles as any[]).map(async (p) => {
          const [skillsRes, profileRes] = await Promise.all([
            supabase.from('freelancer_skills').select('skill_name').eq('profile_id', p.id),
            supabase.from('profiles').select('full_name, avatar_url').eq('user_id', p.user_id).single(),
          ]);
          return {
            ...p,
            languages: p.languages || [],
            experience_level: p.experience_level || 'junior',
            skills: (skillsRes.data || []).map((s: any) => s.skill_name),
            full_name: profileRes.data?.full_name || 'უცნობი',
            avatar_url: profileRes.data?.avatar_url || null,
          } as FreelancerProfile;
        })
      );
      return enriched;
    },
  });
};

export const useFreelancerProfile = (id: string) => {
  return useQuery({
    queryKey: ['freelancer-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      const [skillsRes, projectsRes, profileRes] = await Promise.all([
        supabase.from('freelancer_skills').select('*').eq('profile_id', id),
        supabase.from('freelancer_projects').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('full_name, avatar_url').eq('user_id', (data as any).user_id).single(),
      ]);

      return {
        ...data,
        languages: (data as any).languages || [],
        experience_level: (data as any).experience_level || 'junior',
        skills: (skillsRes.data || []).map((s: any) => s.skill_name),
        projects: (projectsRes.data || []) as FreelancerProject[],
        full_name: profileRes.data?.full_name || 'უცნობი',
        avatar_url: profileRes.data?.avatar_url || null,
      } as FreelancerProfile;
    },
    enabled: !!id,
  });
};

export const useMyFreelancerProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-freelancer-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const [skillsRes, projectsRes] = await Promise.all([
        supabase.from('freelancer_skills').select('*').eq('profile_id', (data as any).id),
        supabase.from('freelancer_projects').select('*').eq('profile_id', (data as any).id).order('created_at', { ascending: false }),
      ]);

      return {
        ...data,
        languages: (data as any).languages || [],
        experience_level: (data as any).experience_level || 'junior',
        skills: (skillsRes.data || []).map((s: any) => s.skill_name),
        projects: (projectsRes.data || []) as FreelancerProject[],
      } as FreelancerProfile;
    },
    enabled: !!user,
  });
};

export const useUpsertFreelancerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: {
      title: string;
      bio: string;
      hourly_rate: number | null;
      availability: string;
      skills: string[];
      experience_level: string;
      languages: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let profileId: string;
      if (existing) {
        profileId = (existing as any).id;
        const { error } = await supabase
          .from('freelancer_profiles')
          .update({
            title: profile.title,
            bio: profile.bio,
            hourly_rate: profile.hourly_rate,
            availability: profile.availability,
            experience_level: profile.experience_level,
            languages: profile.languages,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('freelancer_profiles')
          .insert({
            user_id: user.id,
            title: profile.title,
            bio: profile.bio,
            hourly_rate: profile.hourly_rate,
            availability: profile.availability,
            experience_level: profile.experience_level,
            languages: profile.languages,
          } as any)
          .select('id')
          .single();
        if (error) throw error;
        profileId = (data as any).id;
      }

      // Replace skills
      await supabase.from('freelancer_skills').delete().eq('profile_id', profileId);
      if (profile.skills.length > 0) {
        const { error } = await supabase
          .from('freelancer_skills')
          .insert(profile.skills.map(s => ({ profile_id: profileId, skill_name: s })));
        if (error) throw error;
      }

      return profileId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['freelancer-profiles'] });
      qc.invalidateQueries({ queryKey: ['my-freelancer-profile'] });
    },
  });
};

export const useAddFreelancerProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: { profile_id: string; title: string; description: string; image_url: string | null; live_url: string | null; github_url: string | null }) => {
      const { data, error } = await supabase.from('freelancer_projects').insert(project).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-freelancer-profile'] });
      qc.invalidateQueries({ queryKey: ['freelancer-profile'] });
    },
  });
};

export const useDeleteFreelancerProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('freelancer_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-freelancer-profile'] });
      qc.invalidateQueries({ queryKey: ['freelancer-profile'] });
    },
  });
};

export const useDeleteFreelancerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profileId: string) => {
      // Delete skills, projects, then profile
      await supabase.from('freelancer_skills').delete().eq('profile_id', profileId);
      await supabase.from('freelancer_projects').delete().eq('profile_id', profileId);
      const { error } = await supabase.from('freelancer_profiles').delete().eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['freelancer-profiles'] });
      qc.invalidateQueries({ queryKey: ['my-freelancer-profile'] });
    },
  });
};
