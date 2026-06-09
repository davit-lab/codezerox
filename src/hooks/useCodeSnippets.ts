import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';

interface CodeSnippet {
  id: string;
  title: string;
  html_code: string;
  css_code: string;
  js_code: string;
  language: string;
  user_id: string | null;
  is_public: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export const useCodeSnippets = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveSnippet = async (
    title: string,
    htmlCode: string,
    cssCode: string,
    jsCode: string,
    language: string = 'web',
    hideCode: boolean = false,
    isPublic: boolean = false
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id || null;

      const { data, error } = await supabase
        .from('code_snippets')
        .insert({
          title,
          html_code: htmlCode,
          css_code: cssCode,
          js_code: jsCode,
          user_id: userId,
          is_public: isPublic,
          language,
          hide_code: hideCode,
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: 'შენახულია!',
        description: 'კოდი წარმატებით შეინახა და ლინკი დაგენერირდა.',
      });
      playSound('success');

      return data.id;
    } catch (error: any) {
      toast({
        title: 'შეცდომა',
        description: 'კოდის შენახვა ვერ მოხერხდა.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSnippet = async (id: string): Promise<CodeSnippet | null> => {
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      // Increment view count
      if (data) {
        await supabase
          .from('code_snippets')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);
      }

      return data as CodeSnippet | null;
    } catch (error: any) {
      return null;
    }
  };

  const updateSnippet = async (
    id: string,
    title: string,
    htmlCode: string,
    cssCode: string,
    jsCode: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('code_snippets')
        .update({
          title,
          html_code: htmlCode,
          css_code: cssCode,
          js_code: jsCode,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'განახლებულია!',
        description: 'კოდი წარმატებით განახლდა.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'შეცდომა',
        description: 'კოდის განახლება ვერ მოხერხდა.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveSnippet,
    getSnippet,
    updateSnippet,
  };
};
