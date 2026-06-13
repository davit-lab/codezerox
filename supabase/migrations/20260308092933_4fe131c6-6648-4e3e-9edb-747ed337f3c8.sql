
-- Create gifts table
CREATE TABLE public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  gift_type text NOT NULL DEFAULT 'book', -- 'book' or 'credits'
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  credits_amount integer,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_seen boolean NOT NULL DEFAULT false,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Sender can see their sent gifts
CREATE POLICY "Users can view their sent gifts" ON public.gifts
  FOR SELECT USING (auth.uid() = sender_id);

-- Recipient can see received gifts  
CREATE POLICY "Users can view their received gifts" ON public.gifts
  FOR SELECT USING (auth.uid() = recipient_id);

-- Auth users can create gifts
CREATE POLICY "Auth users can create gifts" ON public.gifts
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Recipient can update (mark as seen)
CREATE POLICY "Recipients can update gifts" ON public.gifts
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Enable realtime for gift notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.gifts;
