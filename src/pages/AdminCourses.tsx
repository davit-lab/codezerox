import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAllCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useCourseChapters, useCreateChapter, useUpdateChapter, useDeleteChapter, Course, CourseChapter } from "@/hooks/useCourses";
import { useAllSubscriptions, useAdminGrantSubscription } from "@/hooks/useCourseSubscription";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminCourses = () => {
  const { data: courses = [], isLoading } = useAllCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const { data: allSubs = [] } = useAllSubscriptions();
  const grantSub = useAdminGrantSubscription();

  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [managingChapters, setManagingChapters] = useState<string | null>(null);
  const [showGrantAccess, setShowGrantAccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", price: 0, monthly_price: 0, difficulty: "beginner",
    duration_hours: 0, total_chapters: 0, cover_url: "", is_published: false,
  });

  const [grantForm, setGrantForm] = useState({ email: "", courseId: "", months: 1 });

  const openCreate = () => {
    setForm({ title: "", description: "", price: 0, monthly_price: 0, difficulty: "beginner", duration_hours: 0, total_chapters: 0, cover_url: "", is_published: false });
    setIsCreating(true);
    setEditingCourse(null);
  };

  const openEdit = (course: Course) => {
    setForm({
      title: course.title, description: course.description || "", price: course.price,
      monthly_price: course.monthly_price || 0,
      difficulty: course.difficulty || "beginner", duration_hours: course.duration_hours || 0,
      total_chapters: course.total_chapters, cover_url: course.cover_url || "", is_published: course.is_published ?? false,
    });
    setEditingCourse(course);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("სათაური აუცილებელია"); return; }
    try {
      if (editingCourse?.id) {
        await updateCourse.mutateAsync({ id: editingCourse.id, ...form });
        toast.success("კურსი განახლდა");
      } else {
        await createCourse.mutateAsync(form);
        toast.success("კურსი შეიქმნა");
      }
      setEditingCourse(null);
      setIsCreating(false);
    } catch { toast.error("შეცდომა"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("წავშალოთ?")) return;
    try { await deleteCourse.mutateAsync(id); toast.success("წაიშალა"); } catch { toast.error("შეცდომა"); }
  };

  const handleGrantAccess = async () => {
    if (!grantForm.email || !grantForm.courseId) { toast.error("შეავსეთ ყველა ველი"); return; }
    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', grantForm.email)
        .single();
      if (profileError || !profile) { toast.error("მომხმარებელი ვერ მოიძებნა"); return; }
      
      await grantSub.mutateAsync({ userId: profile.user_id, courseId: grantForm.courseId, months: grantForm.months });
      toast.success(`წვდომა მინიჭდა ${grantForm.months} თვით`);
      setGrantForm({ email: "", courseId: "", months: 1 });
      setShowGrantAccess(false);
    } catch { toast.error("შეცდომა"); }
  };

  if (managingChapters) {
    return <ChapterManager courseId={managingChapters} onBack={() => setManagingChapters(null)} />;
  }

  return (
    <AdminLayout title="კურსების მართვა">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-muted-foreground text-sm">სულ: {courses.length} კურსი | {allSubs.length} გამოწერა</p>
        <div className="flex gap-2">
          <button onClick={() => setShowGrantAccess(!showGrantAccess)} className="btn btn-outline text-sm">
            <span className="material-symbols-rounded text-sm">person_add</span>
            წვდომის მინიჭება
          </button>
          <button onClick={openCreate} className="btn btn-gold text-sm">
            <span className="material-symbols-rounded text-sm">add</span>
            ახალი კურსი
          </button>
        </div>
      </div>

      {/* Grant access form */}
      {showGrantAccess && (
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-accent/30 p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">წვდომის მინიჭება</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">მომხმარებლის ელ-ფოსტა</label>
              <input className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" placeholder="user@example.com" value={grantForm.email} onChange={e => setGrantForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">კურსი</label>
              <select className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={grantForm.courseId} onChange={e => setGrantForm(f => ({ ...f, courseId: e.target.value }))}>
                <option value="">აირჩიეთ</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">თვეების რაოდენობა</label>
              <input type="number" min={1} max={24} className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={grantForm.months} onChange={e => setGrantForm(f => ({ ...f, months: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleGrantAccess} className="btn btn-gold text-sm" disabled={grantSub.isPending}>მინიჭება</button>
            <button onClick={() => setShowGrantAccess(false)} className="btn btn-outline text-sm">გაუქმება</button>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingCourse) && (
        <div className="mb-8 rounded-2xl border border-white/[0.06] bg-accent/30 p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">{editingCourse?.id ? "კურსის რედაქტირება" : "ახალი კურსი"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">სათაური</label>
              <input className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">თვიური ფასი (₾)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.monthly_price} onChange={e => setForm(f => ({ ...f, monthly_price: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">სირთულე</label>
              <select className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="beginner">დამწყები</option>
                <option value="intermediate">საშუალო</option>
                <option value="advanced">მოწინავე</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">ხანგრძლივობა (საათი)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">თავების რაოდენობა</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.total_chapters} onChange={e => setForm(f => ({ ...f, total_chapters: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">ყდის URL</label>
              <input className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">აღწერა</label>
            <textarea className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
            <span className="text-sm text-foreground">გამოქვეყნებული</span>
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn btn-gold text-sm" disabled={createCourse.isPending || updateCourse.isPending}>შენახვა</button>
            <button onClick={() => { setEditingCourse(null); setIsCreating(false); }} className="btn btn-outline text-sm">გაუქმება</button>
          </div>
        </div>
      )}

      {/* Courses list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-rounded text-4xl text-gold animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const activeSubs = allSubs.filter((s: any) => s.course_id === course.id && new Date(s.expires_at) > new Date());
            return (
              <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-accent/20">
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gold/10 overflow-hidden flex items-center justify-center">
                  {course.cover_url ? (
                    <img src={course.cover_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="material-symbols-rounded text-2xl text-gold/30">school</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">{course.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {course.monthly_price}₾/თვე · {course.total_chapters} თავი · {activeSubs.length} აქტიური გამოწერა · {course.is_published ? 'გამოქვეყნებული' : 'დრაფტი'}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setManagingChapters(course.id)} className="icon-btn" title="თავები">
                    <span className="material-symbols-rounded">list</span>
                  </button>
                  <button onClick={() => openEdit(course)} className="icon-btn" title="რედაქტირება">
                    <span className="material-symbols-rounded">edit</span>
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="icon-btn" title="წაშლა" style={{ color: '#f87171' }}>
                    <span className="material-symbols-rounded">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

// Chapter management sub-component
const ChapterManager = ({ courseId, onBack }: { courseId: string; onBack: () => void }) => {
  const { data: chapters = [], isLoading } = useCourseChapters(courseId);
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();

  const [editing, setEditing] = useState<Partial<CourseChapter> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", content: "", chapter_number: 1,
    content_type: "lesson", code_template: "",
  });

  const openCreate = () => {
    setForm({
      title: "", description: "", content: "", chapter_number: (chapters.length || 0) + 1,
      content_type: "lesson", code_template: "",
    });
    setIsCreating(true);
    setEditing(null);
  };

  const openEdit = (ch: CourseChapter) => {
    setForm({
      title: ch.title, description: ch.description || "", content: ch.content || "",
      chapter_number: ch.chapter_number, content_type: ch.content_type || "lesson",
      code_template: ch.code_template || "",
    });
    setEditing(ch);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("სათაური აუცილებელია"); return; }
    try {
      if (editing?.id) {
        await updateChapter.mutateAsync({ id: editing.id, ...form });
        toast.success("თავი განახლდა");
      } else {
        await createChapter.mutateAsync({ course_id: courseId, ...form });
        toast.success("თავი დაემატა");
      }
      setEditing(null);
      setIsCreating(false);
    } catch { toast.error("შეცდომა"); }
  };

  const handleDeleteCh = async (id: string) => {
    if (!confirm("წავშალოთ?")) return;
    try { await deleteChapter.mutateAsync(id); toast.success("წაიშალა"); } catch { toast.error("შეცდომა"); }
  };

  return (
    <AdminLayout title="თავების მართვა">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-6 text-sm">
        <span className="material-symbols-rounded text-lg">arrow_back</span>
        კურსებზე დაბრუნება
      </button>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">სულ: {chapters.length} თავი</p>
        <button onClick={openCreate} className="btn btn-gold text-sm">
          <span className="material-symbols-rounded text-sm">add</span>
          ახალი თავი
        </button>
      </div>

      {(isCreating || editing) && (
        <div className="mb-8 rounded-2xl border border-white/[0.06] bg-accent/30 p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">{editing?.id ? "თავის რედაქტირება" : "ახალი თავი"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">სათაური</label>
              <input className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">თავის ნომერი</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.chapter_number} onChange={e => setForm(f => ({ ...f, chapter_number: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">აღწერა</label>
            <input className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">კონტენტი (Markdown)</label>
            <textarea className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm font-mono" rows={12} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">კოდის მაგალითი</label>
            <textarea className="w-full px-3 py-2 rounded-lg bg-background border border-white/[0.06] text-foreground text-sm font-mono" rows={4} value={form.code_template} onChange={e => setForm(f => ({ ...f, code_template: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn btn-gold text-sm" disabled={createChapter.isPending || updateChapter.isPending}>შენახვა</button>
            <button onClick={() => { setEditing(null); setIsCreating(false); }} className="btn btn-outline text-sm">გაუქმება</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-rounded text-4xl text-gold animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((ch) => (
            <div key={ch.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-accent/20">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">
                {ch.chapter_number}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{ch.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {ch.content ? `${ch.content.length} სიმბოლო` : 'კონტენტი არ არის'}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(ch)} className="icon-btn" title="რედაქტირება">
                  <span className="material-symbols-rounded">edit</span>
                </button>
                <button onClick={() => handleDeleteCh(ch.id)} className="icon-btn" title="წაშლა" style={{ color: '#f87171' }}>
                  <span className="material-symbols-rounded">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCourses;
