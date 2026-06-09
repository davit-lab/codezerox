-- Calling system for direct chat

-- Create ENUM for call status
DO $$ BEGIN
  CREATE TYPE public.call_status AS ENUM ('initiated', 'ringing', 'connected', 'ended', 'rejected', 'missed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create ENUM for call type
DO $$ BEGIN
  CREATE TYPE public.call_type AS ENUM ('audio', 'video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Calls table
CREATE TABLE IF NOT EXISTS public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
  call_type public.call_type NOT NULL DEFAULT 'audio',
  status public.call_status NOT NULL DEFAULT 'initiated',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_caller ON public.calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver ON public.calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_conversation ON public.calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON public.calls(started_at DESC);

-- Function to update call duration on end
CREATE OR REPLACE FUNCTION public.update_call_duration()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status != 'ended' THEN
    NEW.ended_at = now();
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::integer;
  END IF;
  RETURN NEW;
END $$;

-- Trigger for call duration
DROP TRIGGER IF EXISTS trg_call_duration ON public.calls;
CREATE TRIGGER trg_call_duration BEFORE UPDATE ON public.calls
FOR EACH ROW EXECUTE FUNCTION public.update_call_duration();

-- RLS
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Users can see calls they're involved in
CREATE POLICY "calls_select_own" ON public.calls FOR SELECT
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Users can initiate calls
CREATE POLICY "calls_insert" ON public.calls FOR INSERT
WITH CHECK (auth.uid() = caller_id);

-- Users can update calls they're involved in
CREATE POLICY "calls_update" ON public.calls FOR UPDATE
USING (auth.uid() = caller_id OR auth.uid() = receiver_id)
WITH CHECK (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Admin can do everything
CREATE POLICY "calls_admin_all" ON public.calls FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Realtime
ALTER TABLE public.calls REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper function to initiate a call
CREATE OR REPLACE FUNCTION public.initiate_call(
  _receiver_id uuid,
  _conversation_id uuid,
  _call_type public.call_type DEFAULT 'audio'
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _call_id uuid;
BEGIN
  INSERT INTO public.calls (caller_id, receiver_id, conversation_id, call_type, status)
  VALUES (auth.uid(), _receiver_id, _conversation_id, _call_type, 'initiated')
  RETURNING id INTO _call_id;
  
  RETURN _call_id;
END $$;

-- Helper function to answer a call
CREATE OR REPLACE FUNCTION public.answer_call(_call_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.calls
  SET status = 'connected'
  WHERE id = _call_id
    AND receiver_id = auth.uid()
    AND status IN ('initiated', 'ringing');
  
  RETURN FOUND;
END $$;

-- Helper function to reject a call
CREATE OR REPLACE FUNCTION public.reject_call(_call_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.calls
  SET status = 'rejected'
  WHERE id = _call_id
    AND receiver_id = auth.uid()
    AND status IN ('initiated', 'ringing');
  
  RETURN FOUND;
END $$;

-- Helper function to end a call
CREATE OR REPLACE FUNCTION public.end_call(_call_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.calls
  SET status = 'ended'
  WHERE id = _call_id
    AND (caller_id = auth.uid() OR receiver_id = auth.uid())
    AND status = 'connected';
  
  RETURN FOUND;
END $$;
