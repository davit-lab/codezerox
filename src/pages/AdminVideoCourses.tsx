import { useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  useAllVideoCourses,
  useVideoCourseSections,
  useCourseLectures,
  useVideoAssignments,
  useAllVideoEnrollments,
  useUpsertVideoCourse,
  useDeleteVideoCourse,
  useUpsertVideoSection,
  useDeleteVideoSection,
  useUpsertVideoLecture,
  useDeleteVideoLecture,
  useUpsertVideoAssignment,
  useDeleteVideoAssignment,
  useGrantVideoEnrollment,
  uploadVideoFile,
  VideoCourse,
  VideoCourseSection,
  VideoLecture,
  VideoAssignment,
} from "@/hooks/useVideoCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label style={{ marginBottom: '4px', display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</Label>
    {children}
  </div>
);

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px', background: 'transparent', border: 'none',
      borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
      color: active ? 'var(--gold-light)' : 'var(--text-muted)',
      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'color 0.15s',
    }}
  >{children}</button>
);

// ─── Course form defaults ─────────────────────────────────────────────────────
const emptyCourse: Partial<VideoCourse> = {
  title: '', slug: '', description: '', short_description: '',
  cover_url: '', category: '', difficulty: 'beginner',
  price_gel: 0, is_active: false, sort_order: 0,
};

// ─── Section + Lecture + Assignment editor ────────────────────────────────────
const SectionsEditor = ({ courseId }: { courseId: string }) => {
  const { data: sections = [] } = useVideoCourseSections(courseId);
  const { data: allLectures = [] } = useCourseLectures(courseId);
  const upsertSection = useUpsertVideoSection();
  const deleteSection = useDeleteVideoSection();
  const [editSec, setEditSec] = useState<any | null>(null);
  const [expandedSec, setExpandedSec] = useState<string | null>(null);

  const saveSec = async () => {
    if (!editSec?.title) { toast.error('სათაური სავალდებულოა'); return; }
    try {
      await upsertSection.mutateAsync({ ...editSec, course_id: courseId });
      toast.success('სექცია შენახულია');
      setEditSec(null);
    } catch (e: any) { toast.error(e?.message); }
  };

  return (
    <div>
      <Button size="sm" onClick={() => setEditSec({ title: '', sort_order: sections.length, course_id: courseId })}>
        + ახალი სექცია
      </Button>

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map(sec => {
          const secLectures = allLectures.filter(l => l.section_id === sec.id);
          return (
            <div key={sec.id} style={{
              border: '1px solid var(--border-subtle)', borderRadius: '10px',
              background: 'var(--bg-card)', overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--gold)' }}>folder</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sec.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({secLectures.length} ლექცია)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button size="sm" variant="outline"
                    onClick={() => setExpandedSec(expandedSec === sec.id ? null : sec.id)}>
                    {expandedSec === sec.id ? 'დახურვა' : 'ლექციები'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditSec(sec)}>რედ.</Button>
                  <Button size="sm" variant="outline"
                    onClick={async () => {
                      if (!confirm('სექცია და ყველა ლექცია წაიშლება?')) return;
                      try { await deleteSection.mutateAsync({ id: sec.id, course_id: courseId }); toast.success('წაშლილია'); }
                      catch (e: any) { toast.error(e?.message); }
                    }}>წაშლა</Button>
                </div>
              </div>
              {expandedSec === sec.id && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
                  <LecturesEditor sectionId={sec.id} courseId={courseId} lectures={secLectures} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!editSec} onOpenChange={o => !o && setEditSec(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>სექცია</DialogTitle></DialogHeader>
          {editSec && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="სათაური *">
                <Input value={editSec.title ?? ''} onChange={e => setEditSec({ ...editSec, title: e.target.value })} />
              </Field>
              <Field label="რიგი">
                <Input type="number" value={editSec.sort_order ?? 0} onChange={e => setEditSec({ ...editSec, sort_order: parseInt(e.target.value) || 0 })} />
              </Field>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setEditSec(null)}>გაუქმება</Button>
                <Button onClick={saveSec} disabled={upsertSection.isPending}>შენახვა</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LecturesEditor = ({
  sectionId, courseId, lectures,
}: { sectionId: string; courseId: string; lectures: VideoLecture[] }) => {
  const upsertLecture = useUpsertVideoLecture();
  const deleteLecture = useDeleteVideoLecture();
  const [editLec, setEditLec] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [expandedLec, setExpandedLec] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveLec = async () => {
    if (!editLec?.title) { toast.error('სათაური სავალდებულოა'); return; }
    try {
      await upsertLecture.mutateAsync({ ...editLec, section_id: sectionId, course_id: courseId });
      toast.success('ლექცია შენახულია');
      setEditLec(null);
      setUploadProgress(null);
    } catch (e: any) { toast.error(e?.message); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editLec) return;
    if (!file.type.startsWith('video/')) { toast.error('მხოლოდ ვიდეო ფაილი'); return; }
    if (file.size > 500 * 1024 * 1024) { toast.error('ფაილი მაქსიმუმ 500MB'); return; }

    setUploadProgress('იტვირთება...');
    try {
      const { path } = await uploadVideoFile(file, courseId, editLec.title || 'lecture');
      setEditLec((prev: any) => ({ ...prev, video_url: null, video_storage_path: path }));
      setUploadProgress('✓ ატვირთულია');
      toast.success('ვიდეო ატვირთულია');
    } catch (e: any) {
      toast.error('ვიდეოს ატვირთვა ვერ მოხერხდა: ' + e?.message);
      setUploadProgress(null);
    }
  };

  return (
    <div>
      <Button size="sm" variant="outline"
        onClick={() => setEditLec({ title: '', description: '', sort_order: lectures.length, is_free_preview: false, duration_seconds: 0 })}>
        + ახალი ლექცია
      </Button>

      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {lectures.map((lec, idx) => (
          <div key={lec.id} style={{
            border: '1px solid var(--border-subtle)', borderRadius: '8px',
            background: 'var(--bg-elevated)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span className="material-symbols-rounded" style={{
                  fontSize: '16px',
                  color: lec.video_url ? 'var(--gold)' : 'var(--text-muted)',
                }}>
                  {lec.video_url ? 'play_circle' : 'video_file'}
                </span>
                <span style={{ fontSize: '0.87rem', color: 'var(--text-primary)', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {idx + 1}. {lec.title}
                </span>
                {lec.is_free_preview && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', whiteSpace: 'nowrap' }}>
                    უფასო
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                <Button size="sm" variant="outline"
                  onClick={() => setExpandedLec(expandedLec === lec.id ? null : lec.id)}>
                  {expandedLec === lec.id ? '▲' : 'დავალებები'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setEditLec({ ...lec });
                  setUploadProgress(lec.video_url ? '✓ ვიდეო ატვირთულია' : null);
                }}>რედ.</Button>
                <Button size="sm" variant="outline"
                  onClick={async () => {
                    if (!confirm('ლექცია წაიშლება?')) return;
                    try {
                      await deleteLecture.mutateAsync({ id: lec.id, course_id: courseId, section_id: sectionId });
                      toast.success('წაშლილია');
                    } catch (e: any) { toast.error(e?.message); }
                  }}>×</Button>
              </div>
            </div>
            {expandedLec === lec.id && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '10px 14px' }}>
                <AssignmentsEditor lectureId={lec.id} courseId={courseId} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!editLec} onOpenChange={o => { if (!o) { setEditLec(null); setUploadProgress(null); } }}>
        <DialogContent style={{ maxWidth: '560px' }}>
          <DialogHeader><DialogTitle>ლექცია</DialogTitle></DialogHeader>
          {editLec && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="სათაური *">
                <Input value={editLec.title ?? ''} onChange={e => setEditLec({ ...editLec, title: e.target.value })} />
              </Field>
              <Field label="აღწერა">
                <Textarea rows={3} value={editLec.description ?? ''} onChange={e => setEditLec({ ...editLec, description: e.target.value })} />
              </Field>

              {/* Video upload */}
              <Field label="ვიდეო (MP4)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '16px', marginRight: '4px' }}>upload_file</span>
                      MP4 ატვირთვა
                    </Button>
                    {uploadProgress && (
                      <span style={{ fontSize: '0.82rem', color: uploadProgress.startsWith('✓') ? '#4ade80' : 'var(--text-muted)' }}>
                        {uploadProgress}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                      placeholder="ან ვიდეოს URL (YouTube, CDN...)"
                      value={editLec.video_url ?? ''}
                      onChange={e => setEditLec({ ...editLec, video_url: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                  {editLec.video_url && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      {editLec.video_url}
                    </div>
                  )}
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="ხანგრძლივობა (წამი)">
                  <Input type="number" value={editLec.duration_seconds ?? 0}
                    onChange={e => setEditLec({ ...editLec, duration_seconds: parseInt(e.target.value) || 0 })} />
                </Field>
                <Field label="რიგი">
                  <Input type="number" value={editLec.sort_order ?? 0}
                    onChange={e => setEditLec({ ...editLec, sort_order: parseInt(e.target.value) || 0 })} />
                </Field>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch
                  checked={!!editLec.is_free_preview}
                  onCheckedChange={v => setEditLec({ ...editLec, is_free_preview: v })}
                />
                <Label>უფასო გადახედვა (ყველა ნახავს)</Label>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => { setEditLec(null); setUploadProgress(null); }}>გაუქმება</Button>
                <Button onClick={saveLec} disabled={upsertLecture.isPending}>შენახვა</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AssignmentsEditor = ({ lectureId, courseId }: { lectureId: string; courseId: string }) => {
  const { data: assignments = [] } = useVideoAssignments(lectureId);
  const upsert = useUpsertVideoAssignment();
  const del = useDeleteVideoAssignment();
  const [editing, setEditing] = useState<any | null>(null);

  const save = async () => {
    if (!editing.title || !editing.description) { toast.error('სათაური და აღწერა სავალდებულოა'); return; }
    try {
      await upsert.mutateAsync({ ...editing, lecture_id: lectureId, course_id: courseId });
      toast.success('დავალება შენახულია');
      setEditing(null);
    } catch (e: any) { toast.error(e?.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          დავალებები ({assignments.length})
        </span>
        <Button size="sm" variant="outline" onClick={() => setEditing({ title: '', description: '', sort_order: assignments.length })}>
          + დავალება
        </Button>
      </div>

      {assignments.map((a, i) => (
        <div key={a.id} style={{
          padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {i + 1}. {a.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {a.description.slice(0, 80)}{a.description.length > 80 ? '...' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <Button size="sm" variant="outline" onClick={() => setEditing(a)}>რედ.</Button>
            <Button size="sm" variant="outline"
              onClick={async () => {
                if (!confirm('წავშალო?')) return;
                try { await del.mutateAsync({ id: a.id, lecture_id: lectureId }); toast.success('წაშლილია'); }
                catch (e: any) { toast.error(e?.message); }
              }}>×</Button>
          </div>
        </div>
      ))}

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>დავალება</DialogTitle></DialogHeader>
          {editing && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="სათაური *">
                <Input value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <Field label="დავალების ტექსტი *">
                <Textarea rows={5} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })}
                  placeholder="დავალების ინსტრუქცია, მოთხოვნები, მინიშნებები..." />
              </Field>
              <Field label="რიგი">
                <Input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
              </Field>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setEditing(null)}>გაუქმება</Button>
                <Button onClick={save} disabled={upsert.isPending}>შენახვა</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Enrollments Tab ──────────────────────────────────────────────────────────
const EnrollmentsTab = () => {
  const { data: courses = [] } = useAllVideoCourses();
  const { data: enrollments = [] } = useAllVideoEnrollments();
  const grantEnrollment = useGrantVideoEnrollment();
  const [form, setForm] = useState({ user_id: '', course_id: '', expires_at: '' });

  const grant = async () => {
    if (!form.user_id || !form.course_id) { toast.error('User ID და კურსი სავალდებულოა'); return; }
    try {
      await grantEnrollment.mutateAsync({
        user_id: form.user_id,
        course_id: form.course_id,
        expires_at: form.expires_at || null,
      });
      toast.success('წვდომა მინიჭებულია');
      setForm({ user_id: '', course_id: '', expires_at: '' });
    } catch (e: any) { toast.error(e?.message); }
  };

  return (
    <div>
      <div style={{
        padding: '20px', background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)', borderRadius: '12px', marginBottom: '24px',
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          წვდომის მინიჭება
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <Field label="User ID">
            <Input value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} placeholder="UUID..." />
          </Field>
          <Field label="კურსი">
            <select
              value={form.course_id}
              onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
            >
              <option value="">— აირჩიე —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <Field label="ვადა (სურვ.)">
            <Input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
          </Field>
          <Button onClick={grant} disabled={grantEnrollment.isPending}>მინიჭება</Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {enrollments.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            ჩარიცხვები ჯერ არ არის
          </div>
        )}
        {enrollments.map((e: any) => (
          <div key={e.id} style={{
            padding: '12px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)', borderRadius: '10px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {e.user_id.slice(0, 8)}...
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                კურსი: {e.course_id.slice(0, 8)}... · ჩარ: {new Date(e.enrolled_at).toLocaleDateString('ka')}
                {e.expires_at && ` · ვადა: ${new Date(e.expires_at).toLocaleDateString('ka')}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const AdminVideoCourses = () => {
  const { isAdmin, isLoading } = useAuth();
  const { data: courses = [], isLoading: loadingCourses } = useAllVideoCourses();
  const upsertCourse = useUpsertVideoCourse();
  const deleteCourse = useDeleteVideoCourse();

  const [editing, setEditing] = useState<Partial<VideoCourse> | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [tab, setTab] = useState<'courses' | 'enrollments'>('courses');

  if (isLoading) return <div style={{ padding: '80px', textAlign: 'center' }}>იტვირთება...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title || !editing.slug) {
      toast.error('სათაური და slug სავალდებულოა');
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
    if (!confirm('კურსი ყველა შიგთავსთან ერთად წაიშლება. გამარტივება?')) return;
    try {
      await deleteCourse.mutateAsync(id);
      toast.success('წაშლილია');
    } catch (e: any) {
      toast.error(e?.message ?? 'შეცდომა');
    }
  };

  return (
    <AdminLayout title="ვიდეო კურსები" titleIcon="smart_display">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <TabButton active={tab === 'courses'} onClick={() => setTab('courses')}>კურსები</TabButton>
        <TabButton active={tab === 'enrollments'} onClick={() => setTab('enrollments')}>ჩარიცხვები</TabButton>
      </div>

      {tab === 'courses' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Button onClick={() => setEditing({ ...emptyCourse })}>+ ახალი კურსი</Button>
          </div>

          {loadingCourses ? (
            <div>იტვირთება...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courses.map(c => (
                <div key={c.id} style={{
                  padding: '16px', background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)', borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.title}</h3>
                        {!c.is_active && (
                          <span style={{ fontSize: '0.68rem', padding: '1px 7px', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                            არааქტიური
                          </span>
                        )}
                        {c.price_gel > 0 ? (
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold)' }}>{c.price_gel}₾</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>უფასო</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        /{c.slug} · {c.category || 'კატ. არ არის'} · {c.difficulty}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button variant="outline" size="sm"
                        onClick={() => setActiveCourseId(activeCourseId === c.id ? null : c.id)}>
                        {activeCourseId === c.id ? 'დახურვა' : 'სექციები / ლექციები'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(c)}>რედ.</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)}>წაშლა</Button>
                    </div>
                  </div>

                  {activeCourseId === c.id && (
                    <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
                      <SectionsEditor courseId={c.id} />
                    </div>
                  )}
                </div>
              ))}
              {courses.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  ვიდეო კურსები ჯერ არ დამატებულა
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'enrollments' && <EnrollmentsTab />}

      {/* Course edit/create dialog */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent style={{ maxWidth: '680px', maxHeight: '90vh', overflow: 'auto' }}>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'კურსის რედაქტირება' : 'ახალი ვიდეო კურსი'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Field label="სათაური *">
                <Input value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Slug * (URL-ში)">
                  <Input
                    value={editing.slug ?? ''}
                    onChange={e => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="python-basics"
                  />
                </Field>
                <Field label="კატეგორია">
                  <Input value={editing.category ?? ''} onChange={e => setEditing({ ...editing, category: e.target.value })}
                    placeholder="პროგრამირება, DevOps..." />
                </Field>
              </div>

              <Field label="მოკლე აღწერა">
                <Textarea rows={2} value={editing.short_description ?? ''} onChange={e => setEditing({ ...editing, short_description: e.target.value })} />
              </Field>
              <Field label="სრული აღწერა">
                <Textarea rows={5} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <Field label="სირთულე">
                  <select
                    value={editing.difficulty ?? 'beginner'}
                    onChange={e => setEditing({ ...editing, difficulty: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                  >
                    <option value="beginner">დამწყები</option>
                    <option value="intermediate">საშუალო</option>
                    <option value="advanced">მოწინავე</option>
                  </select>
                </Field>
                <Field label="ფასი (₾)">
                  <Input type="number" step="0.01" value={editing.price_gel ?? 0}
                    onChange={e => setEditing({ ...editing, price_gel: parseFloat(e.target.value) || 0 })} />
                </Field>
                <Field label="რიგი">
                  <Input type="number" value={editing.sort_order ?? 0}
                    onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                </Field>
              </div>

              <Field label="ყდის სურათი (URL)">
                <Input value={editing.cover_url ?? ''} onChange={e => setEditing({ ...editing, cover_url: e.target.value })}
                  placeholder="https://..." />
              </Field>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Switch checked={editing.is_active ?? false} onCheckedChange={v => setEditing({ ...editing, is_active: v })} />
                <Label>აქტიური (ჩანს მომხმარებლებისთვის)</Label>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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

export default AdminVideoCourses;
