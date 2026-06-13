
-- Parent-child relationship table
CREATE TABLE public.parent_children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  child_username TEXT NOT NULL,
  child_display_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id),
  UNIQUE(child_username)
);

ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children"
  ON public.parent_children FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can add children"
  ON public.parent_children FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can remove children"
  ON public.parent_children FOR DELETE
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Children can see their parent link"
  ON public.parent_children FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

CREATE POLICY "Admins can manage parent_children"
  ON public.parent_children FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Kids monthly subscription
CREATE TABLE public.kids_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  amount_gel NUMERIC NOT NULL DEFAULT 10,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view child subscriptions"
  ON public.kids_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create child subscriptions"
  ON public.kids_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Children can view own subscription"
  ON public.kids_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

CREATE POLICY "Admins can manage kids_subscriptions"
  ON public.kids_subscriptions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Books purchased by parent for child
CREATE TABLE public.kids_book_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, book_id)
);

ALTER TABLE public.kids_book_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view child book purchases"
  ON public.kids_book_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can buy books for children"
  ON public.kids_book_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Children can view own purchased books"
  ON public.kids_book_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

CREATE POLICY "Admins can manage kids_book_purchases"
  ON public.kids_book_purchases FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add 'child' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'child';
