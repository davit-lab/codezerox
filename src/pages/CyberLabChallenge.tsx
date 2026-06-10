import { Link, useParams, useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import SEOHead from "@/components/SEOHead";
import { useCyberChallenge, useCyberSolves } from "@/hooks/useCyberLab";
import { useAuth } from "@/hooks/useAuth";
import CTFPanel from "@/components/cyberlab/CTFPanel";
import InteractivePanel from "@/components/cyberlab/InteractivePanel";
import QuizPanel from "@/components/cyberlab/QuizPanel";
import TerminalPanel from "@/components/cyberlab/TerminalPanel";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e', medium: '#eab308', hard: '#f97316', insane: '#ef4444', flagship: '#a855f7',
};
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'მარტივი', medium: 'საშუალო', hard: 'რთული', insane: 'შეშლილი', flagship: 'ლეგენდარული',
};

const CyberLabChallenge = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: challenge, isLoading } = useCyberChallenge(slug || '');
  const { data: solves = [] } = useCyberSolves();
  const isSolved = solves.some(s => s.challenge_id === challenge?.id);

  if (isLoading) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="page-content"><div className="container" style={{ paddingTop: 120, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>იტვირთება...</div></main>
      </>
    );
  }

  if (!challenge) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="page-content">
          <div className="container" style={{ paddingTop: 120, textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: 16 }}>error</span>
            <h2 style={{ color: '#fff', marginBottom: 12 }}>თასქი ვერ მოიძებნა</h2>
            <Link to="/cyber-lab" style={{ color: '#00ff41', textDecoration: 'none' }}>← Cyber Lab-ზე დაბრუნება</Link>
          </div>
        </main>
      </>
    );
  }

  const diffColor = DIFFICULTY_COLORS[challenge.difficulty] || '#888';
  const diffLabel = DIFFICULTY_LABELS[challenge.difficulty] || challenge.difficulty;

  return (
    <>
      <SEOHead title={`${challenge.title_ka} — Cyber Lab`} description={`${challenge.title_ka} — ${diffLabel} დონის თასქი Cyber Lab-ში`} />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container" style={{ maxWidth: 900, paddingTop: 32, paddingBottom: 80 }}>
          <Link to="/cyber-lab" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
            Cyber Lab
          </Link>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: diffColor, border: `1px solid ${diffColor}40`, padding: '2px 10px', borderRadius: 6 }}>{diffLabel}</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 6 }}>{challenge.base_points} XP</span>
                  {(challenge.tags || []).map((t: string) => <span key={t} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>#{t}</span>)}
                </div>
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>{challenge.title_ka}</h1>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.6 }}>{challenge.story_md}</div>
              </div>
              {isSolved && (
                <div style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, color: '#00ff41', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  <span className="material-symbols-rounded">check_circle</span>ამოხსნილია
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>flag</span>{challenge.solves_count} ამოხსნა
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>bolt</span>
                {challenge.engine === 'static' ? 'CTF' : challenge.engine === 'interactive' ? 'სიმულაცია' : challenge.engine === 'quiz' ? 'ქვიზი' : challenge.engine === 'terminal' ? 'ტერმინალი' : 'AI'}
              </span>
            </div>
          </div>

          {!user ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', marginBottom: 12, display: 'block' }}>lock</span>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>თასქის გასავლელად საჭიროა ავტორიზაცია</p>
              <button onClick={() => navigate('/auth?next=' + encodeURIComponent(`/cyber-lab/challenge/${slug}`))}
                style={{ background: '#00ff41', color: '#000', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                შესვლა
              </button>
            </div>
          ) : challenge.engine === 'static' ? (
            <CTFPanel challenge={challenge} isSolved={isSolved} />
          ) : challenge.engine === 'interactive' ? (
            <InteractivePanel challenge={challenge} isSolved={isSolved} />
          ) : challenge.engine === 'quiz' ? (
            <QuizPanel challenge={challenge} isSolved={isSolved} />
          ) : challenge.engine === 'terminal' ? (
            <TerminalPanel challenge={challenge} isSolved={isSolved} />
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>ეს თასქი AI-ტიპისაა და მალე გახდება ხელმისაწვდომი.</div>
          )}
        </div>
      </main>
    </>
  );
};

export default CyberLabChallenge;
