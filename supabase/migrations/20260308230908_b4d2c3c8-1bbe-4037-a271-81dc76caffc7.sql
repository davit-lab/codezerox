
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  page_label TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can read banners
CREATE POLICY "Anyone can view hero banners"
  ON public.hero_banners FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can manage hero banners"
  ON public.hero_banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default entries for each page
INSERT INTO public.hero_banners (page_key, page_label) VALUES
  ('leaderboard', 'ლიდერბორდი'),
  ('categories', 'კატეგორიები'),
  ('gallery', 'გალერეა'),
  ('freelancers', 'ფრილანსერები'),
  ('vacancies', 'ვაკანსიები'),
  ('certifications', 'სერტიფიკატები'),
  ('hub_chat', 'Hub ჩატი');
