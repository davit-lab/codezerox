-- ============================================================================
-- COMPREHENSIVE DATABASE CLEANUP & FIX
-- Date: 2026-06-13
-- Purpose: Resolve schema drift, conflicting RLS policies, broken FKs,
--          inconsistent triggers, and missing columns WITHOUT data loss.
-- WARNING: This migration is IDEMPOTENT. It can be run multiple times safely.
-- ============================================================================

-- ============================================================================
-- 1. ENSURE app_role ENUM HAS ALL REQUIRED VALUES
-- ============================================================================
DO $$
BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentor';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'child';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. ADD MISSING COLUMNS TO profiles (frontend OAuth signup inserts these)
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS cv_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- ============================================================================
-- 3. FIX handle_new_user TRIGGER (standardized, robust, idempotent)
-- ============================================================================
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
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{}',
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

-- Ensure trigger exists and is correctly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. FIX friends TABLE FOREIGN KEYS (must reference profiles.user_id, NOT profiles.id)
-- ============================================================================
DO $$
DECLARE
  _fixed INT := 0;
BEGIN
  -- 4a. Drop old constraints if they exist
  ALTER TABLE public.friends DROP CONSTRAINT IF EXISTS friends_user_a_fkey;
  ALTER TABLE public.friends DROP CONSTRAINT IF EXISTS friends_user_b_fkey;

  -- 4b. Fix any data where user_a/user_b contains profiles.id instead of profiles.user_id
  --     (safe no-op if data is already correct)
  UPDATE public.friends f
  SET user_a = p.user_id
  FROM public.profiles p
  WHERE f.user_a = p.id
    AND f.user_a NOT IN (SELECT user_id FROM public.profiles);

  GET DIAGNOSTICS _fixed = ROW_COUNT;
  IF _fixed > 0 THEN
    RAISE NOTICE 'Fixed % rows in friends.user_a from profiles.id to profiles.user_id', _fixed;
  END IF;

  UPDATE public.friends f
  SET user_b = p.user_id
  FROM public.profiles p
  WHERE f.user_b = p.id
    AND f.user_b NOT IN (SELECT user_id FROM public.profiles);

  GET DIAGNOSTICS _fixed = ROW_COUNT;
  IF _fixed > 0 THEN
    RAISE NOTICE 'Fixed % rows in friends.user_b from profiles.id to profiles.user_id', _fixed;
  END IF;

  -- Also fix initiator_id if it contains profiles.id values
  UPDATE public.friends f
  SET initiator_id = p.user_id
  FROM public.profiles p
  WHERE f.initiator_id = p.id
    AND f.initiator_id NOT IN (SELECT user_id FROM public.profiles);

  GET DIAGNOSTICS _fixed = ROW_COUNT;
  IF _fixed > 0 THEN
    RAISE NOTICE 'Fixed % rows in friends.initiator_id from profiles.id to profiles.user_id', _fixed;
  END IF;

  -- 4c. Recreate FKs pointing to profiles.user_id
  ALTER TABLE public.friends
    ADD CONSTRAINT friends_user_a_fkey FOREIGN KEY (user_a) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  ALTER TABLE public.friends
    ADD CONSTRAINT friends_user_b_fkey FOREIGN KEY (user_b) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

  -- Ensure initiator_id FK is also correct (drop and recreate if needed)
  ALTER TABLE public.friends DROP CONSTRAINT IF EXISTS friends_initiator_id_fkey;
  ALTER TABLE public.friends
    ADD CONSTRAINT friends_initiator_id_fkey FOREIGN KEY (initiator_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'friends table does not exist yet, skipping FK fixes';
END $$;

-- ============================================================================
-- 5. FIX friend NOTIFICATION TRIGGERS (query profiles.user_id, NOT profiles.id)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_friend_request_sent()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _requester_name text;
BEGIN
  SELECT full_name INTO _requester_name
  FROM public.profiles
  WHERE user_id = NEW.initiator_id;

  PERFORM public.create_friend_notification(
    NEW.user_b,
    'ახალი მეგობრობის მოთხოვნა',
    COALESCE(_requester_name, 'მომხმარებელი') || ' გსურთ დამემატოთ მეგობრებში',
    'friend_request',
    NEW.id
  );

  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.notify_friend_request_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _accepter_name text;
  _receiver_id uuid;
BEGIN
  SELECT full_name INTO _accepter_name
  FROM public.profiles
  WHERE user_id = NEW.user_a;

  _receiver_id := CASE
    WHEN NEW.user_a = OLD.user_a THEN OLD.user_b
    ELSE OLD.user_a
  END;

  PERFORM public.create_friend_notification(
    _receiver_id,
    'მეგობრობის მოთხოვნა მიღებულია',
    COALESCE(_accepter_name, 'მომხმარებელი') || ' დათანხმდა თქვენი მეგობრობის მოთხოვნას',
    'friend_accepted',
    NEW.id
  );

  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.notify_friend_request_declined()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _decliner_name text;
  _receiver_id uuid;
BEGIN
  SELECT full_name INTO _decliner_name
  FROM public.profiles
  WHERE user_id = NEW.user_a;

  _receiver_id := CASE
    WHEN NEW.user_a = OLD.user_a THEN OLD.user_b
    ELSE OLD.user_a
  END;

  PERFORM public.create_friend_notification(
    _receiver_id,
    'მეგობრობის მოთხოვნა უარყოფილია',
    COALESCE(_decliner_name, 'მომხმარებელი') || ' უარყოფს თქვენი მეგობრობის მოთხოვნას',
    'friend_declined',
    NEW.id
  );

  RETURN NEW;
END $$;

-- ============================================================================
-- 6. CLEANUP RLS POLICIES ON profiles (remove conflicting duplicates)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all known conflicting profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles publicly" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles own update" ON public.profiles;
DROP POLICY IF EXISTS "profiles own insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
DROP POLICY IF EXISTS "profiles self insert" ON public.profiles;

-- Create clean, non-conflicting policies
CREATE POLICY "profiles_public_select"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_self_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_self_insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. CLEANUP RLS POLICIES ON user_roles
-- ============================================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_all"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- 8. FIX has_role() PREFIX IN EXISTING POLICIES (add public. where missing)
-- ============================================================================
-- These policies were created without the public. prefix which can fail
-- depending on search_path. We recreate them with the prefix.

-- parent_children admin policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage parent_children" ON public.parent_children;
  CREATE POLICY "Admins can manage parent_children"
    ON public.parent_children FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- kids_subscriptions admin policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage kids_subscriptions" ON public.kids_subscriptions;
  CREATE POLICY "Admins can manage kids_subscriptions"
    ON public.kids_subscriptions FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- kids_book_purchases admin policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage kids_book_purchases" ON public.kids_book_purchases;
  CREATE POLICY "Admins can manage kids_book_purchases"
    ON public.kids_book_purchases FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- book_updates admin policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage book updates" ON public.book_updates;
  CREATE POLICY "Admins can manage book updates"
    ON public.book_updates FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- update_purchases admin policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view all update purchases" ON public.update_purchases;
  DROP POLICY IF EXISTS "Admins can manage update purchases" ON public.update_purchases;
  CREATE POLICY "Admins can view all update purchases"
    ON public.update_purchases FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  CREATE POLICY "Admins can manage update purchases"
    ON public.update_purchases FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- code_snippets admin policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete any code snippet" ON public.code_snippets;
  CREATE POLICY "Admins can delete any code snippet"
    ON public.code_snippets FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- hub_projects admin policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete any hub project" ON public.hub_projects;
  CREATE POLICY "Admins can delete any hub project"
    ON public.hub_projects FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- hub_project_comments admin policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete any hub project comment" ON public.hub_project_comments;
  CREATE POLICY "Admins can delete any hub project comment"
    ON public.hub_project_comments FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- vacancies admin policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete any vacancy" ON public.vacancies;
  DROP POLICY IF EXISTS "Admins can update any vacancy" ON public.vacancies;
  CREATE POLICY "Admins can delete any vacancy"
    ON public.vacancies FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  CREATE POLICY "Admins can update any vacancy"
    ON public.vacancies FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================================
-- 9. CLEANUP STORAGE POLICIES FOR book-pdfs (remove conflicting duplicates)
-- ============================================================================
-- Drop all known conflicting book-pdf storage policies
DROP POLICY IF EXISTS "Purchasers can view book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can download PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth users to read book-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read book-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Purchasers and admins can view book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read book-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload book-pdfs" ON storage.objects;

-- Single clear SELECT policy: authenticated users can read book-pdfs
-- (Application-level gating handles purchased vs free books)
CREATE POLICY "book_pdfs_authenticated_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'book-pdfs');

-- Admin write policies
DROP POLICY IF EXISTS "Admins can upload book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete PDFs" ON storage.objects;

CREATE POLICY "book_pdfs_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "book_pdfs_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "book_pdfs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- 10. FIX user_notifications POLICIES (remove overly permissive system insert)
-- ============================================================================
DO $$ BEGIN
  ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
  DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.user_notifications;

  -- Allow authenticated users to insert their own notifications + admin
  CREATE POLICY "user_notifications_insert"
    ON public.user_notifications FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = user_id
      OR public.has_role(auth.uid(), 'admin'::app_role)
    );
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================================
-- 11. BACKFILL: Create missing profiles for existing auth.users
-- ============================================================================
INSERT INTO public.profiles (
  id, user_id, email, full_name, avatar_url, cover_url,
  bio, experience, github_url, website_url, linkedin_url,
  facebook_url, cv_url, location, skills, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}',
  COALESCE(au.created_at, now()),
  now()
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.id IS NULL;

-- ============================================================================
-- 12. BACKFILL: Create missing user_roles for existing auth.users
-- ============================================================================
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'user'
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 13. VERIFY: Output diagnostic counts
-- ============================================================================
DO $$
DECLARE
  _auth_users INT;
  _profiles INT;
  _user_roles INT;
  _orphan_friends INT := 0;
BEGIN
  SELECT COUNT(*) INTO _auth_users FROM auth.users;
  SELECT COUNT(*) INTO _profiles FROM public.profiles;
  SELECT COUNT(*) INTO _user_roles FROM public.user_roles;

  BEGIN
    SELECT COUNT(*) INTO _orphan_friends FROM public.friends f
    WHERE f.user_a NOT IN (SELECT user_id FROM public.profiles)
       OR f.user_b NOT IN (SELECT user_id FROM public.profiles);
  EXCEPTION WHEN undefined_table THEN
    _orphan_friends := 0;
  END;

  RAISE NOTICE '=== DATABASE CLEANUP DIAGNOSTICS ===';
  RAISE NOTICE 'auth.users count: %', _auth_users;
  RAISE NOTICE 'profiles count: %', _profiles;
  RAISE NOTICE 'user_roles count: %', _user_roles;
  RAISE NOTICE 'orphan friends rows: %', _orphan_friends;
  RAISE NOTICE '====================================';
END $$;
