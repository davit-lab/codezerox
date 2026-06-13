import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import { useCreateVacancy, useUpdateVacancy, useVacancy, type VacancyPackageTier } from '@/hooks/useVacancies';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PKGS: {
  id: VacancyPackageTier; name: string; price: number;
  color: string; bg: string; textOnBg: string;
  icon: string; duration: string; ribbon?: string;
  scale: number; features: string[];
}[] = [
  {
    id: 'depremium', name: 'DE-PREMI', price: 10,
    color: '#D4AF37', bg: '#1A1A2E', textOnBg: '#D4AF37',
    icon: 'workspace_premium', duration: '90 დღე', ribbon: 'TOP', scale: 1.05,
    features: ['#1 — ყველაზე ზედა (VIP)', 'ავტო-განახლება / 24სთ', 'CV ინბოქსში', 'ჰომპეიჯ კარუსელი', 'ვერიფიცირებული ✔', 'პრიორიტეტული მხარდაჭერა'],
  },
  {
    id: 'premium', name: 'PREMI', price: 5,
    color: '#fff', bg: '#7B2D8B', textOnBg: '#fff',
    icon: 'star', duration: '60 დღე', ribbon: 'Most Popular', scale: 1.0,
    features: ['#2 — სიის ზედა ნაწილი', 'ავტო-განახლება / 48სთ', 'CV ინბოქსში', 'ვერიფიცირებული ✔'],
  },
  {
    id: 'normal', name: 'NORMALI', price: 3,
    color: '#fff', bg: '#0077B6', textOnBg: '#fff',
    icon: 'verified', duration: '45 დღე', scale: 1.0,
    features: ['#3 — სტანდარტზე ზემოთ', 'CV ინბოქსში', 'ვერიფიცირებული ✔', 'ძიება / ფილტრი'],
  },
  {
    id: 'basic', name: 'BEISIKI', price: 1,
    color: '#fff', bg: '#4CAF50', textOnBg: '#fff',
    icon: 'work', duration: '30 დღე', scale: 0.95,
    features: ['#4 — სტანდარტული', 'ძიება / ფილტრი'],
  },
];

const CreateVacancy = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  // URL params set by PackageCheckout after payment
  const paidPackage = searchParams.get('package') as VacancyPackageTier | null;
  const isReturningPaid = searchParams.get('paid') === '1' && !!paidPackage;

  const [step, setStep] = useState<'form' | 'picker'>('form');
  const [hoveredPkg, setHoveredPkg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const autoFired = useRef(false);

  const { user, isAdmin } = useAuth();
  const createVacancy = useCreateVacancy();
  const updateVacancy = useUpdateVacancy();
  const { data: existingVacancy, isLoading: loadingVacancy } = useVacancy(id || '');

  const [form, setForm] = useState({
    title: '', company_name: '', description: '', requirements: '',
    location: '', job_type: 'full_time', salary_amount: '',
    salary_type: 'monthly', salary_currency: '₾',
    contact_email: '', contact_phone: '',
    category: 'other', experience_level: 'junior',
  });

  // Load existing vacancy for edit mode
  useEffect(() => {
    if (isEdit && existingVacancy) {
      setForm({
        title: existingVacancy.title,
        company_name: existingVacancy.company_name,
        description: existingVacancy.description,
        requirements: existingVacancy.requirements || '',
        location: existingVacancy.location,
        job_type: existingVacancy.job_type,
        salary_amount: existingVacancy.salary_amount?.toString() || '',
        salary_type: existingVacancy.salary_type || 'monthly',
        salary_currency: existingVacancy.salary_currency || '₾',
        contact_email: existingVacancy.contact_email || '',
        contact_phone: existingVacancy.contact_phone || '',
        category: existingVacancy.category,
        experience_level: existingVacancy.experience_level,
      });
    }
  }, [isEdit, existingVacancy]);

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  // Build DB-ready vacancy payload from form state
  const buildPayload = (f: typeof form) => ({
    title: f.title,
    company_name: f.company_name,
    description: f.description,
    requirements: f.requirements || null,
    location: f.location,
    job_type: f.job_type,
    salary_amount: f.salary_amount ? parseFloat(f.salary_amount) : null,
    salary_type: f.salary_type,
    salary_currency: f.salary_currency,
    contact_email: f.contact_email || null,
    contact_phone: f.contact_phone || null,
    category: f.category,
    experience_level: f.experience_level,
  });

  // Core creation function
  const doCreate = async (formData: typeof form, tier: VacancyPackageTier) => {
    if (!user) { toast.error('მომხმარებელი ვერ მოიძებნა'); return; }
    setCreating(true);
    try {
      await createVacancy.mutateAsync({ user_id: user.id, package_tier: tier, ...buildPayload(formData) });
      sessionStorage.removeItem('cv_form_draft');
      toast.success('ვაკანსია წარმატებით გამოქვეყნდა!');
      navigate('/vacancies');
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err);
      toast.error(`შეცდომა: ${msg}`);
      console.error('[CreateVacancy] create error:', err);
    } finally {
      setCreating(false);
    }
  };

  // Form submit: edit → update directly; new → show package picker
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (isEdit && id) {
      try {
        await updateVacancy.mutateAsync({ id, ...buildPayload(form) });
        toast.success('ვაკანსია წარმატებით განახლდა!');
        navigate('/vacancies');
      } catch { toast.error('შეცდომა ვაკანსიის განახლებისას'); }
      return;
    }
    sessionStorage.setItem('cv_form_draft', JSON.stringify(form));
    setStep('picker');
    setTimeout(() => document.getElementById('cv-pkg-picker')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  // Package selected from picker
  const handlePickPackage = (tier: VacancyPackageTier) => {
    if (isAdmin) {
      // Admin: skip checkout entirely, create right now
      setStep('form');
      doCreate(form, tier);
    } else {
      // Regular user: go through checkout; draft already saved in sessionStorage
      navigate(`/package-checkout?package=${tier}`);
    }
  };

  // Non-admin users returning from checkout: restore draft and auto-create
  useEffect(() => {
    if (isEdit || !isReturningPaid || !paidPackage || autoFired.current) return;
    if (!user) return; // wait for auth
    const raw = sessionStorage.getItem('cv_form_draft');
    if (!raw) { navigate('/vacancies/create'); return; } // no draft → restart
    autoFired.current = true;
    try {
      const saved = JSON.parse(raw) as typeof form;
      doCreate(saved, paidPackage);
    } catch { navigate('/vacancies/create'); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) { navigate('/auth'); return null; }
  if (creating) {
    return (
      <><Atmosphere /><Header />
        <main className="page-content">
          <div className="container" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:120, gap:16 }}>
            <div className="vac-loading-spinner" />
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.9rem' }}>ვაკანსია ინახება...</p>
          </div>
        </main>
      </>
    );
  }
  if (isEdit && loadingVacancy) {
    return (
      <><Atmosphere /><Header />
        <main className="page-content">
          <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div className="vac-loading-spinner" />
          </div>
        </main>
      </>
    );
  }
  if (isEdit && existingVacancy && existingVacancy.user_id !== user.id) {
    navigate('/vacancies'); return null;
  }

  const completionSteps = [
    { label: 'პოზიცია', done: !!form.title },
    { label: 'კომპანია', done: !!form.company_name },
    { label: 'აღწერა', done: !!form.description },
    { label: 'ლოკაცია', done: !!form.location },
  ];
  const completionPercent = Math.round((completionSteps.filter(s => s.done).length / completionSteps.length) * 100);

  return (
    <>
      <Atmosphere /><Header />
      <main className="page-content">
        <div className="container" style={{ maxWidth: 760 }}>

          {/* Header */}
          <div className="cv-header">
            <button onClick={() => navigate('/vacancies')} className="cv-back-btn">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <div className="cv-header-text">
              <h1 className="cv-title">{isEdit ? 'ვაკანსიის რედაქტირება' : 'ვაკანსიის დამატება'}</h1>
              <p className="cv-subtitle">{isEdit ? 'შეცვალეთ ინფორმაცია' : 'შეავსეთ ფორმა და გამოაქვეყნეთ'}</p>
            </div>
            {!isEdit && isReturningPaid && paidPackage && (
              <div className="cv-package-indicator" style={{ color: '#a855f7', borderColor: 'rgba(168,85,247,0.4)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 15 }}>workspace_premium</span>
                {paidPackage}
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="cv-progress-bar">
            <div className="cv-progress-track">
              <div className="cv-progress-fill" style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="cv-progress-steps">
              {completionSteps.map((s, i) => (
                <span key={i} className={`cv-progress-step ${s.done ? 'done' : ''}`}>
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>
                    {s.done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="cv-form">

            {/* Section 1: Basic */}
            <div className="cv-section">
              <div className="cv-section-header">
                <span className="cv-section-icon">
                  <span className="material-symbols-rounded">info</span>
                </span>
                <h2 className="cv-section-title">ძირითადი ინფორმაცია</h2>
              </div>
              <div className="cv-grid-2">
                <div className="cv-field">
                  <label className="cv-label">პოზიცია <span className="cv-required">*</span></label>
                  <input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="მაგ: Frontend Developer" className="cv-input" />
                </div>
                <div className="cv-field">
                  <label className="cv-label">კომპანია <span className="cv-required">*</span></label>
                  <input required value={form.company_name} onChange={e => update('company_name', e.target.value)} placeholder="კომპანიის სახელი" className="cv-input" />
                </div>
              </div>
              <div className="cv-grid-2">
                <div className="cv-field">
                  <label className="cv-label">კატეგორია</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)} className="cv-input">
                    <option value="it">IT / პროგრამირება</option>
                    <option value="design">დიზაინი</option>
                    <option value="marketing">მარკეტინგი</option>
                    <option value="finance">ფინანსები</option>
                    <option value="education">განათლება</option>
                    <option value="security">კიბერუსაფრთხოება</option>
                    <option value="management">მენეჯმენტი</option>
                    <option value="other">სხვა</option>
                  </select>
                </div>
                <div className="cv-field">
                  <label className="cv-label">გამოცდილება</label>
                  <select value={form.experience_level} onChange={e => update('experience_level', e.target.value)} className="cv-input">
                    <option value="junior">Junior</option>
                    <option value="mid">Middle</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
              </div>
              <div className="cv-grid-2">
                <div className="cv-field">
                  <label className="cv-label">ადგილმდებარეობა <span className="cv-required">*</span></label>
                  <input required value={form.location} onChange={e => update('location', e.target.value)} placeholder="მაგ: თბილისი" className="cv-input" />
                </div>
                <div className="cv-field">
                  <label className="cv-label">სამუშაო ტიპი</label>
                  <select value={form.job_type} onChange={e => update('job_type', e.target.value)} className="cv-input">
                    <option value="full_time">სრული განაკვეთი</option>
                    <option value="part_time">ნახევარი განაკვეთი</option>
                    <option value="remote">დისტანციური</option>
                    <option value="hybrid">ჰიბრიდული</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Salary */}
            <div className="cv-section">
              <div className="cv-section-header">
                <span className="cv-section-icon">
                  <span className="material-symbols-rounded">payments</span>
                </span>
                <h2 className="cv-section-title">ანაზღაურება</h2>
              </div>
              <div className="cv-grid-3">
                <div className="cv-field">
                  <label className="cv-label">თანხა</label>
                  <input type="number" value={form.salary_amount} onChange={e => update('salary_amount', e.target.value)} placeholder="2000" className="cv-input" />
                </div>
                <div className="cv-field">
                  <label className="cv-label">ტიპი</label>
                  <select value={form.salary_type} onChange={e => update('salary_type', e.target.value)} className="cv-input">
                    <option value="monthly">თვიური</option>
                    <option value="total">სრული</option>
                  </select>
                </div>
                <div className="cv-field">
                  <label className="cv-label">ვალუტა</label>
                  <select value={form.salary_currency} onChange={e => update('salary_currency', e.target.value)} className="cv-input">
                    <option value="₾">₾ (ლარი)</option>
                    <option value="$">$ (დოლარი)</option>
                    <option value="€">€ (ევრო)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Description */}
            <div className="cv-section">
              <div className="cv-section-header">
                <span className="cv-section-icon">
                  <span className="material-symbols-rounded">description</span>
                </span>
                <h2 className="cv-section-title">აღწერა</h2>
              </div>
              <div className="cv-field">
                <label className="cv-label">სამუშაოს აღწერა <span className="cv-required">*</span></label>
                <textarea required rows={5} value={form.description} onChange={e => update('description', e.target.value)} placeholder="სამუშაოს დეტალური აღწერა..." className="cv-input cv-textarea" />
              </div>
              <div className="cv-field">
                <label className="cv-label">მოთხოვნები</label>
                <textarea rows={4} value={form.requirements} onChange={e => update('requirements', e.target.value)} placeholder="საჭირო უნარები და გამოცდილება..." className="cv-input cv-textarea" />
              </div>
            </div>

            {/* Section 4: Contact */}
            <div className="cv-section">
              <div className="cv-section-header">
                <span className="cv-section-icon">
                  <span className="material-symbols-rounded">contact_mail</span>
                </span>
                <h2 className="cv-section-title">საკონტაქტო</h2>
              </div>
              <div className="cv-grid-2">
                <div className="cv-field">
                  <label className="cv-label">ელფოსტა</label>
                  <input type="email" value={form.contact_email} onChange={e => update('contact_email', e.target.value)} placeholder="email@company.com" className="cv-input" />
                </div>
                <div className="cv-field">
                  <label className="cv-label">ტელეფონი</label>
                  <input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} placeholder="+995 xxx xxx xxx" className="cv-input" />
                </div>
              </div>
            </div>

            {/* Submit */}
            {step === 'form' && (
              <button type="submit" disabled={updateVacancy.isPending} className="cv-submit-btn">
                <span className="material-symbols-rounded">
                  {updateVacancy.isPending ? 'hourglass_top' : isEdit ? 'save' : 'arrow_forward'}
                </span>
                {updateVacancy.isPending ? 'იტვირთება...' : isEdit ? 'შენახვა' : 'გაგრძელება — პაკეტის არჩევა'}
              </button>
            )}
          </form>

          {/* Inline Package Picker */}
          {step === 'picker' && !isEdit && (
            <div id="cv-pkg-picker" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:18, padding:'28px 24px', marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:800, fontSize:'1.05rem', color:'#fff', marginBottom:6 }}>
                <span className="material-symbols-rounded" style={{ color: '#a855f7', fontSize: 22 }}>local_offer</span>
                აირჩიეთ განთავსების პაკეტი
              </div>
              <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', margin:'0 0 20px' }}>
                {isAdmin ? 'ადმინი — პაკეტის არჩევა პირდაპირ გამოაქვეყნებს.' : 'გადახდის შემდეგ ვაკანსია ავტომატურად გამოქვეყნდება.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20, alignItems: 'end' }}>
                {PKGS.map(pkg => {
                  const hovered = hoveredPkg === pkg.id;
                  return (
                    <div key={pkg.id} style={{ position: 'relative', transform: `scale(${pkg.scale})`, transformOrigin: 'bottom center', transition: 'transform 0.15s' }}>
                      {/* Ribbon */}
                      {pkg.ribbon && (
                        <div style={{
                          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                          background: pkg.bg, color: pkg.textOnBg,
                          fontSize: '0.65rem', fontWeight: 900, padding: '3px 12px',
                          borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase',
                          border: `1px solid ${pkg.color}66`, zIndex: 1,
                          boxShadow: `0 2px 8px ${pkg.bg}88`,
                          whiteSpace: 'nowrap',
                        }}>
                          {pkg.ribbon}
                        </div>
                      )}
                      <button
                        onMouseEnter={() => setHoveredPkg(pkg.id)}
                        onMouseLeave={() => setHoveredPkg(null)}
                        onClick={() => handlePickPackage(pkg.id)}
                        style={{
                          width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 0, padding: '22px 12px 16px', borderRadius: 14,
                          border: `2px solid ${hovered ? pkg.bg : `${pkg.bg}88`}`,
                          background: hovered ? pkg.bg : `${pkg.bg}22`,
                          cursor: 'pointer', textAlign: 'center',
                          transform: hovered ? 'translateY(-4px)' : 'none',
                          transition: 'all 0.18s ease',
                          boxShadow: hovered ? `0 8px 28px ${pkg.bg}55` : 'none',
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 30, color: hovered ? pkg.textOnBg : pkg.color, marginBottom: 6 }}>{pkg.icon}</span>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: hovered ? pkg.textOnBg : '#fff', marginBottom: 2 }}>{pkg.name}</div>
                        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: hovered ? pkg.textOnBg : pkg.color, lineHeight: 1.1, marginBottom: 4 }}>{pkg.price}₾</div>
                        <div style={{ fontSize: '0.7rem', color: hovered ? `${pkg.textOnBg}bb` : 'rgba(255,255,255,0.4)', marginBottom: 10 }}>{pkg.duration}</div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {pkg.features.map((f, fi) => (
                            <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: hovered ? `${pkg.textOnBg}cc` : 'rgba(255,255,255,0.5)' }}>
                              <span className="material-symbols-rounded" style={{ fontSize: 12, color: hovered ? pkg.textOnBg : pkg.color, flexShrink: 0 }}>check</span>
                              {f}
                            </div>
                          ))}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStep('form')}
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'none', color:'rgba(255,255,255,0.45)', fontSize:'0.84rem', cursor:'pointer', padding:0, marginTop:4 }}
              >
                <span className="material-symbols-rounded" style={{ fontSize:17 }}>arrow_back</span>
                ფორმაზე დაბრუნება
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CreateVacancy;
