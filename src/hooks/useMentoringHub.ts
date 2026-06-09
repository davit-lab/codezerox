import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type HubRole = 'mentor' | 'mentor_assistant' | 'top_student' | 'student';

export interface HubMember {
  id: string;
  course_id: string;
  user_id: string;
  role: HubRole;
  muted: boolean;
  banned: boolean;
  joined_at: string;
  profile?: { full_name: string | null; avatar_url: string | null; email: string | null } | null;
}

export type ChannelCategory = 'general' | 'voice' | 'lecture' | 'assignment';

export interface HubChannel {
  id: string;
  course_id: string;
  name: string;
  type: 'text' | 'voice';
  sort_order: number;
  category?: ChannelCategory;
  min_tier?: number;
  can_send_min_tier?: number;
}

export interface HubLecture {
  id: string;
  course_id: string;
  channel_id: string | null;
  title: string;
  description: string | null;
  recording_url: string | null;
  duration_seconds: number | null;
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

export interface HubAssignmentSubmission {
  id: string;
  assignment_id: string;
  course_id: string;
  user_id: string;
  attachment_url: string | null;
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

export interface HubMessage {
  id: string;
  channel_id: string;
  course_id: string;
  user_id: string;
  content: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

// Resolve course by slug
export const useMentoringCourseBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['mentoring-course-by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_courses' as any)
        .select('id, slug, title, language, mentor_name')
        .eq('slug', slug!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });
};

// Access check: am I admin or member of this course's hub?
export const useHubAccess = (courseId?: string) => {
  const { user, isAdmin } = useAuth();
  return useQuery({
    queryKey: ['hub-access', courseId, user?.id, isAdmin],
    queryFn: async () => {
      if (!courseId || !user) return false;
      if (isAdmin) return true;
      const { data, error } = await supabase
        .from('mentoring_hub_members' as any)
        .select('id, banned')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) return false;
      if (!data) {
        // Maybe they paid but trigger missed: check registrations
        const { data: reg } = await supabase
          .from('mentoring_registrations' as any)
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .in('status', ['paid', 'granted'])
          .maybeSingle();
        return !!reg;
      }
      return !(data as any).banned;
    },
    enabled: !!courseId && !!user,
  });
};

export const useHubChannels = (courseId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['hub-channels', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_channels' as any)
        .select('*')
        .eq('course_id', courseId!)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as HubChannel[];
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`hub-channels-${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_channels', filter: `course_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: ['hub-channels', courseId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId, qc]);

  return q;
};

export const useHubMembers = (courseId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['hub-members', courseId],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from('mentoring_hub_members' as any)
        .select('*')
        .eq('course_id', courseId!);
      if (error) throw error;
      const list = (members ?? []) as any[];
      const userIds = list.map(m => m.user_id);
      let profiles: Record<string, any> = {};
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, email')
          .in('user_id', userIds);
        profiles = Object.fromEntries((profs ?? []).map(p => [p.user_id, p]));
      }
      return list.map(m => ({ ...m, profile: profiles[m.user_id] ?? null })) as HubMember[];
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`hub-members-${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_hub_members', filter: `course_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: ['hub-members', courseId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId, qc]);

  return q;
};

export const useChannelMessages = (channelId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_channel_messages' as any)
        .select('*')
        .eq('channel_id', channelId!)
        .order('created_at', { ascending: true })
        .limit(200);
      if (error) throw error;
      const list = (data ?? []) as any[];
      const ids = Array.from(new Set(list.map(m => m.user_id)));
      let profiles: Record<string, any> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from('profiles').select('user_id, full_name, avatar_url').in('user_id', ids);
        profiles = Object.fromEntries((profs ?? []).map(p => [p.user_id, p]));
      }
      return list.map(m => ({ ...m, profile: profiles[m.user_id] ?? null })) as HubMessage[];
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;
    const ch = supabase
      .channel(`channel-msg-${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_channel_messages', filter: `channel_id=eq.${channelId}` },
        () => qc.invalidateQueries({ queryKey: ['channel-messages', channelId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [channelId, qc]);

  return q;
};

export const useSendChannelMessage = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      channelId, courseId, content, attachmentUrl, attachmentName, attachmentType,
    }: {
      channelId: string; courseId: string; content: string;
      attachmentUrl?: string | null; attachmentName?: string | null; attachmentType?: string | null;
    }) => {
      if (!user) throw new Error('not_authenticated');
      const { error } = await supabase.from('mentoring_channel_messages' as any).insert({
        channel_id: channelId,
        course_id: courseId,
        user_id: user.id,
        content,
        attachment_url: attachmentUrl ?? null,
        attachment_name: attachmentName ?? null,
        attachment_type: attachmentType ?? null,
      });
      if (error) throw error;
    },
  });
};

export const useDeleteChannelMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, channelId }: { id: string; channelId: string }) => {
      const { error } = await supabase.from('mentoring_channel_messages' as any).delete().eq('id', id);
      if (error) throw error;
      return { channelId };
    },
    onSuccess: ({ channelId }) => qc.invalidateQueries({ queryKey: ['channel-messages', channelId] }),
  });
};

// ---------- Admin: channel CRUD ----------
export const useUpsertChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<HubChannel> & { course_id: string; name: string; type?: 'text'|'voice' }) => {
      if (item.id) {
        const { id, ...rest } = item as any;
        const { error } = await supabase.from('mentoring_channels' as any).update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('mentoring_channels' as any).insert({
          course_id: item.course_id, name: item.name, type: item.type ?? 'text',
          sort_order: item.sort_order ?? 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['hub-channels', (vars as any).course_id] }),
  });
};

export const useDeleteChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from('mentoring_channels' as any).delete().eq('id', id);
      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-channels', courseId] }),
  });
};

// ---------- Admin: members ----------
export const useUpdateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId, ...patch }: { id: string; courseId: string; role?: HubRole; muted?: boolean; banned?: boolean }) => {
      const { error } = await supabase.from('mentoring_hub_members' as any).update(patch).eq('id', id);
      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-members', courseId] }),
  });
};

export const useRemoveMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from('mentoring_hub_members' as any).delete().eq('id', id);
      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-members', courseId] }),
  });
};

export const useAddMemberByEmail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, email, role }: { courseId: string; email: string; role?: HubRole }) => {
      // find profile by email
      const { data: prof, error: pe } = await supabase
        .from('profiles').select('user_id').eq('email', email.trim().toLowerCase()).maybeSingle();
      if (pe) throw pe;
      if (!prof) throw new Error('მომხმარებელი ვერ მოიძებნა ამ მეილით');
      // create granted registration (trigger will add hub member)
      const { error: re } = await supabase.from('mentoring_registrations' as any).insert({
        user_id: (prof as any).user_id, course_id: courseId, package_id: null,
        amount_gel: 0, status: 'granted',
      } as any);
      // If insert fails because package_id is required, fallback to direct member insert
      if (re) {
        const { error: me } = await supabase.from('mentoring_hub_members' as any).insert({
          course_id: courseId, user_id: (prof as any).user_id, role: role ?? 'student',
        });
        if (me) throw me;
      } else if (role && role !== 'student') {
        // update role on the auto-created member row
        await supabase.from('mentoring_hub_members' as any)
          .update({ role })
          .eq('course_id', courseId)
          .eq('user_id', (prof as any).user_id);
      }
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-members', courseId] }),
  });
};

// ---------- Friendships ----------
export const useFriendships = (courseId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['hub-friendships', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_friendships' as any)
        .select('*')
        .eq('course_id', courseId!)
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!courseId && !!user,
  });

  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`hub-friends-${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_friendships', filter: `course_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: ['hub-friendships', courseId, user?.id] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId, user?.id, qc]);

  return q;
};

export const useSendFriendRequest = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, addresseeId }: { courseId: string; addresseeId: string }) => {
      if (!user) throw new Error('not_authenticated');
      const { error } = await supabase.from('mentoring_friendships' as any).insert({
        course_id: courseId, requester_id: user.id, addressee_id: addresseeId, status: 'pending',
      });
      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-friendships', courseId] }),
  });
};

export const useRespondFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, courseId }: { id: string; status: 'accepted' | 'declined'; courseId: string }) => {
      const { error } = await supabase.from('mentoring_friendships' as any).update({ status }).eq('id', id);
      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => qc.invalidateQueries({ queryKey: ['hub-friendships', courseId] }),
  });
};

// ---------- DMs ----------
export const useOrCreateDM = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ courseId, otherUserId }: { courseId: string; otherUserId: string }) => {
      if (!user) throw new Error('not_authenticated');
      const [a, b] = [user.id, otherUserId].sort();
      const { data: existing } = await supabase
        .from('mentoring_dms' as any)
        .select('id')
        .eq('course_id', courseId).eq('user_a', a).eq('user_b', b).maybeSingle();
      if (existing) return (existing as any).id as string;
      const { data, error } = await supabase
        .from('mentoring_dms' as any)
        .insert({ course_id: courseId, user_a: a, user_b: b })
        .select('id').single();
      if (error) throw error;
      return (data as any).id as string;
    },
  });
};

export const useDMList = (courseId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['hub-dms', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_dms' as any)
        .select('*')
        .eq('course_id', courseId!)
        .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      const dms = (data ?? []) as any[];
      const otherIds = dms.map(d => d.user_a === user!.id ? d.user_b : d.user_a);
      let profiles: Record<string, any> = {};
      if (otherIds.length) {
        const { data: profs } = await supabase
          .from('profiles').select('user_id, full_name, avatar_url').in('user_id', otherIds);
        profiles = Object.fromEntries((profs ?? []).map(p => [p.user_id, p]));
      }
      return dms.map(d => {
        const otherId = d.user_a === user!.id ? d.user_b : d.user_a;
        return { ...d, other: profiles[otherId] ?? null, otherId };
      });
    },
    enabled: !!courseId && !!user,
  });

  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`hub-dms-${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_dms', filter: `course_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: ['hub-dms', courseId, user?.id] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId, user?.id, qc]);

  return q;
};

export const useDMMessages = (dmId?: string) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['dm-messages', dmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_dm_messages' as any)
        .select('*').eq('dm_id', dmId!)
        .order('created_at', { ascending: true }).limit(200);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!dmId,
  });

  useEffect(() => {
    if (!dmId) return;
    const ch = supabase
      .channel(`dm-msg-${dmId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_dm_messages', filter: `dm_id=eq.${dmId}` },
        () => qc.invalidateQueries({ queryKey: ['dm-messages', dmId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [dmId, qc]);

  return q;
};

export const useSendDM = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ dmId, content }: { dmId: string; content: string }) => {
      if (!user) throw new Error('not_authenticated');
      const { error } = await supabase.from('mentoring_dm_messages' as any).insert({
        dm_id: dmId, sender_id: user.id, content,
      });
      if (error) throw error;
    },
  });
};

// ---------- Voice presence ----------
export const useVoicePresence = (channelId?: string, courseId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['voice-sessions', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_voice_sessions' as any)
        .select('*').eq('channel_id', channelId!);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;
    const ch = supabase
      .channel(`voice-${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentoring_voice_sessions', filter: `channel_id=eq.${channelId}` },
        () => qc.invalidateQueries({ queryKey: ['voice-sessions', channelId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [channelId, qc]);

  const join = async () => {
    if (!user || !channelId || !courseId) return;
    await supabase.from('mentoring_voice_sessions' as any).upsert(
      { channel_id: channelId, course_id: courseId, user_id: user.id },
      { onConflict: 'channel_id,user_id' }
    );
  };
  const leave = async () => {
    if (!user || !channelId) return;
    await supabase.from('mentoring_voice_sessions' as any)
      .delete().eq('channel_id', channelId).eq('user_id', user.id);
  };

  return { ...q, join, leave };
};
