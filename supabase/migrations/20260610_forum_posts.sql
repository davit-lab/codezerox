-- Forum Posts System

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'programming'
    CHECK (category IN ('programming', 'design', 'business', 'help')),
  tags text[] NOT NULL DEFAULT '{}',
  likes_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_post ON public.forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_user ON public.forum_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments(post_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_forum_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_forum_posts_updated_at ON public.forum_posts;
CREATE TRIGGER trg_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts
FOR EACH ROW EXECUTE FUNCTION public.update_forum_updated_at();

DROP TRIGGER IF EXISTS trg_forum_comments_updated_at ON public.forum_comments;
CREATE TRIGGER trg_forum_comments_updated_at BEFORE UPDATE ON public.forum_comments
FOR EACH ROW EXECUTE FUNCTION public.update_forum_updated_at();

-- Trigger: maintain likes_count
CREATE OR REPLACE FUNCTION public.update_forum_likes_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_forum_likes_count ON public.forum_post_likes;
CREATE TRIGGER trg_forum_likes_count AFTER INSERT OR DELETE ON public.forum_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_forum_likes_count();

-- Trigger: maintain comments_count
CREATE OR REPLACE FUNCTION public.update_forum_comments_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_forum_comments_count ON public.forum_comments;
CREATE TRIGGER trg_forum_comments_count AFTER INSERT OR DELETE ON public.forum_comments
FOR EACH ROW EXECUTE FUNCTION public.update_forum_comments_count();

-- RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_posts_select" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_insert" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_update_own" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_delete_own" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_likes_select" ON public.forum_post_likes;
DROP POLICY IF EXISTS "forum_likes_insert" ON public.forum_post_likes;
DROP POLICY IF EXISTS "forum_likes_delete" ON public.forum_post_likes;
DROP POLICY IF EXISTS "forum_comments_select" ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_insert" ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_delete_own" ON public.forum_comments;

CREATE POLICY "forum_posts_select" ON public.forum_posts FOR SELECT USING (is_published = true);
CREATE POLICY "forum_posts_insert" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "forum_posts_update_own" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "forum_posts_delete_own" ON public.forum_posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "forum_likes_select" ON public.forum_post_likes FOR SELECT USING (true);
CREATE POLICY "forum_likes_insert" ON public.forum_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_likes_delete" ON public.forum_post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "forum_comments_select" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "forum_comments_insert" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "forum_comments_delete_own" ON public.forum_comments FOR DELETE USING (auth.uid() = author_id);

-- RPC: increment views safely
CREATE OR REPLACE FUNCTION public.increment_forum_views(_post_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.forum_posts SET views_count = views_count + 1 WHERE id = _post_id;
$$;
