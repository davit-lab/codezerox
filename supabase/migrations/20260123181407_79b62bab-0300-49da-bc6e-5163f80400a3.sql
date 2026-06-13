-- Create community messages table for public chat
CREATE TABLE public.community_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'project', 'question'
    project_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view messages
CREATE POLICY "Authenticated users can view community messages"
ON public.community_messages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create their own messages
CREATE POLICY "Users can create community messages"
ON public.community_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own community messages"
ON public.community_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can delete any message
CREATE POLICY "Admins can delete any community message"
ON public.community_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for community messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Create message reactions table for rating/likes
CREATE TABLE public.message_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL DEFAULT 'like', -- 'like', 'helpful', 'fire'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view reactions
CREATE POLICY "Authenticated users can view reactions"
ON public.message_reactions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can add their own reactions
CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;