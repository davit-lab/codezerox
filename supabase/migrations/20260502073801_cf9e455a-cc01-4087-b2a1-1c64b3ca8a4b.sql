CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. guests) can submit a ticket
CREATE POLICY "Anyone can create a support ticket"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view all support tickets"
  ON public.support_tickets
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own (if logged in when submitting)
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can update support tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete support tickets"
  ON public.support_tickets
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_support_tickets_status ON public.support_tickets(status, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;