import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import { legacyColumns, type ProjectFile, type SnippetRow } from '@/components/playground/project';

export interface ProjectPayload {
  title: string;
  language: string;
  files: ProjectFile[];
  isPublic?: boolean;
  hideCode?: boolean;
}

// Becomes false if the `files` column hasn't been migrated yet; we then
// fall back to the legacy html/css/js columns only.
let filesColumnAvailable = true;

const isMissingFilesColumn = (error: { message?: string; code?: string } | null) =>
  !!error && (error.code === 'PGRST204' || /files/.test(error.message ?? '')) && /column/i.test(error.message ?? '');

const buildRow = (p: ProjectPayload) => {
  const row: Record<string, unknown> = {
    title: p.title,
    language: p.language,
    ...legacyColumns(p.language, p.files),
  };
  if (p.isPublic !== undefined) row.is_public = p.isPublic;
  if (p.hideCode !== undefined) row.hide_code = p.hideCode;
  if (filesColumnAvailable) row.files = p.files;
  return row;
};

export const useCodeSnippets = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const write = async <T,>(run: (row: Record<string, unknown>) => Promise<{ data: T; error: { code?: string; message: string } | null }>, p: ProjectPayload) => {
    let res = await run(buildRow(p));
    if (res.error && filesColumnAvailable && isMissingFilesColumn(res.error)) {
      filesColumnAvailable = false;
      res = await run(buildRow(p));
    }
    return res;
  };

  const saveProject = async (p: ProjectPayload): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) throw new Error('not-authenticated');

      const { data, error } = await write(
        async (row) =>
          await supabase
            .from('code_snippets')
            .insert({ ...row, user_id: userId } as never)
            .select('id')
            .single(),
        p
      );
      if (error) throw error;
      playSound('success');
      return (data as { id: string }).id;
    } catch {
      toast({ title: 'შეცდომა', description: 'კოდის შენახვა ვერ მოხერხდა.', variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id: string, p: ProjectPayload, opts: { silent?: boolean } = {}): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await write(
        async (row) => await supabase.from('code_snippets').update(row as never).eq('id', id).select('id'),
        p
      );
      if (error) throw error;
      if (!data || (Array.isArray(data) && data.length === 0)) throw new Error('not-owner');
      return true;
    } catch {
      if (!opts.silent) {
        toast({ title: 'შეცდომა', description: 'კოდის განახლება ვერ მოხერხდა.', variant: 'destructive' });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getSnippet = async (id: string, opts: { countView?: boolean } = { countView: true }): Promise<SnippetRow | null> => {
    try {
      const { data, error } = await supabase.from('code_snippets').select('*').eq('id', id).maybeSingle();
      if (error) throw error;

      if (data && opts.countView) {
        await supabase
          .from('code_snippets')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);
      }
      return data as unknown as SnippetRow | null;
    } catch {
      return null;
    }
  };

  return { isLoading, saveProject, updateProject, getSnippet };
};
