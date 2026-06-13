-- Add media URL columns to forum_posts (database stores only links, not files)
ALTER TABLE public.forum_posts
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS video_url text;

-- Create storage bucket for forum media (images/videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-media',
  'forum-media',
  true,
  52428800, -- 50MB max
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

-- Public read policy (anyone can view forum media)
DROP POLICY IF EXISTS "forum_media_public_read" ON storage.objects;
CREATE POLICY "forum_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forum-media');

-- Authenticated users can upload
DROP POLICY IF EXISTS "forum_media_auth_upload" ON storage.objects;
CREATE POLICY "forum_media_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'forum-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update/delete their own uploads
DROP POLICY IF EXISTS "forum_media_owner_update" ON storage.objects;
CREATE POLICY "forum_media_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'forum-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "forum_media_owner_delete" ON storage.objects;
CREATE POLICY "forum_media_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'forum-media' AND auth.uid()::text = (storage.foldername(name))[1]);
