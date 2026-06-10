-- Add pricing and simulation builder columns

ALTER TABLE public.cyberrange_challenges
  ADD COLUMN IF NOT EXISTS price_gel int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_credits int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS custom_html text,
  ADD COLUMN IF NOT EXISTS custom_css text,
  ADD COLUMN IF NOT EXISTS custom_js text,
  ADD COLUMN IF NOT EXISTS simulation_config jsonb DEFAULT '{}'::jsonb;

-- Purchases table for paid challenges
CREATE TABLE IF NOT EXISTS public.cyberrange_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  amount_gel int,
  credits_used int,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.cyberrange_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own purchases readable" ON public.cyberrange_purchases FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "own purchases insert" ON public.cyberrange_purchases FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin manage purchases" ON public.cyberrange_purchases FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT, INSERT ON public.cyberrange_purchases TO authenticated;
GRANT ALL ON public.cyberrange_purchases TO service_role;

CREATE INDEX idx_cr_purchases_user ON public.cyberrange_purchases(user_id);
CREATE INDEX idx_cr_purchases_challenge ON public.cyberrange_purchases(challenge_id);

-- Helper: check if user has access to challenge
CREATE OR REPLACE FUNCTION public.cyberrange_has_access(_user_id uuid, _challenge_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cyberrange_challenges c
    WHERE c.id = _challenge_id
      AND (c.is_free = true OR c.price_gel = 0)
  )
  OR EXISTS (
    SELECT 1 FROM public.cyberrange_purchases p
    WHERE p.user_id = _user_id AND p.challenge_id = _challenge_id
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = _user_id AND r.role = 'admin'
  );
$$;
