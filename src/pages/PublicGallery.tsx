import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import ChatWidget from '@/components/chat/ChatWidget';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import heroBgDefault from '@/assets/gallery-hero-bg.jpg';
import { useHeroBanner } from "@/hooks/useHeroBanners";

interface CodeSnippet {
  id: string;
  title: string;
  html_code: string;
  css_code: string;
  js_code: string;
  language: string;
  views: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  hide_code: boolean;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const LANGUAGE_INFO: Record<string, { name: string; icon: string; color: string }> = {
  'web': { name: 'Web', icon: 'language', color: '#FF6B35' },
  'python': { name: 'Python', icon: 'code', color: '#3B82F6' },
  'javascript': { name: 'JavaScript', icon: 'javascript', color: '#EAB308' },
  'typescript': { name: 'TypeScript', icon: 'code', color: '#6366F1' },
  'java': { name: 'Java', icon: 'coffee', color: '#EF4444' },
  'csharp': { name: 'C#', icon: 'code', color: '#8B5CF6' },
  'cpp': { name: 'C++', icon: 'memory', color: '#2563EB' },
  'go': { name: 'Go', icon: 'code', color: '#14B8A6' },
  'rust': { name: 'Rust', icon: 'settings', color: '#F59E0B' },
  'ruby': { name: 'Ruby', icon: 'diamond', color: '#F43F5E' },
  'php': { name: 'PHP', icon: 'code', color: '#A855F7' },
  'swift': { name: 'Swift', icon: 'phone_iphone', color: '#F97316' },
  'kotlin': { name: 'Kotlin', icon: 'android', color: '#7C3AED' },
  'sql': { name: 'SQL', icon: 'storage', color: '#64748B' },
};

const PublicGallery = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<CodeSnippet[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const { data: bannerData } = useHeroBanner("gallery");
  const heroBg = bannerData?.image_url || heroBgDefault;

  useEffect(() => {
    fetchPublicProjects();
  }, []);

  const fetchPublicProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const snippets = (data as CodeSnippet[]) || [];
      setProjects(snippets);

      const userIds = [...new Set(snippets.map(s => s.user_id).filter(Boolean))] as string[];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        if (profilesData) {
          const profilesMap: Record<string, Profile> = {};
          profilesData.forEach((p: Profile) => { profilesMap[p.user_id] = p; });
          setProfiles(profilesMap);
        }
      }
    } catch (error) {
      console.error('Error fetching public projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewContent = (project: CodeSnippet) => {
    if (project.language !== 'web') return '';
    return `<!DOCTYPE html><html><head><style>${project.css_code}</style></head><body>${project.html_code.replace(/<\/?html>|<\/?head>|<\/?body>|<!DOCTYPE html>/gi, '')}<script>${project.js_code}<\/script></body></html>`;
  };

  const getCodePreview = (project: CodeSnippet) => {
    if (project.language === 'web') return project.html_code?.substring(0, 120) || '';
    return project.js_code?.substring(0, 120) || '';
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ka-GE', { month: 'short', day: 'numeric' });

  const handleDeleteSnippet = async (id: string) => {
    if (!confirm('ნამდვილად გსურთ ამ კოდის წაშლა?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('code_snippets').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
      toast.success('კოდი წარმატებით წაიშალა');
    } catch (error) {
      toast.error('კოდის წაშლა ვერ მოხერხდა');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = useMemo(() => {
    let result = projects
      .filter(p => filter === 'all' || p.language === filter)
      .filter(p => searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === 'popular') result = [...result].sort((a, b) => b.views - a.views);
    return result;
  }, [projects, filter, searchQuery, sortBy]);

  const languageCounts = useMemo(() => {
    return projects.reduce((acc, p) => {
      acc[p.language] = (acc[p.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [projects]);

  const totalViews = useMemo(() => projects.reduce((s, p) => s + p.views, 0), [projects]);

  return (
    <>
      <Atmosphere />
      <Header />
      {user && <ChatWidget />}

      <main className="page-content">
        <div className="container">

          {/* Hero — same as leaderboard */}
          <section className="lb2-hero" style={{ backgroundImage: `url(${heroBg})` }}>
            <div className="lb2-hero-overlay" />
            <div className="lb2-hero-content">
              <span className="section-badge">
                <span className="material-symbols-rounded">public</span>
                Gallery
              </span>
              <h1 className="lb2-hero-title">დეველოპერთა პროექტები</h1>
              <p className="lb2-hero-subtitle">იხილეთ სხვა დეველოპერების ნამუშევრები ან დაამატეთ თქვენი შედევრები</p>
              <div className="lb2-hero-stats">
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{projects.length}</span>
                  <span className="lb2-hero-stat-label">პროექტი</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{totalViews.toLocaleString()}</span>
                  <span className="lb2-hero-stat-label">ნახვა</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{Object.keys(profiles).length}</span>
                  <span className="lb2-hero-stat-label">ავტორი</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs — sort */}
          <div className="lb2-tabs">
            <button className={`lb2-tab ${sortBy === 'newest' ? 'lb2-tab-active' : ''}`} onClick={() => setSortBy('newest')}>
              <span className="material-symbols-rounded">schedule</span>
              ახალი
            </button>
            <button className={`lb2-tab ${sortBy === 'popular' ? 'lb2-tab-active' : ''}`} onClick={() => setSortBy('popular')}>
              <span className="material-symbols-rounded">trending_up</span>
              პოპულარული
            </button>
          </div>

          {/* Search */}
          <div className="lb2-search" style={{ marginBottom: 20 }}>
            <span className="material-symbols-rounded">search</span>
            <input
              type="text"
              placeholder="პროექტის ძებნა..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="lb2-search-clear">
                <span className="material-symbols-rounded">close</span>
              </button>
            )}
          </div>

          {/* Language Filters */}
          <div className="gal-filters">
            <button
              className={cn("gal-filter-btn", filter === 'all' && "gal-filter-active")}
              onClick={() => setFilter('all')}
            >
              ყველა ({projects.length})
            </button>
            {Object.entries(LANGUAGE_INFO).map(([key, info]) => {
              const count = languageCounts[key] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  className={cn("gal-filter-btn", filter === key && "gal-filter-active")}
                  onClick={() => setFilter(key)}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 16, color: filter === key ? 'white' : info.color }}>{info.icon}</span>
                  {info.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="lb2-loading">
              <div className="lb2-spinner" />
              <p>იტვირთება...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="lb2-empty">
              <span className="material-symbols-rounded" style={{ fontSize: 56 }}>search_off</span>
              <p>პროექტები არ მოიძებნა</p>
              <p className="lb2-empty-sub">სცადე სხვა ფილტრი ან საძიებო სიტყვა</p>
            </div>
          ) : (
            <div className="gal-grid">
              {filteredProjects.map((project, idx) => {
                const langInfo = LANGUAGE_INFO[project.language] || LANGUAGE_INFO['web'];
                const authorProfile = project.user_id ? profiles[project.user_id] : null;

                return (
                  <div
                    key={project.id}
                    className="gal-card"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    {/* Preview */}
                    <div className="gal-card-preview">
                      {project.language === 'web' ? (
                        <>
                          <iframe
                            srcDoc={getPreviewContent(project)}
                            className="gal-card-iframe"
                            title={project.title}
                            sandbox="allow-scripts"
                          />
                          <div className="gal-card-fade" />
                        </>
                      ) : (
                        <div className="gal-card-code-preview">
                          <div className="gal-card-dots">
                            <span style={{ background: '#EF4444' }} />
                            <span style={{ background: '#EAB308' }} />
                            <span style={{ background: '#22C55E' }} />
                          </div>
                          <pre className="gal-card-code">{getCodePreview(project)}</pre>
                          <div className="gal-card-fade" />
                        </div>
                      )}
                      {/* Language badge */}
                      <div className="gal-lang-badge" style={{ background: langInfo.color }}>
                        {langInfo.name}
                      </div>
                      {project.hide_code && (
                        <div className="gal-lock-badge">
                          <span className="material-symbols-rounded" style={{ fontSize: 12 }}>lock</span>
                          დაფარული
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="gal-card-body">
                      <h3 className="gal-card-title">{project.title}</h3>

                      <div className="gal-card-author">
                        <Avatar className="gal-card-avatar">
                          <AvatarImage src={authorProfile?.avatar_url || ''} />
                          <AvatarFallback>{(authorProfile?.full_name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                        <span className="gal-card-author-name">{authorProfile?.full_name || 'ანონიმური'}</span>
                      </div>

                      <div className="gal-card-meta">
                        <span><span className="material-symbols-rounded">visibility</span>{project.views}</span>
                        <span><span className="material-symbols-rounded">schedule</span>{formatDate(project.created_at)}</span>
                      </div>

                      <div className="gal-card-actions">
                        <Link to={`/code/${project.id}`} className="gal-btn-primary">
                          <span className="material-symbols-rounded">open_in_new</span>
                          ნახვა
                        </Link>
                        {user && !project.hide_code && (
                          <Link to={`/playground?fork=${project.id}`} className="gal-btn-ghost">
                            <span className="material-symbols-rounded">fork_right</span>
                            Fork
                          </Link>
                        )}
                        {(isAdmin || (user && user.id === project.user_id)) && (
                          <button
                            onClick={() => handleDeleteSnippet(project.id)}
                            disabled={deletingId === project.id}
                            className="gal-btn-delete"
                          >
                            <span className="material-symbols-rounded">
                              {deletingId === project.id ? 'hourglass_empty' : 'delete'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default PublicGallery;
