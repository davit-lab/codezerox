import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  useAllMentoringCourses,
  useUpsertMentoringCourse,
  useDeleteMentoringCourse,
  useMentoringPackages,
  useMentoringSyllabus,
  useMentoringFaq,
  useUpsertMentoringPackage,
  useDeleteMentoringPackage,
  useUpsertMentoringSyllabus,
  useDeleteMentoringSyllabus,
  useUpsertMentoringFaq,
  useDeleteMentoringFaq,
  useAllMentoringRegistrations,
  useUpdateMentoringRegistrationStatus,
  type MentoringCourse,
} from "@/hooks/useMentoring";
import MentoringHubManager from "@/components/admin/MentoringHubManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const emptyCourse: Partial<MentoringCourse> = {
  title: "",
  slug: "",
  language: "",
  short_description: "",
  description: "",
  duration_weeks: 0,
  duration_hours: 0,
  prerequisites: "",
  mentor_name: "",
  mentor_photo_url: "",
  mentor_bio: "",
  mentor_linkedin: "",
  cover_url: "",
  is_active: false,
  sort_order: 0,
};

const AdminMentoring = () => {
  const { user, isAdmin, isMentor, isLoading: loading } = useAuth();
  const { data: allCourses = [], isLoading } = useAllMentoringCourses();
  const upsertCourse = useUpsertMentoringCourse();
  const deleteCourse = useDeleteMentoringCourse();

  // Mentors only see courses they own
  const courses = isAdmin
    ? allCourses
    : allCourses.filter(c => (c as any).mentor_user_id === user?.id);

  const [editing, setEditing] = useState<Partial<MentoringCourse> | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [tab, setTab] = useState<'courses' | 'registrations'>('courses');

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}>იტვირთება...</div>;
  if (!isAdmin && !isMentor) return <Navigate to="/" replace />;

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title || !editing.slug || !editing.language || !editing.mentor_name) {
      toast.error('აუცილებელი ველები: სათაური, slug, ენა, მენტორის სახელი');
      return;
    }
    try {
      await upsertCourse.mutateAsync(editing);
      toast.success('შენახულია');
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message ?? 'შეცდომა');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('წავშალო კურსი ყველა პაკეტთან/სილაბუსთან/რეგისტრაციასთან ერთად?')) return;
    try {
      await deleteCourse.mutateAsync(id);
      toast.success('წაშლილია');
    } catch (e: any) {
      toast.error(e?.message ?? 'შეცდომა');
    }
  };

  return (
    <AdminLayout title={isAdmin ? "მენტორინგი" : "ჩემი კურსები"} titleIcon="psychology">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <TabButton active={tab === 'courses'} onClick={() => setTab('courses')}>კურსები</TabButton>
        {isAdmin && <TabButton active={tab === 'registrations'} onClick={() => setTab('registrations')}>რეგისტრაციები</TabButton>}
      </div>

      {tab === 'courses' && (
        <>
          {isAdmin && (
            <div style={{ marginBottom: '20px' }}>
              <Button onClick={() => setEditing({ ...emptyCourse })}>+ ახალი კურსი</Button>
            </div>
          )}

          {isLoading ? (
            <div>იტვირთება...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.map(c => (
                <div
                  key={c.id}
                  style={{
                    padding: '16px', background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)', borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.title}</h3>
                        {!c.is_active && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                            არააქტიური
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {c.language} · /{c.slug} · მენტორი: {c.mentor_name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="outline" size="sm" onClick={() => setActiveCourseId(activeCourseId === c.id ? null : c.id)}>
                        {activeCourseId === c.id ? 'დახურვა' : 'შიგთავსი'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(c)}>რედაქტ.</Button>
                      {isAdmin && <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)}>წაშლა</Button>}
                    </div>
                  </div>

                  {activeCourseId === c.id && <CourseChildEditor courseId={c.id} />}
                </div>
              ))}
              {courses.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  {isAdmin ? 'ჯერ არცერთი კურსი არ დამატებულა' : 'თქვენ ჯერ არ ხართ მინიჭებული არცერთ კურსზე'}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'registrations' && isAdmin && <RegistrationsTab />}

      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent style={{ maxWidth: '720px', maxHeight: '90vh', overflow: 'auto' }}>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'კურსის რედაქტირება' : 'ახალი კურსი'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="სათაური *">
                <Input value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Slug * (URL-ში)"><Input value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></Field>
                <Field label="ენა / ტექნოლოგია *"><Input value={editing.language ?? ''} onChange={e => setEditing({ ...editing, language: e.target.value })} placeholder="Python, JavaScript..." /></Field>
              </div>
              <Field label="მოკლე აღწერა">
                <Textarea rows={2} value={editing.short_description ?? ''} onChange={e => setEditing({ ...editing, short_description: e.target.value })} />
              </Field>
              <Field label="სრული აღწერა">
                <Textarea rows={5} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </Field>
              <Field label="წინასწარი მოთხოვნები">
                <Textarea rows={3} value={editing.prerequisites ?? ''} onChange={e => setEditing({ ...editing, prerequisites: e.target.value })} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <Field label="ხანგრძლივობა (კვირები)"><Input type="number" value={editing.duration_weeks ?? 0} onChange={e => setEditing({ ...editing, duration_weeks: parseInt(e.target.value) || 0 })} /></Field>
                <Field label="საათები"><Input type="number" value={editing.duration_hours ?? 0} onChange={e => setEditing({ ...editing, duration_hours: parseInt(e.target.value) || 0 })} /></Field>
                <Field label="რიგი"><Input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></Field>
              </div>
              <Field label="ყდის სურათი (URL)"><Input value={editing.cover_url ?? ''} onChange={e => setEditing({ ...editing, cover_url: e.target.value })} /></Field>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>მენტორი</div>

              <Field label="მენტორის სახელი *"><Input value={editing.mentor_name ?? ''} onChange={e => setEditing({ ...editing, mentor_name: e.target.value })} /></Field>
              <Field label="მენტორის ფოტო (URL)"><Input value={editing.mentor_photo_url ?? ''} onChange={e => setEditing({ ...editing, mentor_photo_url: e.target.value })} /></Field>
              <Field label="მენტორის ბიოგრაფია"><Textarea rows={3} value={editing.mentor_bio ?? ''} onChange={e => setEditing({ ...editing, mentor_bio: e.target.value })} /></Field>
              <Field label="LinkedIn URL"><Input value={editing.mentor_linkedin ?? ''} onChange={e => setEditing({ ...editing, mentor_linkedin: e.target.value })} /></Field>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <Switch checked={editing.is_active ?? false} onCheckedChange={v => setEditing({ ...editing, is_active: v })} />
                <Label>აქტიური (ჩანს მომხმარებლებისთვის)</Label>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setEditing(null)}>გაუქმება</Button>
                <Button onClick={handleSave} disabled={upsertCourse.isPending}>
                  {upsertCourse.isPending ? 'ინახება...' : 'შენახვა'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label style={{ marginBottom: '4px', display: 'block' }}>{label}</Label>
    {children}
  </div>
);

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px', background: 'transparent',
      border: 'none', borderBottom: active ? '2px solid var(--text-primary)' : '2px solid transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
      cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
    }}
  >{children}</button>
);

// ===== Child editor (packages, syllabus, faq) =====
const CourseChildEditor = ({ courseId }: { courseId: string }) => {
  const [section, setSection] = useState<'packages' | 'syllabus' | 'faq'>('packages');
  return (
    <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <TabButton active={section === 'packages'} onClick={() => setSection('packages')}>პაკეტები</TabButton>
        <TabButton active={section === 'syllabus'} onClick={() => setSection('syllabus')}>სილაბუსი</TabButton>
        <TabButton active={section === 'faq'} onClick={() => setSection('faq')}>FAQ</TabButton>
      </div>
      {section === 'packages' && <PackagesEditor courseId={courseId} />}
      {section === 'syllabus' && <SyllabusEditor courseId={courseId} />}
      {section === 'faq' && <FaqEditor courseId={courseId} />}
    </div>
  );
};

const PackagesEditor = ({ courseId }: { courseId: string }) => {
  const { data: packages = [] } = useMentoringPackages(courseId);
  const upsert = useUpsertMentoringPackage();
  const del = useDeleteMentoringPackage();
  const [editing, setEditing] = useState<any | null>(null);

  const save = async () => {
    if (!editing.name) { toast.error('სახელი სავალდებულოა'); return; }
    const features = (editing.features_text ?? '').split('\n').map((s: string) => s.trim()).filter(Boolean);
    const payload = {
      ...(editing.id ? { id: editing.id } : {}),
      course_id: courseId,
      name: editing.name,
      description: editing.description ?? null,
      price_gel: parseFloat(editing.price_gel) || 0,
      features,
      sort_order: parseInt(editing.sort_order) || 0,
      is_recommended: !!editing.is_recommended,
    };
    try { await upsert.mutateAsync(payload); toast.success('შენახულია'); setEditing(null); }
    catch (e: any) { toast.error(e?.message); }
  };

  return (
    <>
      <Button size="sm" onClick={() => setEditing({ features_text: '', sort_order: packages.length, price_gel: 0 })}>+ ახალი პაკეტი</Button>
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {packages.map(p => (
          <div key={p.id} style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name} — {p.price_gel}₾ {p.is_recommended && '★'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(p.features ?? []).length} დანამატი</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button size="sm" variant="outline" onClick={() => setEditing({ ...p, features_text: (p.features ?? []).join('\n') })}>რედ.</Button>
              <Button size="sm" variant="outline" onClick={() => del.mutate({ id: p.id, course_id: courseId })}>წაშლა</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>პაკეტი</DialogTitle></DialogHeader>
          {editing && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="სახელი"><Input value={editing.name ?? ''} onChange={e => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="აღწერა"><Textarea rows={2} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="ფასი (₾)"><Input type="number" step="0.01" value={editing.price_gel ?? 0} onChange={e => setEditing({ ...editing, price_gel: e.target.value })} /></Field>
                <Field label="რიგი"><Input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: e.target.value })} /></Field>
              </div>
              <Field label="დანამატები (თითო ხაზზე ერთი)">
                <Textarea rows={5} value={editing.features_text ?? ''} onChange={e => setEditing({ ...editing, features_text: e.target.value })} placeholder="1-1 ვიდეო ზარები&#10;კოდის რევიუ&#10;სერტიფიკატი" />
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch checked={!!editing.is_recommended} onCheckedChange={v => setEditing({ ...editing, is_recommended: v })} />
                <Label>რეკომენდირებული</Label>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setEditing(null)}>გაუქმება</Button>
                <Button onClick={save}>შენახვა</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const SyllabusEditor = ({ courseId }: { courseId: string }) => {
  const { data: items = [] } = useMentoringSyllabus(courseId);
  const upsert = useUpsertMentoringSyllabus();
  const del = useDeleteMentoringSyllabus();
  const [editing, setEditing] = useState<any | null>(null);
  const save = async () => {
    if (!editing.title) { toast.error('სათაური სავალდებულოა'); return; }
    const payload = {
      ...(editing.id ? { id: editing.id } : {}),
      course_id: courseId,
      title: editing.title,
      description: editing.description ?? null,
      sort_order: parseInt(editing.sort_order) || 0,
    };
    try { await upsert.mutateAsync(payload); setEditing(null); toast.success('შენახულია'); }
    catch (e: any) { toast.error(e?.message); }
  };
  return (
    <>
      <Button size="sm" onClick={() => setEditing({ sort_order: items.length })}>+ თავი</Button>
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(s => (
          <div key={s.id} style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.sort_order + 1}. {s.title}</div>
              {s.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.description}</div>}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button size="sm" variant="outline" onClick={() => setEditing(s)}>რედ.</Button>
              <Button size="sm" variant="outline" onClick={() => del.mutate({ id: s.id, course_id: courseId })}>წაშლა</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>სილაბუსის თავი</DialogTitle></DialogHeader>
          {editing && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="სათაური"><Input value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })} /></Field>
              <Field label="აღწერა"><Textarea rows={3} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></Field>
              <Field label="რიგი"><Input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: e.target.value })} /></Field>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setEditing(null)}>გაუქმება</Button>
                <Button onClick={save}>შენახვა</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const FaqEditor = ({ courseId }: { courseId: string }) => {
  const { data: items = [] } = useMentoringFaq(courseId);
  const upsert = useUpsertMentoringFaq();
  const del = useDeleteMentoringFaq();
  const [editing, setEditing] = useState<any | null>(null);
  const save = async () => {
    if (!editing.question || !editing.answer) { toast.error('კითხვა და პასუხი სავალდებულოა'); return; }
    const payload = {
      ...(editing.id ? { id: editing.id } : {}),
      course_id: courseId,
      question: editing.question,
      answer: editing.answer,
      sort_order: parseInt(editing.sort_order) || 0,
    };
    try { await upsert.mutateAsync(payload); setEditing(null); toast.success('შენახულია'); }
    catch (e: any) { toast.error(e?.message); }
  };
  return (
    <>
      <Button size="sm" onClick={() => setEditing({ sort_order: items.length })}>+ კითხვა</Button>
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(f => (
          <div key={f.id} style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.question}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{f.answer.slice(0, 120)}{f.answer.length > 120 ? '...' : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button size="sm" variant="outline" onClick={() => setEditing(f)}>რედ.</Button>
              <Button size="sm" variant="outline" onClick={() => del.mutate({ id: f.id, course_id: courseId })}>წაშლა</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>FAQ</DialogTitle></DialogHeader>
          {editing && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="კითხვა"><Input value={editing.question ?? ''} onChange={e => setEditing({ ...editing, question: e.target.value })} /></Field>
              <Field label="პასუხი"><Textarea rows={4} value={editing.answer ?? ''} onChange={e => setEditing({ ...editing, answer: e.target.value })} /></Field>
              <Field label="რიგი"><Input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: e.target.value })} /></Field>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setEditing(null)}>გაუქმება</Button>
                <Button onClick={save}>შენახვა</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const RegistrationsTab = () => {
  const { data: regs = [], isLoading } = useAllMentoringRegistrations();
  const update = useUpdateMentoringRegistrationStatus();
  if (isLoading) return <div>იტვირთება...</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {regs.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>რეგისტრაცია არ არის</div>}
      {regs.map((r: any) => (
        <div key={r.id} style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {r.mentoring_courses?.title} — {r.mentoring_packages?.name} ({r.amount_gel}₾)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              user: {r.user_id.slice(0, 8)}... · {new Date(r.created_at).toLocaleString('ka')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>{r.status}</span>
            <select
              value={r.status}
              onChange={e => update.mutate({ id: r.id, status: e.target.value })}
              style={{ padding: '6px 10px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="paid">paid</option>
              <option value="cancelled">cancelled</option>
              <option value="completed">completed</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMentoring;
