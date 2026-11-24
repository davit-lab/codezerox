CREATE TABLE public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  user_id uuid,
  discount_amount numeric NOT NULL DEFAULT 0,
  order_total numeric,
  ref_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_code_redemptions TO authenticated;
GRANT ALL ON public.promo_code_redemptions TO service_role;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view redemptions" ON public.promo_code_redemptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.site_announcement (
  id int PRIMARY KEY DEFAULT 1,
  message text NOT NULL DEFAULT '',
  link_url text,
  is_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.site_announcement (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT ON public.site_announcement TO anon, authenticated;
GRANT UPDATE ON public.site_announcement TO authenticated;
GRANT ALL ON public.site_announcement TO service_role;
ALTER TABLE public.site_announcement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads announcement" ON public.site_announcement FOR SELECT USING (true);
CREATE POLICY "Admins update announcement" ON public.site_announcement FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

-- Record a redemption once per reference (idempotent); service role or the paying user
CREATE OR REPLACE FUNCTION public.redeem_promo_code(_code text, _user_id uuid, _discount numeric, _total numeric, _ref text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.promo_codes WHERE code = upper(trim(_code))) THEN RETURN false; END IF;
  INSERT INTO public.promo_code_redemptions(code,user_id,discount_amount,order_total,ref_id)
  VALUES (upper(trim(_code)),_user_id,COALESCE(_discount,0),_total,_ref)
  ON CONFLICT (ref_id) DO NOTHING;
  IF FOUND THEN
    UPDATE public.promo_codes SET current_uses = current_uses + 1, updated_at = now() WHERE code = upper(trim(_code));
  END IF;
  RETURN FOUND;
END $$;

REVOKE EXECUTE ON FUNCTION public.increment_promo_usage(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id uuid, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _user_id = auth.uid() AND _role <> 'admin' THEN RAISE EXCEPTION 'cannot demote yourself'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','user','mentor');
  INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, _role) ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_ban(_user_id uuid, _banned boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'cannot ban yourself'; END IF;
  UPDATE public.profiles SET is_banned = _banned WHERE user_id = _user_id;
END $$;

CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_banned FROM public.profiles WHERE user_id = _user_id), false)
$$;