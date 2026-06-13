
-- Payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  paypal_order_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Freelancer profiles
CREATE TABLE public.freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  title text,
  bio text,
  hourly_rate numeric,
  availability text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view freelancer profiles" ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own freelancer profile" ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own freelancer profile" ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own freelancer profile" ON public.freelancer_profiles FOR DELETE USING (auth.uid() = user_id);

-- Freelancer skills
CREATE TABLE public.freelancer_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL
);
ALTER TABLE public.freelancer_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view skills" ON public.freelancer_skills FOR SELECT USING (true);
CREATE POLICY "Profile owners can insert skills" ON public.freelancer_skills FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_skills.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Profile owners can delete skills" ON public.freelancer_skills FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_skills.profile_id AND user_id = auth.uid())
);

-- Freelancer projects
CREATE TABLE public.freelancer_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  live_url text,
  github_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.freelancer_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view projects" ON public.freelancer_projects FOR SELECT USING (true);
CREATE POLICY "Profile owners can insert projects" ON public.freelancer_projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_projects.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Profile owners can update projects" ON public.freelancer_projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_projects.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Profile owners can delete projects" ON public.freelancer_projects FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_projects.profile_id AND user_id = auth.uid())
);

-- Direct conversations
CREATE TABLE public.direct_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one uuid NOT NULL,
  participant_two uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_one, participant_two)
);
ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations" ON public.direct_conversations FOR SELECT USING (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "Auth users can create conversations" ON public.direct_conversations FOR INSERT WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "Participants can update conversations" ON public.direct_conversations FOR UPDATE USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Direct messages
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages" ON public.direct_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.direct_conversations WHERE id = direct_messages.conversation_id AND (participant_one = auth.uid() OR participant_two = auth.uid()))
);
CREATE POLICY "Participants can send messages" ON public.direct_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.direct_conversations WHERE id = direct_messages.conversation_id AND (participant_one = auth.uid() OR participant_two = auth.uid()))
);
CREATE POLICY "Participants can update messages" ON public.direct_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.direct_conversations WHERE id = direct_messages.conversation_id AND (participant_one = auth.uid() OR participant_two = auth.uid()))
);

-- Enable realtime for direct messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
CREATE POLICY "Anyone can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Auth users can upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own project images" ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND auth.uid()::text = (storage.foldername(name))[1]);
