-- Marketplace Projects table
CREATE TABLE IF NOT EXISTS public.marketplace_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  price NUMERIC,
  price_negotiable BOOLEAN DEFAULT false,
  preview_url TEXT NOT NULL,
  zip_path TEXT,
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active projects" ON public.marketplace_projects
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owner insert" ON public.marketplace_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner update" ON public.marketplace_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner delete" ON public.marketplace_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Increment views RPC
CREATE OR REPLACE FUNCTION public.increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.marketplace_projects SET views = views + 1 WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for marketplace files (run once)
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace', 'marketplace', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'marketplace public read' AND tablename = 'objects') THEN
    CREATE POLICY "marketplace public read" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'marketplace auth upload' AND tablename = 'objects') THEN
    CREATE POLICY "marketplace auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace' AND auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'marketplace owner delete' AND tablename = 'objects') THEN
    CREATE POLICY "marketplace owner delete" ON storage.objects FOR DELETE USING (bucket_id = 'marketplace');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
