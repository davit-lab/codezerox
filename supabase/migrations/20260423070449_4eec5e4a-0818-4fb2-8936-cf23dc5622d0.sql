-- Security definer helper to check course-mentor ownership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_course_mentor(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mentoring_courses
    WHERE id = _course_id AND mentor_user_id = _user_id
  );
$$;

-- ===== mentoring_courses: allow assigned mentor to view + update their own course =====
DROP POLICY IF EXISTS "Mentors can view their assigned course" ON public.mentoring_courses;
CREATE POLICY "Mentors can view their assigned course"
  ON public.mentoring_courses FOR SELECT
  TO authenticated
  USING (mentor_user_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can update their assigned course" ON public.mentoring_courses;
CREATE POLICY "Mentors can update their assigned course"
  ON public.mentoring_courses FOR UPDATE
  TO authenticated
  USING (mentor_user_id = auth.uid())
  WITH CHECK (mentor_user_id = auth.uid());

-- ===== mentoring_packages =====
DROP POLICY IF EXISTS "Mentors can manage packages of their courses" ON public.mentoring_packages;
CREATE POLICY "Mentors can manage packages of their courses"
  ON public.mentoring_packages FOR ALL
  TO authenticated
  USING (public.is_course_mentor(auth.uid(), course_id))
  WITH CHECK (public.is_course_mentor(auth.uid(), course_id));

-- ===== mentoring_syllabus =====
DROP POLICY IF EXISTS "Mentors can manage syllabus of their courses" ON public.mentoring_syllabus;
CREATE POLICY "Mentors can manage syllabus of their courses"
  ON public.mentoring_syllabus FOR ALL
  TO authenticated
  USING (public.is_course_mentor(auth.uid(), course_id))
  WITH CHECK (public.is_course_mentor(auth.uid(), course_id));

-- ===== mentoring_faq =====
DROP POLICY IF EXISTS "Mentors can manage faq of their courses" ON public.mentoring_faq;
CREATE POLICY "Mentors can manage faq of their courses"
  ON public.mentoring_faq FOR ALL
  TO authenticated
  USING (public.is_course_mentor(auth.uid(), course_id))
  WITH CHECK (public.is_course_mentor(auth.uid(), course_id));

-- ===== mentoring_registrations: mentor can view registrations for their courses =====
DROP POLICY IF EXISTS "Mentors can view registrations of their courses" ON public.mentoring_registrations;
CREATE POLICY "Mentors can view registrations of their courses"
  ON public.mentoring_registrations FOR SELECT
  TO authenticated
  USING (public.is_course_mentor(auth.uid(), course_id));

-- ===== mentoring_channels =====
DROP POLICY IF EXISTS "Mentors can manage channels of their courses" ON public.mentoring_channels;
CREATE POLICY "Mentors can manage channels of their courses"
  ON public.mentoring_channels FOR ALL
  TO authenticated
  USING (public.is_course_mentor(auth.uid(), course_id))
  WITH CHECK (public.is_course_mentor(auth.uid(), course_id));

-- ===== mentoring_hub_members =====
DROP POLICY IF EXISTS "Mentors can manage members of their courses" ON public.mentoring_hub_members;
CREATE POLICY "Mentors can manage members of their courses"
  ON public.mentoring_hub_members FOR ALL
  TO authenticated
  USING (public.is_course_mentor(auth.uid(), course_id))
  WITH CHECK (public.is_course_mentor(auth.uid(), course_id));

-- ===== mentoring_channel_messages: mentors can moderate messages in their courses =====
DROP POLICY IF EXISTS "Mentors can moderate messages of their courses" ON public.mentoring_channel_messages;
CREATE POLICY "Mentors can moderate messages of their courses"
  ON public.mentoring_channel_messages FOR DELETE
  TO authenticated
  USING (public.is_course_mentor(auth.uid(), course_id));
