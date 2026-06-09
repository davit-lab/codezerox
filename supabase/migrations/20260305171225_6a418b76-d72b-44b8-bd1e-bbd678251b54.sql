
-- Add experience_level and languages to freelancer_profiles
ALTER TABLE public.freelancer_profiles ADD COLUMN IF NOT EXISTS experience_level text DEFAULT 'junior';
ALTER TABLE public.freelancer_profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';

-- Allow anyone to read basic profile info (needed for freelancer name/avatar display)
CREATE POLICY "Anyone can view profiles publicly"
ON public.profiles
FOR SELECT
USING (true);
