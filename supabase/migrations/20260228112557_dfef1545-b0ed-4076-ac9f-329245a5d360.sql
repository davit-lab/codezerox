
-- Create vacancies table
CREATE TABLE public.vacancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'full_time', -- full_time, part_time, remote, hybrid
  salary_amount NUMERIC,
  salary_type TEXT DEFAULT 'monthly', -- monthly, total
  salary_currency TEXT DEFAULT '₾',
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'other',
  experience_level TEXT DEFAULT 'junior', -- junior, mid, senior, lead
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vacancy messages table
CREATE TABLE public.vacancy_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  cv_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancy_messages ENABLE ROW LEVEL SECURITY;

-- Vacancies policies: anyone authenticated can create, anyone can view active
CREATE POLICY "Anyone can view active vacancies" ON public.vacancies FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create vacancies" ON public.vacancies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vacancies" ON public.vacancies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vacancies" ON public.vacancies FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own inactive vacancies" ON public.vacancies FOR SELECT USING (auth.uid() = user_id);

-- Vacancy messages policies
CREATE POLICY "Vacancy owners can view messages" ON public.vacancy_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.vacancies WHERE vacancies.id = vacancy_messages.vacancy_id AND vacancies.user_id = auth.uid()));
CREATE POLICY "Authenticated users can send messages" ON public.vacancy_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Vacancy owners can update messages (mark read)" ON public.vacancy_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.vacancies WHERE vacancies.id = vacancy_messages.vacancy_id AND vacancies.user_id = auth.uid()));

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) VALUES ('vacancy-cvs', 'vacancy-cvs', false);
CREATE POLICY "Authenticated users can upload CVs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vacancy-cvs' AND auth.uid() IS NOT NULL);
CREATE POLICY "Vacancy owners can view CVs" ON storage.objects FOR SELECT USING (bucket_id = 'vacancy-cvs');

-- Trigger for updated_at
CREATE TRIGGER update_vacancies_updated_at BEFORE UPDATE ON public.vacancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
