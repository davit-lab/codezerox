
-- Add experience fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bio text DEFAULT null,
  ADD COLUMN IF NOT EXISTS experience text DEFAULT null,
  ADD COLUMN IF NOT EXISTS github_url text DEFAULT null,
  ADD COLUMN IF NOT EXISTS website_url text DEFAULT null,
  ADD COLUMN IF NOT EXISTS location text DEFAULT null,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- Allow anyone to view profiles publicly
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);
