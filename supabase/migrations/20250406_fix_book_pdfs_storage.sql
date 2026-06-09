-- Emergency fix for book-pdfs storage access issues
-- This migration ensures authenticated users can access book PDFs

-- First, clean ALL existing conflicting policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop all SELECT policies on storage.objects that relate to books/PDFs
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND cmd = 'SELECT'
      AND (
        policyname ILIKE '%pdf%' 
        OR policyname ILIKE '%book%' 
        OR policyname ILIKE '%download%'
        OR policyname ILIKE '%purchaser%'
        OR policyname ILIKE '%authenticated%storage%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END $$;

-- Enable RLS on storage.objects (ensure it's on)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a simple, working SELECT policy for book-pdfs
-- Allow authenticated users to read from book-pdfs bucket
CREATE POLICY "Allow auth users to read book-pdfs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'book-pdfs');

-- Allow anon (public) users to read from book-pdfs (if needed for free books)
-- Comment this out if you want to require authentication
CREATE POLICY "Allow public to read book-pdfs"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'book-pdfs');

-- Keep admin policies for write operations
DROP POLICY IF EXISTS "Admins can upload book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete book PDFs" ON storage.objects;

CREATE POLICY "Admins can upload book PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update book PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete book PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));
