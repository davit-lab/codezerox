-- Fix friends table FK: reference profiles.user_id instead of profiles.id
-- The auth UUID (auth.uid()) matches profiles.user_id, not profiles.id

-- Drop existing FK constraints
ALTER TABLE public.friends DROP CONSTRAINT IF EXISTS friends_user_a_fkey;
ALTER TABLE public.friends DROP CONSTRAINT IF EXISTS friends_user_b_fkey;

-- Recreate FKs pointing to profiles.user_id
ALTER TABLE public.friends ADD CONSTRAINT friends_user_a_fkey FOREIGN KEY (user_a) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.friends ADD CONSTRAINT friends_user_b_fkey FOREIGN KEY (user_b) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
