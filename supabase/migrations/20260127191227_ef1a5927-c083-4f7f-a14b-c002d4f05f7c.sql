-- Create rate limiting table for password reset attempts
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier text NOT NULL,
    action text NOT NULL,
    attempt_count integer NOT NULL DEFAULT 1,
    first_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
    last_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
    blocked_until timestamp with time zone,
    UNIQUE(identifier, action)
);

-- Enable RLS - only service role can access this table
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- No public access - only service role operations via edge functions
CREATE POLICY "No public access to rate limits"
ON public.rate_limit_attempts
FOR ALL
USING (false)
WITH CHECK (false);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON public.rate_limit_attempts(identifier, action);

-- Create cleanup function for expired rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.rate_limit_attempts 
    WHERE first_attempt_at < now() - interval '1 hour';
    RETURN NEW;
END;
$$;

-- Create trigger to cleanup old entries periodically
DROP TRIGGER IF EXISTS cleanup_rate_limits ON public.rate_limit_attempts;
CREATE TRIGGER cleanup_rate_limits
AFTER INSERT ON public.rate_limit_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_rate_limit_entries();