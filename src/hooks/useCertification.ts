import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CertificationExam {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  total_questions: number;
  pass_threshold: number;
  price_gel: number;
  time_limit_minutes: number;
  is_active: boolean;
  final_assignment: string | null;
}

export interface ExamQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  exam_id: string;
  certificate_number: string;
  issued_at: string;
  certification_exams?: CertificationExam;
}

export const useCertificationExams = () => {
  return useQuery({
    queryKey: ['certification-exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certification_exams')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return data as CertificationExam[];
    },
  });
};

export const useExamAttempts = (examId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['exam-attempts', examId],
    queryFn: async () => {
      if (!user || !examId) return [];
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_id', examId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ExamAttempt[];
    },
    enabled: !!user && !!examId,
  });
};

export const useUserCertificates = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-certificates'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('certificates')
        .select('*, certification_exams(*)')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user,
  });
};

export const useStartExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (examId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/start-exam`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ examId }),
        }
      );

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Failed to start exam');
      return result as {
        attemptId: string;
        examName: string;
        timeLimit: number;
        passThreshold: number;
        questions: ExamQuestion[];
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  });
};

export const useSubmitExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ attemptId, answers }: { attemptId: string; answers: Record<string, string> }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/submit-exam`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ attemptId, answers }),
        }
      );

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Failed to submit exam');
      return result as {
        score: number;
        totalQuestions: number;
        passThreshold: number;
        passed: boolean;
        certificateNumber: string | null;
        certificateId: string | null;
        correctAnswers?: Record<string, string>;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['user-certificates'] });
    },
  });
};
