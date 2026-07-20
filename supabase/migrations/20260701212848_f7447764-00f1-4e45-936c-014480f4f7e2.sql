
-- 1. book_updates: restrict to admins and purchasers
DROP POLICY IF EXISTS "Anyone can view book updates" ON public.book_updates;
CREATE POLICY "Purchasers view book updates" ON public.book_updates
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.purchases p WHERE p.user_id = auth.uid() AND p.book_id = book_updates.book_id)
  );
REVOKE SELECT ON public.book_updates FROM anon;

-- 2. profiles: remove public/anon exposure of emails
DROP POLICY IF EXISTS profiles_public_select ON public.profiles;
CREATE POLICY profiles_authenticated_select ON public.profiles
  FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 3. support_tickets: remove from realtime publication to prevent broadcast leakage
ALTER PUBLICATION supabase_realtime DROP TABLE public.support_tickets;

-- 4. vacancies: hide contact_email/contact_phone from anonymous visitors via column grants
REVOKE SELECT ON public.vacancies FROM anon;
GRANT SELECT (
  id, user_id, title, company_name, description, requirements, location,
  job_type, salary_amount, salary_type, salary_currency, is_active, category,
  experience_level, created_at, updated_at, package_tier, package_paid, package_expires_at
) ON public.vacancies TO anon;

-- 5. video_lectures: restrict to admins, enrolled users, or free previews
DROP POLICY IF EXISTS read_video_lectures ON public.video_lectures;
CREATE POLICY read_video_lectures ON public.video_lectures
  FOR SELECT TO authenticated
  USING (
    is_free_preview = true
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.video_enrollments e
      WHERE e.user_id = auth.uid() AND e.course_id = video_lectures.course_id
    )
  );
REVOKE SELECT ON public.video_lectures FROM anon;
