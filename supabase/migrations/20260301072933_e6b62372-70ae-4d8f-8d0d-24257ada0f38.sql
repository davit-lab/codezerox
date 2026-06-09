
-- Fix vacancy_messages RLS: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.vacancy_messages;
DROP POLICY IF EXISTS "Vacancy owners can update messages (mark read)" ON public.vacancy_messages;
DROP POLICY IF EXISTS "Vacancy owners can view messages" ON public.vacancy_messages;

CREATE POLICY "Authenticated users can send messages"
ON public.vacancy_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Vacancy owners can view messages"
ON public.vacancy_messages FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM vacancies
  WHERE vacancies.id = vacancy_messages.vacancy_id
  AND vacancies.user_id = auth.uid()
));

CREATE POLICY "Senders can view their own messages"
ON public.vacancy_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id);

CREATE POLICY "Vacancy owners can update messages (mark read)"
ON public.vacancy_messages FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM vacancies
  WHERE vacancies.id = vacancy_messages.vacancy_id
  AND vacancies.user_id = auth.uid()
));

-- Fix vacancies RLS: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view active vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Authenticated users can create vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Users can delete their own vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Users can update their own vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Users can view their own inactive vacancies" ON public.vacancies;

CREATE POLICY "Anyone can view active vacancies"
ON public.vacancies FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can view their own inactive vacancies"
ON public.vacancies FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create vacancies"
ON public.vacancies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacancies"
ON public.vacancies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacancies"
ON public.vacancies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
