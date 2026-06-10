import { Link, useParams } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import SEOHead from "@/components/SEOHead";
import {
  useCyberCategories,
  useCyberChallenges,
  useCyberSolves,
} from "@/hooks/useCyberLab";

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

const CyberLabCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { data: categories = [] } = useCyberCategories();
  const { data: challenges = [] } = useCyberChallenges(categorySlug);
  const { data: solves = [] } = useCyberSolves();

  const category = categories.find(c => c.slug === categorySlug);
  const completedIds = new Set(solves.map(s => s.challenge_id));

  return (
    <>
      <SEOHead title={`${category?.name_ka || 'კატეგორია'} — Cyber Lab`} description={category?.description_ka || ''} />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container">
          <div style={{ padding: '32px 0 24px' }}>
            <Link to="/cyber-lab" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
              Cyber Lab
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 32, color: category?.color || '#00ff41' }}>
                {category?.icon || 'folder'}
              </span>
              <div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, color: '#fff', margin: 0 }}>
                  {category?.name_ka || 'კატეგორია'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                  {category?.description_ka}
                </p>
              </div>
            </div>
          </div>

          {challenges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>inventory_2</span>
              <p>ამ კატეგორიაში ჯერ არ არის თასქები</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16, paddingBottom: 60 }}>
              {challenges.map(ch => {
                const diffColor = DIFFICULTY_COLORS[ch.difficulty] || '#888';
                const diffLabel = DIFFICULTY_LABELS[ch.difficulty] || ch.difficulty;
                const engineLabel: Record<string, string> = { static: 'CTF', interactive: 'სიმულაცია', quiz: 'ქვიზი', terminal: 'ტერმინალი', ai: 'AI' };
                const isCompleted = completedIds.has(ch.id);
                return (
                  <Link
                    key={ch.id}
                    to={`/cyber-lab/challenge/${ch.slug}`}
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
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', lineHeight: 1.3 }}>{ch.title_ka}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
                        padding: '2px 8px', borderRadius: 6,
                      }}>
                        {engineLabel[ch.engine] || ch.engine}
                      </span>
                      {(ch.tags || []).slice(0, 3).map(t => (
                        <span key={t} style={{
                          fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
                          padding: '2px 8px', borderRadius: 6,
                        }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 14 }}>flag</span>
                        {ch.solves_count} ამოხსნა
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#00ff41', fontWeight: 700 }}>
                        {ch.base_points} XP
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CyberLabCategory;
