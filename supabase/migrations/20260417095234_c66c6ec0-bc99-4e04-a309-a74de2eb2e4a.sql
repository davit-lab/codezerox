-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder (folder = user_id)
CREATE POLICY "Users can upload their chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view (bucket is public, but explicit policy for clarity)
CREATE POLICY "Chat attachments are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Users can delete their own
CREATE POLICY "Users can delete their chat attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);