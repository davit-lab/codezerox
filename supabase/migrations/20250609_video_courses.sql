-- =============================================
-- VIDEO COURSES SYSTEM
-- =============================================

-- Main courses table
CREATE TABLE IF NOT EXISTS public.video_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  cover_url TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'beginner',
  price_gel NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sections within a course
CREATE TABLE IF NOT EXISTS public.video_course_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.video_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual lectures within a section
CREATE TABLE IF NOT EXISTS public.video_lectures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES public.video_course_sections(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.video_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_storage_path TEXT,
  duration_seconds INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assignments per lecture (uploaded by admin)
CREATE TABLE IF NOT EXISTS public.video_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lecture_id UUID REFERENCES public.video_lectures(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.video_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User video progress (tracks position in seconds + completion)
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lecture_id UUID REFERENCES public.video_lectures(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.video_courses(id) ON DELETE CASCADE NOT NULL,
  position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lecture_id)
);

-- Course enrollments (who purchased / has access)
CREATE TABLE IF NOT EXISTS public.video_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.video_courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- RLS
ALTER TABLE public.video_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_enrollments ENABLE ROW LEVEL SECURITY;

-- video_courses: everyone can read active, admin has full access
DROP POLICY IF EXISTS "public_read_active_video_courses" ON public.video_courses;
CREATE POLICY "public_read_active_video_courses" ON public.video_courses
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_all_video_courses" ON public.video_courses;
CREATE POLICY "admin_all_video_courses" ON public.video_courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- video_course_sections: public read
DROP POLICY IF EXISTS "public_read_video_sections" ON public.video_course_sections;
CREATE POLICY "public_read_video_sections" ON public.video_course_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_video_sections" ON public.video_course_sections;
CREATE POLICY "admin_all_video_sections" ON public.video_course_sections
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- video_lectures: everyone can read metadata (titles, duration etc.) for syllabus display.
-- Playback access is controlled on frontend + Supabase Storage.
DROP POLICY IF EXISTS "read_video_lectures" ON public.video_lectures;
CREATE POLICY "read_video_lectures" ON public.video_lectures
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_video_lectures" ON public.video_lectures;
CREATE POLICY "admin_all_video_lectures" ON public.video_lectures
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- video_assignments: enrolled or admin
DROP POLICY IF EXISTS "read_video_assignments" ON public.video_assignments;
CREATE POLICY "read_video_assignments" ON public.video_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.video_enrollments WHERE user_id = auth.uid() AND course_id = video_assignments.course_id)
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admin_all_video_assignments" ON public.video_assignments;
CREATE POLICY "admin_all_video_assignments" ON public.video_assignments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- video_progress: users manage own progress
DROP POLICY IF EXISTS "users_manage_own_video_progress" ON public.video_progress;
CREATE POLICY "users_manage_own_video_progress" ON public.video_progress
  FOR ALL USING (user_id = auth.uid());

-- video_enrollments
DROP POLICY IF EXISTS "users_view_own_enrollments" ON public.video_enrollments;
CREATE POLICY "users_view_own_enrollments" ON public.video_enrollments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_enrollments" ON public.video_enrollments;
CREATE POLICY "admin_all_enrollments" ON public.video_enrollments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- STORAGE BUCKET: videos
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  524288000,  -- 500 MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Admins can upload/delete videos
DROP POLICY IF EXISTS "admin_upload_videos" ON storage.objects;
CREATE POLICY "admin_upload_videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos'
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admin_update_videos" ON storage.objects;
CREATE POLICY "admin_update_videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'videos'
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_videos" ON storage.objects;
CREATE POLICY "admin_delete_videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'videos'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Enrolled users (and admins) can read/stream videos
DROP POLICY IF EXISTS "enrolled_read_videos" ON storage.objects;
CREATE POLICY "enrolled_read_videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.video_enrollments ve
        WHERE ve.user_id = auth.uid()
          AND (ve.expires_at IS NULL OR ve.expires_at > now())
      )
    )
  );
