import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useMarketplaceProjects, useDeleteMarketplaceProject, MarketplaceProject } from "@/hooks/useMarketplace";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MarketplaceTermsModal, { useMarketplaceTerms } from "@/components/marketplace/MarketplaceTermsModal";
import { toast } from "sonner";

const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'Node.js', 'Express', 'Django', 'FastAPI', 'Laravel',
  'Flutter', 'React Native', 'TypeScript', 'JavaScript',
  'Python', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust',
];

const getPhotoUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
};

const formatPrice = (price: number | null, negotiable: boolean) => {
  if (negotiable || price === null) return 'შეთანხმებით';
  if (price === 0) return 'უფასო';
  return `${price} ₾`;
};

const Projects = () => {
  const { user } = useAuth();
  const { accepted, needsModal } = useMarketplaceTerms();
  const [search, setSearch] = useState('');
  const [tech, setTech] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'views'>('newest');

  const { data: projects = [], isLoading } = useMarketplaceProjects({
    search: search || undefined,
    tech: tech || undefined,
    sortBy,
  });

  if (accepted === null) return null;

  return (
    <>
      {needsModal && <MarketplaceTermsModal onAccepted={() => window.location.reload()} />}
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container">

          {/* Hero */}
          <div style={{ textAlign: 'center', padding: '52px 0 40px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)',
              borderRadius: 30, padding: '5px 18px', marginBottom: 20,
              fontSize: '0.8rem', color: 'rgba(168,85,247,0.9)', fontWeight: 600,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 15 }}>storefront</span>
              პროექტების მარკეტი
            </div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
              იყიდე / გაყიდე{' '}
              <span style={{ color: 'var(--gold)' }}>პროექტები</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '1rem', maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.6 }}>
              ატვირთე შენი პროექტი — კოდი, ლაივ პრევიუ, ფასი. ყიდე ან გაყიდე სამართლიანად.
            </p>
            {user && (
              <Link to="/projects/create" className="btn btn-gold">
                <span className="material-symbols-rounded">add</span>
                პროექტის ატვირთვა
              </Link>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
            <div style={{ flex: '1 1 220px', position: 'relative', minWidth: 0 }}>
              <span className="material-symbols-rounded" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 18, pointerEvents: 'none' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="პროექტის ძიება..."
                style={{
                  width: '100%', padding: '10px 14px 10px 38px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <select
              value={tech}
              onChange={e => setTech(e.target.value)}
              className="filter-select"
              style={{ minWidth: 160 }}
            >
              <option value="">ყველა ტექნოლოგია</option>
              {TECH_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['newest', 'views'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  style={{
                    padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    border: `1px solid ${sortBy === s ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    background: sortBy === s ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                    color: sortBy === s ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                  }}
                >
                  {s === 'newest' ? 'ახალი' : 'პოპულარული'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--gold)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.3)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>inventory_2</span>
              <p style={{ fontSize: '1rem' }}>პროექტები ვერ მოიძებნა</p>
              {user && (
                <Link to="/projects/create" className="btn btn-gold" style={{ marginTop: 24 }}>
                  <span className="material-symbols-rounded">add</span>
                  პირველი ატვირთე
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20, paddingBottom: 80 }}>
              {projects.map(p => <ProjectCard key={p.id} project={p} currentUserId={user?.id} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const ProjectCard = ({ project, currentUserId }: { project: MarketplaceProject; currentUserId?: string }) => {
  const deleteProject = useDeleteMarketplaceProject();
  const isOwner = currentUserId === project.user_id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('პროექტი წაიშლება. გააგრძელებ?')) return;
    try {
      await deleteProject.mutateAsync(project.id);
      toast.success('პროექტი წაიშალა');
    } catch {
      toast.error('შეცდომა წაშლისას');
    }
  };
  const thumb = project.photos?.[0] ? getPhotoUrl(project.photos[0]) : null;
  const price = formatPrice(project.price, project.price_negotiable);
  const isPaid = !project.price_negotiable && project.price !== null && project.price > 0;
  const isFree = !project.price_negotiable && (project.price === 0 || project.price === null) && !project.price_negotiable;

  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, overflow: 'hidden', transition: 'all 0.2s ease',
          height: '100%', display: 'flex', flexDirection: 'column',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.3)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '';
        }}
      >
        {/* Thumbnail */}
        <div style={{ height: 178, background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {thumb ? (
            <img src={thumb} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 44, color: 'rgba(255,255,255,0.12)' }}>code</span>
            </div>
          )}
          {/* Owner actions */}
          {isOwner && (
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 5, zIndex: 2 }}
              onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
              <Link
                to={`/projects/edit/${project.id}`}
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                  color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 15 }}>edit</span>
              </Link>
              <button
                onClick={handleDelete}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(239,68,68,0.75)', backdropFilter: 'blur(6px)',
                  color: '#fff', border: '1px solid rgba(239,68,68,0.4)',
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 15 }}>delete</span>
              </button>
            </div>
          )}
          {/* Price badge */}
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: isPaid ? 'rgba(212,175,55,0.92)' : project.price_negotiable ? 'rgba(168,85,247,0.92)' : 'rgba(52,211,153,0.92)',
            color: '#fff', fontSize: '0.76rem', fontWeight: 800,
            padding: '3px 10px', borderRadius: 8,
          }}>
            {price}
          </div>
          {/* Preview badge */}
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            borderRadius: 6, padding: '3px 8px',
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 12, color: 'var(--gold)' }}>play_circle</span>
            ლაივ პრევიუ
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontWeight: 800, fontSize: '0.97rem', color: '#fff', marginBottom: 7, lineHeight: 1.3 }}>
            {project.title}
          </h2>
          {project.description && (
            <p style={{
              color: 'rgba(255,255,255,0.42)', fontSize: '0.8rem', marginBottom: 10, lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}>
              {project.description}
            </p>
          )}
          {/* Tech stack */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12, flex: 1 }}>
            {(project.tech_stack || []).slice(0, 4).map((t: string) => (
              <span key={t} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '2px 7px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)',
              }}>{t}</span>
            ))}
            {(project.tech_stack || []).length > 4 && (
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
            <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 13 }}>visibility</span>
              {project.views}
            </span>
            <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.32)' }}>
              {project.seller_name || ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Projects;
