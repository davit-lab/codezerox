import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Atmosphere from "@/components/layout/Atmosphere";
import SEOHead from "@/components/SEOHead";
import { useMentoringCourses } from "@/hooks/useMentoring";
import { Skeleton } from "@/components/ui/skeleton";

const Mentoring = () => {
  const { data: courses = [], isLoading } = useMentoringCourses();

  return (
    <>
      <SEOHead title="მენტორინგი — CodeZero Academy" description="ინდივიდუალური მენტორინგი პროგრამირების კურსებზე გამოცდილ მენტორებთან ერთად." />
      <Atmosphere />
      <Header />
      <main style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto 48px', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>მენტორინგი</h1>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>აირჩიე პროგრამირების ენა და დაიწყე ინდივიდუალური სწავლა გამოცდილ მენტორთან ერთად.</p>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {[1, 2, 3].map(i => <Skeleton key={i} style={{ height: '320px', borderRadius: '12px' }} />)}
            </div>
          ) : courses.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>school</span>
              <h3 style={{ marginTop: '16px', color: 'var(--text-primary)' }}>კურსები ჯერ არ დამატებულა</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>მალე დაგემატებათ ახალი მენტორინგის კურსები.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {courses.map(c => (
                <Link
                  key={c.id}
                  to={`/mentoring/${c.slug}`}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  {c.cover_url ? (
                    <img src={c.cover_url} alt={c.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      height: '180px',
                      background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '1.5rem', fontWeight: 600,
                    }}>{c.language}</div>
                  )}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontSize: '0.75rem', textTransform: 'uppercase',
                      color: 'var(--text-muted)', letterSpacing: '0.08em',
                      marginBottom: '8px',
                    }}>{c.language}</div>
                    <h3 style={{
                      fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)',
                      marginBottom: '8px', lineHeight: 1.3,
                    }}>{c.title}</h3>
                    {c.short_description && (
                      <p style={{
                        fontSize: '0.9rem', color: 'var(--text-secondary)',
                        lineHeight: 1.5, marginBottom: '16px', flex: 1,
                      }}>{c.short_description}</p>
                    )}
                    <div style={{
                      display: 'flex', gap: '16px', fontSize: '0.85rem',
                      color: 'var(--text-muted)', paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}>
                      {c.duration_weeks > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>schedule</span>
                          {c.duration_weeks} კვირა
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>person</span>
                        {c.mentor_name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Mentoring;
