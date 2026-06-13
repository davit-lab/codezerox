import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useBankPayment } from '@/hooks/useBankPayment';
import { usePrice } from '@/hooks/usePricing';
import { useSpendCredits } from '@/hooks/useSiteCredits';
import SiteCreditsWidget from '@/components/credits/SiteCreditsWidget';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PKG_META: Record<string, { name: string; color: string; desc: string; priceKey: string; fallback: number }> = {
  basic:      { name: 'ბეისიკი',     color: '#6b7280', desc: '30 დღე, სტანდარტული ჩვენება',          priceKey: 'pkg_basic',           fallback: 1 },
  normal:     { name: 'ნორმალი',     color: '#3b82f6', desc: '45 დღე, CV-ის მიღება, ლურჯი ბეჯი',       priceKey: 'pkg_normal',          fallback: 3 },
  premium:    { name: 'პრემი',       color: '#f59e0b', desc: '60 დღე, სიის ზედა ნაწილი, Featured',     priceKey: 'pkg_premium',         fallback: 5 },
  depremium:  { name: 'დე-პრემი',   color: '#a855f7', desc: '90 დღე, პირველი ადგილი, VIP ბეჯი',       priceKey: 'pkg_depremium',       fallback: 10 },
  freelancer: { name: 'ფრილანსერი',  color: '#a855f7', desc: 'ყოველთვიური გამოწერა',                  priceKey: 'freelancer_monthly', fallback: 10 },
  project:    { name: 'პროექტის ატვირთვა', color: '#D4AF37', desc: 'ერთჯერადი — Marketplace-ზე ატვირთვა', priceKey: 'marketplace_upload', fallback: 10 },
};

const PackageCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const { activeProviders, hasBankProviders, initiatePayment, processing: bankProcessing, PROVIDER_LABELS } = useBankPayment();
  const spendCredits = useSpendCredits();
  const pkgId    = searchParams.get('package') || '';
  const type     = searchParams.get('type') || 'vacancy';
  const isProject  = type === 'project' || pkgId === 'project';
  const isFL       = type === 'freelancer' || pkgId === 'freelancer';
  const itemKey    = isProject ? 'project' : isFL ? 'freelancer' : pkgId;
  const meta       = PKG_META[itemKey];
  const dynPrice   = usePrice(meta?.priceKey ?? '', meta?.fallback ?? 0);
  const pkg        = meta ? { ...meta, price: dynPrice } : null;

  const [method, setMethod] = useState<'flitt' | 'bog' | 'tbc'>('flitt');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [useCredits, setUseCredits] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState(0);

  if (!user) { navigate('/auth'); return null; }
  if (!pkg)  { navigate('/packages'); return null; }

  const remainingToPay = Math.max(0, pkg.price - (useCredits ? creditsAmount : 0));


  const handleBankPay = async (provider: 'flitt' | 'bog' | 'tbc') => {
    setProcessing(true);
    try {
      // If fully covered by credits, finalize without redirect
      if (remainingToPay <= 0) {
        if (useCredits && creditsAmount > 0) {
          const ok = await spendCredits.mutateAsync({
            amount: creditsAmount,
            reason: `${pkg.name} (${itemKey})`,
            refId: `pkg_${itemKey}_credits_only_${Date.now()}`,
          });
          if (!ok) { toast.error('კრედიტი ვერ ჩამოიჭრა'); setProcessing(false); return; }
        }
        await onSuccess();
        setProcessing(false);
        return;
      }

      const paymentType = isProject ? 'project_upload' : isFL ? 'freelancer_subscription' : 'vacancy_package';
      await initiatePayment(
        provider,
        [{ name: pkg.name, price: remainingToPay, type: paymentType, package_id: itemKey, credits: useCredits ? creditsAmount : 0, pricing_key: pkg.priceKey }],
        undefined,
        useCredits ? creditsAmount : undefined,
      );
    } catch (e: any) {
      toast.error(e.message || 'გადახდა ვერ მოხერხდა');
    } finally {
      setProcessing(false);
    }
  };

  const onSuccess = async () => {
    if (isFL) {
      const now = new Date();
      const expires = new Date(now);
      expires.setDate(expires.getDate() + 30);
      await supabase.from('freelancer_subscriptions').upsert({
        user_id: user!.id,
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
        amount_gel: pkg.price,
      }, { onConflict: 'user_id' });
    }
    setDone(true);
    toast.success('გადახდა წარმატებულია!');
    setTimeout(() => {
      if (isProject) navigate('/projects/create?paid=1');
      else if (isFL) navigate('/freelancer/edit?paid=1');
      else navigate(`/vacancies/create?package=${pkgId}&paid=1`);
    }, 1800);
  };



  if (isAdmin && !done) {
    return (
      <><Atmosphere /><Header />
        <main className="page-content">
          <div className="container" style={{ maxWidth: 480, paddingTop: 60 }}>
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#a855f7', display: 'block', marginBottom: 12 }}>admin_panel_settings</span>
              <div style={{ fontWeight: 900, fontSize: '1.15rem', marginBottom: 8 }}>ადმინი — უფასო წვდომა</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>გადახდა არ არის საჭირო.</div>
              <button
                className="cv-submit-btn"
                style={{ maxWidth: 280, margin: '0 auto' }}
                onClick={onSuccess}
              >
                <span className="material-symbols-rounded">check_circle</span>
                გაგრძელება
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (done) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="page-content">
          <div className="pco-done">
            <div className="pco-done-icon">
              <span className="material-symbols-rounded">check_circle</span>
            </div>
            <h2 className="pco-done-title">გადახდა წარმატებულია!</h2>
            <p className="pco-done-sub">
              {isProject ? 'პროექტის ატვირთვის გვერდზე გადამისამართება...' : isFL ? 'ფრილანსერის გვერდზე გადამისამართება...' : 'ვაკანსიის ფორმაზე გადამისამართება...'}
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Atmosphere /><Header />
      <main className="page-content">
        <div className="pco-wrap">

          {/* Back */}
          <button className="pco-back" onClick={() => navigate('/packages')}>
            <span className="material-symbols-rounded">arrow_back</span>
            უკან
          </button>

          <div className="pco-grid">
            {/* Left — order summary */}
            <div className="pco-summary">
              <h2 className="pco-sum-title">შეკვეთის შეჯამება</h2>

              <div className="pco-sum-card" style={{ borderColor: `${pkg.color}40` }}>
                <div className="pco-sum-stripe" style={{ background: pkg.color }} />
                <div className="pco-sum-pkg-row">
                  <div>
                    <div className="pco-sum-pkg-name" style={{ color: pkg.color }}>{pkg.name}</div>
                    <div className="pco-sum-pkg-desc">{pkg.desc}</div>
                  </div>
                  <div className="pco-sum-pkg-price" style={{ color: pkg.color }}>{pkg.price}₾</div>
                </div>
              </div>

              <div className="mb-3">
                <SiteCreditsWidget
                  total={pkg.price}
                  apply={useCredits}
                  appliedAmount={creditsAmount}
                  onToggle={setUseCredits}
                  onAmountChange={setCreditsAmount}
                />
              </div>

              {useCredits && creditsAmount > 0 && (
                <div className="pco-sum-total-row" style={{ color: '#22c55e' }}>
                  <span>კრედიტი</span>
                  <span>−{creditsAmount.toFixed(2)}₾</span>
                </div>
              )}

              <div className="pco-sum-total-row">
                <span>გადასახდელი</span>
                <span className="pco-sum-total">{remainingToPay.toFixed(2)}₾</span>
              </div>

              <div className="pco-sum-secure">
                <span className="material-symbols-rounded">lock</span>
                უსაფრთხო გადახდა SSL-ით
              </div>
            </div>


            {/* Right — payment form */}
            <div className="pco-form-side">
              <h2 className="pco-form-title">გადახდის მეთოდი</h2>

              {/* Method tabs */}
              <div className="pco-methods">
                {hasBankProviders && activeProviders.includes('flitt') && (
                  <button onClick={() => setMethod('flitt')}
                    className={`pco-method${method === 'flitt' ? ' pco-method-on' : ''}`}>
                    <span className="material-symbols-rounded">credit_card</span>
                    ბარათი (Flitt)
                  </button>
                )}
                {hasBankProviders && activeProviders.includes('bog') && (
                  <button onClick={() => setMethod('bog')}
                    className={`pco-method${method === 'bog' ? ' pco-method-on' : ''}`}>
                    🏦 საქ. ბანკი
                  </button>
                )}
                {hasBankProviders && activeProviders.includes('tbc') && (
                  <button onClick={() => setMethod('tbc')}
                    className={`pco-method${method === 'tbc' ? ' pco-method-on' : ''}`}>
                    🏦 თიბისი
                  </button>
                )}
              </div>

              <div className="pco-bank-wrap">
                <p className="pco-bank-info">
                  <span className="material-symbols-rounded">info</span>
                  {PROVIDER_LABELS[method]}-ის გადახდის გვერდზე გადამისამართდები
                </p>
                <button className="pco-pay-btn" onClick={() => handleBankPay(method)} disabled={bankProcessing || processing}>
                  {bankProcessing
                    ? <><span className="pco-spinner" />გადამისამართება...</>
                    : <><span className="material-symbols-rounded">{remainingToPay <= 0 ? 'check' : 'open_in_new'}</span>{remainingToPay <= 0 ? 'დადასტურება' : `გადახდა — ${remainingToPay.toFixed(2)}₾`}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .pco-wrap { max-width:960px; margin:0 auto; padding:32px 20px 80px; }
        .pco-back { display:flex; align-items:center; gap:6px; background:none; border:none; color:var(--text-muted); font-size:0.88rem; cursor:pointer; padding:0; margin-bottom:28px; transition:color 0.2s; }
        .pco-back:hover { color:var(--text-primary); }
        .pco-back .material-symbols-rounded { font-size:18px; }

        .pco-grid { display:grid; grid-template-columns:1fr 1.4fr; gap:28px; align-items:start; }
        @media(max-width:700px){ .pco-grid { grid-template-columns:1fr; } }

        /* Summary */
        .pco-summary { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; }
        .pco-sum-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:20px; }
        .pco-sum-card { position:relative; border:1.5px solid; border-radius:12px; padding:16px 16px 16px 20px; margin-bottom:20px; overflow:hidden; background:rgba(255,255,255,0.02); }
        .pco-sum-stripe { position:absolute; left:0; top:0; bottom:0; width:4px; }
        .pco-sum-pkg-row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .pco-sum-pkg-name { font-size:1rem; font-weight:800; margin-bottom:3px; }
        .pco-sum-pkg-desc { font-size:0.78rem; color:var(--text-muted); }
        .pco-sum-pkg-price { font-size:1.6rem; font-weight:900; flex-shrink:0; }
        .pco-sum-total-row { display:flex; justify-content:space-between; align-items:baseline; padding:14px 0; border-top:1px solid rgba(255,255,255,0.07); font-size:0.88rem; color:var(--text-muted); }
        .pco-sum-total { font-size:1.4rem; font-weight:900; color:var(--text-primary); }
        .pco-sum-secure { display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-dim); margin-top:12px; }
        .pco-sum-secure .material-symbols-rounded { font-size:15px; color:#22c55e; }

        /* Form side */
        .pco-form-side { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; }
        .pco-form-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:20px; }

        .pco-methods { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
        .pco-method { display:flex; align-items:center; gap:6px; padding:9px 16px; border-radius:9px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:var(--text-muted); font-size:0.84rem; font-weight:600; cursor:pointer; transition:all 0.18s; }
        .pco-method:hover { border-color:rgba(255,255,255,0.2); color:var(--text-primary); }
        .pco-method-on { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); color:var(--text-primary); }
        .pco-method .material-symbols-rounded { font-size:17px; }

        .pco-card-form { display:flex; flex-direction:column; gap:16px; }
        .pco-field { display:flex; flex-direction:column; gap:6px; }
        .pco-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .pco-label { font-size:0.78rem; font-weight:600; color:var(--text-muted); }
        .pco-input-wrap { position:relative; display:flex; align-items:center; }
        .pco-input-icon { position:absolute; left:12px; font-size:17px; color:var(--text-dim); pointer-events:none; }
        .pco-input { width:100%; padding:11px 14px; border-radius:9px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:var(--text-primary); font-size:0.9rem; outline:none; transition:border-color 0.18s; font-family:inherit; }
        .pco-input-wrap .pco-input { padding-left:40px; }
        .pco-input:focus { border-color:rgba(255,255,255,0.25); }
        .pco-card-type { position:absolute; right:12px; font-size:0.7rem; font-weight:800; color:var(--text-muted); letter-spacing:0.05em; }
        .pco-err { font-size:0.78rem; color:#f87171; margin:0; }

        .pco-pay-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:13px; border-radius:11px; background:#7c3aed; border:none; color:#fff; font-size:0.92rem; font-weight:700; cursor:pointer; transition:background 0.2s,transform 0.2s; margin-top:4px; }
        .pco-pay-btn:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); }
        .pco-pay-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .pco-pay-btn .material-symbols-rounded { font-size:18px; }

        .pco-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:pco-spin 0.7s linear infinite; }
        @keyframes pco-spin { to { transform:rotate(360deg); } }

        .pco-bank-wrap { display:flex; flex-direction:column; gap:16px; }
        .pco-bank-info { display:flex; align-items:center; gap:8px; padding:12px; background:rgba(255,255,255,0.04); border-radius:9px; font-size:0.83rem; color:var(--text-muted); margin:0; }
        .pco-bank-info .material-symbols-rounded { font-size:17px; flex-shrink:0; }

        /* Done */
        .pco-done { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; gap:16px; }
        .pco-done-icon .material-symbols-rounded { font-size:72px; color:#22c55e; }
        .pco-done-title { font-size:1.8rem; font-weight:800; color:var(--text-primary); margin:0; }
        .pco-done-sub { font-size:0.95rem; color:var(--text-muted); margin:0; }
      `}</style>
    </>
  );
};

export default PackageCheckout;
