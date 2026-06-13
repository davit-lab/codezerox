
-- Add exam purchase tracking & a pricing_config row for exam fee
CREATE TABLE IF NOT EXISTS public.exam_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exam_id uuid NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.bank_transactions(id) ON DELETE SET NULL,
  amount_gel numeric NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  attempt_id uuid REFERENCES public.exam_attempts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS exam_purchases_transaction_unique
  ON public.exam_purchases(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS exam_purchases_user_exam_idx
  ON public.exam_purchases(user_id, exam_id, consumed_at);

GRANT SELECT ON public.exam_purchases TO authenticated;
GRANT ALL ON public.exam_purchases TO service_role;

ALTER TABLE public.exam_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own exam purchases" ON public.exam_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Seed pricing key for certification exam (10 GEL per attempt)
INSERT INTO public.pricing_config (key, label, amount_gel, description)
VALUES ('certification_exam', 'სასერთიფიკაციო გამოცდა', 10, 'ერთი მცდელობის ფასი ლარში')
ON CONFLICT (key) DO NOTHING;
