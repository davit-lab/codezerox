import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useCreateMarketplaceProject, useUpdateMarketplaceProject, useMarketplaceProject } from "@/hooks/useMarketplace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TECH_OPTIONS = [
  'React','Next.js','Vue','Angular','Svelte','Node.js','Express',
  'Django','FastAPI','Laravel','Spring Boot','Flutter','React Native',
  'TypeScript','JavaScript','Python','PHP','Swift','Kotlin','Go',
  'Rust','C#','.NET','Tailwind CSS','Bootstrap','PostgreSQL','MongoDB',
  'MySQL','Redis','GraphQL','Docker',
];

const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <div className="cv-section">
    <div className="cv-section-header">
      <span className="cv-section-icon"><span className="material-symbols-rounded">{icon}</span></span>
      <h2 className="cv-section-title">{title}</h2>
    </div>
    {children}
  </div>
);

const CreateProject = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!editId;
  const isReturningPaid = searchParams.get('paid') === '1';

  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const createProject = useCreateMarketplaceProject();
  const updateProject = useUpdateMarketplaceProject();
  const { data: existing } = useMarketplaceProject(editId || '');

  // Step: 'form' | 'payment'
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const autoFired = useRef(false);

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [previewUrl, setPreviewUrl] = useState(existing?.preview_url || '');
  const [price, setPrice] = useState(existing?.price != null ? String(existing.price) : '');
  const [negotiable, setNegotiable] = useState(existing?.price_negotiable || false);
  const [multiSale, setMultiSale] = useState(existing?.is_multi_sale || false);
  const [techStack, setTechStack] = useState<string[]>(existing?.tech_stack || []);
  const [customTech, setCustomTech] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) return null;
  if (!user) { navigate('/auth'); return null; }

  const toggleTech = (t: string) => {
    setTechStack(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const addCustomTech = () => {
    const t = customTech.trim();
    if (t && !techStack.includes(t)) { setTechStack(prev => [...prev, t]); setCustomTech(''); }
  };

  // Build form data object for saving
  const buildFormData = () => ({
    title, description, previewUrl, price, negotiable, multiSale, techStack,
    // Note: Files can't be saved to sessionStorage - they'll need to be re-selected
    // But we'll warn the user about this
  });

  // Handle form validation and go to payment step
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('სათაური სავალდებულოა'); return; }
    if (!previewUrl.trim()) { toast.error('ლაივ პრევიუ URL სავალდებულოა'); return; }
    if (!isEdit && !zipFile) { toast.error('კოდის ZIP ფაილი სავალდებულოა'); return; }
    if (!isEdit && photoFiles.length === 0) { toast.error('მინიმუმ 1 ფოტო სავალდებულოა'); return; }

    if (isEdit) {
      // Edit mode: save directly
      await doUpload();
      return;
    }

    // New project: save draft and go to payment
    // Note: Files can't be serialized, so we keep them in state
    // and warn user not to refresh
    sessionStorage.setItem('project_form_draft', JSON.stringify(buildFormData()));
    setStep('payment');
    setTimeout(() => document.getElementById('proj-payment-card')?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  // Core upload function
  const doUpload = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const photoPaths: string[] = isEdit ? (existing?.photos || []) : [];

      if (photoFiles.length > 0) {
        for (const f of photoFiles) {
          const ext = f.name.split('.').pop();
          const path = `${user.id}/marketplace-photos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from('project-images').upload(path, f);
          if (error) throw error;
          photoPaths.push(path);
        }
      }

      let zipPath = isEdit ? (existing?.zip_path || null) : null;
      if (zipFile) {
        const ext = zipFile.name.split('.').pop();
        const path = `${user.id}/marketplace-code/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('project-images').upload(path, zipFile);
        if (error) throw error;
        zipPath = path;
      }

      const payload = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        tech_stack: techStack,
        price: negotiable ? null : (price !== '' ? parseFloat(price) : 0),
        price_negotiable: negotiable,
        is_multi_sale: multiSale,
        preview_url: previewUrl.trim(),
        zip_path: zipPath,
        photos: photoPaths,
        status: 'active',
      };

      if (isEdit && editId) {
        await updateProject.mutateAsync({ id: editId, ...payload });
        toast.success('პროექტი განახლდა!');
      } else {
        await createProject.mutateAsync(payload as any);
        toast.success('პროექტი გამოქვეყნდა!');
      }
      sessionStorage.removeItem('project_form_draft');
      navigate('/projects');
    } catch (err: any) {
      toast.error(`შეცდომა: ${err?.message || 'უცნობი შეცდომა'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle returning from payment
  useEffect(() => {
    if (isEdit || !isReturningPaid || autoFired.current) return;
    if (!user) return;
    const raw = sessionStorage.getItem('project_form_draft');
    if (!raw) { navigate('/projects/create'); return; }
    autoFired.current = true;
    try {
      const saved = JSON.parse(raw);
      setTitle(saved.title || '');
      setDescription(saved.description || '');
      setPreviewUrl(saved.previewUrl || '');
      setPrice(saved.price || '');
      setNegotiable(saved.negotiable || false);
      setMultiSale(saved.multiSale || false);
      setTechStack(saved.techStack || []);
      // Files must be re-selected by user
      toast.info('გთხოვთ თავიდან აირჩიოთ ფოტოები და ZIP ფაილი', { duration: 5000 });
      setStep('form');
    } catch { navigate('/projects/create'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ paddingTop: 36, paddingBottom: 80 }}>

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <button
                onClick={() => navigate('/projects')}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}
              >
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <div>
                <h1 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', lineHeight: 1.2 }}>
                  {isEdit ? 'პროექტის რედაქტირება' : 'პროექტის ატვირთვა'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem', marginTop: 3 }}>
                  {isEdit ? 'შეცვალე ინფორმაცია' : 'შეავსე ყველა ველი და ატვირთე კოდი'}
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit}>

              {/* Basic Info */}
              <Section icon="info" title="ძირითადი ინფო">
                <div className="cv-field">
                  <label className="cv-label">პროექტის სახელი <span className="cv-required">*</span></label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="მაგ: E-Commerce React App" className="cv-input" />
                </div>
                <div className="cv-field">
                  <label className="cv-label">აღწერა</label>
                  <textarea
                    rows={4} value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="პროექტის დეტალური აღწერა — ფუნქციონალი, ტექნოლოგიები, რა პრობლემას წყვეტს..."
                    className="cv-input cv-textarea"
                  />
                </div>
                <div className="cv-field">
                  <label className="cv-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16, color: 'var(--gold)' }}>open_in_new</span>
                    ლაივ პრევიუ URL <span className="cv-required">*</span>
                  </label>
                  <input
                    required value={previewUrl} onChange={e => setPreviewUrl(e.target.value)}
                    placeholder="https://my-project.netlify.app"
                    className="cv-input"
                  />
                  <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.76rem', marginTop: 5 }}>
                    Netlify / Vercel / GitHub Pages / ნებისმიერი hosting — პროექტი უნდა იყოს deploy-ირებული
                  </p>
                </div>
              </Section>

              {/* Price */}
              <Section icon="payments" title="ფასი">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                  <input
                    type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', userSelect: 'none' }}>შეთანხმებით (ფასი განისაზღვრება პირდაპირ)</span>
                </label>
                {!negotiable && (
                  <div className="cv-field">
                    <label className="cv-label">ფასი ლარში — 0 = უფასო</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number" min={0} step={0.01}
                        value={price} onChange={e => setPrice(e.target.value)}
                        placeholder="0"
                        className="cv-input"
                        style={{ paddingRight: 44 }}
                      />
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', fontWeight: 800, fontSize: '1rem' }}>₾</span>
                    </div>
                  </div>
                )}
                {/* Multi-sale option */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox" checked={multiSale} onChange={e => setMultiSale(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'rgba(168,85,247,0.9)', cursor: 'pointer' }}
                  />
                  <span style={{ userSelect: 'none' }}>
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>მრავალჯერადი გაყიდვა</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginLeft: 8 }}>— პოსტი არ წაიშლება მიღების დადასტურების შემდეგ</span>
                  </span>
                </label>
              </Section>

              {/* Tech Stack */}
              <Section icon="code" title="ტექნოლოგიები">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                  {TECH_OPTIONS.map(t => (
                    <button
                      key={t} type="button" onClick={() => toggleTech(t)}
                      style={{
                        padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.79rem',
                        border: `1px solid ${techStack.includes(t) ? 'rgba(212,175,55,0.55)' : 'rgba(255,255,255,0.1)'}`,
                        background: techStack.includes(t) ? 'rgba(212,175,55,0.13)' : 'rgba(255,255,255,0.04)',
                        color: techStack.includes(t) ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.12s',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={customTech} onChange={e => setCustomTech(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTech(); } }}
                    placeholder="სხვა ტექნოლოგია..."
                    className="cv-input" style={{ flex: 1 }}
                  />
                  <button type="button" onClick={addCustomTech} className="btn btn-ghost" style={{ flexShrink: 0, padding: '0 16px' }}>
                    <span className="material-symbols-rounded">add</span>
                  </button>
                </div>
                {techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {techStack.map(t => (
                      <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--gold)', fontSize: '0.79rem' }}>
                        {t}
                        <button type="button" onClick={() => toggleTech(t)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              {/* Photos */}
              <Section icon="photo_library" title={`ფოტოები / სქრინშოტები${!isEdit ? ' *' : ''}`}>
                <input
                  type="file" accept="image/*" multiple
                  onChange={e => setPhotoFiles(Array.from(e.target.files || []))}
                  className="cv-input"
                />
                {isEdit && existing?.photos && existing.photos.length > 0 && photoFiles.length === 0 && (
                  <p style={{ color: 'rgba(52,211,153,0.8)', fontSize: '0.78rem', marginTop: 5 }}>
                    ✓ {existing.photos.length} ფოტო უკვე ატვირთულია — ახლის ატვირთვა დაამატებს
                  </p>
                )}
                {photoFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {photoFiles.map((f, i) => (
                      <div key={i} style={{ width: 80, height: 58, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Code ZIP */}
              <Section icon="folder_zip" title={`კოდის ფაილი (ZIP)${!isEdit ? ' *' : ''}`}>
                <input
                  type="file" accept=".zip,.tar,.tar.gz,.rar"
                  onChange={e => setZipFile(e.target.files?.[0] || null)}
                  className="cv-input"
                />
                {isEdit && existing?.zip_path && !zipFile && (
                  <p style={{ color: 'rgba(52,211,153,0.8)', fontSize: '0.78rem', marginTop: 5 }}>
                    ✓ სორს კოდი უკვე ატვირთულია — ახლის ატვირთვა გამოანაცვლებს
                  </p>
                )}
                <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.76rem', marginTop: 5 }}>
                  მთლიანი სორს კოდი ZIP-ში. მყიდველი ჩამოტვირთავს შეთანხმების შემდეგ.
                </p>
                {zipFile && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(52,211,153,0.85)', fontSize: '0.81rem' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>check_circle</span>
                    {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(1)} MB)
                  </div>
                )}
              </Section>

              {/* Submit */}
              {step === 'form' && (
                <button type="submit" disabled={submitting} className="cv-submit-btn">
                  <span className="material-symbols-rounded">{isEdit ? 'save' : 'arrow_forward'}</span>
                  {isEdit ? 'შენახვა' : 'გაგრძელება — გადახდა'}
                </button>
              )}
            </form>

            {/* Payment Step */}
            {step === 'payment' && !isEdit && (
              <div id="proj-payment-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, padding: '32px 28px', marginTop: 20 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: 16 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#D4AF37' }}>payments</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>პროექტის ატვირთვა</h2>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', maxWidth: 320, margin: '0 auto' }}>განცხადების გამოსაქვეყნებლად საჭიროა გადახდა</p>
                </div>

                <div style={{ background: 'rgba(26,26,46,0.5)', border: '2px solid #D4AF37', borderRadius: 16, padding: '24px 20px', marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>ატვირთვის ღირებულება</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#D4AF37', lineHeight: 1 }}>10 ₾</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>ერთჯერადი გადახდა</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    onClick={() => navigate('/package-checkout?package=project&type=project')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '14px 24px', borderRadius: 12, background: '#D4AF37', color: '#1A1A2E',
                      fontSize: '1rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-rounded">lock</span>
                    გადახდაზე გადასვლა
                  </button>
                  <button
                    onClick={() => setStep('form')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '12px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-rounded">arrow_back</span>
                    უკან
                  </button>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 16 }}>
                  ⚠️ გთხოვთ ამ გვერდიდან არ გახვიდეთ — ფოტოები და ZIP ფაილი თავიდან მოგიწეთ არჩევა
                </p>
              </div>
            )}

            {/* Post-payment: show re-upload notice and submit */}
            {isReturningPaid && step === 'form' && !isEdit && (
              <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 14, padding: '20px 24px', marginTop: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span className="material-symbols-rounded" style={{ color: 'rgba(52,211,153,0.9)', fontSize: 24 }}>check_circle</span>
                  <span style={{ fontWeight: 700, color: 'rgba(52,211,153,0.9)' }}>გადახდა წარმატებულია!</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                  გთხოვთ თავიდან აირჩიოთ ფოტოები და ZIP ფაილი, შემდეგ დააჭირეთ "გამოქვეყნებას"
                </p>
                <button
                  onClick={doUpload}
                  disabled={submitting || !zipFile || photoFiles.length === 0}
                  className="cv-submit-btn"
                  style={{ opacity: (!zipFile || photoFiles.length === 0) ? 0.5 : 1 }}
                >
                  <span className="material-symbols-rounded">{submitting ? 'hourglass_top' : 'cloud_upload'}</span>
                  {submitting ? 'ატვირთვა...' : 'პროექტის გამოქვეყნება'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateProject;
