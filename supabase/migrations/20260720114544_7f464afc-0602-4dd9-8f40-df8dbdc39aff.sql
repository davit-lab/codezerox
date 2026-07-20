
-- 1) profiles: drop overly permissive read policy
DROP POLICY IF EXISTS profiles_authenticated_view_public_fields ON public.profiles;

-- 2) marketplace_projects: hide zip_path column, expose via RPC
REVOKE SELECT (zip_path) ON public.marketplace_projects FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.marketplace_project_has_zip(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_projects
    WHERE id = _project_id AND zip_path IS NOT NULL AND zip_path <> ''
  );
$$;

CREATE OR REPLACE FUNCTION public.get_marketplace_zip_path(_project_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_zip text;
  v_owner uuid;
BEGIN
  SELECT zip_path, user_id INTO v_zip, v_owner
  FROM public.marketplace_projects WHERE id = _project_id;

  IF v_zip IS NULL THEN RETURN NULL; END IF;

  IF auth.uid() = v_owner
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR EXISTS (
        SELECT 1 FROM public.marketplace_sales
        WHERE project_id = _project_id
          AND buyer_id = auth.uid()
          AND status = 'confirmed'
     )
  THEN
    RETURN v_zip;
  END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.marketplace_project_has_zip(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_marketplace_zip_path(uuid) TO authenticated;

-- 3) cyberrange-files: gate read by access
DROP POLICY IF EXISTS "cyberrange-files authed read" ON storage.objects;

CREATE POLICY "cyberrange-files access read" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'cyberrange-files'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.cyberrange_challenges c
      WHERE c.artifact_path = storage.objects.name
        AND public.cyberrange_has_access(auth.uid(), c.id)
    )
  )
);

-- 4) voice-messages: private, sender or conversation recipient only
DROP POLICY IF EXISTS voice_messages_download ON storage.objects;

CREATE POLICY voice_messages_participants_read ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'voice-messages'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1
      FROM public.direct_messages dm
      JOIN public.direct_conversations dc ON dc.id = dm.conversation_id
      WHERE dm.is_voice_message = true
        AND dm.voice_url LIKE '%' || storage.objects.name
        AND (dc.participant_one = auth.uid() OR dc.participant_two = auth.uid())
    )
  )
);
