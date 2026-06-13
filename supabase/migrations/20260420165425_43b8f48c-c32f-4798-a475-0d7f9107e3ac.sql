
ALTER FUNCTION public.is_mentoring_hub_member(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.has_paid_mentoring(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.can_access_mentoring_hub(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.auto_add_hub_member() SET search_path = public;
