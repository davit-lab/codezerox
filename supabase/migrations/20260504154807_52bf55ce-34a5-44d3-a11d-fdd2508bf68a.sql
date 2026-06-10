
-- 1. Add Flitt provider settings
INSERT INTO public.payment_settings (provider, setting_key, setting_value, is_active) VALUES
  ('flitt', 'merchant_id', '', false),
  ('flitt', 'secret_key', '', false),
  ('flitt', 'credit_secret_key', '', false),
  ('flitt', 'callback_url', '', false)
ON CONFLICT (provider, setting_key) DO NOTHING;

-- 2. Manual payment links table (admin fallback)
CREATE TABLE IF NOT EXISTS public.manual_payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  payment_url TEXT NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  package_id UUID,
  amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'GEL',
  callback_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_manual_payment_links_token ON public.manual_payment_links(callback_token);

ALTER TABLE public.manual_payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage manual payment links"
  ON public.manual_payment_links FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active manual payment links"
  ON public.manual_payment_links FOR SELECT TO authenticated
  USING (is_active = true);

CREATE TRIGGER update_manual_payment_links_updated_at
  BEFORE UPDATE ON public.manual_payment_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
