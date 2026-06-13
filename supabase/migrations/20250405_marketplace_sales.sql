-- Add multi-sale option to projects
ALTER TABLE public.marketplace_projects
  ADD COLUMN IF NOT EXISTS is_multi_sale BOOLEAN DEFAULT false;

-- Marketplace sales table
CREATE TABLE IF NOT EXISTS public.marketplace_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.marketplace_projects(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'access_given', -- access_given | confirmed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(project_id, buyer_id)
);

ALTER TABLE public.marketplace_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seller manages own sales" ON public.marketplace_sales
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Buyer views own purchases" ON public.marketplace_sales
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyer confirms purchase" ON public.marketplace_sales
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Find user by email (SECURITY DEFINER can access auth.users)
CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email TEXT)
RETURNS TABLE(user_id UUID, full_name TEXT, username TEXT, avatar_url TEXT) AS $$
  SELECT au.id, p.full_name, p.username, p.avatar_url
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE lower(au.email) = lower(search_email)
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- After buyer confirms: if not multi_sale → mark project as sold
CREATE OR REPLACE FUNCTION public.confirm_marketplace_sale(sale_id UUID)
RETURNS void AS $$
DECLARE
  v_project_id UUID;
  v_buyer_id UUID;
  v_is_multi BOOLEAN;
BEGIN
  SELECT s.project_id, s.buyer_id, p.is_multi_sale
  INTO v_project_id, v_buyer_id, v_is_multi
  FROM public.marketplace_sales s
  JOIN public.marketplace_projects p ON p.id = s.project_id
  WHERE s.id = sale_id AND s.buyer_id = auth.uid();

  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Sale not found or not authorized';
  END IF;

  UPDATE public.marketplace_sales
  SET status = 'confirmed', confirmed_at = NOW()
  WHERE id = sale_id;

  IF NOT v_is_multi THEN
    UPDATE public.marketplace_projects
    SET status = 'sold'
    WHERE id = v_project_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
