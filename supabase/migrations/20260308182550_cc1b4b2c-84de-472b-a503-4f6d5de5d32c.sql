
-- User XP summary table
CREATE TABLE public.user_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- XP transaction log
CREATE TABLE public.xp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- user_xp RLS: everyone can see leaderboard, users manage own
CREATE POLICY "Anyone can view XP" ON public.user_xp FOR SELECT USING (true);
CREATE POLICY "System can insert XP" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update XP" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);

-- xp_transactions RLS
CREATE POLICY "Users can view own transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_xp_total ON public.user_xp(total_xp DESC);
CREATE INDEX idx_user_xp_user ON public.user_xp(user_id);
CREATE INDEX idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);

-- Function to award XP
CREATE OR REPLACE FUNCTION public.award_xp(_user_id UUID, _amount INTEGER, _action TEXT, _ref TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Ensure user_xp record exists
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add XP
  UPDATE public.user_xp
  SET total_xp = total_xp + _amount,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING total_xp INTO new_total;

  -- Calculate level (every 200 XP = 1 level)
  new_level := GREATEST(1, (new_total / 200) + 1);
  UPDATE public.user_xp SET level = new_level WHERE user_id = _user_id;

  -- Log transaction
  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _action, _ref);
END;
$$;

-- Auto-award XP on book purchase
CREATE OR REPLACE FUNCTION public.xp_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 50, 'book_purchase', NEW.book_id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_purchase
  AFTER INSERT ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_purchase();

-- Auto-award XP on book review
CREATE OR REPLACE FUNCTION public.xp_on_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 30, 'book_review', NEW.book_id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_review
  AFTER INSERT ON public.book_reviews
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_review();

-- Auto-award XP on hub project
CREATE OR REPLACE FUNCTION public.xp_on_hub_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 40, 'hub_project', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_hub_project
  AFTER INSERT ON public.hub_projects
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_hub_project();

-- Auto-award XP on community message
CREATE OR REPLACE FUNCTION public.xp_on_community_msg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 5, 'community_message', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_community_msg
  AFTER INSERT ON public.community_messages
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_community_msg();

-- Auto-award XP on blog comment
CREATE OR REPLACE FUNCTION public.xp_on_blog_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 10, 'blog_comment', NEW.post_id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_blog_comment
  AFTER INSERT ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_blog_comment();
