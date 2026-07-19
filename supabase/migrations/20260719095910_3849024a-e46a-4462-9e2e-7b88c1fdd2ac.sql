CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz,
  role public.app_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.created_at,
    COALESCE(ur.role, 'user'::public.app_role) AS role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
  ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM anon;

CREATE OR REPLACE FUNCTION public.book_pdf_matches_storage_object(_pdf_url text, _object_name text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    _pdf_url = _object_name
    OR split_part(_pdf_url, '/book-pdfs/', 2) = _object_name
    OR split_part(_pdf_url, '/object/public/book-pdfs/', 2) = _object_name
    OR split_part(_pdf_url, '/object/sign/book-pdfs/', 2) = _object_name,
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.book_pdf_matches_storage_object(text, text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Authenticated users can read book-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Purchasers and admins can view book PDFs" ON storage.objects;

CREATE POLICY "Purchasers admins and free books can read book PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'book-pdfs'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.purchases p
      JOIN public.books b ON b.id = p.book_id
      WHERE p.user_id = auth.uid()
        AND public.book_pdf_matches_storage_object(b.pdf_url, storage.objects.name)
    )
    OR EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.is_free = true
        AND public.book_pdf_matches_storage_object(b.pdf_url, storage.objects.name)
    )
  )
);

CREATE POLICY "Free preview book PDFs can be read anonymously"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'book-pdfs'
  AND EXISTS (
    SELECT 1
    FROM public.books b
    WHERE b.is_free = true
      AND public.book_pdf_matches_storage_object(b.pdf_url, storage.objects.name)
  )
);