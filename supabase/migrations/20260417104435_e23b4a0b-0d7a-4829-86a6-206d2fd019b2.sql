
-- =====================================================================
-- SECURITY HARDENING MIGRATION
-- =====================================================================

-- 1) PROFILES: remove anonymous read access (email exposure)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles publicly" ON public.profiles;

-- Authenticated users can view profile basics (still needed for chat, freelancers, etc.)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2) VACANCY CVS: fix overly permissive storage policy
DROP POLICY IF EXISTS "Vacancy owners can view CVs" ON storage.objects;

-- CV path format used in code: {user_id}/{vacancy_id}/{filename}
-- Allow: vacancy owner OR the uploader (CV owner)
CREATE POLICY "Vacancy owners and uploaders can view CVs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vacancy-cvs' AND (
    -- The user who uploaded (first folder segment is their user_id)
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- The vacancy owner (second folder segment is the vacancy id)
    EXISTS (
      SELECT 1 FROM public.vacancies v
      WHERE v.id::text = (storage.foldername(name))[2]
        AND v.user_id = auth.uid()
    )
  )
);

-- 3) PROMO CODES: don't expose discount details to all authenticated users
DROP POLICY IF EXISTS "Anyone can view active promo codes by code" ON public.promo_codes;

-- Validation should happen server-side via security definer function
CREATE OR REPLACE FUNCTION public.validate_promo_code(_code text)
RETURNS TABLE(code text, discount_type text, discount_value numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT pc.code, pc.discount_type, pc.discount_value
  FROM public.promo_codes pc
  WHERE pc.code = upper(trim(_code))
    AND pc.is_active = true
    AND (pc.expires_at IS NULL OR pc.expires_at > now())
    AND (pc.max_uses IS NULL OR pc.current_uses < pc.max_uses);
END;
$$;
