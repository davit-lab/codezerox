-- Hack Lab Tables
CREATE TABLE IF NOT EXISTS public.hack_lab_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_price_gel INT NOT NULL DEFAULT 29,
  is_active BOOL NOT NULL DEFAULT true,
  age_verification_required BOOL NOT NULL DEFAULT true,
  min_age INT NOT NULL DEFAULT 18,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.hack_lab_settings (monthly_price_gel, is_active, age_verification_required, min_age, description)
VALUES (29, true, true, 18, 'ეთიკური ჰაკინგის სრული კურსი — 300+ ლექცია')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.hack_lab_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  module_name TEXT NOT NULL DEFAULT 'General',
  order_index INT NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  duration_min INT NOT NULL DEFAULT 20,
  is_published BOOL NOT NULL DEFAULT false,
  is_free BOOL NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hack_lab_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  price_gel INT NOT NULL DEFAULT 29,
  expires_at TIMESTAMPTZ NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.hack_lab_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.hack_lab_lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- RLS
ALTER TABLE public.hack_lab_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hack_lab_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hack_lab_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hack_lab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.hack_lab_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can view published lessons" ON public.hack_lab_lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage lessons" ON public.hack_lab_lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users view own subscription" ON public.hack_lab_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage subscriptions" ON public.hack_lab_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users manage own progress" ON public.hack_lab_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all progress" ON public.hack_lab_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
