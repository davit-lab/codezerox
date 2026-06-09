
-- ============ VACANCIES PACKAGE COLUMNS ============
ALTER TABLE public.vacancies
  ADD COLUMN IF NOT EXISTS package_tier TEXT DEFAULT 'basic'
    CHECK (package_tier IN ('basic','normal','premium','depremium')),
  ADD COLUMN IF NOT EXISTS package_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.set_vacancy_package_tier(p_vacancy_id uuid, p_tier text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.vacancies SET package_tier = p_tier WHERE id = p_vacancy_id;
$$;
GRANT EXECUTE ON FUNCTION public.set_vacancy_package_tier(uuid, text) TO authenticated;

-- ============ MARKETPLACE PROJECTS ============
CREATE TABLE IF NOT EXISTS public.marketplace_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  price NUMERIC,
  price_negotiable BOOLEAN DEFAULT false,
  is_multi_sale BOOLEAN DEFAULT false,
  preview_url TEXT NOT NULL,
  zip_path TEXT,
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketplace_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active projects" ON public.marketplace_projects;
CREATE POLICY "Public read active projects" ON public.marketplace_projects FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Owner insert" ON public.marketplace_projects;
CREATE POLICY "Owner insert" ON public.marketplace_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owner update" ON public.marketplace_projects;
CREATE POLICY "Owner update" ON public.marketplace_projects FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role));
DROP POLICY IF EXISTS "Owner delete" ON public.marketplace_projects;
CREATE POLICY "Owner delete" ON public.marketplace_projects FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_project_views(project_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.marketplace_projects SET views = views + 1 WHERE id = project_id; END;
$$;

-- ============ MARKETPLACE SALES ============
CREATE TABLE IF NOT EXISTS public.marketplace_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.marketplace_projects(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(project_id, buyer_id)
);
ALTER TABLE public.marketplace_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Buyer/seller read" ON public.marketplace_sales;
CREATE POLICY "Buyer/seller read" ON public.marketplace_sales FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR has_role(auth.uid(),'admin'::app_role));
DROP POLICY IF EXISTS "Seller insert" ON public.marketplace_sales;
CREATE POLICY "Seller insert" ON public.marketplace_sales FOR INSERT WITH CHECK (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Buyer/seller update" ON public.marketplace_sales;
CREATE POLICY "Buyer/seller update" ON public.marketplace_sales FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE OR REPLACE FUNCTION public.confirm_marketplace_sale(sale_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.marketplace_sales SET status='confirmed', confirmed_at=NOW()
  WHERE id = sale_id AND (buyer_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));
END;
$$;

CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email TEXT)
RETURNS TABLE(user_id UUID, full_name TEXT, email TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.user_id, p.full_name, p.email FROM public.profiles p WHERE p.email ILIKE search_email LIMIT 1;
$$;

-- ============ FREELANCER SUBSCRIPTIONS ============
CREATE TABLE IF NOT EXISTS public.freelancer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  amount_gel NUMERIC DEFAULT 10,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.freelancer_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User reads own" ON public.freelancer_subscriptions;
CREATE POLICY "User reads own" ON public.freelancer_subscriptions FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role));
DROP POLICY IF EXISTS "User updates own" ON public.freelancer_subscriptions;
CREATE POLICY "User updates own" ON public.freelancer_subscriptions FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role));
DROP POLICY IF EXISTS "Service insert" ON public.freelancer_subscriptions;
CREATE POLICY "Service insert" ON public.freelancer_subscriptions FOR INSERT WITH CHECK (true);

-- ============ USER WARNINGS ============
CREATE TABLE IF NOT EXISTS public.user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User reads own warnings" ON public.user_warnings;
CREATE POLICY "User reads own warnings" ON public.user_warnings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authenticated insert warnings" ON public.user_warnings;
CREATE POLICY "Authenticated insert warnings" ON public.user_warnings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============ KIDS SUBSCRIPTIONS price default ============
ALTER TABLE public.kids_subscriptions ALTER COLUMN amount_gel SET DEFAULT 50;

NOTIFY pgrst, 'reload schema';
