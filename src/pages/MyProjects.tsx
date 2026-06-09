import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import ChatWidget from '@/components/chat/ChatWidget';
import { useToast } from '@/hooks/use-toast';

interface CodeSnippet {
  id: string;
  title: string;
  html_code: string;
  css_code: string;
  js_code: string;
  language: string;
  views: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const LANGUAGE_INFO: Record<string, { name: string; icon: string; color: string }> = {
  'web': { name: 'Web', icon: 'language', color: '#e44d26' },
  'python': { name: 'Python', icon: 'code', color: '#3776ab' },
  'javascript': { name: 'JavaScript', icon: 'javascript', color: '#f7df1e' },
  'typescript': { name: 'TypeScript', icon: 'code', color: '#3178c6' },
  'java': { name: 'Java', icon: 'coffee', color: '#007396' },
  'csharp': { name: 'C#', icon: 'code', color: '#68217a' },
  'cpp': { name: 'C++', icon: 'memory', color: '#00599c' },
  'go': { name: 'Go', icon: 'code', color: '#00add8' },
  'rust': { name: 'Rust', icon: 'settings', color: '#dea584' },
  'ruby': { name: 'Ruby', icon: 'diamond', color: '#cc342d' },
  'php': { name: 'PHP', icon: 'code', color: '#777bb4' },
  'swift': { name: 'Swift', icon: 'phone_iphone', color: '#fa7343' },
  'kotlin': { name: 'Kotlin', icon: 'android', color: '#7f52ff' },
  'sql': { name: 'SQL', icon: 'storage', color: '#336791' },
};

const MyProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<CodeSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects((data as CodeSnippet[]) || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('code_snippets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'წაიშალა!',
        description: 'პროექტი წარმატებით წაიშალა.',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'შეცდომა',
        description: 'პროექტის წაშლა ვერ მოხერხდა.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVisibility = async (id: string, currentPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('code_snippets')
        .update({ is_public: !currentPublic } as any)
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.map(p => p.id === id ? { ...p, is_public: !currentPublic } : p));
      toast({
        title: !currentPublic ? 'საჯარო გახდა!' : 'პირადი გახდა!',
        description: !currentPublic ? 'პროექტი ახლა საჯარო გალერეაში ჩანს.' : 'პროექტი ახლა მხოლოდ შენ ხედავ.',
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'შეცდომა',
        description: 'ხილვადობის შეცვლა ვერ მოხერხდა.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/code/${id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'დაკოპირდა!',
      description: 'ლინკი დაკოპირდა clipboard-ში.',
    });
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.language === filter);

  const getCodePreview = (project: CodeSnippet) => {
    if (project.language === 'web') {
      return project.html_code?.substring(0, 100) || '';
    }
    return project.js_code?.substring(0, 100) || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="projects-page">
          <div className="container">
            <div className="projects-empty">
              <span className="material-symbols-rounded" style={{ fontSize: '4rem', color: 'var(--gold)' }}>
                lock
              </span>
              <h2>ავტორიზაცია საჭიროა</h2>
              <p>პროექტების სანახავად გაიარეთ ავტორიზაცია</p>
              <Link to="/auth" className="btn btn-primary">
                <span className="material-symbols-rounded">login</span>
                შესვლა
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Atmosphere />
      <Header />
      <ChatWidget />

      <main className="projects-page">
        <div className="container">
          {/* Header */}
          <div className="projects-header">
            <div>
              <h1 className="section-title">ჩემი პროექტები</h1>
              <p style={{ color: 'var(--text-muted)' }}>
                შენი შენახული კოდის პროექტები ({projects.length})
              </p>
            </div>
            <Link to="/playground" className="btn btn-primary">
              <span className="material-symbols-rounded">add</span>
              ახალი პროექტი
            </Link>
          </div>

          {/* Filters */}
          <div className="projects-filters">
            <button
              className={`projects-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ყველა
            </button>
            {Object.entries(LANGUAGE_INFO).map(([key, info]) => {
              const count = projects.filter(p => p.language === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  className={`projects-filter-btn ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                  style={{ '--lang-color': info.color } as React.CSSProperties}
                >
                  {info.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="projects-loading">
              <div className="projects-spinner" />
              <p>იტვირთება...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="projects-empty">
              <span className="material-symbols-rounded" style={{ fontSize: '4rem', color: 'var(--gold)' }}>
                folder_off
              </span>
              <h2>პროექტები არ მოიძებნა</h2>
              <p>შექმენი პირველი პროექტი Playground-ში</p>
              <Link to="/playground" className="btn btn-primary">
                <span className="material-symbols-rounded">code</span>
                Playground-ზე გადასვლა
              </Link>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => {
                const langInfo = LANGUAGE_INFO[project.language] || LANGUAGE_INFO['web'];
                return (
                  <div key={project.id} className="project-card">
                    <div 
                      className="project-card-preview"
                      style={{ '--lang-color': langInfo.color } as React.CSSProperties}
                    >
                      <div className="project-card-code">
                        <pre>{getCodePreview(project)}...</pre>
                      </div>
                      <div className="project-card-lang">
                        <span className="material-symbols-rounded">{langInfo.icon}</span>
                        {langInfo.name}
                      </div>
                    </div>
                    
                    <div className="project-card-content">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="project-card-title" style={{ marginBottom: 0 }}>{project.title}</h3>
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ 
                            background: project.is_public ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                            color: project.is_public ? '#22c55e' : '#94a3b8'
                          }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 12 }}>
                            {project.is_public ? 'public' : 'lock'}
                          </span>
                          {project.is_public ? 'საჯარო' : 'პირადი'}
                        </span>
                      </div>
                      
                      <div className="project-card-meta">
                        <span>
                          <span className="material-symbols-rounded">visibility</span>
                          {project.views}
                        </span>
                        <span>
                          <span className="material-symbols-rounded">calendar_today</span>
                          {formatDate(project.updated_at)}
                        </span>
                      </div>

                      <div className="project-card-actions">
                        <Link 
                          to={`/code/${project.id}`} 
                          className="btn btn-ghost btn-sm"
                        >
                          <span className="material-symbols-rounded">open_in_new</span>
                          ნახვა
                        </Link>
                        <Link 
                          to={`/playground?edit=${project.id}`} 
                          className="btn btn-ghost btn-sm"
                        >
                          <span className="material-symbols-rounded">edit</span>
                          რედაქტირება
                        </Link>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggleVisibility(project.id, project.is_public)}
                          title={project.is_public ? 'პირადი გახადე' : 'საჯარო გახადე'}
                        >
                          <span className="material-symbols-rounded">
                            {project.is_public ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleCopyLink(project.id)}
                        >
                          <span className="material-symbols-rounded">share</span>
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm btn-danger"
                          onClick={() => handleDelete(project.id)}
                        >
                          <span className="material-symbols-rounded">delete</span>
                        </button>
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

export default MyProjects;
