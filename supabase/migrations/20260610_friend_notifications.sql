-- Friend Request Notifications
-- This migration adds triggers to create notifications when friend requests are sent, accepted, or rejected

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_friend_notification(
  _user_id uuid,
  _title text,
  _message text,
  _type text,
  _reference_id uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, title, message, type, reference_id)
  VALUES (_user_id, _title, _message, _type, _reference_id);
END $$;

-- Trigger: Notification when friend request is sent
CREATE OR REPLACE FUNCTION public.notify_friend_request_sent()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _requester_name text;
BEGIN
  -- Get requester's name
  SELECT full_name INTO _requester_name
  FROM public.profiles
  WHERE id = NEW.user_a;

  -- Create notification for receiver
  PERFORM public.create_friend_notification(
    NEW.user_b,
    'ახალი მეგობრობის მოთხოვნა',
    COALESCE(_requester_name, 'მომხმარებელი') || ' გსურთ დამემატოთ მეგობრებში',
    'friend_request',
    NEW.id
  );

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_friend_request_sent ON public.friends;
CREATE TRIGGER trg_friend_request_sent
AFTER INSERT ON public.friends
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION public.notify_friend_request_sent();

-- Trigger: Notification when friend request is accepted
CREATE OR REPLACE FUNCTION public.notify_friend_request_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _accepter_name text;
  _receiver_id uuid;
BEGIN
  -- Get accepter's name
  SELECT full_name INTO _accepter_name
  FROM public.profiles
  WHERE id = NEW.user_a;

  -- Determine who should receive the notification (the other user)
  _receiver_id := CASE
    WHEN NEW.user_a = OLD.user_a THEN OLD.user_b
    ELSE OLD.user_a
  END;

  -- Create notification for the requester
  PERFORM public.create_friend_notification(
    _receiver_id,
    'მეგობრობის მოთხოვნა მიღებულია',
    COALESCE(_accepter_name, 'მომხმარებელი') || ' დათანხმდა თქვენი მეგობრობის მოთხოვნას',
    'friend_accepted',
    NEW.id
  );

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_friend_request_accepted ON public.friends;
CREATE TRIGGER trg_friend_request_accepted
AFTER UPDATE ON public.friends
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
EXECUTE FUNCTION public.notify_friend_request_accepted();

-- Trigger: Notification when friend request is declined
CREATE OR REPLACE FUNCTION public.notify_friend_request_declined()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _decliner_name text;
  _receiver_id uuid;
BEGIN
  -- Get decliner's name
  SELECT full_name INTO _decliner_name
  FROM public.profiles
  WHERE id = NEW.user_a;

  -- Determine who should receive the notification (the other user)
  _receiver_id := CASE
    WHEN NEW.user_a = OLD.user_a THEN OLD.user_b
    ELSE OLD.user_a
  END;

  -- Create notification for the requester
  PERFORM public.create_friend_notification(
    _receiver_id,
    'მეგობრობის მოთხოვნა უარყოფილია',
    COALESCE(_decliner_name, 'მომხმარებელი') || ' უარყოფს თქვენი მეგობრობის მოთხოვნას',
    'friend_declined',
    NEW.id
  );

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_friend_request_declined ON public.friends;
CREATE TRIGGER trg_friend_request_declined
AFTER UPDATE ON public.friends
FOR EACH ROW
WHEN (NEW.status = 'declined' AND OLD.status = 'pending')
EXECUTE FUNCTION public.notify_friend_request_declined();
