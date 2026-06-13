
-- ============ PRICING CONFIG ============
CREATE TABLE public.pricing_config (
  key text PRIMARY KEY,
  label text NOT NULL,
  amount_gel numeric(10,2) NOT NULL DEFAULT 0,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.pricing_config TO anon, authenticated;
GRANT ALL ON public.pricing_config TO service_role;

ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_config readable by everyone"
ON public.pricing_config FOR SELECT
USING (true);

CREATE POLICY "pricing_config admin write"
ON public.pricing_config FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed default pricing
INSERT INTO public.pricing_config (key, label, amount_gel, description) VALUES
  ('vacancy_basic',     'ვაკანსია - საბაზისო',  10, 'ერთი ვაკანსიის გამოქვეყნება 30 დღით'),
  ('vacancy_premium',   'ვაკანსია - პრემიუმი',  25, 'პრემიუმ ვაკანსია 30 დღით'),
  ('vacancy_featured',  'ვაკანსია - გამორჩეული', 50, 'გამორჩეული ვაკანსია 30 დღით'),
  ('freelancer_monthly','ფრილანსერი - თვიური',  15, 'ფრილანსერი პროფილი 30 დღით'),
  ('freelancer_pro',    'ფრილანსერი - PRO',     30, 'PRO ფრილანსერი 30 დღით'),
  ('marketplace_upload','პროექტის ატვირთვა',     5, 'პროექტის გამოქვეყნება 30 დღით'),
  ('kids_monthly',      'საბავშვო ანგარიში - თვიური', 20, 'ბავშვის ანგარიში 30 დღით')
ON CONFLICT (key) DO NOTHING;

-- ============ SITE CREDITS WALLET ============
CREATE TABLE public.site_credits_wallet (
  user_id uuid PRIMARY KEY,
  balance numeric(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_credits_wallet TO authenticated;
GRANT ALL ON public.site_credits_wallet TO service_role;

ALTER TABLE public.site_credits_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet self read"
ON public.site_credits_wallet FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "wallet admin write"
ON public.site_credits_wallet FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.site_credits_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('refund','spend','admin_grant','admin_deduct')),
  reason text,
  ref_id text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_credits_transactions TO authenticated;
GRANT ALL ON public.site_credits_transactions TO service_role;

ALTER TABLE public.site_credits_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credits tx self read"
ON public.site_credits_transactions FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "credits tx admin write"
ON public.site_credits_transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RPC: admin grants credits (refund or grant)
CREATE OR REPLACE FUNCTION public.admin_grant_site_credits(
  _user_id uuid, _amount numeric, _reason text, _type text DEFAULT 'admin_grant'
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance numeric;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _type NOT IN ('refund','admin_grant','admin_deduct') THEN
    RAISE EXCEPTION 'invalid type';
  END IF;

  INSERT INTO public.site_credits_wallet (user_id, balance)
  VALUES (_user_id, GREATEST(_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
  SET balance = GREATEST(public.site_credits_wallet.balance + _amount, 0),
      updated_at = now()
  RETURNING balance INTO new_balance;

  INSERT INTO public.site_credits_transactions (user_id, amount, type, reason, created_by)
  VALUES (_user_id, _amount, _type, _reason, auth.uid());

  RETURN new_balance;
END;
$$;

-- RPC: spend credits (used by checkout)
CREATE OR REPLACE FUNCTION public.spend_site_credits(
  _user_id uuid, _amount numeric, _reason text, _ref_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_bal numeric;
BEGIN
  IF _amount <= 0 THEN RETURN false; END IF;

  SELECT balance INTO current_bal
  FROM public.site_credits_wallet
  WHERE user_id = _user_id
  FOR UPDATE;

  IF current_bal IS NULL OR current_bal < _amount THEN
    RETURN false;
  END IF;

  UPDATE public.site_credits_wallet
  SET balance = balance - _amount, updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.site_credits_transactions (user_id, amount, type, reason, ref_id, created_by)
  VALUES (_user_id, -_amount, 'spend', _reason, _ref_id, COALESCE(auth.uid(), _user_id));

  RETURN true;
END;
$$;

-- ============ NOTIFICATIONS (in-app) - create if not exists ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text DEFAULT 'info',
  link text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "notifications self read"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "notifications self update"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
