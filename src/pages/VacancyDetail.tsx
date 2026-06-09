import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import { useVacancy, useSendVacancyMessage, useDeleteVacancy } from '@/hooks/useVacancies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const jobTypeLabels: Record<string, string> = {
  full_time: 'სრული განაკვეთი', part_time: 'ნახევარი განაკვეთი',
  remote: 'დისტანციური', hybrid: 'ჰიბრიდული',
};
const experienceLabels: Record<string, string> = {
  junior: 'Junior', mid: 'Middle', senior: 'Senior', lead: 'Lead',
};
const categoryLabels: Record<string, string> = {
  it: 'IT / პროგრამირება', design: 'დიზაინი', marketing: 'მარკეტინგი',
  finance: 'ფინანსები', education: 'განათლება', security: 'კიბერუსაფრთხოება',
  management: 'მენეჯმენტი', other: 'სხვა',
};
const categoryIcons: Record<string, string> = {
  it: 'code', design: 'palette', marketing: 'campaign',
  finance: 'payments', education: 'school', security: 'shield',
  management: 'groups', other: 'work',
};

const VacancyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: vacancy, isLoading } = useVacancy(id || '');
  const sendMessage = useSendVacancyMessage();
  const deleteVacancy = useDeleteVacancy();

  const [showApply, setShowApply] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', message: '' });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const isOwner = user && vacancy && user.id === vacancy.user_id;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !vacancy) return;
    setSending(true);
    try {
      let cvUrl: string | null = null;
      if (cvFile) {
        const ext = cvFile.name.split('.').pop();
        const path = `${user.id}/${vacancy.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('vacancy-cvs').upload(path, cvFile);
        if (uploadError) throw uploadError;
        cvUrl = path;
      }
      await sendMessage.mutateAsync({
        vacancy_id: vacancy.id, sender_id: user.id,
        sender_name: applyForm.name || profile?.full_name || 'უცნობი',
        sender_email: applyForm.email || profile?.email || '',
        message: applyForm.message, cv_url: cvUrl,
      });
      toast.success('შეტყობინება წარმატებით გაიგზავნა!');
      setShowApply(false);
      setApplyForm({ name: '', email: '', message: '' });
      setCvFile(null);
    } catch (err) {
      console.error('Send error:', err);
      toast.error('შეცდომა გაგზავნისას');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!vacancy) return;
    try {
      await deleteVacancy.mutateAsync(vacancy.id);
      toast.success('ვაკანსია წაიშალა');
      navigate('/vacancies');
    } catch {
      toast.error('შეცდომა წაშლისას');
    }
  };

  if (isLoading) {
    return (
      <><Atmosphere /><Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-[3px] border-muted animate-spin border-t-primary" />
        </div>
      </>
    );
  }

  if (!vacancy) {
    return (
      <><Atmosphere /><Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-rounded text-4xl text-muted-foreground/60">error</span>
            </div>
            <p className="text-muted-foreground font-medium mb-3">ვაკანსია ვერ მოიძებნა</p>
            <Link to="/vacancies" className="text-primary hover:underline text-sm font-semibold">← დაბრუნება</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Atmosphere /><Header />
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/vacancies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
            <span className="material-symbols-rounded text-lg">arrow_back</span>
            ვაკანსიები
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-5">
              <div className="relative p-7 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-primary text-2xl">
                      {categoryIcons[vacancy.category] || 'work'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{vacancy.title}</h1>
                    <p className="text-lg text-muted-foreground">{vacancy.company_name}</p>
                  </div>
                  {vacancy.salary_amount && (
                    <div className="text-right shrink-0 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
                      <span className="text-xl font-black text-primary">{vacancy.salary_amount}{vacancy.salary_currency}</span>
                      <p className="text-xs text-primary/70 font-medium">{vacancy.salary_type === 'monthly' ? '/ თვე' : 'სრულად'}</p>
                    </div>
                  )}
                </div>

                {/* Owner actions */}
                {isOwner && (
                  <div className="flex items-center gap-2 mb-6">
                    <Link
                      to={`/vacancies/edit/${vacancy.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <span className="material-symbols-rounded text-base">edit</span>
                      რედაქტირება
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
                    >
                      <span className="material-symbols-rounded text-base">delete</span>
                      წაშლა
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-7">
                  <span className="px-3 py-1.5 rounded-xl text-xs bg-muted/60 text-muted-foreground flex items-center gap-1 font-medium">
                    <span className="material-symbols-rounded text-sm">location_on</span>{vacancy.location}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl text-xs bg-muted/60 text-muted-foreground font-medium">
                    {jobTypeLabels[vacancy.job_type] || vacancy.job_type}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl text-xs bg-muted/60 text-muted-foreground font-medium">
                    {experienceLabels[vacancy.experience_level]}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl text-xs bg-primary/10 text-primary font-semibold">
                    {categoryLabels[vacancy.category] || vacancy.category}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-rounded text-primary text-lg">description</span>
                      აღწერა
                    </h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">{vacancy.description}</p>
                  </div>
                  {vacancy.requirements && (
                    <div>
                      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-rounded text-primary text-lg">checklist</span>
                        მოთხოვნები
                      </h2>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">{vacancy.requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-4">
                <div className="p-6 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 space-y-4">
                  <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-2">საკონტაქტო</h3>
                  {vacancy.contact_email && (
                    <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-muted/30">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-rounded text-primary text-sm">email</span>
                      </div>
                      <span className="text-muted-foreground break-all text-xs">{vacancy.contact_email}</span>
                    </div>
                  )}
                  {vacancy.contact_phone && (
                    <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-muted/30">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-rounded text-primary text-sm">phone</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{vacancy.contact_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-rounded text-primary text-sm">calendar_today</span>
                    </div>
                    <span className="text-muted-foreground text-xs">{new Date(vacancy.created_at).toLocaleDateString('ka-GE')}</span>
                  </div>

                  {!isOwner && user && (
                    <button
                      onClick={() => setShowApply(true)}
                      className="w-full mt-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                    >
                      <span className="material-symbols-rounded">send</span>
                      გამოხმაურება
                    </button>
                  )}
                  {!user && (
                    <Link to="/auth" className="w-full mt-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
                      <span className="material-symbols-rounded">login</span>
                      შედით გამოხმაურებისთვის
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Apply Modal */}
          {showApply && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
              <div className="w-full max-w-lg rounded-3xl bg-card/95 backdrop-blur-xl border border-border/30 p-7 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-rounded text-primary">mail</span>
                    </div>
                    <h2 className="text-xl font-black">გამოხმაურება</h2>
                  </div>
                  <button onClick={() => setShowApply(false)} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <span className="material-symbols-rounded text-lg">close</span>
                  </button>
                </div>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-muted-foreground">სახელი *</label>
                    <input required value={applyForm.name} onChange={e => setApplyForm(p => ({ ...p, name: e.target.value }))} placeholder={profile?.full_name || 'თქვენი სახელი'} className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/30 focus:border-primary/50 focus:outline-none text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-muted-foreground">ელფოსტა *</label>
                    <input required type="email" value={applyForm.email} onChange={e => setApplyForm(p => ({ ...p, email: e.target.value }))} placeholder={profile?.email || 'email@example.com'} className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/30 focus:border-primary/50 focus:outline-none text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-muted-foreground">შეტყობინება *</label>
                    <textarea required rows={4} value={applyForm.message} onChange={e => setApplyForm(p => ({ ...p, message: e.target.value }))} placeholder="მოკლედ აღწერეთ რატომ ხართ შესაფერისი..." className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/30 focus:border-primary/50 focus:outline-none text-sm resize-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-muted-foreground">CV (არასავალდებულო)</label>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files?.[0] || null)} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" />
                  </div>
                  <button type="submit" disabled={sending} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                    <span className="material-symbols-rounded text-lg">{sending ? 'hourglass_top' : 'send'}</span>
                    {sending ? 'იგზავნება...' : 'გაგზავნა'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
              <div className="w-full max-w-sm rounded-3xl bg-card/95 backdrop-blur-xl border border-border/30 p-7 space-y-5 shadow-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                  <span className="material-symbols-rounded text-destructive text-3xl">delete_forever</span>
                </div>
                <h2 className="text-xl font-black">ვაკანსიის წაშლა</h2>
                <p className="text-sm text-muted-foreground">ნამდვილად გსურთ ამ ვაკანსიის წაშლა? ეს მოქმედება ვერ იქნება შეცვლილი.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-muted/50 text-foreground font-semibold hover:bg-muted/70 transition-colors text-sm">
                    გაუქმება
                  </button>
                  <button onClick={handleDelete} disabled={deleteVacancy.isPending} className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 text-sm">
                    {deleteVacancy.isPending ? 'იშლება...' : 'წაშლა'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default VacancyDetail;