import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MentoringCourse {
  id: string;
  title: string;
  slug: string;
  language: string;
  short_description: string | null;
  description: string | null;
  duration_weeks: number;
  duration_hours: number;
  prerequisites: string | null;
  mentor_name: string;
  mentor_photo_url: string | null;
  mentor_bio: string | null;
  mentor_linkedin: string | null;
  mentor_user_id: string | null;
  cover_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MentoringPackage {
  id: string;
  course_id: string;
  name: string;
  description: string | null;
  price_gel: number;
  features: string[];
  sort_order: number;
  is_recommended: boolean;
}

export interface MentoringSyllabus {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export interface MentoringFaq {
  id: string;
  course_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface MentoringRegistration {
  id: string;
  user_id: string;
  course_id: string;
  package_id: string;
  amount_gel: number;
  status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
}

// Public: list active courses
export const useMentoringCourses = () => {
  return useQuery({
    queryKey: ['mentoring-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_courses' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MentoringCourse[];
    },
  });
};

// Admin: all courses
export const useAllMentoringCourses = () => {
  return useQuery({
    queryKey: ['mentoring-courses-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_courses' as any)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MentoringCourse[];
    },
  });
};

export const useMentoringCourse = (id: string) => {
  return useQuery({
    queryKey: ['mentoring-course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_courses' as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as MentoringCourse | null;
    },
    enabled: !!id,
  });
};

export const useMentoringPackages = (courseId: string) => {
  return useQuery({
    queryKey: ['mentoring-packages', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_packages' as any)
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MentoringPackage[];
    },
    enabled: !!courseId,
  });
};

export const useMentoringSyllabus = (courseId: string) => {
  return useQuery({
    queryKey: ['mentoring-syllabus', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_syllabus' as any)
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MentoringSyllabus[];
    },
    enabled: !!courseId,
  });
};

export const useMentoringFaq = (courseId: string) => {
  return useQuery({
    queryKey: ['mentoring-faq', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_faq' as any)
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MentoringFaq[];
    },
    enabled: !!courseId,
  });
};

// Mutations - courses
export const useUpsertMentoringCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: Partial<MentoringCourse>) => {
      const payload = { ...course };
      if (payload.id) {
        const { id, ...rest } = payload;
        const { data, error } = await supabase
          .from('mentoring_courses' as any)
          .update(rest as any)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('mentoring_courses' as any)
        .insert(payload as any)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentoring-courses'] });
      qc.invalidateQueries({ queryKey: ['mentoring-courses-all'] });
    },
  });
};

export const useDeleteMentoringCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mentoring_courses' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentoring-courses'] });
      qc.invalidateQueries({ queryKey: ['mentoring-courses-all'] });
    },
  });
};

// Generic helpers for child tables
const childMutations = (table: 'mentoring_packages' | 'mentoring_syllabus' | 'mentoring_faq', invalidateKey: string) => {
  return {
    useUpsert: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: async (item: any) => {
          if (item.id) {
            const { id, ...rest } = item;
            const { data, error } = await supabase.from(table as any).update(rest).eq('id', id).select().maybeSingle();
            if (error) throw error;
            return data;
          }
          const { data, error } = await supabase.from(table as any).insert(item).select().maybeSingle();
          if (error) throw error;
          return data;
        },
        onSuccess: (_d, vars: any) => {
          qc.invalidateQueries({ queryKey: [invalidateKey, vars.course_id] });
        },
      });
    },
    useDelete: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: async ({ id }: { id: string; course_id: string }) => {
          const { error } = await supabase.from(table as any).delete().eq('id', id);
          if (error) throw error;
        },
        onSuccess: (_d, vars) => {
          qc.invalidateQueries({ queryKey: [invalidateKey, vars.course_id] });
        },
      });
    },
  };
};

const pkgM = childMutations('mentoring_packages', 'mentoring-packages');
export const useUpsertMentoringPackage = pkgM.useUpsert;
export const useDeleteMentoringPackage = pkgM.useDelete;

const sylM = childMutations('mentoring_syllabus', 'mentoring-syllabus');
export const useUpsertMentoringSyllabus = sylM.useUpsert;
export const useDeleteMentoringSyllabus = sylM.useDelete;

const faqM = childMutations('mentoring_faq', 'mentoring-faq');
export const useUpsertMentoringFaq = faqM.useUpsert;
export const useDeleteMentoringFaq = faqM.useDelete;

// Registrations
export const useCreateMentoringRegistration = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { course_id: string; package_id: string; amount_gel: number; notes?: string }) => {
      if (!user) throw new Error('not_authenticated');
      const { data, error } = await supabase
        .from('mentoring_registrations' as any)
        .insert({
          user_id: user.id,
          course_id: input.course_id,
          package_id: input.package_id,
          amount_gel: input.amount_gel,
          notes: input.notes ?? null,
          status: 'pending',
        })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentoring-registrations'] });
      qc.invalidateQueries({ queryKey: ['my-mentoring-registrations'] });
    },
  });
};

export const useMyMentoringRegistrations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-mentoring-registrations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('mentoring_registrations' as any)
        .select('*, mentoring_courses(title, slug), mentoring_packages(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useAllMentoringRegistrations = () => {
  return useQuery({
    queryKey: ['mentoring-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_registrations' as any)
        .select('*, mentoring_courses(title, slug), mentoring_packages(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useUpdateMentoringRegistrationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('mentoring_registrations' as any)
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentoring-registrations'] });
    },
  });
};
