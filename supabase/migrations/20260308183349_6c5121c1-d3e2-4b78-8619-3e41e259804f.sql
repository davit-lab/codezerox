
-- Backfill XP for existing users who have qualifying activities
-- First, ensure user_xp rows exist for all users with activities

-- Award XP for existing book purchases (50 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT p.user_id, COUNT(*) * 50, GREATEST(1, (COUNT(*) * 50 / 200) + 1)
FROM public.purchases p
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = p.user_id)
GROUP BY p.user_id
ON CONFLICT DO NOTHING;

-- Update existing user_xp with purchase XP
UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT p.user_id, COUNT(*) * 50 as xp
  FROM public.purchases p
  LEFT JOIN public.xp_transactions xt ON xt.user_id = p.user_id AND xt.action_type = 'book_purchase' AND xt.reference_id = p.id::text
  WHERE xt.id IS NULL
  GROUP BY p.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

-- Insert missing xp_transactions for purchases
INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT p.user_id, 50, 'book_purchase', p.id::text
FROM public.purchases p
LEFT JOIN public.xp_transactions xt ON xt.reference_id = p.id::text AND xt.action_type = 'book_purchase'
WHERE xt.id IS NULL;

-- Award XP for existing book reviews (30 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT br.user_id, COUNT(*) * 30, GREATEST(1, (COUNT(*) * 30 / 200) + 1)
FROM public.book_reviews br
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = br.user_id)
GROUP BY br.user_id
ON CONFLICT DO NOTHING;

UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT br.user_id, COUNT(*) * 30 as xp
  FROM public.book_reviews br
  LEFT JOIN public.xp_transactions xt ON xt.user_id = br.user_id AND xt.action_type = 'book_review' AND xt.reference_id = br.id::text
  WHERE xt.id IS NULL
  GROUP BY br.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT br.user_id, 30, 'book_review', br.id::text
FROM public.book_reviews br
LEFT JOIN public.xp_transactions xt ON xt.reference_id = br.id::text AND xt.action_type = 'book_review'
WHERE xt.id IS NULL;

-- Award XP for hub projects (40 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT hp.user_id, COUNT(*) * 40, GREATEST(1, (COUNT(*) * 40 / 200) + 1)
FROM public.hub_projects hp
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = hp.user_id)
GROUP BY hp.user_id
ON CONFLICT DO NOTHING;

UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT hp.user_id, COUNT(*) * 40 as xp
  FROM public.hub_projects hp
  LEFT JOIN public.xp_transactions xt ON xt.user_id = hp.user_id AND xt.action_type = 'hub_project' AND xt.reference_id = hp.id::text
  WHERE xt.id IS NULL
  GROUP BY hp.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT hp.user_id, 40, 'hub_project', hp.id::text
FROM public.hub_projects hp
LEFT JOIN public.xp_transactions xt ON xt.reference_id = hp.id::text AND xt.action_type = 'hub_project'
WHERE xt.id IS NULL;

-- Award XP for blog comments (10 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT bc.user_id, COUNT(*) * 10, GREATEST(1, (COUNT(*) * 10 / 200) + 1)
FROM public.blog_comments bc
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = bc.user_id)
GROUP BY bc.user_id
ON CONFLICT DO NOTHING;

UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT bc.user_id, COUNT(*) * 10 as xp
  FROM public.blog_comments bc
  LEFT JOIN public.xp_transactions xt ON xt.user_id = bc.user_id AND xt.action_type = 'blog_comment' AND xt.reference_id = bc.id::text
  WHERE xt.id IS NULL
  GROUP BY bc.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT bc.user_id, 10, 'blog_comment', bc.id::text
FROM public.blog_comments bc
LEFT JOIN public.xp_transactions xt ON xt.reference_id = bc.id::text AND xt.action_type = 'blog_comment'
WHERE xt.id IS NULL;

-- Recalculate all levels
UPDATE public.user_xp SET level = GREATEST(1, (total_xp / 200) + 1);

-- Create an admin function to manually award XP
CREATE OR REPLACE FUNCTION public.admin_award_xp(_user_id uuid, _amount integer, _reason text DEFAULT 'admin_award')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, _amount, GREATEST(1, (_amount / 200) + 1))
  ON CONFLICT (user_id) DO UPDATE
  SET total_xp = user_xp.total_xp + _amount,
      level = GREATEST(1, ((user_xp.total_xp + _amount) / 200) + 1),
      updated_at = now();

  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _reason, 'admin_' || gen_random_uuid()::text);
END;
$$;
