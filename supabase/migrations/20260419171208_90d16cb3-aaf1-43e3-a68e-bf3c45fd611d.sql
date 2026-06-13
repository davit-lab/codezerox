
-- Mentoring courses
CREATE TABLE public.mentoring_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  duration_weeks INTEGER DEFAULT 0,
  duration_hours INTEGER DEFAULT 0,
  prerequisites TEXT,
  mentor_name TEXT NOT NULL,
  mentor_photo_url TEXT,
  mentor_bio TEXT,
  mentor_linkedin TEXT,
  cover_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Packages (3 tiers)
CREATE TABLE public.mentoring_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_gel NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Syllabus chapters
CREATE TABLE public.mentoring_syllabus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FAQ
CREATE TABLE public.mentoring_faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registrations
CREATE TABLE public.mentoring_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.mentoring_packages(id) ON DELETE RESTRICT,
  amount_gel NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_provider TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_mentoring_packages_course ON public.mentoring_packages(course_id);
CREATE INDEX idx_mentoring_syllabus_course ON public.mentoring_syllabus(course_id);
CREATE INDEX idx_mentoring_faq_course ON public.mentoring_faq(course_id);
CREATE INDEX idx_mentoring_registrations_user ON public.mentoring_registrations(user_id);
CREATE INDEX idx_mentoring_registrations_course ON public.mentoring_registrations(course_id);

-- Enable RLS
ALTER TABLE public.mentoring_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_registrations ENABLE ROW LEVEL SECURITY;

-- Courses policies: anyone views active, admins manage
CREATE POLICY "Anyone can view active courses" ON public.mentoring_courses
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all courses" ON public.mentoring_courses
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage courses" ON public.mentoring_courses
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Packages: anyone views (for active courses), admins manage
CREATE POLICY "Anyone can view packages" ON public.mentoring_packages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mentoring_courses c WHERE c.id = course_id AND (c.is_active = true OR has_role(auth.uid(), 'admin'::app_role)))
  );
CREATE POLICY "Admins manage packages" ON public.mentoring_packages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Syllabus: same pattern
CREATE POLICY "Anyone can view syllabus" ON public.mentoring_syllabus
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mentoring_courses c WHERE c.id = course_id AND (c.is_active = true OR has_role(auth.uid(), 'admin'::app_role)))
  );
CREATE POLICY "Admins manage syllabus" ON public.mentoring_syllabus
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- FAQ: same pattern
CREATE POLICY "Anyone can view faq" ON public.mentoring_faq
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mentoring_courses c WHERE c.id = course_id AND (c.is_active = true OR has_role(auth.uid(), 'admin'::app_role)))
  );
CREATE POLICY "Admins manage faq" ON public.mentoring_faq
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Registrations: user sees own, admin sees all
CREATE POLICY "Users view own registrations" ON public.mentoring_registrations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all registrations" ON public.mentoring_registrations
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users create registrations" ON public.mentoring_registrations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update registrations" ON public.mentoring_registrations
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete registrations" ON public.mentoring_registrations
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER trg_mentoring_courses_updated BEFORE UPDATE ON public.mentoring_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mentoring_packages_updated BEFORE UPDATE ON public.mentoring_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mentoring_registrations_updated BEFORE UPDATE ON public.mentoring_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
