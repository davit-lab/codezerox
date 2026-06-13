import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import {
  useMarketplaceProject, useDeleteMarketplaceProject,
  useSalesByProject, useMyAccessForProject,
  useSearchUserByEmail, useGrantAccess, useConfirmSale,
  useSendWarning,
  FoundUser, MarketplaceSale
} from "@/hooks/useMarketplace";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const getPhotoUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
};

const formatPrice = (price: number | null, negotiable: boolean) => {
  if (negotiable || price === null) return 'შეთანხმებით';
  if (price === 0) return 'უფასო';
  return `${price} ₾`;
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { data: project, isLoading } = useMarketplaceProject(id!);
  const deleteProject = useDeleteMarketplaceProject();
  const sendWarning = useSendWarning();
  const [showWarnPanel, setShowWarnPanel] = useState(false);
  const [warnMsg, setWarnMsg] = useState('');

  const { data: sales = [] } = useSalesByProject(id!);
  const { data: myAccess } = useMyAccessForProject(id!);
  const searchUser = useSearchUserByEmail();
  const grantAccess = useGrantAccess();
  const confirmSale = useConfirmSale();

  const [activePhoto, setActivePhoto] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showGrantPanel, setShowGrantPanel] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchDone, setSearchDone] = useState(false);

  useEffect(() => {
    if (id) {
      (async () => { try { await supabase.rpc('increment_project_views', { project_id: id } as any); } catch {} })();
    }
  }, [id]);

  const handleDownload = async () => {
    if (!project?.zip_path) { toast.error('ფაილი არ არის'); return; }
    const { data, error } = await supabase.storage.from('project-images').createSignedUrl(project.zip_path, 3600);
    if (error) { toast.error('ჩამოტვირთვა ვერ მოხდა'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const handleSearchUser = async () => {
    if (!emailInput.trim()) return;
    setSearchDone(false);
    setFoundUser(null);
    try {
      const result = await searchUser.mutateAsync(emailInput.trim());
      setFoundUser(result);
      setSearchDone(true);
      if (!result) toast.error('მომხმარებელი ვერ მოიძებნა');
    } catch {
      toast.error('ძიება ვერ მოხდა');
    }
  };

  const handleGrantAccess = async () => {
    if (!foundUser || !id) return;
    try {
      await grantAccess.mutateAsync({ projectId: id, buyerId: foundUser.user_id });
      toast.success(`${foundUser.full_name || foundUser.email || foundUser.user_id}-ს წვდომა მიენიჭა!`);
      setFoundUser(null);
      setEmailInput('');
      setSearchDone(false);
    } catch (err: any) {
      toast.error(err?.message || 'შეცდომა წვდომის მინიჭებისას');
    }
  };

  const handleConfirm = async (saleId: string) => {
    if (!confirm('დაადასტურებ მიღებას? ' + (!project?.is_multi_sale ? 'პოსტი ავტომატურად წაიშლება.' : 'პოსტი გააგრძელებს გაყიდვას.'))) return;
    try {
      await confirmSale.mutateAsync(saleId);
      toast.success('მიღება დადასტურდა!');
      if (!project?.is_multi_sale) navigate('/projects');
    } catch {
      toast.error('შეცდომა');
    }
  };

  const handleDelete = async () => {
    if (!confirm('პროექტი წაიშლება. გააგრძელებ?')) return;
    try {
      await deleteProject.mutateAsync(id!);
      toast.success('პროექტი წაიშალა');
      navigate('/projects');
    } catch {
      toast.error('შეცდომა წაშლისას');
    }
  };

  const handleSendWarning = async () => {
    if (!warnMsg.trim() || !project) return;
    try {
      await sendWarning.mutateAsync({ userId: project.user_id, message: warnMsg.trim() });
      toast.success('გაფრთხილება გაიგზავნა');
      setWarnMsg('');
      setShowWarnPanel(false);
    } catch {
      toast.error('შეცდომა გაგზავნისას');
    }
  };

  if (isLoading) {
    return (
      <>
        <Atmosphere /><Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--gold)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Atmosphere /><Header />
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'rgba(255,255,255,0.35)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 64 }}>error</span>
          <p style={{ marginTop: 16, fontSize: '1rem' }}>პროექტი ვერ მოიძებნა</p>
          <Link to="/projects" className="btn btn-gold" style={{ marginTop: 24 }}>პროექტები</Link>
        </div>
      </>
    );
  }

  const photos = (project.photos || []).map(getPhotoUrl);
  const isOwner = user?.id === project.user_id;
  const canManage = isOwner || isAdmin;
  const priceLabel = formatPrice(project.price, project.price_negotiable);
  const isFree = !project.price_negotiable && (project.price === 0);
  const isPaid = !project.price_negotiable && project.price !== null && project.price > 0;
  const profile = null;
  const hasAccess = !!myAccess;
  const alreadyConfirmed = myAccess?.status === 'confirmed';

  return (
    <>
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container" style={{ maxWidth: 1080, paddingTop: 28, paddingBottom: 80 }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <button
              onClick={() => navigate('/projects')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.88rem' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
              პროექტები
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {isOwner && (
                <Link to={`/projects/edit/${project.id}`} className="btn btn-ghost btn-sm">
                  <span className="material-symbols-rounded">edit</span>
                  რედაქტირება
                </Link>
              )}
              {canManage && (
                <button onClick={handleDelete} className="btn btn-danger btn-sm">
                  <span className="material-symbols-rounded">delete</span>
                </button>
              )}
              {isAdmin && !isOwner && (
                <button
                  onClick={() => setShowWarnPanel(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.4)', color: 'rgba(251,146,60,0.9)' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>warning</span>
                  გაფრთხილება
                </button>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>

            {/* LEFT */}
            <div>
              {/* Gallery */}
              {photos.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', aspectRatio: '16/9' }}>
                    <img src={photos[activePhoto]} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {photos.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {photos.map((p, i) => (
                        <button
                          key={i} onClick={() => setActivePhoto(i)}
                          style={{ width: 62, height: 46, padding: 0, border: `2px solid ${i === activePhoto ? 'var(--gold)' : 'transparent'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        >
                          <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title + tech */}
              <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
                {project.title}
              </h1>

              {(project.tech_stack || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {(project.tech_stack || []).map((t: string) => (
                    <span key={t} style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: '0.79rem' }}>{t}</span>
                  ))}
                </div>
              )}

              {project.description && (
                <p style={{ color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: 28, whiteSpace: 'pre-wrap' }}>
                  {project.description}
                </p>
              )}

              {/* Seller: Grant Access Panel */}
              {isOwner && (
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => setShowGrantPanel(v => !v)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 18px', borderRadius: showGrantPanel ? '14px 14px 0 0' : 14,
                      background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)',
                      color: 'var(--gold)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>key</span>
                      წვდომის მინიჭება ({sales.length})
                    </span>
                    <span className="material-symbols-rounded" style={{ fontSize: 18, transition: 'transform 0.2s', transform: showGrantPanel ? 'rotate(180deg)' : '' }}>expand_more</span>
                  </button>

                  {showGrantPanel && (
                    <div style={{ border: '1px solid rgba(212,175,55,0.2)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: 18, background: 'rgba(255,255,255,0.02)' }}>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginBottom: 14 }}>
                        მყიდველის Email-ით მოძებნე და წვდომა მიანიჭე — ჩამოტვირთვის ბმული ავტომატურად გაეხსნება.
                      </p>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        <input
                          value={emailInput}
                          onChange={e => { setEmailInput(e.target.value); setSearchDone(false); setFoundUser(null); }}
                          onKeyDown={e => e.key === 'Enter' && handleSearchUser()}
                          placeholder="მყიდველის Email..."
                          className="cv-input"
                          style={{ flex: 1, fontSize: '0.85rem' }}
                        />
                        <button
                          onClick={handleSearchUser}
                          disabled={searchUser.isPending}
                          className="btn btn-ghost"
                          style={{ flexShrink: 0 }}
                        >
                          <span className="material-symbols-rounded">{searchUser.isPending ? 'hourglass_top' : 'search'}</span>
                        </button>
                      </div>

                      {searchDone && !foundUser && (
                        <p style={{ color: 'rgba(255,100,100,0.8)', fontSize: '0.82rem', marginBottom: 12 }}>
                          ❌ ამ Email-ით მომხმარებელი ვერ მოიძებნა
                        </p>
                      )}

                      {foundUser && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span className="material-symbols-rounded" style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>person</span>
                            </div>
                            <div>
                              <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{foundUser.full_name || foundUser.email || '—'}</p>
                              {foundUser.email && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.74rem' }}>{foundUser.email}</p>}
                            </div>
                          </div>
                          <button
                            onClick={handleGrantAccess}
                            disabled={grantAccess.isPending}
                            className="btn btn-gold"
                            style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                          >
                            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>key</span>
                            {grantAccess.isPending ? 'იგზავნება...' : 'წვდომის მინიჭება'}
                          </button>
                        </div>
                      )}

                      {/* Sales list */}
                      {sales.length > 0 && (
                        <div>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.73rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>მინიჭებული წვდომები</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {sales.map((s: MarketplaceSale) => (
                              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                                  {(s as any).buyer_profile?.full_name || (s as any).buyer_profile?.email || s.buyer_id.slice(0, 8)}
                                </span>
                                <span style={{
                                  fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                                  background: s.status === 'confirmed' ? 'rgba(52,211,153,0.15)' : 'rgba(212,175,55,0.12)',
                                  color: s.status === 'confirmed' ? 'rgba(52,211,153,0.9)' : 'var(--gold)',
                                  border: `1px solid ${s.status === 'confirmed' ? 'rgba(52,211,153,0.25)' : 'rgba(212,175,55,0.25)'}`,
                                }}>
                                  {s.status === 'confirmed' ? '✓ დადასტურდა' : 'წვდომა მინიჭებული'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Admin: download any ZIP */}
              {isAdmin && !isOwner && project.zip_path && (
                <div style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(139,92,246,0.9)', fontWeight: 700, fontSize: '0.88rem' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 17 }}>admin_panel_settings</span>
                      ადმინის წვდომა
                    </div>
                    <button onClick={handleDownload} className="btn btn-ghost btn-sm">
                      <span className="material-symbols-rounded">download</span>
                      კოდი (ZIP)
                    </button>
                  </div>
                </div>
              )}

              {/* Admin: warn panel */}
              {isAdmin && !isOwner && showWarnPanel && (
                <div style={{ marginBottom: 20, padding: '16px 18px', background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 14 }}>
                  <p style={{ color: 'rgba(251,146,60,0.9)', fontWeight: 700, fontSize: '0.88rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>warning</span>
                    გაფრთხილება მომხმარებელს
                  </p>
                  <textarea
                    value={warnMsg}
                    onChange={e => setWarnMsg(e.target.value)}
                    placeholder="გაფრთხილების ტექსტი..."
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 10, color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={handleSendWarning}
                      disabled={!warnMsg.trim() || sendWarning.isPending}
                      style={{ padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.83rem', background: 'rgba(251,146,60,0.85)', color: '#fff', border: 'none' }}
                    >
                      {sendWarning.isPending ? 'იგზავნება...' : 'გაგზავნა'}
                    </button>
                    <button onClick={() => setShowWarnPanel(false)} style={{ padding: '8px 14px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem' }}>გაუქმება</button>
                  </div>
                </div>
              )}

              {/* Buyer: has access panel */}
              {!isOwner && hasAccess && (
                <div style={{ marginBottom: 20, padding: '16px 18px', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700, color: 'rgba(52,211,153,0.9)', fontSize: '0.9rem' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>check_circle</span>
                    წვდომა გაქვს — ჩამოტვირთე კოდი
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={handleDownload} className="btn btn-gold" style={{ flex: '1 1 auto' }}>
                      <span className="material-symbols-rounded">download</span>
                      ZIP ჩამოტვირთვა
                    </button>
                    {!alreadyConfirmed && (
                      <button
                        onClick={() => handleConfirm(myAccess!.id)}
                        disabled={confirmSale.isPending}
                        style={{
                          flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: 'rgba(52,211,153,0.9)',
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>task_alt</span>
                        {confirmSale.isPending ? 'იგზავნება...' : 'მიღება დადასტურება'}
                      </button>
                    )}
                  </div>
                  {alreadyConfirmed && (
                    <p style={{ color: 'rgba(52,211,153,0.7)', fontSize: '0.78rem', marginTop: 8 }}>✓ მიღება უკვე დადასტურებული გაქვს</p>
                  )}
                  {!alreadyConfirmed && (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 8 }}>
                      {project.is_multi_sale
                        ? 'მიღების დადასტურებისას პოსტი გაყიდვაში დარჩება (მრავალჯერადი)'
                        : 'მიღების დადასტურებისას პოსტი ავტომატურად წაიშლება'}
                    </p>
                  )}
                </div>
              )}

              {/* Live Preview Panel */}
              <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                {/* Preview header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: 'rgba(255,255,255,0.04)', borderBottom: showPreview ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'var(--gold)' }}>play_circle</span>
                    ლაივ პრევიუ
                    {showPreview && previewLoading && (
                      <span className="material-symbols-rounded" style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <a
                      href={project.preview_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 14 }}>open_in_new</span>
                      ახალ ჩანართში
                    </a>
                    <button
                      onClick={() => { setShowPreview(v => !v); if (!showPreview) setPreviewLoading(true); }}
                      style={{
                        padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.81rem', fontWeight: 700,
                        background: showPreview ? 'rgba(255,255,255,0.06)' : 'rgba(212,175,55,0.13)',
                        border: `1px solid ${showPreview ? 'rgba(255,255,255,0.12)' : 'rgba(212,175,55,0.4)'}`,
                        color: showPreview ? 'rgba(255,255,255,0.5)' : 'var(--gold)',
                      }}
                    >
                      {showPreview ? 'დახურვა' : 'გაშვება'}
                    </button>
                  </div>
                </div>

                {/* iframe */}
                {showPreview && (
                  <div style={{ height: 520, position: 'relative', background: '#fff' }}>
                    <iframe
                      src={project.preview_url}
                      title={project.title}
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock"
                      loading="lazy"
                      onLoad={() => setPreviewLoading(false)}
                    />
                  </div>
                )}

                {!showPreview && (
                  <div
                    style={{ padding: '32px 18px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                    onClick={() => { setShowPreview(true); setPreviewLoading(true); }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 40, color: 'rgba(212,175,55,0.5)', display: 'block', marginBottom: 8 }}>play_circle</span>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>დააჭირე პრევიუს სანახავად</p>
                    <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.75rem', marginTop: 4 }}>{project.preview_url}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{ position: 'sticky', top: 88 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 22 }}>

                {/* Price */}
                <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{
                    fontSize: '2.2rem', fontWeight: 900,
                    color: isPaid ? 'var(--gold)' : project.price_negotiable ? 'rgba(168,85,247,0.9)' : 'rgba(52,211,153,0.9)',
                    letterSpacing: '-0.5px',
                  }}>
                    {priceLabel}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.76rem', marginTop: 4 }}>
                    {isFree ? 'უფასოდ ჩამოტვირთვა' : isPaid ? 'გამყიდველთან შეთანხმება' : 'ფასი განიხილება პირდაპირ'}
                  </p>
                </div>

                {/* Multi-sale badge */}
                {project.is_multi_sale && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '5px 10px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 8 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 14, color: 'rgba(168,85,247,0.8)' }}>repeat</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(168,85,247,0.8)', fontWeight: 600 }}>მრავალჯერადი გაყიდვა</span>
                  </div>
                )}

                {/* CTA Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
                  {isFree && project.zip_path && !hasAccess && (
                    <button onClick={handleDownload} className="btn btn-gold" style={{ width: '100%' }}>
                      <span className="material-symbols-rounded">download</span>
                      კოდის ჩამოტვირთვა
                    </button>
                  )}
                  {!isOwner && user && !hasAccess && (
                    <Link
                      to={`/chat?user=${project.user_id}`}
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                    >
                      <span className="material-symbols-rounded">chat</span>
                      გამყიდველს მიწერა
                    </Link>
                  )}
                  {!user && (
                    <Link to="/auth" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                      <span className="material-symbols-rounded">login</span>
                      შესვლა / კონტაქტი
                    </Link>
                  )}
                  {isPaid && !isOwner && user && !hasAccess && (
                    <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.73rem', textAlign: 'center' }}>
                      📩 გამყიდველს მიწერ → ფასზე თანხმდები → გამყიდველი Email-ით გაძლევს წვდომას
                    </p>
                  )}
                </div>

                {/* Author info */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.73rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>გამყიდველი</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 19, color: 'rgba(255,255,255,0.35)' }}>person</span>
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontSize: '0.87rem', fontWeight: 700 }}>
                        {'გამყიდველი'}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 14, fontSize: '0.77rem', color: 'rgba(255,255,255,0.35)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 14 }}>visibility</span>
                      {project.views} ნახვა
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 14 }}>schedule</span>
                      {new Date(project.created_at).toLocaleDateString('ka-GE')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProjectDetail;
