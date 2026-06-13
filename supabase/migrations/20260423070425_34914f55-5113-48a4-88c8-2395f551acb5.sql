-- 1. Add 'mentor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentor';

-- 2. Add mentor ownership to mentoring_courses
ALTER TABLE public.mentoring_courses
  ADD COLUMN IF NOT EXISTS mentor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mentoring_courses_mentor_user_id ON public.mentoring_courses(mentor_user_id);
