CREATE OR REPLACE FUNCTION public.increment_blog_views(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.blog_posts
  SET views = views + 1
  WHERE id = _post_id;
END;
$$;