-- Voice messages support for direct chat

-- Add voice message support to direct_messages table
ALTER TABLE public.direct_messages 
ADD COLUMN IF NOT EXISTS is_voice_message boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS voice_duration integer, -- duration in seconds
ADD COLUMN IF NOT EXISTS voice_url text; -- URL to the audio file

-- Create storage bucket for voice messages
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for voice messages storage
CREATE POLICY "voice_messages_upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'voice-messages'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "voice_messages_download" ON storage.objects
FOR SELECT
USING (bucket_id = 'voice-messages');

-- Function to generate voice message path
CREATE OR REPLACE FUNCTION public.voice_message_path(_user_id uuid, _message_id uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER AS $$
  SELECT _user_id::text || '/' || _message_id::text || '.webm';
$$;
