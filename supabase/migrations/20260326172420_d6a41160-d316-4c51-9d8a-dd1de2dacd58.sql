DELETE FROM public.activity_log;
DROP FUNCTION IF EXISTS public.cleanup_old_activity_logs();