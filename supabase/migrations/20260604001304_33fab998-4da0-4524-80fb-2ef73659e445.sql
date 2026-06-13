
-- 1. Profiles: drop overly permissive SELECT
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 2. Support tickets: tighten INSERT
DROP POLICY IF EXISTS "Anyone can create a support ticket" ON public.support_tickets;
CREATE POLICY "Users can create their own support ticket"
  ON public.support_tickets FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 3. User warnings: admin-only insert
DROP POLICY IF EXISTS "Authenticated insert warnings" ON public.user_warnings;
CREATE POLICY "Admins insert warnings"
  ON public.user_warnings FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Freelancer subscriptions: admin-only insert (service_role bypasses RLS)
DROP POLICY IF EXISTS "Service insert" ON public.freelancer_subscriptions;
CREATE POLICY "Admins insert freelancer subs"
  ON public.freelancer_subscriptions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Manual payment links: admins only (hide callback_token from regular users)
DROP POLICY IF EXISTS "Anyone can view active manual payment links" ON public.manual_payment_links;
ALTER TABLE public.manual_payment_links ADD COLUMN IF NOT EXISTS intended_user_id uuid;
-- Public view exposing only safe columns for active links
CREATE OR REPLACE VIEW public.manual_payment_links_public AS
  SELECT id, title, description, payment_url, book_id, package_id, amount, currency, is_active, created_at
  FROM public.manual_payment_links WHERE is_active = true;
GRANT SELECT ON public.manual_payment_links_public TO authenticated, anon;

-- 6. Cyberrange writeups: fix self-referencing predicate
DROP POLICY IF EXISTS "own writeup insert" ON public.cyberrange_writeups;
CREATE POLICY "own writeup insert"
  ON public.cyberrange_writeups FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.cyberrange_solves s
      WHERE s.user_id = auth.uid()
        AND s.challenge_id = cyberrange_writeups.challenge_id
    )
  );

DROP POLICY IF EXISTS "writeups readable after solving" ON public.cyberrange_writeups;
CREATE POLICY "writeups readable after solving"
  ON public.cyberrange_writeups FOR SELECT TO authenticated
  USING (
    (
      status = 'approved'
      AND EXISTS (
        SELECT 1 FROM public.cyberrange_solves s
        WHERE s.user_id = auth.uid()
          AND s.challenge_id = cyberrange_writeups.challenge_id
      )
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR user_id = auth.uid()
  );

-- 7. Cyberrange hint reveals (server-side hint accounting)
CREATE TABLE IF NOT EXISTS public.cyberrange_hint_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL,
  hint_id uuid,
  revealed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id, hint_id)
);
GRANT SELECT, INSERT ON public.cyberrange_hint_reveals TO authenticated;
GRANT ALL ON public.cyberrange_hint_reveals TO service_role;
ALTER TABLE public.cyberrange_hint_reveals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User reads own hint reveals"
  ON public.cyberrange_hint_reveals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "User inserts own hint reveals"
  ON public.cyberrange_hint_reveals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
