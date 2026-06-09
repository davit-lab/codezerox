// PostingPackages — vacancy & freelancer packages page
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { usePrice } from '@/hooks/usePricing';
import { toast } from 'sonner';

interface PkgFeature { text: string; yes: boolean; }
interface VacPkg { id: string; name: string; price: number; color: string; label: string | null; desc: string; features: PkgFeature[]; hi?: boolean; top?: boolean; }


const PKGS: VacPkg[] = [
  { id:'basic',     name:'ბეისიკი',   price:1,  color:'#6b7280', label:null,
    desc:'სტანდარტული განთავსება',
    features:[
      {text:'30 დღიანი განთავსება', yes:true},
      {text:'სტანდარტული ჩვენება სიაში', yes:true},
      {text:'CV-ის მიღება', yes:false},
      {text:'გამოჩენილი ბეჯი', yes:false},
      {text:'სიის ზედა ნაწილი', yes:false},
    ]},
  { id:'normal',    name:'ნორმალი',   price:3,  color:'#3b82f6', label:'გამოჩენილი',
    desc:'ლურჯი ბეჯი, გამოყოფილი პოზიცია',
    features:[
      {text:'45 დღიანი განთავსება', yes:true},
      {text:'გამოყოფილი პოზიცია', yes:true},
      {text:'CV-ის მიღება', yes:true},
      {text:'ლურჯი ბეჯი', yes:true},
      {text:'სიის ზედა ნაწილი', yes:false},
    ]},
  { id:'premium',   name:'პრემი',     price:5,  color:'#f59e0b', label:'პოპულარული', hi:true,
    desc:'ოქროსფერი ჩარჩო, სიის ზედა ნაწილში',
    features:[
      {text:'60 დღიანი განთავსება', yes:true},
      {text:'სიის ზედა ნაწილი', yes:true},
      {text:'CV-ის მიღება', yes:true},
      {text:'ოქროსფერი ჩარჩო და ბეჯი', yes:true},
      {text:'Featured tag', yes:true},
    ]},
  { id:'depremium', name:'დე-პრემი', price:10, color:'#a855f7', label:'👑 პირველი ადგილი', top:true,
    desc:'სიის სათავე, ანიმ. ჩარჩო, მაქს. ხილვადობა',
    features:[
      {text:'90 დღიანი განთავსება', yes:true},
      {text:'სიის სათავეში პირველი', yes:true},
      {text:'CV-ის მიღება', yes:true},
      {text:'ანიმ. მეწამული ჩარჩო', yes:true},
      {text:'Featured + VIP ბეჯი', yes:true},
    ]},
];

const CMP = [
  ['ფასი',         '1₾','3₾','5₾','10₾'],
  ['განთავსება',   '30 დღე','45 დღე','60 დღე','90 დღე'],
  ['CV-ის მიღება', '—','✓','✓','✓'],
  ['ხილვადობა',    'ჩვეულ.','გამოჩ.','ზედა ნაწ.','🏆 პირველი'],
  ['ბეჯი',         '—','ლურჯი','ოქროს','VIP'],
  ['Featured',      '—','—','✓','✓'],
];

const FL_FEATS = [
  'პროფილი ჩანს ყველა სტუმრისთვის',
  'კლიენტებისგან პირდაპირი შეთავაზებები',
  'Portfolio — შენი პროექტების გვერდი',
  'ვარსკვლავური შეფასებები და რეიტინგი',
  'ვერიფიცირებული ფრილანსერის ნიშანი',
  'სააბონემენტოს გაუქმება ნებისმიერ დროს',
];

const PostingPackages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const mode = searchParams.get('mode') || 'vacancy';
  const [activeTab, setActiveTab] = useState<'vacancy' | 'freelancer'>(mode as 'vacancy' | 'freelancer');
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  // Dynamic prices from pricing_config (admin-editable)
  const basicP     = usePrice('pkg_basic', 1);
  const normalP    = usePrice('pkg_normal', 3);
  const premiumP   = usePrice('pkg_premium', 5);
  const deluxeP    = usePrice('pkg_depremium', 10);
  const freelancerP = usePrice('freelancer_monthly', 10);

  const dynPkgs = PKGS.map(p => ({
    ...p,
    price: p.id === 'basic' ? basicP : p.id === 'normal' ? normalP : p.id === 'premium' ? premiumP : deluxeP,
  }));

  const handleSelect = (pkgId: string) => {
    if (!user) { toast.error('გთხოვთ, გაიაროთ ავტორიზაცია'); navigate('/auth'); return; }
    setSelectedPkg(pkgId);
    setTimeout(() => navigate(`/package-checkout?package=${pkgId}`), 350);
  };

  const handleFreelancer = () => {
    if (!user) { toast.error('გთხოვთ, გაიაროთ ავტორიზაცია'); navigate('/auth'); return; }
    navigate('/package-checkout?type=freelancer');
  };


  return (
    <>
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="pkgv2-wrap">

          {/* Header */}
          <div className="pkgv2-head">
            <h1 className="pkgv2-title">პაკეტები</h1>
            <p className="pkgv2-subtitle">განათავსე ვაკანსია ან დარეგისტრირდი ფრილანსერად</p>
            <div className="pkgv2-tabs">
              <button onClick={() => setActiveTab('vacancy')}
                className={`pkgv2-tab${activeTab === 'vacancy' ? ' pkgv2-tab-on' : ''}`}>
                <span className="material-symbols-rounded">work_outline</span>
                ვაკანსია
              </button>
              <button onClick={() => setActiveTab('freelancer')}
                className={`pkgv2-tab${activeTab === 'freelancer' ? ' pkgv2-tab-on' : ''}`}>
                <span className="material-symbols-rounded">person_outline</span>
                ფრილანსინგი
              </button>
            </div>
          </div>

          {/* VACANCY */}
          {activeTab === 'vacancy' && (
            <>
              <div className="pkgv2-cards">
                {[...dynPkgs].reverse().map((pkg) => (
                  <div key={pkg.id}
                    className={`pkgv2-card${pkg.top ? ' pkgv2-card-top' : pkg.hi ? ' pkgv2-card-hi' : ''}${selectedPkg === pkg.id ? ' pkgv2-card-sel' : ''}`}
                    style={{ '--c': pkg.color } as React.CSSProperties}
                  >
                    <div className="pkgv2-stripe" style={{ background: pkg.color }} />
                    {pkg.label && (
                      <span className="pkgv2-lbl" style={{ color: pkg.color, background: `${pkg.color}18`, border: `1px solid ${pkg.color}38` }}>
                        {pkg.label}
                      </span>
                    )}
                    <div className="pkgv2-name">{pkg.name}</div>
                    <div className="pkgv2-price-row">
                      <span className="pkgv2-price" style={{ color: pkg.color }}>{pkg.price}₾</span>
                      <span className="pkgv2-per">/ განთავსება</span>
                    </div>
                    <p className="pkgv2-desc">{pkg.desc}</p>
                    <div className="pkgv2-divider" />
                    <ul className="pkgv2-feats">
                      {pkg.features.map((f, i) => (
                        <li key={i} className={`pkgv2-feat${f.yes ? '' : ' pkgv2-feat-no'}`}>
                          <span className="material-symbols-rounded pkgv2-ficon" style={{ color: f.yes ? pkg.color : 'var(--text-dim)' }}>
                            {f.yes ? 'check' : 'close'}
                          </span>
                          <span style={{ color: f.yes ? 'var(--text-secondary)' : 'var(--text-dim)' }}>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="pkgv2-btn"
                      style={{
                        background: selectedPkg === pkg.id ? pkg.color : 'transparent',
                        borderColor: pkg.color,
                        color: selectedPkg === pkg.id ? '#fff' : pkg.color,
                      }}
                      onClick={() => handleSelect(pkg.id)}
                    >
                      {selectedPkg === pkg.id
                        ? <><span className="material-symbols-rounded">check</span>არჩეულია</>
                        : <>ამ პაკეტით განთავსება</>}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pkgv2-cmp">
                <div className="pkgv2-cmp-row pkgv2-cmp-head">
                  <div className="pkgv2-cmp-feat">ფუნქცია</div>
                  {dynPkgs.map(p => <div key={p.id} className="pkgv2-cmp-col" style={{ color: p.color }}>{p.name}</div>)}
                </div>
                {CMP.map((row, i) => (
                  <div key={i} className="pkgv2-cmp-row">
                    <div className="pkgv2-cmp-feat">{row[0]}</div>
                    {row.slice(1).map((val, j) => {
                      const display = row[0] === 'ფასი' ? `${dynPkgs[j].price}₾` : val;
                      return (
                        <div key={j} className="pkgv2-cmp-col" style={{ color: val === '—' ? 'var(--text-dim)' : dynPkgs[j].color }}>{display}</div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* FREELANCER */}
          {activeTab === 'freelancer' && (
            <div className="pkgv2-fl">
              <div className="pkgv2-fl-left">
                <h2 className="pkgv2-fl-h">რატომ ღირს ფრილანსერი გახდე?</h2>
                {[
                  { icon: 'visibility',   t: 'ხილვადობა',              d: 'შენი პროფილი ჩანს ყველა ვიზიტორისთვის' },
                  { icon: 'forum',        t: 'პირდაპირი შეკვეთები',      d: 'კლიენტები გიგზავნიან პირდაპირ შეთავაზებებს' },
                  { icon: 'grade',        t: 'შეფასებები',               d: 'ვარსკვლავური რეიტინგი ნდობის ასამაღლებლად' },
                  { icon: 'badge',        t: 'ვერიფიკაცია',              d: 'გადამოწმებული ფრილანსერის ნიშანი' },
                  { icon: 'work_history', t: 'Portfolio',                d: 'შენი სამუშაოების გვერდი' },
                ].map((b, i) => (
                  <div key={i} className="pkgv2-fl-pt">
                    <div className="pkgv2-fl-icon"><span className="material-symbols-rounded">{b.icon}</span></div>
                    <div>
                      <div className="pkgv2-fl-pt-t">{b.t}</div>
                      <div className="pkgv2-fl-pt-d">{b.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pkgv2-fl-card">
                <div className="pkgv2-fl-card-head">
                  <span className="material-symbols-rounded pkgv2-fl-card-icon">person_edit</span>
                  <div className="pkgv2-fl-card-name">ფრილანსერის პაკეტი</div>
                  <div className="pkgv2-fl-card-sub">ყოველთვიური გამოწერა</div>
                </div>
                <div className="pkgv2-fl-price-row">
                  <span className="pkgv2-fl-price">{freelancerP}₾</span>
                  <span className="pkgv2-fl-per">/ თვეში</span>
                </div>
                <ul className="pkgv2-feats" style={{ marginBottom: 16 }}>
                  {FL_FEATS.map((t, i) => (
                    <li key={i} className="pkgv2-feat">
                      <span className="material-symbols-rounded pkgv2-ficon" style={{ color: '#a855f7' }}>check</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="pkgv2-fl-note">
                  <span className="material-symbols-rounded" style={{ fontSize: 15 }}>info</span>
                  გამოწერა ნებისმიერ დროს შეიძლება გაუქმდეს
                </p>
                <button className="pkgv2-fl-btn" onClick={handleFreelancer}>
                  <span className="material-symbols-rounded">person_add</span>
                  გამოიწერე — {freelancerP}₾/თვე
                </button>
                <button className="pkgv2-fl-btn-ghost" onClick={() => navigate('/freelancers')}>
                  <span className="material-symbols-rounded">search</span>
                  ფრილანსერების ნახვა
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .pkgv2-wrap { max-width:1160px; margin:0 auto; padding:36px 20px 80px; }

        .pkgv2-head { text-align:center; margin-bottom:44px; }
        .pkgv2-title { font-size:clamp(1.8rem,4vw,2.5rem); font-weight:800; color:var(--text-primary); margin-bottom:6px; }
        .pkgv2-subtitle { color:var(--text-muted); font-size:0.95rem; margin-bottom:24px; }

        .pkgv2-tabs { display:inline-flex; gap:4px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:4px; }
        .pkgv2-tab { display:flex; align-items:center; gap:7px; padding:9px 20px; border-radius:9px; border:none; cursor:pointer; font-size:0.88rem; font-weight:600; color:var(--text-muted); background:transparent; transition:all 0.2s; }
        .pkgv2-tab .material-symbols-rounded { font-size:18px; }
        .pkgv2-tab-on { background:rgba(255,255,255,0.08); color:var(--text-primary); }

        .pkgv2-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:36px; }
        @media(max-width:900px){ .pkgv2-cards { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:520px){ .pkgv2-cards { grid-template-columns:1fr; } }

        .pkgv2-card { position:relative; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px 18px 18px; display:flex; flex-direction:column; transition:transform 0.2s,border-color 0.2s,box-shadow 0.2s; overflow:hidden; }
        .pkgv2-card:hover { transform:translateY(-4px); border-color:var(--c); box-shadow:0 8px 28px rgba(0,0,0,0.22); }
        .pkgv2-card-hi { border-color:rgba(245,158,11,0.3); }
        .pkgv2-card-top { border-color:rgba(168,85,247,0.38); box-shadow:0 4px 20px rgba(168,85,247,0.12); }
        .pkgv2-card-sel { transform:translateY(-6px) scale(1.015); }

        .pkgv2-stripe { position:absolute; top:0; left:0; right:0; height:3px; border-radius:16px 16px 0 0; }

        .pkgv2-lbl { display:inline-flex; align-self:flex-start; padding:3px 9px; border-radius:999px; font-size:0.68rem; font-weight:700; letter-spacing:0.04em; margin:8px 0 10px; }

        .pkgv2-name { font-size:1.1rem; font-weight:800; color:var(--text-primary); margin-bottom:4px; }
        .pkgv2-price-row { display:flex; align-items:baseline; gap:4px; margin-bottom:4px; }
        .pkgv2-price { font-size:1.9rem; font-weight:900; line-height:1; }
        .pkgv2-per { font-size:0.75rem; color:var(--text-dim); }
        .pkgv2-desc { font-size:0.78rem; color:var(--text-muted); line-height:1.5; margin-bottom:0; }
        .pkgv2-divider { height:1px; background:rgba(255,255,255,0.07); margin:14px 0; }

        .pkgv2-feats { list-style:none; padding:0; margin:0 0 14px; display:flex; flex-direction:column; gap:7px; flex:1; }
        .pkgv2-feat { display:flex; align-items:center; gap:6px; font-size:0.8rem; line-height:1.3; }
        .pkgv2-feat-no { opacity:0.55; }
        .pkgv2-ficon { font-size:15px; flex-shrink:0; }

        .pkgv2-btn { width:100%; padding:10px; border-radius:10px; border:1.5px solid; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; justify-content:center; gap:5px; margin-top:auto; }
        .pkgv2-btn .material-symbols-rounded { font-size:15px; }
        .pkgv2-btn:hover { opacity:0.82; }

        .pkgv2-cmp { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:12px; overflow:hidden; margin-bottom:20px; }
        .pkgv2-cmp-row { display:grid; grid-template-columns:1.6fr repeat(4,1fr); gap:4px; padding:9px 14px; }
        .pkgv2-cmp-head { background:rgba(255,255,255,0.04); font-size:0.78rem; font-weight:700; }
        .pkgv2-cmp-row:not(.pkgv2-cmp-head) { font-size:0.78rem; border-top:1px solid rgba(255,255,255,0.05); }
        .pkgv2-cmp-row:not(.pkgv2-cmp-head):hover { background:rgba(255,255,255,0.02); }
        .pkgv2-cmp-feat { color:var(--text-secondary); font-weight:500; }
        .pkgv2-cmp-col { text-align:center; }
        @media(max-width:580px){ .pkgv2-cmp { display:none; } }

        .pkgv2-fl { display:grid; grid-template-columns:1fr 340px; gap:28px; align-items:start; }
        @media(max-width:800px){ .pkgv2-fl { grid-template-columns:1fr; } }

        .pkgv2-fl-h { font-size:1.2rem; font-weight:700; color:var(--text-primary); margin-bottom:16px; }
        .pkgv2-fl-pt { display:flex; gap:12px; align-items:flex-start; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); margin-bottom:10px; transition:border-color 0.2s,background 0.2s; }
        .pkgv2-fl-pt:hover { border-color:rgba(168,85,247,0.22); background:rgba(168,85,247,0.05); }
        .pkgv2-fl-icon { width:36px; height:36px; min-width:36px; border-radius:9px; background:rgba(168,85,247,0.14); display:flex; align-items:center; justify-content:center; color:#a855f7; }
        .pkgv2-fl-icon .material-symbols-rounded { font-size:18px; }
        .pkgv2-fl-pt-t { font-size:0.86rem; font-weight:700; color:var(--text-primary); margin-bottom:2px; }
        .pkgv2-fl-pt-d { font-size:0.77rem; color:var(--text-muted); line-height:1.4; }

        .pkgv2-fl-card { border:1.5px solid rgba(168,85,247,0.32); border-radius:16px; padding:24px 20px; background:rgba(168,85,247,0.04); position:sticky; top:80px; }
        .pkgv2-fl-card-head { text-align:center; margin-bottom:14px; }
        .pkgv2-fl-card-icon { font-size:32px; color:#a855f7; margin-bottom:6px; }
        .pkgv2-fl-card-name { font-size:1.05rem; font-weight:800; color:var(--text-primary); margin-bottom:2px; }
        .pkgv2-fl-card-sub { font-size:0.78rem; color:var(--text-muted); }
        .pkgv2-fl-price-row { display:flex; align-items:baseline; gap:4px; justify-content:center; margin-bottom:16px; }
        .pkgv2-fl-price { font-size:2.2rem; font-weight:900; color:#a855f7; }
        .pkgv2-fl-per { font-size:0.82rem; color:var(--text-muted); }
        .pkgv2-fl-note { display:flex; align-items:center; gap:5px; font-size:0.74rem; color:var(--text-dim); margin-bottom:12px; padding:7px 9px; background:rgba(255,255,255,0.03); border-radius:7px; }
        .pkgv2-fl-btn { width:100%; padding:12px; border-radius:11px; background:#7c3aed; border:none; color:#fff; font-size:0.9rem; font-weight:700; cursor:pointer; margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:6px; transition:background 0.2s,transform 0.2s; }
        .pkgv2-fl-btn:hover { background:#6d28d9; transform:translateY(-1px); }
        .pkgv2-fl-btn .material-symbols-rounded { font-size:18px; }
        .pkgv2-fl-btn-ghost { width:100%; padding:10px; border-radius:11px; background:transparent; border:1.5px solid rgba(168,85,247,0.28); color:#a855f7; font-size:0.84rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; }
        .pkgv2-fl-btn-ghost:hover { background:rgba(168,85,247,0.09); }
        .pkgv2-fl-btn-ghost .material-symbols-rounded { font-size:17px; }
      `}</style>
    </>
  );
};

export default PostingPackages;
