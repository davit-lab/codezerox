-- Fix handle_new_user trigger
-- WARNING: Use supabase/migrations/20260613_comprehensive_database_cleanup.sql for production.
-- This file is kept for quick local fixes only.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, user_id, email, full_name, avatar_url, cover_url,
    bio, experience, github_url, website_url, linkedin_url,
    facebook_url, cv_url, location, skills, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}',
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
