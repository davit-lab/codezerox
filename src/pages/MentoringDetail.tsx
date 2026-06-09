import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Atmosphere from "@/components/layout/Atmosphere";
import SEOHead from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useMentoringPackages,
  useMentoringSyllabus,
  useMentoringFaq,
  type MentoringCourse,
  type MentoringPackage,
} from "@/hooks/useMentoring";
import { MentoringPaymentDialog } from "@/components/mentoring/MentoringPaymentDialog";

const MentoringDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [payingPkg, setPayingPkg] = useState<MentoringPackage | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['mentoring-course-by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentoring_courses' as any)
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as MentoringCourse | null;
    },
    enabled: !!slug,
  });

  const { data: packages = [] } = useMentoringPackages(course?.id ?? '');
  const { data: syllabus = [] } = useMentoringSyllabus(course?.id ?? '');
  const { data: faq = [] } = useMentoringFaq(course?.id ?? '');

  const handleRegister = (packageId: string) => {
    if (!user) {
      navigate('/auth?next=' + encodeURIComponent(`/mentoring/${slug}`));
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    setPayingPkg(pkg);
  };

  if (isLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main style={{ paddingTop: '120px' }}>
          <div className="container">
            <Skeleton style={{ height: '400px', borderRadius: '12px' }} />
          </div>
        </main>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main style={{ paddingTop: '120px', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ color: 'var(--text-primary)' }}>კურსი ვერ მოიძებნა</h2>
            <Link to="/mentoring" style={{ color: 'var(--text-primary)', textDecoration: 'underline', marginTop: '16px', display: 'inline-block' }}>
              ყველა კურსი
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead title={`${course.title} — მენტორინგი`} description={course.short_description ?? undefined} />
      <Atmosphere />
      <Header />
      <main style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{
              fontSize: '0.75rem', textTransform: 'uppercase',
              color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '12px',
            }}>{course.language}</div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
              fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>{course.title}</h1>
            {course.short_description && (
              <p style={{
                fontSize: '1.05rem', color: 'var(--text-secondary)',
                lineHeight: 1.6, maxWidth: '720px',
              }}>{course.short_description}</p>
            )}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '24px',
              marginTop: '24px', paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              {course.duration_weeks > 0 && (
                <Stat icon="schedule" label="ხანგრძლივობა" value={`${course.duration_weeks} კვირა`} />
              )}
              {course.duration_hours > 0 && (
                <Stat icon="timer" label="საათები" value={`${course.duration_hours} სთ`} />
              )}
              <Stat icon="person" label="მენტორი" value={course.mentor_name} />
            </div>
          </div>

          {/* Mentor */}
          <Section title="მენტორი">
            <div style={{
              display: 'flex', gap: '20px', alignItems: 'flex-start',
              padding: '24px', background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)', borderRadius: '12px',
            }}>
              {course.mentor_photo_url ? (
                <img
                  src={course.mentor_photo_url}
                  alt={course.mentor_name}
                  style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  background: 'var(--bg-elevated)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  color: 'var(--text-muted)', fontSize: '2rem', fontWeight: 600,
                }}>{course.mentor_name.charAt(0)}</div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '4px' }}>
                  {course.mentor_name}
                </h3>
                {course.mentor_bio && (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {course.mentor_bio}
                  </p>
                )}
                {course.mentor_linkedin && (
                  <a
                    href={course.mentor_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      marginTop: '12px', color: 'var(--text-primary)',
                      fontSize: '0.85rem', textDecoration: 'none',
                      borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px',
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>link</span>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </Section>

          {/* Description */}
          {course.description && (
            <Section title="კურსის შესახებ">
              <div style={{
                padding: '24px', background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)', borderRadius: '12px',
                color: 'var(--text-secondary)', lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>{course.description}</div>
            </Section>
          )}

          {/* Prerequisites */}
          {course.prerequisites && (
            <Section title="წინასწარი ცოდნის მოთხოვნები">
              <div style={{
                padding: '20px', background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)', borderRadius: '12px',
                color: 'var(--text-secondary)', lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>{course.prerequisites}</div>
            </Section>
          )}

          {/* Syllabus */}
          {syllabus.length > 0 && (
            <Section title="სილაბუსი">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {syllabus.map((s, idx) => (
                  <div
                    key={s.id}
                    style={{
                      padding: '16px 20px', background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)', borderRadius: '10px',
                      display: 'flex', gap: '16px',
                    }}
                  >
                    <div style={{
                      flexShrink: 0, width: '32px', height: '32px',
                      borderRadius: '50%', background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
                    }}>{idx + 1}</div>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                        {s.title}
                      </div>
                      {s.description && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {s.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Packages */}
          {packages.length > 0 && (
            <Section title="პაკეტები">
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
                gap: '16px',
              }}>
                {packages.map(pkg => (
                  <div
                    key={pkg.id}
                    style={{
                      padding: '24px',
                      background: 'var(--bg-card)',
                      border: pkg.is_recommended ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      display: 'flex', flexDirection: 'column', gap: '16px',
                      position: 'relative',
                    }}
                  >
                    {pkg.is_recommended && (
                      <div style={{
                        position: 'absolute', top: '-10px', left: '20px',
                        background: 'var(--bg-card)', padding: '2px 10px',
                        fontSize: '0.7rem', textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: 'var(--text-primary)',
                        border: '1px solid var(--text-primary)', borderRadius: '4px',
                      }}>რეკომენდირებული</div>
                    )}
                    <div>
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    <div style={{
                      fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)',
                      paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      {pkg.price_gel} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>₾</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      {(pkg.features ?? []).map((f, i) => (
                        <li key={i} style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--text-primary)', flexShrink: 0, marginTop: '2px' }}>check</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleRegister(pkg.id)}
                      style={{
                        padding: '12px 16px',
                        background: pkg.is_recommended ? 'var(--text-primary)' : 'transparent',
                        color: pkg.is_recommended ? 'var(--bg-card)' : 'var(--text-primary)',
                        border: '1px solid var(--text-primary)',
                        borderRadius: '8px', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.9rem',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      რეგისტრაცია და გადახდა
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* FAQ */}
          {faq.length > 0 && (
            <Section title="ხშირად დასმული კითხვები">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {faq.map(item => (
                  <details
                    key={item.id}
                    style={{
                      padding: '16px 20px', background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)', borderRadius: '10px',
                    }}
                  >
                    <summary style={{
                      cursor: 'pointer', color: 'var(--text-primary)',
                      fontWeight: 600, fontSize: '0.95rem',
                    }}>{item.question}</summary>
                    <div style={{
                      marginTop: '12px', paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem',
                      whiteSpace: 'pre-wrap',
                    }}>{item.answer}</div>
                  </details>
                ))}
              </div>
            </Section>
          )}
        </div>
      </main>

      {payingPkg && course && (
        <MentoringPaymentDialog
          open={!!payingPkg}
          onClose={() => setPayingPkg(null)}
          courseId={course.id}
          courseTitle={course.title}
          packageId={payingPkg.id}
          packageName={payingPkg.name}
          amountGel={payingPkg.price_gel}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['my-mentoring-registrations'] });
            qc.invalidateQueries({ queryKey: ['mentoring-registrations'] });
          }}
        />
      )}
    </>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: '40px' }}>
    <h2 style={{
      fontSize: '0.85rem', textTransform: 'uppercase',
      letterSpacing: '0.12em', color: 'var(--text-muted)',
      marginBottom: '16px', fontWeight: 600,
    }}>{title}</h2>
    {children}
  </section>
);

const Stat = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{
      fontSize: '0.7rem', textTransform: 'uppercase',
      letterSpacing: '0.1em', color: 'var(--text-muted)',
    }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{icon}</span>
      {value}
    </div>
  </div>
);

export default MentoringDetail;
