-- 1. Add package columns to vacancies (idempotent)
ALTER TABLE public.vacancies
  ADD COLUMN IF NOT EXISTS package_tier       TEXT        NOT NULL DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS package_paid       BOOLEAN              DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ;

-- 2. RPC: set tier after insert (bypasses PostgREST schema cache)
CREATE OR REPLACE FUNCTION public.set_vacancy_package_tier(
  p_vacancy_id uuid,
  p_tier        text
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.vacancies
  SET    package_tier = p_tier
  WHERE  id = p_vacancy_id;
$$;

GRANT EXECUTE ON FUNCTION public.set_vacancy_package_tier(uuid, text) TO authenticated;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
