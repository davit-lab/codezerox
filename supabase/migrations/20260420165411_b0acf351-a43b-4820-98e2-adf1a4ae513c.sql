
-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.mentoring_hub_role AS ENUM ('mentor', 'mentor_assistant', 'top_student', 'student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TABLES ============

-- Hub members (one row per user per course)
CREATE TABLE IF NOT EXISTS public.mentoring_hub_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.mentoring_hub_role NOT NULL DEFAULT 'student',
  muted boolean NOT NULL DEFAULT false,
  banned boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_hub_members_course ON public.mentoring_hub_members(course_id);
CREATE INDEX IF NOT EXISTS idx_hub_members_user ON public.mentoring_hub_members(user_id);

-- Channels (text or voice)
CREATE TABLE IF NOT EXISTS public.mentoring_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text','voice')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_channels_course ON public.mentoring_channels(course_id);

-- Channel messages
CREATE TABLE IF NOT EXISTS public.mentoring_channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.mentoring_channels(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel ON public.mentoring_channel_messages(channel_id, created_at DESC);

-- DM conversations (per course, between two users)
CREATE TABLE IF NOT EXISTS public.mentoring_dms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_a < user_b),
  UNIQUE (course_id, user_a, user_b)
);
CREATE INDEX IF NOT EXISTS idx_dms_users ON public.mentoring_dms(user_a, user_b);

CREATE TABLE IF NOT EXISTS public.mentoring_dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dm_id uuid NOT NULL REFERENCES public.mentoring_dms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dm_messages_dm ON public.mentoring_dm_messages(dm_id, created_at DESC);

-- Friendships (per course scope)
CREATE TABLE IF NOT EXISTS public.mentoring_friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, requester_id, addressee_id)
);

-- Voice presence sessions
CREATE TABLE IF NOT EXISTS public.mentoring_voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.mentoring_channels(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.mentoring_courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_channel ON public.mentoring_voice_sessions(channel_id);

-- ============ Security definer helpers ============

CREATE OR REPLACE FUNCTION public.is_mentoring_hub_member(_user_id uuid, _course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mentoring_hub_members
    WHERE user_id = _user_id AND course_id = _course_id AND banned = false
  )
$$;

CREATE OR REPLACE FUNCTION public.has_paid_mentoring(_user_id uuid, _course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mentoring_registrations
    WHERE user_id = _user_id AND course_id = _course_id
      AND status IN ('paid','granted')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_mentoring_hub(_user_id uuid, _course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
      OR public.is_mentoring_hub_member(_user_id, _course_id)
      OR public.has_paid_mentoring(_user_id, _course_id)
$$;

-- Auto-add hub member when user gets paid/granted registration
CREATE OR REPLACE FUNCTION public.auto_add_hub_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('paid','granted') THEN
    INSERT INTO public.mentoring_hub_members (course_id, user_id, role)
    VALUES (NEW.course_id, NEW.user_id, 'student')
    ON CONFLICT (course_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_auto_add_hub_member ON public.mentoring_registrations;
CREATE TRIGGER trg_auto_add_hub_member
AFTER INSERT OR UPDATE ON public.mentoring_registrations
FOR EACH ROW EXECUTE FUNCTION public.auto_add_hub_member();

-- updated_at trigger for dms
DROP TRIGGER IF EXISTS trg_dms_updated_at ON public.mentoring_dms;
CREATE TRIGGER trg_dms_updated_at BEFORE UPDATE ON public.mentoring_dms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RLS ============
ALTER TABLE public.mentoring_hub_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_dms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_voice_sessions ENABLE ROW LEVEL SECURITY;

-- HUB MEMBERS
CREATE POLICY "hub_members_select" ON public.mentoring_hub_members FOR SELECT
USING (public.can_access_mentoring_hub(auth.uid(), course_id));
CREATE POLICY "hub_members_admin_all" ON public.mentoring_hub_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- CHANNELS
CREATE POLICY "channels_select" ON public.mentoring_channels FOR SELECT
USING (public.can_access_mentoring_hub(auth.uid(), course_id));
CREATE POLICY "channels_admin_all" ON public.mentoring_channels FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- CHANNEL MESSAGES
CREATE POLICY "channel_messages_select" ON public.mentoring_channel_messages FOR SELECT
USING (public.can_access_mentoring_hub(auth.uid(), course_id));

CREATE POLICY "channel_messages_insert" ON public.mentoring_channel_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.can_access_mentoring_hub(auth.uid(), course_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.mentoring_hub_members m
    WHERE m.course_id = mentoring_channel_messages.course_id
      AND m.user_id = auth.uid()
      AND (m.muted = true OR m.banned = true)
  )
);

CREATE POLICY "channel_messages_delete_own" ON public.mentoring_channel_messages FOR DELETE
USING (auth.uid() = user_id);
CREATE POLICY "channel_messages_admin_delete" ON public.mentoring_channel_messages FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- DMs
CREATE POLICY "dms_select" ON public.mentoring_dms FOR SELECT
USING (auth.uid() = user_a OR auth.uid() = user_b OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "dms_insert" ON public.mentoring_dms FOR INSERT
WITH CHECK (
  (auth.uid() = user_a OR auth.uid() = user_b)
  AND public.can_access_mentoring_hub(auth.uid(), course_id)
);

-- DM MESSAGES
CREATE POLICY "dm_messages_select" ON public.mentoring_dm_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.mentoring_dms d
  WHERE d.id = mentoring_dm_messages.dm_id
    AND (auth.uid() = d.user_a OR auth.uid() = d.user_b OR public.has_role(auth.uid(), 'admin'::app_role))
));
CREATE POLICY "dm_messages_insert" ON public.mentoring_dm_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.mentoring_dms d
    WHERE d.id = mentoring_dm_messages.dm_id
      AND (auth.uid() = d.user_a OR auth.uid() = d.user_b)
  )
);
CREATE POLICY "dm_messages_update_own" ON public.mentoring_dm_messages FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.mentoring_dms d
  WHERE d.id = mentoring_dm_messages.dm_id
    AND (auth.uid() = d.user_a OR auth.uid() = d.user_b)
));

-- FRIENDSHIPS
CREATE POLICY "friendships_select" ON public.mentoring_friendships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "friendships_insert" ON public.mentoring_friendships FOR INSERT
WITH CHECK (
  auth.uid() = requester_id
  AND public.can_access_mentoring_hub(auth.uid(), course_id)
);
CREATE POLICY "friendships_update" ON public.mentoring_friendships FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships_delete" ON public.mentoring_friendships FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- VOICE SESSIONS
CREATE POLICY "voice_select" ON public.mentoring_voice_sessions FOR SELECT
USING (public.can_access_mentoring_hub(auth.uid(), course_id));
CREATE POLICY "voice_insert" ON public.mentoring_voice_sessions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.can_access_mentoring_hub(auth.uid(), course_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.mentoring_hub_members m
    WHERE m.course_id = mentoring_voice_sessions.course_id
      AND m.user_id = auth.uid()
      AND m.banned = true
  )
);
CREATE POLICY "voice_delete_own" ON public.mentoring_voice_sessions FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- ============ Realtime ============
ALTER TABLE public.mentoring_hub_members REPLICA IDENTITY FULL;
ALTER TABLE public.mentoring_channels REPLICA IDENTITY FULL;
ALTER TABLE public.mentoring_channel_messages REPLICA IDENTITY FULL;
ALTER TABLE public.mentoring_dms REPLICA IDENTITY FULL;
ALTER TABLE public.mentoring_dm_messages REPLICA IDENTITY FULL;
ALTER TABLE public.mentoring_friendships REPLICA IDENTITY FULL;
ALTER TABLE public.mentoring_voice_sessions REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_hub_members;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_channels;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_channel_messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_dms;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_dm_messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_friendships;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_voice_sessions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
