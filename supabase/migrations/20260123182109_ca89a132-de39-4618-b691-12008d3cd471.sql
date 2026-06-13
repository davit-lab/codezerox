-- Add reply_to column to community_messages
ALTER TABLE public.community_messages 
ADD COLUMN reply_to UUID REFERENCES public.community_messages(id) ON DELETE SET NULL;

-- Add channel column
ALTER TABLE public.community_messages 
ADD COLUMN channel TEXT NOT NULL DEFAULT 'general';

-- Add upvotes column for quick counting
ALTER TABLE public.community_messages 
ADD COLUMN upvote_count INTEGER NOT NULL DEFAULT 0;

-- Create function to update upvote count
CREATE OR REPLACE FUNCTION public.update_message_upvote_count()
RETURNS TRIGGER AS $$
DECLARE
    target_message_id UUID;
    new_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_message_id := OLD.message_id;
    ELSE
        target_message_id := NEW.message_id;
    END IF;

    SELECT COUNT(*) INTO new_count
    FROM public.message_reactions
    WHERE message_id = target_message_id AND reaction_type = 'like';

    UPDATE public.community_messages
    SET upvote_count = new_count
    WHERE id = target_message_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for upvote count
CREATE TRIGGER update_upvote_count_trigger
AFTER INSERT OR DELETE ON public.message_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_message_upvote_count();