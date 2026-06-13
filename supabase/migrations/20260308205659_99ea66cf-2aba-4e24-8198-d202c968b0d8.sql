
CREATE TABLE public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'bog' or 'tbc'
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'GEL',
  status text NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  bank_order_id text, -- ID returned by bank
  bank_status text, -- raw status from bank
  error_message text,
  items jsonb, -- what was purchased
  discount_amount numeric DEFAULT 0,
  callback_received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own bank transactions"
  ON public.bank_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create transactions (initiate payment)
CREATE POLICY "Users can create bank transactions"
  ON public.bank_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all bank transactions"
  ON public.bank_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update transactions
CREATE POLICY "Admins can manage bank transactions"
  ON public.bank_transactions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
