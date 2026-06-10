import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import SEOHead from "@/components/SEOHead";
import {
  useCyberCategories,
  useCyberChallenges,
  useCyberLeaderboard,
  useCyberStats,
  useCyberSolves,
} from "@/hooks/useCyberLab";
import { useAuth } from "@/hooks/useAuth";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#f97316',
  insane: '#ef4444',
  flagship: '#a855f7',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'მარტივი',
  medium: 'საშუალო',
  hard: 'რთული',
  insane: 'შეშლილი',
  flagship: 'ლეგენდარული',
};

const CyberLab = () => {
  const { user } = useAuth();
  const { data: categories = [] } = useCyberCategories();
  const { data: challenges = [] } = useCyberChallenges();
  const { data: leaderboard = [] } = useCyberLeaderboard(10);
  const { data: stats } = useCyberStats();
  const { data: solves = [] } = useCyberSolves();

  const completedIds = new Set(solves.map(s => s.challenge_id));
  const totalPoints = challenges.reduce((s, c) => s + c.base_points, 0);

  return (
    <>
      <SEOHead title="Cyber Lab — ჰაკერის სიმულაცია" description="ისწავლე კიბერუსაფრთხოება პრაქტიკულად. CTF-ები, ინტერაქტიური სიმულაციები და ქვიზები ქართულად." />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container">
          {/* Hero */}
          <div style={{ textAlign: 'center', padding: '52px 0 40px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)',
              borderRadius: 30, padding: '5px 18px', marginBottom: 20,
              fontSize: '0.8rem', color: 'rgba(0,255,65,0.9)', fontWeight: 600,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 15 }}>security</span>
              Cyber Lab
            </div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
              გახდი <span style={{ color: '#00ff41' }}>ჰაკერი</span> პრაქტიკით
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '1rem', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6 }}>
              CTF-ები, ინტერაქტიური სიმულაციები და ქვიზები — ყველაფერი ქართულად. გაიარე გამოცდები და მიიღე სერტიფიკატი.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
              <StatBox icon="flag" value={`${challenges.length}`} label="თასქი" />
              <StatBox icon="emoji_events" value={`${totalPoints}`} label="სულ ქულა" />
              <StatBox icon="groups" value={`${leaderboard.length}`} label="მონაწილე" />
              {user && stats && (
                <StatBox icon="military_tech" value={`${stats.total_points}`} label="ჩემი ქულა" />
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/cyber-lab/leaderboard" className="btn" style={{
                background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.3)',
                color: '#00ff41', borderRadius: 12, padding: '10px 22px', fontWeight: 700,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-rounded">emoji_events</span>
                ლიდერბორდი
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-rounded" style={{ color: '#00ff41' }}>category</span>
              კატეგორიები
            </h2>
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>hourglass_empty</span>
                კატეგორიები მალე დაემატება
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {categories.map(cat => {
                  const catChallenges = challenges.filter(c => c.category_id === cat.id);
                  const catCompleted = catChallenges.filter(c => completedIds.has(c.id)).length;
                  return (
                    <Link
                      key={cat.id}
                      to={`/cyber-lab/${cat.slug}`}
                      style={{
                        textDecoration: 'none',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16, padding: '22px 20px', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', gap: 10,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = `${cat.color || '#00ff41'}50`;
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.transform = '';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="material-symbols-rounded" style={{
                          fontSize: 28, color: cat.color || '#00ff41',
                          background: `${cat.color || '#00ff41'}15`, borderRadius: 10,
                          padding: 6,
                        }}>{cat.icon || 'folder'}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{cat.name_ka}</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{cat.name_en}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, flex: 1 }}>
                        {cat.description_ka}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                          {catChallenges.length} თასქი
                        </span>
                        {catCompleted > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#00ff41', fontWeight: 600 }}>
                            {catCompleted}/{catChallenges.length} გავლილი
                          </span>
                        )}
                      </div>
                      {catChallenges.length > 0 && (
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            width: `${catChallenges.length ? (catCompleted / catChallenges.length) * 100 : 0}%`,
                            height: '100%', background: cat.color || '#00ff41', borderRadius: 2,
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* All Challenges */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-rounded" style={{ color: '#00ff41' }}>flag</span>
              ყველა თასქი
            </h2>
            {challenges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>hourglass_empty</span>
                თასქები მალე დაემატება
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                {challenges.map(ch => (
                  <ChallengeCard key={ch.id} challenge={ch} isCompleted={completedIds.has(ch.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard preview */}
          {leaderboard.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-rounded" style={{ color: '#00ff41' }}>emoji_events</span>
                  ტოპ 10
                </h2>
                <Link to="/cyber-lab/leaderboard" style={{ color: '#00ff41', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                  მეტი →
                </Link>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <div key={entry.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: idx < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{
                      width: 28, textAlign: 'center', fontWeight: 800, fontSize: '0.85rem',
                      color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'rgba(255,255,255,0.4)',
                    }}>#{idx + 1}</span>
                    <span style={{ flex: 1, color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                      მომხმარებელი
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                      {entry.solves_count} ამოხსნა
                    </span>
                    <span style={{ color: '#00ff41', fontWeight: 700, fontSize: '0.9rem', minWidth: 50, textAlign: 'right' }}>
                      {entry.total_points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const StatBox = ({ icon, value, label }: { icon: string; value: string; label: string }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, padding: '14px 22px', textAlign: 'center', minWidth: 100,
  }}>
    <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#00ff41', marginBottom: 4, display: 'block' }}>{icon}</span>
    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{value}</div>
    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
  </div>
);

const ChallengeCard = ({ challenge, isCompleted }: { challenge: { id: string; slug: string; title_ka: string; difficulty: string; base_points: number; engine: string; tags: string[] | null; solves_count: number }; isCompleted: boolean }) => {
  const diffColor = DIFFICULTY_COLORS[challenge.difficulty] || '#888';
  const diffLabel = DIFFICULTY_LABELS[challenge.difficulty] || challenge.difficulty;
  const engineLabel: Record<string, string> = { static: 'CTF', interactive: 'სიმულაცია', quiz: 'ქვიზი', terminal: 'ტერმინალი', ai: 'AI' };

  return (
    <Link
      to={`/cyber-lab/challenge/${challenge.slug}`}
      style={{
        textDecoration: 'none',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '18px 18px', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${diffColor}50`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLElement).style.transform = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
          color: diffColor, border: `1px solid ${diffColor}40`, padding: '2px 8px', borderRadius: 6,
        }}>
          {diffLabel}
        </div>
        {isCompleted && (
          <span className="material-symbols-rounded" style={{ color: '#00ff41', fontSize: 20 }}>check_circle</span>
        )}
      </div>
      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', lineHeight: 1.3 }}>{challenge.title_ka}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
          padding: '2px 8px', borderRadius: 6,
        }}>
          {engineLabel[challenge.engine] || challenge.engine}
        </span>
        {(challenge.tags || []).slice(0, 3).map(t => (
          <span key={t} style={{
            fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
            padding: '2px 8px', borderRadius: 6,
          }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>flag</span>
          {challenge.solves_count} ამოხსნა
        </span>
        <span style={{ fontSize: '0.85rem', color: '#00ff41', fontWeight: 700 }}>
          {challenge.base_points} XP
        </span>
      </div>
    </Link>
  );
};

export default CyberLab;
