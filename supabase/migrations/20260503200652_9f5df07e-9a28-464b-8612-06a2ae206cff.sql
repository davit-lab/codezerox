
-- Categories
CREATE TABLE public.cyberrange_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_ka text NOT NULL,
  name_en text NOT NULL,
  description_ka text,
  icon text,
  color text DEFAULT '#5F13CA',
  sort int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cyberrange_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable by all" ON public.cyberrange_categories FOR SELECT USING (true);
CREATE POLICY "categories admin manage" ON public.cyberrange_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Ranks
CREATE TABLE public.cyberrange_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_ka text NOT NULL,
  name_en text NOT NULL,
  min_points int NOT NULL DEFAULT 0,
  badge_color text DEFAULT '#FFD700',
  sort int NOT NULL DEFAULT 0
);
ALTER TABLE public.cyberrange_ranks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ranks readable" ON public.cyberrange_ranks FOR SELECT USING (true);
CREATE POLICY "ranks admin" ON public.cyberrange_ranks FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Challenges
CREATE TABLE public.cyberrange_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES public.cyberrange_categories(id) ON DELETE SET NULL,
  title_ka text NOT NULL,
  title_en text,
  story_md text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard','insane','flagship')),
  engine text NOT NULL DEFAULT 'static' CHECK (engine IN ('static','interactive','terminal','ai')),
  base_points int NOT NULL DEFAULT 25,
  dynamic_scoring boolean DEFAULT false,
  flag_hash text NOT NULL,
  flag_format text DEFAULT 'CZ{...}',
  scenario jsonb DEFAULT '{}'::jsonb,
  artifact_path text,
  tags text[] DEFAULT '{}',
  min_rank_points int DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  author_user_id uuid,
  source text NOT NULL DEFAULT 'curated' CHECK (source IN ('curated','ai','community')),
  solves_count int NOT NULL DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);
ALTER TABLE public.cyberrange_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published challenges readable" ON public.cyberrange_challenges FOR SELECT
  USING (status = 'published' OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "challenges admin manage" ON public.cyberrange_challenges FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX idx_cr_chal_cat ON public.cyberrange_challenges(category_id);
CREATE INDEX idx_cr_chal_status ON public.cyberrange_challenges(status);

-- Public-safe view that hides flag_hash
CREATE OR REPLACE VIEW public.cyberrange_challenges_public AS
SELECT id, slug, category_id, title_ka, title_en, story_md, difficulty, engine,
       base_points, dynamic_scoring, scenario, artifact_path, tags, min_rank_points,
       status, source, solves_count, rating, created_at, published_at
FROM public.cyberrange_challenges
WHERE status = 'published';

-- Hints
CREATE TABLE public.cyberrange_challenge_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  sort int NOT NULL DEFAULT 0,
  hint_md text NOT NULL,
  cost_pct int NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cyberrange_challenge_hints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hints readable on published" ON public.cyberrange_challenge_hints FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cyberrange_challenges c WHERE c.id = challenge_id AND (c.status='published' OR has_role(auth.uid(),'admin'::app_role))));
CREATE POLICY "hints admin" ON public.cyberrange_challenge_hints FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Solves
CREATE TABLE public.cyberrange_solves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  points_awarded int NOT NULL,
  hints_used int DEFAULT 0,
  time_to_solve_s int,
  first_blood boolean DEFAULT false,
  solved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.cyberrange_solves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "solves readable by all" ON public.cyberrange_solves FOR SELECT USING (true);
CREATE POLICY "solves admin manage" ON public.cyberrange_solves FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX idx_cr_solves_user ON public.cyberrange_solves(user_id);
CREATE INDEX idx_cr_solves_chal ON public.cyberrange_solves(challenge_id);

-- Attempts
CREATE TABLE public.cyberrange_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  ip_hash text,
  success boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cyberrange_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts readable" ON public.cyberrange_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));
CREATE INDEX idx_cr_attempts_user ON public.cyberrange_attempts(user_id, submitted_at DESC);

-- Writeups
CREATE TABLE public.cyberrange_writeups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.cyberrange_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content_md text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  upvotes int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cyberrange_writeups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own writeup insert" ON public.cyberrange_writeups FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.cyberrange_solves s WHERE s.user_id = auth.uid() AND s.challenge_id = challenge_id));
CREATE POLICY "writeups readable after solving" ON public.cyberrange_writeups FOR SELECT TO authenticated
  USING (status = 'approved' AND EXISTS (SELECT 1 FROM public.cyberrange_solves s WHERE s.user_id = auth.uid() AND s.challenge_id = challenge_id) OR has_role(auth.uid(),'admin'::app_role) OR user_id = auth.uid());
CREATE POLICY "writeups admin all" ON public.cyberrange_writeups FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- User stats
CREATE TABLE public.cyberrange_user_stats (
  user_id uuid PRIMARY KEY,
  total_points int NOT NULL DEFAULT 0,
  rank_slug text DEFAULT 'script_kiddie',
  solves_count int NOT NULL DEFAULT 0,
  streak_days int DEFAULT 0,
  last_solve_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cyberrange_user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats readable by all" ON public.cyberrange_user_stats FOR SELECT USING (true);
CREATE POLICY "stats admin write" ON public.cyberrange_user_stats FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('cyberrange-files', 'cyberrange-files', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "cyberrange-files admin manage" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'cyberrange-files' AND has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (bucket_id = 'cyberrange-files' AND has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "cyberrange-files authed read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cyberrange-files');

-- Helper: leaderboard
CREATE OR REPLACE FUNCTION public.cyberrange_leaderboard(_limit int DEFAULT 100)
RETURNS TABLE(user_id uuid, total_points int, solves_count int, rank_slug text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.user_id, s.total_points, s.solves_count, s.rank_slug
  FROM public.cyberrange_user_stats s
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = s.user_id AND ur.role='admin')
  ORDER BY s.total_points DESC LIMIT _limit;
$$;

-- Helper: compute rank slug from points
CREATE OR REPLACE FUNCTION public.cyberrange_rank_for_points(_points int)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT slug FROM public.cyberrange_ranks WHERE min_points <= _points ORDER BY min_points DESC LIMIT 1;
$$;
