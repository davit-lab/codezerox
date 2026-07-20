-- ============================================================================
-- ⚠️ DEPRECATED: This file is an outdated concatenation of migrations.
-- It contains schema drift, conflicting policies, and broken FK definitions.
-- DO NOT USE THIS FILE FOR NEW DATABASE SETUP.
-- 
-- Instead, run migrations in chronological order from supabase/migrations/
-- or apply the comprehensive fix: 
--   supabase/migrations/20260613_comprehensive_database_cleanup.sql
-- ============================================================================
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Add storage policies for book-pdfs bucket
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);-- Add storage policies for book-pdfs bucket
-- Allow authenticated users to download PDFs (for purchased books / free books)
CREATE POLICY "Authenticated users can download PDFs"
  bucket_id = 'book-pdfs' 
  AND public.has_role(auth.uid(), 'admin')
);
-- Create book_reviews table
);-- Create book_reviews table
CREATE TABLE public.book_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
AFTER DELETE ON public.book_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_book_rating();
-- Create reading progress table
EXECUTE FUNCTION public.update_book_rating();-- Create reading progress table
CREATE TABLE public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
BEFORE UPDATE ON public.reading_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create user_credits table for tracking AI chat credits
EXECUTE FUNCTION public.update_updated_at_column();-- Create user_credits table for tracking AI chat credits
CREATE TABLE public.user_credits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
AFTER INSERT ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.handle_first_purchase();
-- Create community messages table for public chat
EXECUTE FUNCTION public.handle_first_purchase();-- Create community messages table for public chat
CREATE TABLE public.community_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
AFTER INSERT OR DELETE ON public.message_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_message_upvote_count();
-- Allow admins to delete profiles
EXECUTE FUNCTION public.update_message_upvote_count();-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
ON public.credit_purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
-- Create password reset codes table
USING (has_role(auth.uid(), 'admin'::app_role));-- Create password reset codes table
CREATE TABLE public.password_reset_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
AFTER INSERT ON public.password_reset_codes
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_reset_codes();
-- Create ai_conversations table for proper conversation management
EXECUTE FUNCTION public.cleanup_expired_reset_codes();-- Create ai_conversations table for proper conversation management
CREATE TABLE public.ai_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
-- Create index for performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_chat_messages_conversation_id ON public.ai_chat_messages(conversation_id);
-- Create table for storing code snippets
CREATE INDEX idx_ai_chat_messages_conversation_id ON public.ai_chat_messages(conversation_id);-- Create table for storing code snippets
CREATE TABLE public.code_snippets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
BEFORE UPDATE ON public.code_snippets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add language column to code_snippets table
EXECUTE FUNCTION public.update_updated_at_column();-- Add language column to code_snippets table
ALTER TABLE public.code_snippets 
ADD COLUMN language TEXT NOT NULL DEFAULT 'web';
ON public.purchases
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Allow admins to delete any code snippet from the gallery
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));-- Allow admins to delete any code snippet from the gallery
CREATE POLICY "Admins can delete any code snippet"
ON public.code_snippets
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
-- Create courses table
USING (has_role(auth.uid(), 'admin'::app_role));-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ON public.code_snippets
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
-- 🛡️ SECURITY HARDENING MIGRATION 🛡️
WITH CHECK (auth.uid() IS NOT NULL);-- 🛡️ SECURITY HARDENING MIGRATION 🛡️
-- 1. FIX: Remove permissive storage policy that bypasses purchase verification
AFTER INSERT ON public.rate_limit_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_rate_limit_entries();
-- Create storage bucket for course content images
EXECUTE FUNCTION public.cleanup_rate_limit_entries();-- Create storage bucket for course content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-content', 'course-content', true)
  VALUES (_user_id, _amount, _reason, 'admin_' || gen_random_uuid()::text);
END;
$function$;CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 1000)
RETURNS TABLE(user_id uuid, total_xp integer, level integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ux.user_id, ux.total_xp, ux.level
  FROM public.user_xp ux
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = ux.user_id AND ur.role = 'admin'
  )
  ORDER BY ux.total_xp DESC
  LIMIT _limit;
$$;
CREATE OR REPLACE FUNCTION public.increment_blog_views(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.blog_posts
  SET views = views + 1
  WHERE id = _post_id;
END;
$$;
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  setting_key text NOT NULL,
  setting_value text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(provider, setting_key)
);
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage payment settings"
ON public.payment_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
-- Insert default settings for BOG
INSERT INTO public.payment_settings (provider, setting_key, setting_value, is_active) VALUES
  ('bog', 'client_id', '', false),
  ('bog', 'secret_key', '', false),
  ('bog', 'merchant_id', '', false),
  ('bog', 'terminal_id', '', false),
  ('bog', 'callback_url', '', false);
-- Insert default settings for TBC
INSERT INTO public.payment_settings (provider, setting_key, setting_value, is_active) VALUES
  ('tbc', 'client_id', '', false),
  ('tbc', 'secret_key', '', false),
  ('tbc', 'api_key', '', false),
  ('tbc', 'callback_url', '', false);
CREATE TABLE public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'bog' or 'tbc'
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'GEL',
  status text NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  bank_order_id text, -- ID returned by bank
  bank_status text, -- raw status from bank
  error_message text,
  items jsonb, -- what was purchased
  discount_amount numeric DEFAULT 0,
  callback_received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
-- Users can view their own transactions
CREATE POLICY "Users can view own bank transactions"
  ON public.bank_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
-- Users can create transactions (initiate payment)
CREATE POLICY "Users can create bank transactions"
  ON public.bank_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
-- Admins can view all transactions
CREATE POLICY "Admins can view all bank transactions"
  ON public.bank_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Admins can update transactions
CREATE POLICY "Admins can manage bank transactions"
  ON public.bank_transactions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Certification exams table
CREATE TABLE public.certification_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'frontend', 'backend', 'cyber'
  subcategory TEXT, -- 'html_css_js', 'csharp', 'javascript', 'python', 'sql', etc
  description TEXT,
  total_questions INTEGER NOT NULL DEFAULT 50,
  pass_threshold INTEGER NOT NULL DEFAULT 40,
  price_gel NUMERIC NOT NULL DEFAULT 10,
  time_limit_minutes INTEGER NOT NULL DEFAULT 120,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Exam questions table
CREATE TABLE public.exam_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL, -- 'a', 'b', 'c', 'd'
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Exam attempts table
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB, -- store user answers
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exam_id)
);
-- Enable RLS
ALTER TABLE public.certification_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
-- Exams: anyone can view active exams, admins can manage
CREATE POLICY "Anyone can view active exams" ON public.certification_exams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage exams" ON public.certification_exams FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
-- Questions: only visible during exam (via edge function), admins can manage
CREATE POLICY "Admins can manage questions" ON public.exam_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
-- Attempts: users can manage their own
CREATE POLICY "Users can view own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = user_id);
-- Certificates: users can view own, anyone can verify
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can verify certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "System can create certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all attempts"
ON public.exam_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  page_label TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
-- Everyone can read banners
CREATE POLICY "Anyone can view hero banners"
  ON public.hero_banners FOR SELECT
  TO authenticated, anon
  USING (true);
-- Only admins can update
CREATE POLICY "Admins can manage hero banners"
  ON public.hero_banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- Seed default entries for each page
INSERT INTO public.hero_banners (page_key, page_label) VALUES
  ('leaderboard', 'ლიდერბორდი'),
  ('categories', 'კატეგორიები'),
  ('gallery', 'გალერეა'),
  ('freelancers', 'ფრილანსერები'),
  ('vacancies', 'ვაკანსიები'),
  ('certifications', 'სერტიფიკატები'),
  ('hub_chat', 'Hub ჩატი');
-- Drop the restrictive ALL policy and replace with permissive ones
DROP POLICY IF EXISTS "Admins can manage hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Anyone can view hero banners" ON public.hero_banners;
-- Permissive SELECT for everyone
CREATE POLICY "Anyone can view hero banners"
ON public.hero_banners FOR SELECT
USING (true);
-- Permissive ALL for admins
CREATE POLICY "Admins can manage hero banners"
ON public.hero_banners FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
-- Allow admins to upload to avatars bucket (for banners)
CREATE POLICY "Admins can upload to avatars bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);
-- Allow admins to update files in avatars bucket
CREATE POLICY "Admins can update avatars bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);
-- Allow admins to delete from avatars bucket
CREATE POLICY "Admins can delete from avatars bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);
-- Create course_subscriptions table for monthly subscription model
CREATE TABLE public.course_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  chapters_read_this_month integer NOT NULL DEFAULT 0,
  month_reset_at timestamptz NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  last_chapter_generated_at date DEFAULT NULL,
  granted_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
-- Track which chapters a user has read
CREATE TABLE public.course_chapter_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);
-- Enable RLS
ALTER TABLE public.course_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_chapter_reads ENABLE ROW LEVEL SECURITY;
-- RLS policies for course_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.course_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all subscriptions"
  ON public.course_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own subscriptions"
  ON public.course_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions"
  ON public.course_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
-- RLS policies for course_chapter_reads
CREATE POLICY "Users can view their own reads"
  ON public.course_chapter_reads FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reads"
  ON public.course_chapter_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage reads"
  ON public.course_chapter_reads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Update chapter RLS: allow subscribers to view chapters
DROP POLICY IF EXISTS "Users can view chapters of purchased courses" ON public.course_chapters;
CREATE POLICY "Users can view chapters of subscribed courses"
  ON public.course_chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_subscriptions
      WHERE course_id = course_chapters.course_id
        AND user_id = auth.uid()
        AND expires_at > now()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );
-- Add monthly_price column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS monthly_price numeric NOT NULL DEFAULT 0;
-- Update course prices to monthly prices
UPDATE public.courses SET monthly_price = 30 WHERE title = 'კიბერუსაფრთხოების საფუძვლები';
UPDATE public.courses SET monthly_price = 25 WHERE title = 'ქსელის უსაფრთხოება';
UPDATE public.courses SET monthly_price = 20 WHERE title = 'შეღწევადობის ტესტირება';
UPDATE public.courses SET monthly_price = 15 WHERE title = 'ვებ აპლიკაციების უსაფრთხოება';
UPDATE public.courses SET monthly_price = 10 WHERE title = 'ინციდენტების მართვა და ფორენზიკა';
-- Trigger to update updated_at
CREATE TRIGGER update_course_subscriptions_updated_at
  BEFORE UPDATE ON public.course_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Add final assignment text to certification exams
ALTER TABLE public.certification_exams ADD COLUMN IF NOT EXISTS final_assignment text;
-- Create assignment submissions table
CREATE TABLE public.exam_assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exam_id uuid NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_feedback text,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  UNIQUE (user_id, exam_id)
);
ALTER TABLE public.exam_assignment_submissions ENABLE ROW LEVEL SECURITY;
-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.exam_assignment_submissions
FOR SELECT USING (auth.uid() = user_id);
-- Users can create submissions
CREATE POLICY "Users can create submissions" ON public.exam_assignment_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own pending submissions
CREATE POLICY "Users can update pending submissions" ON public.exam_assignment_submissions
FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions" ON public.exam_assignment_submissions
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions" ON public.exam_assignment_submissions
FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
-- Create notifications table
CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  reference_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.user_notifications
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.user_notifications
FOR UPDATE USING (auth.uid() = user_id);
-- Admins can insert notifications
CREATE POLICY "Admins can insert notifications" ON public.user_notifications
FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- System can insert notifications (for edge functions)
CREATE POLICY "System can insert notifications" ON public.user_notifications
FOR INSERT WITH CHECK (true);
-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
-- Replace overly permissive policy with authenticated-only
DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.user_notifications
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action_type ON public.activity_log(action_type);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own activity"
ON public.activity_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity"
ON public.activity_log FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete activity"
ON public.activity_log FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.activity_log
  WHERE created_at < now() - interval '30 days';
END;
$$;
-- Email infrastructure
-- Creates the queue system, send log, send state, suppression, and unsubscribe
-- tables used by both auth and transactional emails.
-- Extensions required for queue processing
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pgmq;
-- Create email queues (auth = high priority, transactional = normal)
-- Wrapped in DO blocks to handle "queue already exists" errors idempotently.
DO $$ BEGIN PERFORM pgmq.create('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- Dead-letter queues for messages that exceed max retries
DO $$ BEGIN PERFORM pgmq.create('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- Email send log table (audit trail for all send attempts)
-- UPDATE is allowed for the service role so the suppression edge function
-- can update a log record's status when a bounce/complaint/unsubscribe occurs.
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Service role can read send log"
    ON public.email_send_log FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Service role can insert send log"
    ON public.email_send_log FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Service role can update send log"
    ON public.email_send_log FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient ON public.email_send_log(recipient_email);
-- Backfill: add message_id column to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_log ADD COLUMN message_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_email_send_log_message ON public.email_send_log(message_id);
-- Prevent duplicate sends: only one 'sent' row per message_id.
-- If VT expires and another worker picks up the same message, the pre-send
-- check catches it. This index is a DB-level safety net for race conditions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_sent_unique
  ON public.email_send_log(message_id) WHERE status = 'sent';
-- Backfill: update status CHECK constraint for existing tables that predate new statuses
DO $$ BEGIN
  ALTER TABLE public.email_send_log DROP CONSTRAINT IF EXISTS email_send_log_status_check;
  ALTER TABLE public.email_send_log ADD CONSTRAINT email_send_log_status_check
    CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq'));
END $$;
-- Rate-limit state and queue config (single row, tracks Retry-After cooldown + throughput settings)
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until TIMESTAMPTZ,
  batch_size INTEGER NOT NULL DEFAULT 10,
  send_delay_ms INTEGER NOT NULL DEFAULT 200,
  auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT DO NOTHING;
-- Backfill: add config columns to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN batch_size INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN send_delay_ms INTEGER NOT NULL DEFAULT 200;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Service role can manage send state"
    ON public.email_send_state FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
-- RPC wrappers so Edge Functions can interact with pgmq via supabase.rpc()
-- (PostgREST only exposes functions in the public schema; pgmq functions are in the pgmq schema)
-- All wrappers auto-create the queue on undefined_table (42P01) so emails
-- are never lost if the queue was dropped (extension upgrade, restore, etc.).
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name TEXT, payload JSONB)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;
CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name TEXT, batch_size INT, vt INT)
RETURNS TABLE(msg_id BIGINT, read_ct INT, message JSONB)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;
CREATE OR REPLACE FUNCTION public.delete_email(queue_name TEXT, message_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;
CREATE OR REPLACE FUNCTION public.move_to_dlq(
  source_queue TEXT, dlq_name TEXT, message_id BIGINT, payload JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$$;
-- Restrict queue RPC wrappers to service_role only (SECURITY DEFINER runs as owner,
-- so without this any authenticated user could manipulate the email queues)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) TO service_role;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) TO service_role;
-- Suppressed emails table (tracks unsubscribes, bounces, complaints)
-- Append-only: no DELETE or UPDATE policies to prevent bypassing suppression.
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);
ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Service role can read suppressed emails"
    ON public.suppressed_emails FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Service role can insert suppressed emails"
    ON public.suppressed_emails FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails(email);
-- Email unsubscribe tokens table (one token per email address for unsubscribe links)
-- No DELETE policy to prevent removing tokens. UPDATE allowed only to mark tokens as used.
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);
ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Service role can read tokens"
    ON public.email_unsubscribe_tokens FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Service role can insert tokens"
    ON public.email_unsubscribe_tokens FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Service role can mark tokens as used"
    ON public.email_unsubscribe_tokens FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);
-- ============================================================
-- POST-MIGRATION STEPS (applied dynamically by setup_email_infra)
-- These steps contain project-specific secrets and URLs and
-- cannot be expressed as static SQL. They are applied via the
-- Supabase Management API (ExecuteSQL) each time the tool runs.
-- ============================================================
--
-- 1. VAULT SECRET
--    Stores (or updates) the Supabase service_role key in
--    vault as 'email_queue_service_role_key'.
--    Uses vault.create_secret / vault.update_secret (upsert).
--    To revert: DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
--
-- 2. CRON JOB (pg_cron)
--    Creates job 'process-email-queue' with a 5-second interval.
--    The job checks:
--      a) rate-limit cooldown (email_send_state.retry_after_until)
--      b) whether auth_emails or transactional_emails queues have messages
--    If conditions are met, it calls the process-email-queue Edge Function
--    via net.http_post using the vault-stored service_role key.
--    To revert: SELECT cron.unschedule('process-email-queue');
DELETE FROM public.activity_log;
DROP FUNCTION IF EXISTS public.cleanup_old_activity_logs();
-- Fix: allow anyone to view chapter metadata (content is gated in UI)
DROP POLICY IF EXISTS "Users can view chapters of subscribed courses" ON public.course_chapters;
-- Allow all authenticated users to view chapters (content gating is done in app)
CREATE POLICY "Anyone can view chapters"
  ON public.course_chapters
  FOR SELECT
  USING (true);
$function$;
