import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface HubLecture {
  id: string;
  course_id: string;
  channel_id: string | null;
  title: string;
  description: string | null;
  recording_url: string | null;
  duration_seconds: number | null;
  views_count: number;
  min_tier: number;
  recorded_at: string;
  created_by: string | null;
  created_at: string;
}

export interface HubAssignment {
  id: string;
  course_id: string;
  channel_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  min_tier: number;
  created_by: string | null;
  created_at: string;
}

export interface SubmissionAttachment {
  url: string;
  name: string;
  type: string;
  size?: number;
}

export interface HubAssignmentSubmission {
  id: string;
  assignment_id: string;
  course_id: string;
  user_id: string;
  attachment_url: string | null;
  attachments: SubmissionAttachment[];
  content: string | null;
  grade: number | null;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
}

export interface HubLiveSession {
  id: string;
  course_id: string;
  channel_id: string;
  host_user_id: string;
  title: string | null;
  is_recording: boolean;
  started_at: string;
  ended_at: string | null;
}

// ---------- Current user's tier in this course ----------
export const useMyHubMembership = (courseId?: string) => {
  const { user, isAdmin } = useAuth();
  return useQuery({
    queryKey: ['my-hub-membership', courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user) return null;
      const { data } = await supabase
        .from('mentoring_hub_members' as any)
        .select('id, role, package_tier, banned, muted')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();
      // Admins get max tier implicitly via UI gating
      if (!data && isAdmin) return { role: 'mentor', package_tier: 3, muted: false, banned: false } as any;
      return data as any;
    },
    enabled: !!courseId && !!user,
  });
};

// ---------- Lectures ----------
export const useLectures = (courseId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['hub-lectures', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_lectures' as any)
        .select('*')
        .eq('course_id', courseId!)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as HubLecture[];
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`hub-lectures-${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_lectures', filter: `course_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: ['hub-lectures', courseId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId, qc]);

  return q;
};

export const useUpsertLecture = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<HubLecture> & { course_id: string; title: string }) => {
      if (item.id) {
        const { id, ...rest } = item as any;
        const { error } = await supabase.from('mentoring_lectures' as any).update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('mentoring_lectures' as any).insert({
          course_id: item.course_id,
          channel_id: item.channel_id ?? null,
          title: item.title,
          description: item.description ?? null,
          recording_url: item.recording_url ?? null,
          duration_seconds: item.duration_seconds ?? null,
          min_tier: item.min_tier ?? 1,
          created_by: user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['hub-lectures', (vars as any).course_id] }),
  });
};

export const useDeleteLecture = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from('mentoring_lectures' as any).delete().eq('id', id);
      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-lectures', courseId] }),
  });
};

export const useIncrementLectureView = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lectureId, courseId }: { lectureId: string; courseId: string }) => {
      await supabase.rpc('increment_lecture_view' as any, { _lecture_id: lectureId } as any);
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-lectures', courseId] }),
  });
};

// ---------- Live sessions ----------
export const useLiveSessions = (courseId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['hub-live-sessions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_live_sessions' as any)
        .select('*')
        .eq('course_id', courseId!)
        .is('ended_at', null);
      if (error) throw error;
      return (data ?? []) as unknown as HubLiveSession[];
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`hub-live-${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_live_sessions', filter: `course_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: ['hub-live-sessions', courseId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId, qc]);

  return q;
};

export const useStartLiveSession = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ courseId, channelId, title }: { courseId: string; channelId: string; title?: string }) => {
      if (!user) throw new Error('not_authenticated');
      const { data, error } = await supabase
        .from('mentoring_live_sessions' as any)
        .insert({ course_id: courseId, channel_id: channelId, host_user_id: user.id, title: title ?? null, is_recording: true })
        .select('id').single();
      if (error) throw error;
      return (data as any).id as string;
    },
  });
};

export const useEndLiveSession = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('mentoring_live_sessions' as any)
        .update({ ended_at: new Date().toISOString(), is_recording: false })
        .eq('id', id);
      if (error) throw error;
    },
  });
};

// ---------- Assignments ----------
export const useAssignments = (courseId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['hub-assignments', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_assignments' as any)
        .select('*')
        .eq('course_id', courseId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as HubAssignment[];
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`hub-assignments-${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_assignments', filter: `course_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: ['hub-assignments', courseId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId, qc]);

  return q;
};

export const useUpsertAssignment = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<HubAssignment> & { course_id: string; title: string }) => {
      if (item.id) {
        const { id, ...rest } = item as any;
        const { error } = await supabase.from('mentoring_assignments' as any).update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('mentoring_assignments' as any).insert({
          course_id: item.course_id,
          channel_id: item.channel_id ?? null,
          title: item.title,
          description: item.description ?? null,
          due_at: item.due_at ?? null,
          min_tier: item.min_tier ?? 1,
          created_by: user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['hub-assignments', (vars as any).course_id] }),
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from('mentoring_assignments' as any).delete().eq('id', id);
      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-assignments', courseId] }),
  });
};

// ---------- Submissions ----------
export const useMySubmission = (assignmentId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-submission', assignmentId, user?.id],
    queryFn: async () => {
      if (!assignmentId || !user) return null;
      const { data } = await supabase
        .from('mentoring_assignment_submissions' as any)
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .maybeSingle();
      return data as unknown as HubAssignmentSubmission | null;
    },
    enabled: !!assignmentId && !!user,
  });
};

// Mentor/admin view of all submissions for one assignment
export const useAllSubmissions = (assignmentId?: string, courseId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['all-submissions', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_assignment_submissions' as any)
        .select('*')
        .eq('assignment_id', assignmentId!)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      const list = (data ?? []) as any[];
      const ids = Array.from(new Set(list.map(s => s.user_id)));
      let profiles: Record<string, any> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from('profiles').select('user_id, full_name, avatar_url, email').in('user_id', ids);
        profiles = Object.fromEntries((profs ?? []).map(p => [p.user_id, p]));
      }
      return list.map(s => ({ ...s, profile: profiles[s.user_id] ?? null }));
    },
    enabled: !!assignmentId,
  });

  useEffect(() => {
    if (!assignmentId) return;
    const ch = supabase
      .channel(`hub-subs-${assignmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_assignment_submissions', filter: `assignment_id=eq.${assignmentId}` },
        () => qc.invalidateQueries({ queryKey: ['all-submissions', assignmentId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [assignmentId, qc]);

  return q;
};

// Aggregate stats only (for non-mentor users)
export const useSubmissionStats = (assignmentId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['submission-stats', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_assignment_submission_stats', { _assignment_id: assignmentId! });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return { submitted: Number(row?.submitted ?? 0), total: Number(row?.total ?? 0) };
    },
    enabled: !!assignmentId,
  });

  useEffect(() => {
    if (!assignmentId) return;
    const ch = supabase
      .channel(`hub-stats-${assignmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_assignment_submissions', filter: `assignment_id=eq.${assignmentId}` },
        () => qc.invalidateQueries({ queryKey: ['submission-stats', assignmentId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [assignmentId, qc]);

  return q;
};

export const useSubmitAssignment = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      assignmentId, courseId, content, attachments,
    }: { assignmentId: string; courseId: string; content?: string; attachments?: SubmissionAttachment[] }) => {
      if (!user) throw new Error('not_authenticated');
      const atts = attachments ?? [];
      const firstUrl = atts[0]?.url ?? null;
      // Upsert by (assignment_id, user_id) unique key
      const { data: existing } = await supabase
        .from('mentoring_assignment_submissions' as any)
        .select('id, reviewed_at')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing && (existing as any).reviewed_at) {
        throw new Error('უკვე შეფასებულია, ვეღარ ცვლი');
      }
      if (existing) {
        const { error } = await supabase.from('mentoring_assignment_submissions' as any)
          .update({
            content: content ?? null,
            attachment_url: firstUrl,
            attachments: atts as any,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('mentoring_assignment_submissions' as any).insert({
          assignment_id: assignmentId,
          course_id: courseId,
          user_id: user.id,
          content: content ?? null,
          attachment_url: firstUrl,
          attachments: atts as any,
        });
        if (error) throw error;
      }
      return { assignmentId };
    },
    onSuccess: ({ assignmentId }) => {
      qc.invalidateQueries({ queryKey: ['my-submission', assignmentId] });
      qc.invalidateQueries({ queryKey: ['submission-stats', assignmentId] });
      qc.invalidateQueries({ queryKey: ['all-submissions', assignmentId] });
    },
  });
};

export const useGradeSubmission = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      id, assignmentId, grade, feedback,
    }: { id: string; assignmentId: string; grade: number | null; feedback: string | null }) => {
      const { error } = await supabase.from('mentoring_assignment_submissions' as any)
        .update({
          grade,
          feedback,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      return { assignmentId };
    },
    onSuccess: ({ assignmentId }) => qc.invalidateQueries({ queryKey: ['all-submissions', assignmentId] }),
  });
};
