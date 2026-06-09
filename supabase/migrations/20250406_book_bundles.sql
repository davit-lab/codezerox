-- ============================================
-- Book Bundle Discounts
-- Admin can select multiple books, set a discount (% or fixed),
-- and users see & get the discount when buying all books together.
-- ============================================

-- 1. Bundle header
CREATE TABLE IF NOT EXISTS public.book_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Books inside a bundle
CREATE TABLE IF NOT EXISTS public.book_bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.book_bundles(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  UNIQUE (bundle_id, book_id)
);

-- 3. RLS
ALTER TABLE public.book_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_bundle_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read active bundles
CREATE POLICY "Anyone can view active bundles"
  ON public.book_bundles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view bundle items"
  ON public.book_bundle_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can manage bundles
CREATE POLICY "Admins can manage bundles"
  ON public.book_bundles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage bundle items"
  ON public.book_bundle_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Updated_at trigger
CREATE TRIGGER update_book_bundles_updated_at
  BEFORE UPDATE ON public.book_bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
