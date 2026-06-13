import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import SEOHead from "@/components/SEOHead";
import { useCyberLeaderboard, useCyberRanks } from "@/hooks/useCyberLab";

const CyberLabLeaderboard = () => {
  const { data: leaderboard = [], isLoading } = useCyberLeaderboard(100);
  const { data: ranks = [] } = useCyberRanks();

  const getRankInfo = (slug: string) => ranks.find(r => r.slug === slug);

  return (
    <>
      <SEOHead title="Cyber Lab Leaderboard — ჰაკერების რეიტინგი" description="Cyber Lab-ის ტოპ ჰაკერები და რეიტინგი" />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container" style={{ maxWidth: 800, paddingTop: 32, paddingBottom: 80 }}>
          <Link to="/cyber-lab" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
            Cyber Lab
          </Link>

          <div style={{ textAlign: 'center', padding: '20px 0 32px' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
              <span style={{ color: '#00ff41' }}>ჰაკერების</span> რეიტინგი
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem' }}>
              ყველაზე მეტი ქულა — ყველაზე მაღალი რანგი
            </p>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>იტვირთება...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.3)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>emoji_events</span>
              ჯერ არავის აქვს ქულა. იყავი პირველი!
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              {leaderboard.map((entry, idx) => {
                const rank = getRankInfo(entry.rank_slug);
                return (
                  <div key={entry.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 20px',
                    borderBottom: idx < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    background: idx < 3 ? 'rgba(0,255,65,0.02)' : 'transparent',
                  }}>
                    <span style={{
                      width: 32, textAlign: 'center', fontWeight: 800, fontSize: '0.9rem',
                      color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'rgba(255,255,255,0.4)',
                    }}>#{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>მომხმარებელი</div>
                      {rank && (
                        <span style={{ fontSize: '0.72rem', color: rank.badge_color || '#00ff41', background: `${rank.badge_color || '#00ff41'}15`, padding: '1px 8px', borderRadius: 6 }}>
                          {rank.name_ka}
                        </span>
                      )}
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{entry.solves_count} ამოხსნა</span>
                    <span style={{ color: '#00ff41', fontWeight: 700, fontSize: '0.95rem', minWidth: 60, textAlign: 'right' }}>
                      {entry.total_points}
                    </span>
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

export default CyberLabLeaderboard;
