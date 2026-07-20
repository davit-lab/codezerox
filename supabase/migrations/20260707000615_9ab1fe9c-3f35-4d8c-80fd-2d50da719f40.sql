
-- 1) course_chapters: restrict to paid users, admins, or free preview (chapter 1)
DROP POLICY IF EXISTS "Anyone can view chapters" ON public.course_chapters;
CREATE POLICY "Chapters visible to enrolled users or preview"
ON public.course_chapters
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR chapter_number = 1
  OR EXISTS (
    SELECT 1 FROM public.course_subscriptions cs
    WHERE cs.user_id = auth.uid()
      AND cs.course_id = course_chapters.course_id
      AND cs.expires_at > now()
  )
  OR EXISTS (
    SELECT 1 FROM public.course_purchases cp
    WHERE cp.user_id = auth.uid()
      AND cp.course_id = course_chapters.course_id
  )
);
REVOKE SELECT ON public.course_chapters FROM anon;

-- 2) cyberrange_challenges: hide flag_hash from clients via column-level grants
REVOKE SELECT ON public.cyberrange_challenges FROM anon, authenticated;
GRANT SELECT (
  id, slug, category_id, title_ka, title_en, story_md, difficulty, engine,
  base_points, dynamic_scoring, flag_format, scenario, artifact_path, tags,
  min_rank_points, status, author_user_id, source, solves_count, rating,
  created_at, published_at, price_gel, price_credits, is_free,
  custom_html, custom_css, custom_js, simulation_config
) ON public.cyberrange_challenges TO anon, authenticated;
GRANT ALL ON public.cyberrange_challenges TO service_role;

-- 3) profiles: keep row visibility for authenticated users but hide the email column
DROP POLICY IF EXISTS "profiles_authenticated_select" ON public.profiles;
CREATE POLICY "profiles_authenticated_view_public_fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (
  id, user_id, full_name, avatar_url, cover_url, bio, experience,
  github_url, website_url, location, skills, created_at, updated_at
) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Admin helper: fetch a user's email (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.profiles
  WHERE user_id = _user_id
    AND has_role(auth.uid(), 'admin'::app_role);
$$;
