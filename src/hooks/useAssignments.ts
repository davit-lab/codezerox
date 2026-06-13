import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AssignmentSubmission {
  id: string;
  user_id: string;
  exam_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export const useMySubmission = (examId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-assignment', examId],
    queryFn: async () => {
      if (!user || !examId) return null;
      const { data, error } = await supabase
        .from('exam_assignment_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_id', examId)
        .maybeSingle();
      if (error) throw error;
      return data as AssignmentSubmission | null;
    },
    enabled: !!user && !!examId,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, content }: { examId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upsert - if exists update, if not insert
      const { data: existing } = await supabase
        .from('exam_assignment_submissions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('exam_id', examId)
        .maybeSingle();

      if (existing) {
        if (existing.status !== 'pending' && existing.status !== 'rejected') {
          throw new Error('დავალება უკვე დადასტურებულია');
        }
        const { error } = await supabase
          .from('exam_assignment_submissions')
          .update({ content, status: 'pending', admin_feedback: null, reviewed_at: null })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exam_assignment_submissions')
          .insert({ user_id: user.id, exam_id: examId, content });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['my-assignment', vars.examId] });
    },
  });
};

// Admin hooks
export const useAllSubmissions = () => {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ['admin-assignment-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_assignment_submissions')
        .select('*, certification_exams(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });
};

export const useReviewAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, status, feedback, userId, examName }: {
      submissionId: string;
      status: 'approved' | 'rejected';
      feedback: string;
      userId: string;
      examName: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('exam_assignment_submissions')
        .update({
          status,
          admin_feedback: feedback || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);
      if (error) throw error;

      // Send notification to user
      const title = status === 'approved'
        ? '✅ დავალება დადასტურდა!'
        : '❌ დავალება უარყოფილია';
      const message = status === 'approved'
        ? `თქვენი ფინალური დავალება "${examName}" გამოცდისთვის დადასტურდა! გილოცავთ!`
        : `თქვენი ფინალური დავალება "${examName}" გამოცდისთვის უარყოფილია.${feedback ? ` კომენტარი: ${feedback}` : ''}`;

      await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: status === 'approved' ? 'success' : 'error',
          reference_id: submissionId,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignment-submissions'] });
    },
  });
};
