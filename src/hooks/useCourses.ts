import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  price: number;
  monthly_price: number;
  difficulty: string | null;
  duration_hours: number | null;
  total_chapters: number;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CourseChapter {
  id: string;
  course_id: string;
  chapter_number: number;
  title: string;
  description: string | null;
  content: string | null;
  content_type: string | null;
  code_template: string | null;
  expected_output: string | null;
  quiz_data: any;
  terminal_commands: any;
  created_at: string;
  updated_at: string;
}

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useAllCourses = () => {
  return useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Course;
    },
    enabled: !!id,
  });
};

export const useCourseChapters = (courseId: string) => {
  return useQuery({
    queryKey: ['course-chapters', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('chapter_number', { ascending: true });
      if (error) throw error;
      return data as CourseChapter[];
    },
    enabled: !!courseId,
  });
};

export const useCoursePurchase = (courseId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['course-purchase', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_purchases')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!user,
  });
};

export const useMyCoursePurchases = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-course-purchases', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_purchases')
        .select('*, courses(*)')
        .eq('user_id', user!.id)
        .order('purchased_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateCoursePurchase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('course_purchases')
        .insert({ user_id: user!.id, course_id: courseId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-course-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['course-purchase'] });
    },
  });
};

export const useCourseProgress = (courseId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['course-progress', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!user,
  });
};

export const useUpdateCourseProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, chapterId, completed, score }: { courseId: string; chapterId: string; completed: boolean; score?: number }) => {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user!.id,
          course_id: courseId,
          chapter_id: chapterId,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          score: score ?? null,
        }, { onConflict: 'user_id,course_id,chapter_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', vars.courseId] });
    },
  });
};

// Admin mutations
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (course: Partial<Course>) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(course as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['all-courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      const { error } = await supabase
        .from('courses')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['all-courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['all-courses'] });
    },
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chapter: Partial<CourseChapter>) => {
      const { data, error } = await supabase
        .from('course_chapters')
        .insert(chapter as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['course-chapters', vars.course_id] });
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CourseChapter> & { id: string }) => {
      const { error } = await supabase
        .from('course_chapters')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-chapters'] });
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('course_chapters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-chapters'] });
    },
  });
};
