-- Create password reset codes table
CREATE TABLE public.password_reset_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (edge functions will use service role)
CREATE POLICY "Service role can manage reset codes"
ON public.password_reset_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX idx_password_reset_codes_code ON public.password_reset_codes(code);

-- Auto-cleanup old codes (optional trigger)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    DELETE FROM public.password_reset_codes 
    WHERE expires_at < now() OR used = true;
    RETURN NEW;
END;
$function$;

CREATE TRIGGER cleanup_old_reset_codes
AFTER INSERT ON public.password_reset_codes
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_reset_codes();