
-- Admin can delete/update any vacancy
CREATE POLICY "Admins can delete any vacancy" ON public.vacancies FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any vacancy" ON public.vacancies FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete/update any hub project
CREATE POLICY "Admins can delete any hub project" ON public.hub_projects FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any hub project" ON public.hub_projects FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all hub projects (including non-public)
CREATE POLICY "Admins can view all hub projects" ON public.hub_projects FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete/update any freelancer profile
CREATE POLICY "Admins can delete any freelancer profile" ON public.freelancer_profiles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any freelancer profile" ON public.freelancer_profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete any freelancer review
CREATE POLICY "Admins can delete any freelancer review" ON public.freelancer_reviews FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete any book review
CREATE POLICY "Admins can delete any book review" ON public.book_reviews FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all vacancies (including inactive)
CREATE POLICY "Admins can view all vacancies" ON public.vacancies FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
