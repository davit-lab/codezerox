import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VideoCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  cover_url: string | null;
  category: string | null;
  difficulty: string;
  price_gel: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface VideoCourseSection {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface VideoLecture {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_storage_path: string | null;
  duration_seconds: number;
  sort_order: number;
  is_free_preview: boolean;
  created_at: string;
}

export interface VideoAssignment {
  id: string;
  lecture_id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  lecture_id: string;
  course_id: string;
  position_seconds: number;
  completed: boolean;
  updated_at: string;
}

export interface VideoEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  expires_at: string | null;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useVideoCourses = () =>
  useQuery({
    queryKey: ['video-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_courses' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as VideoCourse[];
    },
  });

export const useAllVideoCourses = () =>
  useQuery({
    queryKey: ['video-courses-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_courses' as any)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as VideoCourse[];
    },
  });

export const useVideoCourse = (id: string) =>
  useQuery({
    queryKey: ['video-course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_courses' as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as VideoCourse | null;
    },
    enabled: !!id,
  });

export const useVideoCourseSections = (courseId: string) =>
  useQuery({
    queryKey: ['video-course-sections', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_course_sections' as any)
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as VideoCourseSection[];
    },
    enabled: !!courseId,
  });

export const useCourseLectures = (courseId: string) =>
  useQuery({
    queryKey: ['video-lectures-course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_lectures' as any)
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as VideoLecture[];
    },
    enabled: !!courseId,
  });

export const useSectionLectures = (sectionId: string) =>
  useQuery({
    queryKey: ['video-lectures-section', sectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_lectures' as any)
        .select('*')
        .eq('section_id', sectionId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as VideoLecture[];
    },
    enabled: !!sectionId,
  });

export const useVideoAssignments = (lectureId: string) =>
  useQuery({
    queryKey: ['video-assignments', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_assignments' as any)
        .select('*')
        .eq('lecture_id', lectureId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as VideoAssignment[];
    },
    enabled: !!lectureId,
  });

export const useVideoProgress = (lectureId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['video-progress', user?.id, lectureId],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('video_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('lecture_id', lectureId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as VideoProgress | null;
    },
    enabled: !!user && !!lectureId,
  });
};

export const useCourseProgress = (courseId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['video-course-progress', user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('video_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      if (error) throw error;
      return (data ?? []) as unknown as VideoProgress[];
    },
    enabled: !!user && !!courseId,
  });
};

export const useVideoEnrollment = (courseId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['video-enrollment', user?.id, courseId],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('video_enrollments' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as VideoEnrollment | null;
    },
    enabled: !!user && !!courseId,
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const useUpsertVideoCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: Partial<VideoCourse>) => {
      if (course.id) {
        const { id, created_at, updated_at, ...rest } = course as any;
        const { data, error } = await supabase
          .from('video_courses' as any)
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('video_courses' as any)
        .insert(course as any)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['video-courses'] });
      qc.invalidateQueries({ queryKey: ['video-courses-all'] });
    },
  });
};

export const useDeleteVideoCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('video_courses' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['video-courses'] });
      qc.invalidateQueries({ queryKey: ['video-courses-all'] });
    },
  });
};

export const useUpsertVideoSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (section: Partial<VideoCourseSection>) => {
      if (section.id) {
        const { id, created_at, ...rest } = section as any;
        const { data, error } = await supabase
          .from('video_course_sections' as any)
          .update(rest)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('video_course_sections' as any)
        .insert(section as any)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars: any) => {
      qc.invalidateQueries({ queryKey: ['video-course-sections', vars.course_id] });
    },
  });
};

export const useDeleteVideoSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, course_id }: { id: string; course_id: string }) => {
      const { error } = await supabase.from('video_course_sections' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['video-course-sections', vars.course_id] });
    },
  });
};

export const useUpsertVideoLecture = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lecture: Partial<VideoLecture>) => {
      if (lecture.id) {
        const { id, created_at, ...rest } = lecture as any;
        const { data, error } = await supabase
          .from('video_lectures' as any)
          .update(rest)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('video_lectures' as any)
        .insert(lecture as any)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars: any) => {
      qc.invalidateQueries({ queryKey: ['video-lectures-course', vars.course_id] });
      qc.invalidateQueries({ queryKey: ['video-lectures-section', vars.section_id] });
    },
  });
};

export const useDeleteVideoLecture = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, course_id, section_id }: { id: string; course_id: string; section_id: string }) => {
      const { error } = await supabase.from('video_lectures' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['video-lectures-course', vars.course_id] });
      qc.invalidateQueries({ queryKey: ['video-lectures-section', vars.section_id] });
    },
  });
};

export const useUpsertVideoAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: Partial<VideoAssignment>) => {
      if (assignment.id) {
        const { id, created_at, ...rest } = assignment as any;
        const { data, error } = await supabase
          .from('video_assignments' as any)
          .update(rest)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('video_assignments' as any)
        .insert(assignment as any)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars: any) => {
      qc.invalidateQueries({ queryKey: ['video-assignments', vars.lecture_id] });
    },
  });
};

export const useDeleteVideoAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lecture_id }: { id: string; lecture_id: string }) => {
      const { error } = await supabase.from('video_assignments' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['video-assignments', vars.lecture_id] });
    },
  });
};

export const useUpdateVideoProgress = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lecture_id,
      course_id,
      position_seconds,
      completed,
    }: {
      lecture_id: string;
      course_id: string;
      position_seconds: number;
      completed: boolean;
    }) => {
      if (!user) throw new Error('not_authenticated');
      const { error } = await supabase.from('video_progress' as any).upsert(
        {
          user_id: user.id,
          lecture_id,
          course_id,
          position_seconds,
          completed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lecture_id' }
      );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['video-progress', user?.id, vars.lecture_id] });
      qc.invalidateQueries({ queryKey: ['video-course-progress', user?.id, vars.course_id] });
    },
  });
};

export const useGrantVideoEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user_id,
      course_id,
      expires_at,
    }: {
      user_id: string;
      course_id: string;
      expires_at?: string | null;
    }) => {
      const { error } = await supabase.from('video_enrollments' as any).upsert(
        { user_id, course_id, expires_at: expires_at ?? null },
        { onConflict: 'user_id,course_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['video-enrollment'] });
    },
  });
};

export const useAllVideoEnrollments = () =>
  useQuery({
    queryKey: ['video-enrollments-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_enrollments' as any)
        .select('*')
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as VideoEnrollment[];
    },
  });

// Upload video to Supabase Storage (private bucket — returns path only, use signed URLs for playback)
export const uploadVideoFile = async (
  file: File,
  courseId: string,
  lectureTitle: string
): Promise<{ path: string }> => {
  const ext = file.name.split('.').pop() ?? 'mp4';
  const path = `${courseId}/${Date.now()}_${lectureTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
  const { error } = await supabase.storage.from('videos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return { path };
};

// Generate a short-lived signed URL for video playback (2 hours)
export const useVideoSignedUrl = (storagePath: string | null | undefined) => {
  return useQuery({
    queryKey: ['video-signed-url', storagePath],
    queryFn: async () => {
      if (!storagePath) return null;
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(storagePath, 7200); // 2 hours
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!storagePath,
    staleTime: 60 * 60 * 1000, // re-fetch after 1 hour
    gcTime: 2 * 60 * 60 * 1000,
  });
};
