CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  setting_key text NOT NULL,
  setting_value text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(provider, setting_key)
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage payment settings"
ON public.payment_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings for BOG
INSERT INTO public.payment_settings (provider, setting_key, setting_value, is_active) VALUES
  ('bog', 'client_id', '', false),
  ('bog', 'secret_key', '', false),
  ('bog', 'merchant_id', '', false),
  ('bog', 'terminal_id', '', false),
  ('bog', 'callback_url', '', false);

-- Insert default settings for TBC
INSERT INTO public.payment_settings (provider, setting_key, setting_value, is_active) VALUES
  ('tbc', 'client_id', '', false),
  ('tbc', 'secret_key', '', false),
  ('tbc', 'api_key', '', false),
  ('tbc', 'callback_url', '', false);