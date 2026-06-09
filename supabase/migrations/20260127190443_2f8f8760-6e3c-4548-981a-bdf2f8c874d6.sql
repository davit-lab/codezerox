-- Fix password_reset_codes RLS - remove public access
DROP POLICY IF EXISTS "Service role can manage reset codes" ON public.password_reset_codes;

-- Create proper restrictive policies for password_reset_codes
-- Only service role should access this table (via edge functions)
CREATE POLICY "No public access to reset codes"
ON public.password_reset_codes
FOR ALL
USING (false)
WITH CHECK (false);

-- Also fix code_snippets "Anyone can create snippets" policy
DROP POLICY IF EXISTS "Anyone can create snippets" ON public.code_snippets;

-- Create proper policy requiring authentication for creating snippets
CREATE POLICY "Authenticated users can create snippets"
ON public.code_snippets
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);