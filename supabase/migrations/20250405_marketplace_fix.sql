-- Ensure marketplace_projects table exists
CREATE TABLE IF NOT EXISTS public.marketplace_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Ensure marketplace_sales table exists
CREATE TABLE IF NOT EXISTS public.marketplace_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.marketplace_projects(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'access_given',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(project_id, buyer_id)
);

-- Fix: drop and recreate policies idempotently
DROP POLICY IF EXISTS "Public read active projects" ON public.marketplace_projects;
DROP POLICY IF EXISTS "Owner insert" ON public.marketplace_projects;
DROP POLICY IF EXISTS "Owner update" ON public.marketplace_projects;
DROP POLICY IF EXISTS "Owner delete" ON public.marketplace_projects;

ALTER TABLE public.marketplace_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active projects" ON public.marketplace_projects
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owner insert" ON public.marketplace_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner update" ON public.marketplace_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner delete" ON public.marketplace_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure increment_project_views exists
CREATE OR REPLACE FUNCTION public.increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.marketplace_projects SET views = views + 1 WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create marketplace storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('marketplace', 'marketplace', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop and recreate storage policies
DROP POLICY IF EXISTS "marketplace public read" ON storage.objects;
DROP POLICY IF EXISTS "marketplace auth upload" ON storage.objects;
DROP POLICY IF EXISTS "marketplace owner delete" ON storage.objects;

CREATE POLICY "marketplace public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'marketplace');

CREATE POLICY "marketplace auth upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'marketplace' AND auth.uid() IS NOT NULL);

CREATE POLICY "marketplace owner delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'marketplace');

-- Sales table policies (idempotent)
DROP POLICY IF EXISTS "Seller manages own sales" ON public.marketplace_sales;
DROP POLICY IF EXISTS "Buyer views own purchases" ON public.marketplace_sales;
DROP POLICY IF EXISTS "Buyer confirms purchase" ON public.marketplace_sales;

ALTER TABLE public.marketplace_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seller manages own sales" ON public.marketplace_sales
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Buyer views own purchases" ON public.marketplace_sales
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyer confirms purchase" ON public.marketplace_sales
  FOR UPDATE USING (auth.uid() = buyer_id);

-- find_user_by_email RPC
CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email TEXT)
RETURNS TABLE(user_id UUID, full_name TEXT, email TEXT) AS $$
  SELECT au.id, p.full_name, au.email
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE lower(au.email) = lower(search_email)
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- confirm_marketplace_sale RPC
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
    UPDATE public.marketplace_projects SET status = 'sold' WHERE id = v_project_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
