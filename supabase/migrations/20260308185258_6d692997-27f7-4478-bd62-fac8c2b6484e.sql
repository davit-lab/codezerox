CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 1000)
RETURNS TABLE(user_id uuid, total_xp integer, level integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ux.user_id, ux.total_xp, ux.level
  FROM public.user_xp ux
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = ux.user_id AND ur.role = 'admin'
  )
  ORDER BY ux.total_xp DESC
  LIMIT _limit;
$$;