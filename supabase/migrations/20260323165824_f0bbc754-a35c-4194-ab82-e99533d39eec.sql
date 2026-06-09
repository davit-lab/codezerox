
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.activity_log
  WHERE created_at < now() - interval '30 days';
END;
$$;
