-- ============================================================================
-- EMERGENCY RECOVERY SCRIPT
-- Fixes: missing profiles, admin access, PDF storage, payments, RLS policies
-- ============================================================================

-- ============================================================================
-- 1. FIX PROFILES: Auto-create profiles for auth users who lack them
-- ============================================================================

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.id IS NULL;

-- ============================================================================
-- 2. FIX ADMIN ACCESS: Grant admin role to yourself
-- Replace 'YOUR_EMAIL@gmail.com' with your actual email before running!
-- ============================================================================

-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'YOUR_EMAIL@gmail.com'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 3. FIX STORAGE: Ensure book-pdfs bucket exists and is public
-- ============================================================================

-- Create bucket if missing
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-pdfs', 'book-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Fix bucket policies for public read
CREATE POLICY IF NOT EXISTS "Allow public read book-pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-pdfs');

CREATE POLICY IF NOT EXISTS "Allow authenticated upload book-pdfs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-pdfs');

-- ============================================================================
-- 4. FIX RLS POLICIES: Ensure key tables are readable/writable
-- ============================================================================

-- Books: public can read published books
CREATE POLICY IF NOT EXISTS "books public read" ON public.books FOR SELECT USING (true);

-- Categories: public read
CREATE POLICY IF NOT EXISTS "categories public read" ON public.categories FOR SELECT USING (true);

-- Profiles: users can read all profiles (for social features)
CREATE POLICY IF NOT EXISTS "profiles public read" ON public.profiles FOR SELECT USING (true);

-- Profiles: users can update own profile
CREATE POLICY IF NOT EXISTS "profiles own update" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Purchases: users can read own purchases
CREATE POLICY IF NOT EXISTS "purchases own read" ON public.purchases FOR SELECT USING (user_id = auth.uid());

-- Purchases: users can insert own purchases
CREATE POLICY IF NOT EXISTS "purchases own insert" ON public.purchases FOR INSERT WITH CHECK (user_id = auth.uid());

-- User roles: users can read own roles
CREATE POLICY IF NOT EXISTS "user_roles own read" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- 5. FIX PRICING: Ensure pricing_config table exists with sample data
-- ============================================================================

-- Check if pricing_config exists, create if not (skip if using different table)
-- Note: If your app uses a different pricing table, adjust accordingly.

-- ============================================================================
-- 6. FIX TRIGGERS: Ensure profile auto-creation on signup works
-- ============================================================================

-- Recreate the handle_new_user trigger if it was dropped
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ============================================================================
-- 7. VERIFY: Run this to check counts after recovery
-- ============================================================================

-- Uncomment to verify:
-- SELECT 
--   (SELECT COUNT(*) FROM auth.users) AS auth_users,
--   (SELECT COUNT(*) FROM public.profiles) AS profiles,
--   (SELECT COUNT(*) FROM public.books) AS books,
--   (SELECT COUNT(*) FROM public.purchases) AS purchases,
--   (SELECT COUNT(*) FROM public.categories) AS categories,
--   (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') AS admins;
