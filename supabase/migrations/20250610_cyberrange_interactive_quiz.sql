-- Interactive steps for cyberrange challenges (engine = 'interactive')
CREATE TABLE IF NOT EXISTS public.cyberrange_interactive_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  step_order int NOT NULL DEFAULT 0,
  step_type text NOT NULL DEFAULT 'prompt' CHECK (step_type IN ('prompt','form','code','reveal','choice')),
  content_ka text NOT NULL DEFAULT '',
  expected_answer text,
  next_step_on_success uuid REFERENCES public.cyberrange_interactive_steps(id) ON DELETE SET NULL,
  hint_ka text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cyberrange_interactive_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interactive steps readable on published" ON public.cyberrange_interactive_steps FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cyberrange_challenges c WHERE c.id = challenge_id AND (c.status='published' OR has_role(auth.uid(),'admin'::app_role))));
CREATE POLICY "interactive steps admin" ON public.cyberrange_interactive_steps FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX idx_cr_interactive_challenge ON public.cyberrange_interactive_steps(challenge_id, step_order);

-- Quiz questions for cyberrange challenges (engine = 'quiz')
CREATE TABLE IF NOT EXISTS public.cyberrange_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  question_ka text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_option_index int NOT NULL DEFAULT 0,
  explanation_ka text,
  sort_order int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cyberrange_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz questions readable on published" ON public.cyberrange_quiz_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cyberrange_challenges c WHERE c.id = challenge_id AND (c.status='published' OR has_role(auth.uid(),'admin'::app_role))));
CREATE POLICY "quiz questions admin" ON public.cyberrange_quiz_questions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX idx_cr_quiz_challenge ON public.cyberrange_quiz_questions(challenge_id, sort_order);

-- User progress for interactive steps and quizzes
CREATE TABLE IF NOT EXISTS public.cyberrange_user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'started' CHECK (status IN ('started','completed','failed')),
  current_step_id uuid REFERENCES public.cyberrange_interactive_steps(id) ON DELETE SET NULL,
  quiz_score int DEFAULT 0,
  quiz_answers jsonb DEFAULT '{}'::jsonb,
  points_earned int DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.cyberrange_user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress readable" ON public.cyberrange_user_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "own progress write" ON public.cyberrange_user_progress FOR ALL TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));
CREATE INDEX idx_cr_progress_user ON public.cyberrange_user_progress(user_id);
CREATE INDEX idx_cr_progress_challenge ON public.cyberrange_user_progress(challenge_id);

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cyberrange_interactive_steps TO authenticated;
GRANT ALL ON public.cyberrange_interactive_steps TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cyberrange_quiz_questions TO authenticated;
GRANT ALL ON public.cyberrange_quiz_questions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cyberrange_user_progress TO authenticated;
GRANT ALL ON public.cyberrange_user_progress TO service_role;
