import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import SEOHead from '@/components/SEOHead';
import { useVacancies, useMyVacancies, type Vacancy, type VacancyPackageTier } from '@/hooks/useVacancies';
import { useAuth } from '@/hooks/useAuth';
import vacanciesHeroBgDefault from '@/assets/vacancies-hero-bg.jpg';
import { useHeroBanner } from "@/hooks/useHeroBanners";

const jobTypeLabels: Record<string, string> = {
  full_time: 'სრული განაკვეთი',
  part_time: 'ნახევარი განაკვეთი',
  remote: 'დისტანციური',
  hybrid: 'ჰიბრიდული',
};

const experienceLabels: Record<string, string> = {
  junior: 'Junior', mid: 'Middle', senior: 'Senior', lead: 'Lead',
};

const categoryIcons: Record<string, string> = {
  it: 'code', design: 'palette', marketing: 'campaign',
  finance: 'payments', education: 'school', security: 'shield',
  management: 'groups', other: 'work',
};

const experienceColors: Record<string, string> = {
  junior: 'var(--emerald)',
  mid: 'var(--sapphire)',
  senior: 'var(--amethyst)',
  lead: 'var(--gold)',
};

const categories = [
  { key: 'all', label: 'ყველა', icon: 'apps' },
  { key: 'it', label: 'IT', icon: 'code' },
  { key: 'design', label: 'დიზაინი', icon: 'palette' },
  { key: 'marketing', label: 'მარკეტინგი', icon: 'campaign' },
  { key: 'finance', label: 'ფინანსები', icon: 'payments' },
  { key: 'security', label: 'უსაფრთხოება', icon: 'shield' },
  { key: 'management', label: 'მენეჯმენტი', icon: 'groups' },
  { key: 'education', label: 'განათლება', icon: 'school' },
  { key: 'other', label: 'სხვა', icon: 'work' },
];

const TIER_CONFIG: Record<VacancyPackageTier, {
  label: string; badgeBg: string; badgeColor: string; cardBg: string;
  topBorder: string; glow: string; icon: string;
  ribbon?: string; ribbonBg?: string;
  cvDelivery: boolean; verified: boolean;
}> = {
  depremium: {
    label: 'DE-PREMI',
    badgeBg: '#1A1A2E', badgeColor: '#D4AF37',
    cardBg: 'rgba(26,26,46,0.7)',
    topBorder: '#D4AF37',
    glow: '0 4px 32px rgba(212,175,55,0.28)',
    icon: 'workspace_premium',
    ribbon: 'TOP', ribbonBg: '#D4AF37',
    cvDelivery: true, verified: true,
  },
  premium: {
    label: 'PREMI',
    badgeBg: '#7B2D8B', badgeColor: '#fff',
    cardBg: 'rgba(123,45,139,0.09)',
    topBorder: '#7B2D8B',
    glow: '0 4px 24px rgba(123,45,139,0.25)',
    icon: 'star',
    ribbon: 'Most Popular', ribbonBg: '#7B2D8B',
    cvDelivery: true, verified: true,
  },
  normal: {
    label: 'NORMALI',
    badgeBg: '#0077B6', badgeColor: '#fff',
    cardBg: 'rgba(0,119,182,0.07)',
    topBorder: '#0077B6',
    glow: '0 4px 18px rgba(0,119,182,0.18)',
    icon: 'verified',
    cvDelivery: true, verified: true,
  },
  basic: {
    label: 'BEISIKI',
    badgeBg: '#4CAF50', badgeColor: '#fff',
    cardBg: 'rgba(76,175,80,0.05)',
    topBorder: '#4CAF50',
    glow: 'none',
    icon: 'work',
    cvDelivery: false, verified: false,
  },
};

const VacancyCard = ({ vacancy, index }: { vacancy: Vacancy; index: number }) => {
  const expColor = experienceColors[vacancy.experience_level] || 'var(--text-muted)';
  const timeAgo = getTimeAgo(vacancy.created_at);
  const tier = (vacancy.package_tier || 'basic') as VacancyPackageTier;
  const cfg = TIER_CONFIG[tier];

  return (
    <Link
      to={`/vacancies/${vacancy.id}`}
      className={`vac-card vac-card-tier-${tier}`}
      style={{
        animationDelay: `${index * 60}ms`,
        position: 'relative',
        background: cfg.cardBg,
        borderTop: `4px solid ${cfg.topBorder}`,
        boxShadow: cfg.glow !== 'none' ? cfg.glow : undefined,
        border: `1px solid ${cfg.topBorder}33`,
        borderTopWidth: 4,
      }}
    >
      {/* Ribbon */}
      {cfg.ribbon && (
        <div style={{
          position: 'absolute', top: 12, right: -1,
          background: cfg.ribbonBg, color: tier === 'depremium' ? '#1A1A2E' : '#fff',
          fontSize: '0.68rem', fontWeight: 900, padding: '3px 10px 3px 8px',
          borderRadius: '4px 0 0 4px',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: `0 2px 8px ${cfg.ribbonBg}55`,
        }}>
          {cfg.ribbon}
        </div>
      )}

      {/* Depremium animated shimmer */}
      {tier === 'depremium' && <div className="vac-depremium-shimmer" />}

      <div className="vac-card-inner">
        {/* Tier badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: cfg.badgeBg, color: cfg.badgeColor,
          fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px',
          borderRadius: 6, marginBottom: 10, letterSpacing: '0.04em',
          border: `1px solid ${cfg.topBorder}55`,
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 13 }}>{cfg.icon}</span>
          {cfg.label}
          {cfg.verified && (
            <span className="material-symbols-rounded" style={{ fontSize: 13, color: cfg.badgeColor, opacity: 0.9 }}>verified</span>
          )}
        </div>

        {/* Header */}
        <div className="vac-card-header">
          <div className="vac-card-icon" style={{ background: `${cfg.topBorder}18`, border: `1px solid ${cfg.topBorder}44`, color: cfg.topBorder }}>
            <span className="material-symbols-rounded">{categoryIcons[vacancy.category] || 'work'}</span>
          </div>
          <div className="vac-card-titles">
            <h3 className="vac-card-title" style={{ color: tier === 'depremium' ? '#D4AF37' : '#fff' }}>{vacancy.title}</h3>
            <div className="vac-card-company">
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>apartment</span>
              {vacancy.company_name}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="vac-card-desc">{vacancy.description}</p>

        {/* Tags */}
        <div className="vac-card-tags">
          <span className="vac-tag vac-tag-location">
            <span className="material-symbols-rounded">location_on</span>
            {vacancy.location}
          </span>
          <span className="vac-tag">
            <span className="material-symbols-rounded">schedule</span>
            {jobTypeLabels[vacancy.job_type] || vacancy.job_type}
          </span>
          <span className="vac-tag" style={{ borderColor: `${expColor}33`, color: expColor, background: `${expColor}11` }}>
            <span className="material-symbols-rounded">military_tech</span>
            {experienceLabels[vacancy.experience_level] || vacancy.experience_level}
          </span>
          {cfg.cvDelivery && (
            <span className="vac-tag" style={{ borderColor: `${cfg.topBorder}44`, color: cfg.topBorder, background: `${cfg.topBorder}10` }}>
              <span className="material-symbols-rounded">description</span>
              CV მიღება
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="vac-card-footer">
          <span className="vac-card-time">
            <span className="material-symbols-rounded">access_time</span>
            {timeAgo}
          </span>
          {vacancy.salary_amount ? (
            <div className="vac-card-salary">
              <span className="vac-salary-amount" style={{ color: cfg.topBorder }}>
                {vacancy.salary_amount}{vacancy.salary_currency}
              </span>
              <span className="vac-salary-period">
                {vacancy.salary_type === 'monthly' ? '/ თვე' : 'სრულად'}
              </span>
            </div>
          ) : (
            <span className="vac-card-salary-negotiable">შეთანხმებით</span>
          )}
        </div>
      </div>
    </Link>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} წუთის წინ`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} საათის წინ`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} დღის წინ`;
  return `${Math.floor(days / 30)} თვის წინ`;
}

const Vacancies = () => {
  const { user } = useAuth();
  const { data: vacancies = [], isLoading } = useVacancies();
  const { data: myVacancies = [] } = useMyVacancies();
  const { data: bannerData } = useHeroBanner("vacancies");
  const vacanciesHeroBg = bannerData?.image_url || vacanciesHeroBgDefault;
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const hasVacancies = myVacancies.length > 0;

  const filtered = useMemo(() => vacancies.filter(v => {
    const matchesSearch = !search ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || v.category === filter;
    return matchesSearch && matchesFilter;
  }), [vacancies, search, filter]);

  const stats = useMemo(() => ({
    total: vacancies.length,
    remote: vacancies.filter(v => v.job_type === 'remote').length,
    companies: new Set(vacancies.map(v => v.company_name)).size,
  }), [vacancies]);

  return (
    <>
      <SEOHead
        title="ვაკანსიები — IT სამუშაო განცხადებები"
        description="IT ვაკანსიები საქართველოში. იპოვე სამუშაო პროგრამირებაში, დიზაინში და ტექნოლოგიებში."
        path="/vacancies"
      />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container">

          {/* Hero */}
          <section className="vac-hero" style={{ backgroundImage: `url(${vacanciesHeroBg})` }}>
            <div className="vac-hero-overlay" />
            <div className="vac-hero-content">
              <div className="vac-hero-left">
                <span className="section-badge">
                  <span className="material-symbols-rounded">work</span>
                  ვაკანსიები
                </span>
                <h1 className="vac-hero-title">იპოვე შენი<br /><span className="vac-hero-accent">მომავალი სამუშაო</span></h1>
                <p className="vac-hero-subtitle">
                  IT ვაკანსიები საქართველოში — პროგრამირება, დიზაინი, კიბერუსაფრთხოება და სხვა
                </p>
              </div>
              <div className="vac-hero-actions">
                {user && hasVacancies && (
                  <Link to="/vacancies/inbox" className="vac-btn-ghost">
                    <span className="material-symbols-rounded">inbox</span>
                    ინბოქსი
                  </Link>
                )}
                {user && (
                  <Link to="/vacancies/create" className="vac-btn-primary">
                    <span className="material-symbols-rounded">add_circle</span>
                    ვაკანსიის განთავსება
                  </Link>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="vac-stats-row">
              <div className="vac-stat">
                <span className="vac-stat-num">{stats.total}</span>
                <span className="vac-stat-label">აქტიური ვაკანსია</span>
              </div>
              <div className="vac-stat-divider" />
              <div className="vac-stat">
                <span className="vac-stat-num">{stats.remote}</span>
                <span className="vac-stat-label">დისტანციური</span>
              </div>
              <div className="vac-stat-divider" />
              <div className="vac-stat">
                <span className="vac-stat-num">{stats.companies}</span>
                <span className="vac-stat-label">კომპანია</span>
              </div>
            </div>
          </section>

          {/* Search + Filter */}
          <div className="vac-toolbar">
            <div className="vac-search-wrap">
              <span className="material-symbols-rounded vac-search-icon">search</span>
              <input
                type="text"
                placeholder="მოძებნე პოზიცია ან კომპანია..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="vac-search-input"
              />
              {search && (
                <button className="vac-search-clear" onClick={() => setSearch('')}>
                  <span className="material-symbols-rounded">close</span>
                </button>
              )}
            </div>

            <div className="vac-filter-pills">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setFilter(cat.key)}
                  className={`vac-pill ${filter === cat.key ? 'active' : ''}`}
                >
                  <span className="material-symbols-rounded">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="vac-results-bar">
            <p className="vac-results-count">
              <strong>{filtered.length}</strong> ვაკანსია ნაპოვნია
            </p>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="vac-loading">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="vac-skeleton" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="vac-skeleton-header">
                    <div className="vac-skeleton-icon" />
                    <div className="vac-skeleton-lines">
                      <div className="vac-skeleton-line w-3/4" />
                      <div className="vac-skeleton-line w-1/2" />
                    </div>
                  </div>
                  <div className="vac-skeleton-line w-full" />
                  <div className="vac-skeleton-line w-2/3" />
                  <div className="vac-skeleton-tags">
                    <div className="vac-skeleton-tag" />
                    <div className="vac-skeleton-tag" />
                    <div className="vac-skeleton-tag" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="vac-empty">
              <div className="vac-empty-icon">
                <span className="material-symbols-rounded">work_off</span>
              </div>
              <h3>ვაკანსიები ვერ მოიძებნა</h3>
              <p>სცადეთ სხვა ფილტრი ან საძიებო სიტყვა</p>
              {(search || filter !== 'all') && (
                <button className="vac-btn-ghost" onClick={() => { setSearch(''); setFilter('all'); }}>
                  <span className="material-symbols-rounded">filter_alt_off</span>
                  ფილტრის გასუფთავება
                </button>
              )}
            </div>
          ) : (
            <div className="vac-grid">
              {filtered.map((v, i) => <VacancyCard key={v.id} vacancy={v} index={i} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Vacancies;
