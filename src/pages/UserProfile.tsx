import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, MapPin, Globe, Github, Calendar, Briefcase, 
  Code, MessageCircle, ChevronLeft, ExternalLink
} from "lucide-react";

interface PublicProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience: string | null;
  github_url: string | null;
  website_url: string | null;
  location: string | null;
  skills: string[] | null;
  created_at: string;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hubProjects, setHubProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      const [profileRes, projectsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('hub_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(6),
      ]);
      if (profileRes.data) setProfile(profileRes.data as PublicProfile);
      if (projectsRes.data) setHubProjects(projectsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long' })
    : '';

  if (loading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-border-subtle animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Atmosphere />
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <User className="w-16 h-16 text-text-muted" />
          <p className="text-text-secondary text-lg">პროფილი ვერ მოიძებნა</p>
          <Link to="/" className="text-gold hover:underline">მთავარ გვერდზე დაბრუნება</Link>
        </div>
      </>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <>
      <Atmosphere />
      <Header />
      <ChatWidget />

      <main className="pt-32 pb-20 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Back */}
          <Link to="/hub" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            უკან
          </Link>

          {/* Profile Header */}
          <div className="relative overflow-hidden rounded-3xl bg-bg-card border border-border-subtle p-8 md:p-12 mb-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-gold/30 bg-bg-elevated shadow-2xl shadow-gold/20">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-text-muted" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-text-white mb-2">
                  {profile.full_name || 'მომხმარებელი'}
                </h1>

                {profile.bio && (
                  <p className="text-text-secondary mb-4 max-w-xl">{profile.bio}</p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {profile.location && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated/80 border border-border-subtle rounded-xl text-sm text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated/80 border border-border-subtle rounded-xl text-sm text-text-secondary">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    {memberSince}
                  </div>
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated/80 border border-border-subtle rounded-xl text-sm text-text-secondary hover:text-gold hover:border-gold/30 transition-colors">
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {profile.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated/80 border border-border-subtle rounded-xl text-sm text-text-secondary hover:text-gold hover:border-gold/30 transition-colors">
                      <Globe className="w-3.5 h-3.5" />
                      ვებსაიტი
                    </a>
                  )}
                </div>

                {isOwnProfile && (
                  <Link to="/profile" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gold/10 border border-gold/20 text-gold text-sm rounded-xl hover:bg-gold/20 transition-colors">
                    რედაქტირება
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 mb-6">
              <h2 className="flex items-center gap-2 font-semibold text-text-white mb-4">
                <Code className="w-5 h-5 text-gold" />
                უნარები
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gold/10 border border-gold/20 text-gold text-sm rounded-xl">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {profile.experience && (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 mb-6">
              <h2 className="flex items-center gap-2 font-semibold text-text-white mb-4">
                <Briefcase className="w-5 h-5 text-gold" />
                გამოცდილება
              </h2>
              <p className="text-text-secondary whitespace-pre-wrap">{profile.experience}</p>
            </div>
          )}

          {/* Hub Projects */}
          {hubProjects.length > 0 && (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-semibold text-text-white mb-4">
                <ExternalLink className="w-5 h-5 text-gold" />
                პროექტები ({hubProjects.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {hubProjects.map((project) => (
                  <div key={project.id} className="p-4 bg-bg-elevated border border-border-subtle rounded-xl hover:border-gold/20 transition-colors">
                    <h3 className="font-medium text-text-white mb-1">{project.title}</h3>
                    {project.description && (
                      <p className="text-text-muted text-sm line-clamp-2 mb-3">{project.description}</p>
                    )}
                    <div className="flex gap-2">
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Live
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-text-secondary hover:text-gold flex items-center gap-1">
                          <Github className="w-3 h-3" /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message button */}
          {user && !isOwnProfile && (
            <div className="mt-6 text-center">
              <Link
                to={`/chat?user=${profile.user_id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/30 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                მიწერა
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default UserProfile;
