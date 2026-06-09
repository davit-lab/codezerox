
-- Drop the restrictive ALL policy and replace with permissive ones
DROP POLICY IF EXISTS "Admins can manage hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Anyone can view hero banners" ON public.hero_banners;

-- Permissive SELECT for everyone
CREATE POLICY "Anyone can view hero banners"
ON public.hero_banners FOR SELECT
USING (true);

-- Permissive ALL for admins
CREATE POLICY "Admins can manage hero banners"
ON public.hero_banners FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
