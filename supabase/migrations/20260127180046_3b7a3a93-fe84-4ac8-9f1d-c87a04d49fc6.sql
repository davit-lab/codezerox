-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    total_chapters INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT DEFAULT 'beginner',
    duration_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create course_chapters table
CREATE TABLE public.course_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    content_type TEXT DEFAULT 'lesson',
    quiz_data JSONB,
    terminal_commands JSONB,
    code_template TEXT,
    expected_output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(course_id, chapter_number)
);

-- Create user_course_progress table
CREATE TABLE public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES public.course_chapters(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false,
    score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, chapter_id)
);

-- Create course_purchases table
CREATE TABLE public.course_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON public.courses
FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Chapters policies
CREATE POLICY "Users can view chapters of purchased courses" ON public.course_chapters
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.course_purchases
        WHERE course_purchases.course_id = course_chapters.course_id
        AND course_purchases.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage chapters" ON public.course_chapters
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Progress policies
CREATE POLICY "Users can view their own progress" ON public.user_course_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_course_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress" ON public.user_course_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Purchase policies
CREATE POLICY "Users can view their own purchases" ON public.course_purchases
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.course_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.course_purchases
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage purchases" ON public.course_purchases
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_chapters_updated_at
BEFORE UPDATE ON public.course_chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
BEFORE UPDATE ON public.user_course_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the Cybersecurity course
INSERT INTO public.courses (title, description, cover_url, price, total_chapters, difficulty, duration_hours, is_published)
VALUES (
    'Cybersecurity & Ethical Hacking',
    'სრული კურსი კიბერუსაფრთხოების შესახებ. ისწავლე ეთიკური ჰაკინგი, პენეტრაციული ტესტირება, ქსელის უსაფრთხოება და მრავალი სხვა. პრაქტიკული დავალებები Hack The Box სტილში.',
    NULL,
    90,
    150,
    'intermediate',
    80,
    true
);