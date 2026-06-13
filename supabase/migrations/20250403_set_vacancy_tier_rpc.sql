-- RPC function to set package_tier on a vacancy.
-- Called from the frontend after insert to bypass PostgREST schema cache issues.
CREATE OR REPLACE FUNCTION public.set_vacancy_package_tier(
  p_vacancy_id uuid,
  p_tier        text
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.vacancies
  SET package_tier = p_tier
  WHERE id = p_vacancy_id;
$$;

GRANT EXECUTE ON FUNCTION public.set_vacancy_package_tier(uuid, text) TO authenticated;
