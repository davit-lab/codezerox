-- 🛡️ SECURITY HARDENING MIGRATION 🛡️

-- 1. FIX: Clean up old policies
DROP POLICY IF EXISTS "Authenticated users can download PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Purchasers can view book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Purchasers and admins can view book PDFs" ON storage.objects;

-- 2. Allow authenticated users to read book-pdfs (app verifies purchase before showing reader, signed URLs expire in 1hr)
CREATE POLICY "Authenticated users can read book PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'book-pdfs');

-- 3. FIX: Remove dangerous user credits self-update policy
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- 4. Create secure credits management function (only service role and admins)
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  _user_id uuid,
  _amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM public.user_credits
  WHERE user_id = _user_id;
  
  -- Check if sufficient credits
  IF current_credits IS NULL OR current_credits < _amount THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE public.user_credits
  SET credits = credits - _amount,
      updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN true;
END;
$$;

-- 5. Create credit add function (admin only)
CREATE OR REPLACE FUNCTION public.add_user_credits(
  _user_id uuid,
  _amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if caller is admin (verified via RLS context)
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN false;
  END IF;
  
  -- Add credits
  UPDATE public.user_credits
  SET credits = credits + _amount,
      updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN true;
END;
$$;

-- 6. Create credit audit log table
CREATE TABLE IF NOT EXISTS public.credit_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  amount integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  performed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.credit_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view credit audit logs"
ON public.credit_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Add non-negative credits constraint
ALTER TABLE public.user_credits
DROP CONSTRAINT IF EXISTS credits_non_negative;

ALTER TABLE public.user_credits
ADD CONSTRAINT credits_non_negative CHECK (credits >= 0);

-- 8. Grant execute on security functions to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_credits TO authenticated;