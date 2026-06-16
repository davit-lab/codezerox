import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Atmosphere from "@/components/layout/Atmosphere";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import {
  useHackLabSettings,
  useHackLabLessons,
  useHackLabSubscription,
  useHackLabProgress,
} from "@/hooks/useHackLab";

const MODULES = [
  { name: 'Linux & Terminal', icon: 'terminal', color: '#5F13CA' },
  { name: 'ქსელები & Protocols', icon: 'wifi', color: '#7B3FD6' },
  { name: 'Web Security', icon: 'public', color: '#5F13CA' },
  { name: 'Social Engineering', icon: 'psychology', color: '#7B3FD6' },
  { name: 'Cryptography', icon: 'lock', color: '#5F13CA' },
  { name: 'Malware Analysis', icon: 'bug_report', color: '#7B3FD6' },
  { name: 'Reverse Engineering', icon: 'code_blocks', color: '#5F13CA' },
  { name: 'Exploitation', icon: 'flash_on', color: '#7B3FD6' },
];

const DIFF_COLORS: Record<string, string> = {
  beginner: '#22c55e', easy: '#84cc16', medium: '#eab308',
  hard: '#f97316', expert: '#ef4444',
};
const DIFF_LABELS: Record<string, string> = {
  beginner: 'დამწყები', easy: 'მარტივი', medium: 'საშუალო',
  hard: 'რთული', expert: 'ექსპერტი',
};

const AgeVerificationModal = ({ onConfirm, onDecline }: { onConfirm: () => void; onDecline: () => void }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(3,3,5,0.95)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  }}>
    <div style={{
      background: 'var(--bg-card)', border: '1px solid rgba(95,19,202,0.4)',
      borderRadius: 20, padding: '40px 36px', maxWidth: 440, width: '100%', textAlign: 'center',
      boxShadow: '0 0 60px rgba(95,19,202,0.2)',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: 'rgba(95,19,202,0.15)',
        border: '2px solid rgba(95,19,202,0.4)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 24px',
      }}>
        <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#5F13CA' }}>verified_user</span>
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
        ასაკის დადასტურება
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 28 }}>
        Ethical Hacking Lab განკუთვნილია <strong style={{ color: '#fff' }}>18 წელს ზემოთ</strong> პირებისთვის.
        კიბერუსაფრთხოების ცოდნა პასუხისმგებლობით გამოიყენება.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onDecline} style={{
          flex: 1, padding: '12px', borderRadius: 12,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
        }}>
          18-ზე ნაკლები ვარ
        </button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '12px', borderRadius: 12,
          background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)',
          border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
        }}>
          18+ ვარ, შევდივარ
        </button>
      </div>
    </div>
  </div>
);

const SubscriptionModal = ({ price, onClose }: { price: number; onClose: () => void }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9998,
    background: 'rgba(3,3,5,0.92)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  }}>
    <div style={{
      background: 'var(--bg-card)', border: '1px solid rgba(95,19,202,0.4)',
      borderRadius: 20, padding: '40px 36px', maxWidth: 460, width: '100%',
      boxShadow: '0 0 60px rgba(95,19,202,0.2)',
    }}>
      <button onClick={onClose} style={{
        float: 'right', background: 'none', border: 'none',
        color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 22,
      }}>✕</button>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'rgba(95,19,202,0.15)',
          border: '2px solid rgba(95,19,202,0.4)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#5F13CA' }}>shield</span>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Ethical Hacking Lab
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
          სრული წვდომა 300+ ლექციაზე
        </p>
      </div>
      <div style={{
        background: 'rgba(95,19,202,0.08)', border: '1px solid rgba(95,19,202,0.2)',
        borderRadius: 14, padding: '20px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>ყოველთვიური გადასახადი</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#5F13CA' }}>{price} ₾</span>
        </div>
        {[
          '300+ ლექცია ეთიკური ჰაკინგში',
          'CTF გამოწვევები და Labs',
          'Linux, Web, Crypto, Malware',
          'ახალი კონტენტი ყოველ კვირა',
          'სერტიფიკატი დასრულებისას',
        ].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#5F13CA' }}>check_circle</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{f}</span>
          </div>
        ))}
      </div>
      <Link to="/payment/checkout?product=hack-lab" style={{
        display: 'block', textAlign: 'center', padding: '14px',
        background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)', borderRadius: 12,
        color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '1rem',
        marginBottom: 12,
      }}>
        გამოწერა — {price} ₾/თვე
      </Link>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
        გახდომს შეგიძლია ნებისმიერ დროს
      </p>
    </div>
  </div>
);

const EthicalHackingLab = () => {
  const { user } = useAuth();
  const { data: settings } = useHackLabSettings();
  const { data: lessons = [] } = useHackLabLessons();
  const { data: subscription } = useHackLabSubscription(user?.id);
  const { data: progress = [] } = useHackLabProgress(user?.id);

  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('hack_lab_age_verified') === 'true';
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const hasAccess = subscription?.status === 'active' && new Date(subscription.expires_at) > new Date();
  const completedIds = new Set(progress.map((p: { lesson_id: string }) => p.lesson_id));

  const filteredLessons = useMemo(() => {
    if (activeModule) return lessons.filter((l: { module_name: string }) => l.module_name === activeModule);
    return lessons;
  }, [lessons, activeModule]);

  const moduleStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    for (const l of lessons) {
      const m = (l as { module_name: string }).module_name;
      if (!stats[m]) stats[m] = { total: 0, completed: 0 };
      stats[m].total++;
      if (completedIds.has((l as { id: string }).id)) stats[m].completed++;
    }
    return stats;
  }, [lessons, completedIds]);

  const handleAgeConfirm = () => {
    localStorage.setItem('hack_lab_age_verified', 'true');
    setAgeVerified(true);
  };

  const handleAgeDecline = () => {
    window.location.href = '/';
  };

  if (!ageVerified) {
    return <AgeVerificationModal onConfirm={handleAgeConfirm} onDecline={handleAgeDecline} />;
  }

  const price = settings?.monthly_price_gel ?? 29;

  return (
    <>
      <SEOHead title="Ethical Hacking Lab — კიბერუსაფრთხოება" description="300+ ლექცია ეთიკური ჰაკინგის, CTF-ების და კიბერუსაფრთხოების შესახებ ქართულად." />
      <Atmosphere />
      <Header />

      {showSubscriptionModal && (
        <SubscriptionModal price={price} onClose={() => setShowSubscriptionModal(false)} />
      )}

      <main className="page-content">
        <div className="container">

          {/* Hero */}
          <div style={{ textAlign: 'center', padding: '52px 0 44px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(95,19,202,0.1)', border: '1px solid rgba(95,19,202,0.3)',
              borderRadius: 30, padding: '5px 18px', marginBottom: 20,
              fontSize: '0.8rem', color: 'rgba(123,63,214,0.9)', fontWeight: 600,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 15 }}>shield</span>
              Ethical Hacking Lab
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
              გახდი <span style={{ color: '#5F13CA' }}>Ethical Hacker</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '1rem', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6 }}>
              300+ ლექცია Linux-იდან Advanced Exploitation-მდე — ყველაფერი ქართულად.
              პრაქტიკული Labs, CTF-ები და სერტიფიკატი.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
              {[
                { icon: 'school', value: `${lessons.length || '300'}+`, label: 'ლექცია' },
                { icon: 'view_module', value: '8', label: 'მოდული' },
                { icon: 'emoji_events', value: '50+', label: 'CTF Lab' },
                { icon: 'workspace_premium', value: '1', label: 'სერტიფიკატი' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '14px 22px', textAlign: 'center', minWidth: 100,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#5F13CA', marginBottom: 4, display: 'block' }}>{s.icon}</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {!hasAccess && (
              <button onClick={() => setShowSubscriptionModal(true)} style={{
                padding: '14px 36px', borderRadius: 14,
                background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)',
                border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem',
                fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span className="material-symbols-rounded">lock_open</span>
                წვდომის გახსნა — {price} ₾/თვე
              </button>
            )}
            {hasAccess && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px',
                background: 'rgba(95,19,202,0.15)', border: '1px solid rgba(95,19,202,0.3)',
                borderRadius: 12, color: '#7B3FD6', fontWeight: 700,
              }}>
                <span className="material-symbols-rounded">verified</span>
                წვდომა აქტიურია · {completedIds.size}/{lessons.length} გავლილი
              </div>
            )}
          </div>

          {/* Modules */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-rounded" style={{ color: '#5F13CA' }}>view_module</span>
              მოდულები
            </h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveModule(null)}
                style={{
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  background: !activeModule ? 'rgba(95,19,202,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${!activeModule ? 'rgba(95,19,202,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: !activeModule ? '#7B3FD6' : 'rgba(255,255,255,0.5)',
                }}
              >
                ყველა ({lessons.length})
              </button>
              {MODULES.map(m => {
                const s = moduleStats[m.name];
                return (
                  <button
                    key={m.name}
                    onClick={() => setActiveModule(activeModule === m.name ? null : m.name)}
                    style={{
                      padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: activeModule === m.name ? 'rgba(95,19,202,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeModule === m.name ? 'rgba(95,19,202,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: activeModule === m.name ? '#7B3FD6' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{m.icon}</span>
                    {m.name} {s ? `(${s.total})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lessons */}
          <div style={{ marginBottom: 60 }}>
            {filteredLessons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.25)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 52, display: 'block', marginBottom: 14 }}>hourglass_empty</span>
                ლექციები მალე დაემატება
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredLessons.map((lesson: {
                  id: string; title: string; description: string;
                  module_name: string; order_index: number; difficulty: string;
                  duration_min: number; is_free: boolean;
                }, idx: number) => {
                  const isCompleted = completedIds.has(lesson.id);
                  const isLocked = !hasAccess && !lesson.is_free;
                  const diffColor = DIFF_COLORS[lesson.difficulty] || '#888';

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (isLocked) { setShowSubscriptionModal(true); return; }
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.025)', border: `1px solid ${isCompleted ? 'rgba(95,19,202,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 14, padding: '16px 20px', cursor: isLocked ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', gap: 16,
                        transition: 'all 0.2s', opacity: isLocked ? 0.7 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!isLocked) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(95,19,202,0.3)';
                      }}
                      onMouseLeave={e => {
                        if (!isLocked) (e.currentTarget as HTMLElement).style.borderColor = isCompleted ? 'rgba(95,19,202,0.3)' : 'rgba(255,255,255,0.07)';
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: isCompleted ? 'rgba(95,19,202,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isCompleted ? 'rgba(95,19,202,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: 700, color: isCompleted ? '#7B3FD6' : 'rgba(255,255,255,0.3)',
                      }}>
                        {isCompleted ? <span className="material-symbols-rounded" style={{ fontSize: 18 }}>check</span> : idx + 1}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{lesson.title}</span>
                          {lesson.is_free && (
                            <span style={{ fontSize: '0.68rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                              უფასო
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700, color: diffColor,
                            border: `1px solid ${diffColor}40`, padding: '1px 7px', borderRadius: 5,
                          }}>
                            {DIFF_LABELS[lesson.difficulty] || lesson.difficulty}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-rounded" style={{ fontSize: 13 }}>schedule</span>
                            {lesson.duration_min} წთ
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{lesson.module_name}</span>
                        </div>
                      </div>

                      {isLocked ? (
                        <span className="material-symbols-rounded" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, flexShrink: 0 }}>lock</span>
                      ) : (
                        <Link
                          to={`/hack-lab/lesson/${lesson.id}`}
                          style={{
                            padding: '8px 18px', borderRadius: 10, textDecoration: 'none',
                            background: 'rgba(95,19,202,0.15)', border: '1px solid rgba(95,19,202,0.3)',
                            color: '#7B3FD6', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          {isCompleted ? 'გადახედვა' : 'დაწყება'}
                          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
};

export default EthicalHackingLab;
