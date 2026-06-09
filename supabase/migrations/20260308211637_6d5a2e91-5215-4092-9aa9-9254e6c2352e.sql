
-- Certification exams table
CREATE TABLE public.certification_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'frontend', 'backend', 'cyber'
  subcategory TEXT, -- 'html_css_js', 'csharp', 'javascript', 'python', 'sql', etc
  description TEXT,
  total_questions INTEGER NOT NULL DEFAULT 50,
  pass_threshold INTEGER NOT NULL DEFAULT 40,
  price_gel NUMERIC NOT NULL DEFAULT 10,
  time_limit_minutes INTEGER NOT NULL DEFAULT 120,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam questions table
CREATE TABLE public.exam_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL, -- 'a', 'b', 'c', 'd'
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam attempts table
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB, -- store user answers
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exam_id)
);

-- Enable RLS
ALTER TABLE public.certification_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Exams: anyone can view active exams, admins can manage
CREATE POLICY "Anyone can view active exams" ON public.certification_exams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage exams" ON public.certification_exams FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Questions: only visible during exam (via edge function), admins can manage
CREATE POLICY "Admins can manage questions" ON public.exam_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Attempts: users can manage their own
CREATE POLICY "Users can view own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Certificates: users can view own, anyone can verify
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can verify certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "System can create certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
