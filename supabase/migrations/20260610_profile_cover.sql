-- Add cover_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Update RLS to allow public read (profiles are already public)
-- No new policies needed since profiles_public_select already covers this
