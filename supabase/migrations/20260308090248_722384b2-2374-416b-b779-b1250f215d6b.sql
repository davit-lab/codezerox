
-- Hub projects table (GitHub-style project sharing)
CREATE TABLE public.hub_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    screenshot_url text,
    live_url text,
    github_url text,
    tags text[] DEFAULT '{}',
    views integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hub_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hub projects" ON public.hub_projects FOR SELECT USING (true);
CREATE POLICY "Auth users can create projects" ON public.hub_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.hub_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.hub_projects FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Hub project comments
CREATE TABLE public.hub_project_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.hub_projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hub_project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.hub_project_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can create comments" ON public.hub_project_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.hub_project_comments FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Hub project likes
CREATE TABLE public.hub_project_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.hub_projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id)
);

ALTER TABLE public.hub_project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.hub_project_likes FOR SELECT USING (true);
CREATE POLICY "Auth users can add likes" ON public.hub_project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.hub_project_likes FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.hub_project_comments;
