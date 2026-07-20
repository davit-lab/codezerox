import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  experience: string | null;
  github_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  cv_url: string | null;
  location: string | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isChild: boolean;
  isMentor: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; needsEmailVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChild, setIsChild] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string, authEmail?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, avatar_url, cover_url, bio, experience, github_url, website_url, location, skills, created_at, updated_at')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setProfile({
        ...data,
        email: authEmail || '',
        linkedin_url: null,
        facebook_url: null,
        cv_url: null,
      });
    }
  };

  const checkRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (!error && data) {
      setIsAdmin(data.some(r => r.role === 'admin'));
      setIsChild(data.some(r => r.role === 'child'));
      setIsMentor(data.some(r => (r.role as string) === 'mentor'));
    } else {
      setIsAdmin(false);
      setIsChild(false);
      setIsMentor(false);
    }
  };

  useEffect(() => {
    let initialSessionResolved = false;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip the initial INITIAL_SESSION event — we handle it via getSession
        if (!initialSessionResolved) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (session.user.app_metadata?.provider === 'google') {
            createProfileFromOAuth(session.user);
          }
          setTimeout(() => {
            fetchProfile(session.user.id, session.user.email);
            checkRoles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsChild(false);
          setIsMentor(false);
        }
      }
    );

    // THEN check for existing session — this is the source of truth on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      initialSessionResolved = true;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        if (session.user.app_metadata?.provider === 'google') {
          createProfileFromOAuth(session.user);
        }
        fetchProfile(session.user.id, session.user.email);
        checkRoles(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (!error) {
      try {
        await supabase.functions.invoke('sync-missing-profiles');
      } catch {
        // Ignore sync failures here; DB trigger is the primary path
      }
    }
    
    return {
      error,
      needsEmailVerification: !data.session,
    };
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const redirectUrl = 'https://codezero.ge/auth';

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: provider === 'google' ? {
          prompt: 'consent',
          access_type: 'offline',
        } : undefined,
      },
    });

    return { error };
  };

  const createProfileFromOAuth = async (authUser: User) => {
    const metadata = authUser.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || '';
    const avatarUrl = metadata.avatar_url || metadata.picture || '';

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    if (!existing) {
      await supabase.from('profiles').insert({
        user_id: authUser.id,
        email: authUser.email || '',
        full_name: fullName,
        avatar_url: avatarUrl,
        cover_url: null,
        bio: null,
        experience: null,
        github_url: null,
        website_url: null,
        linkedin_url: null,
        facebook_url: null,
        cv_url: null,
        location: null,
        skills: [],
      });
    } else {
      const updates: Partial<Profile> = {};
      if (fullName) updates.full_name = fullName;
      if (avatarUrl) updates.avatar_url = avatarUrl;
      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('user_id', authUser.id);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      try {
        await supabase.functions.invoke('sync-missing-profiles');
      } catch {
        // Ignore sync failures here; DB trigger is the primary path
      }
      setSession(data.session);
      setUser(data.user);

      setTimeout(() => {
        fetchProfile(data.user.id, data.user.email);
        checkRoles(data.user.id);
      }, 0);
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore errors - clear local state regardless
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsChild(false);
    setIsMentor(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error, data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select();
    
    if (error) {
      return { error };
    } else if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isChild,
        isMentor,
        isLoading,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
