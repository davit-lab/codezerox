import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  useHackLabAllLessons,
  useHackLabSettings,
  useAllHackLabSubscriptions,
  useGrantHackLabAccess,
  useRevokeHackLabAccess,
  useUpsertHackLabLesson,
  useDeleteHackLabLesson,
} from "@/hooks/useHackLab";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tab = 'lessons' | 'subscriptions' | 'settings';

const EMPTY_LESSON = {
  title: '', description: '', content: '', module_name: 'Linux & Terminal',
  order_index: 0, difficulty: 'beginner', duration_min: 20,
  is_published: false, is_free: false,
};

const AdminHackLab = () => {
  const { user } = useAuth();
  const { data: lessons = [], isLoading: lessonsLoading } = useHackLabAllLessons();
  const { data: settings } = useHackLabSettings();
  const { data: subscriptions = [] } = useAllHackLabSubscriptions();
  const grantAccess = useGrantHackLabAccess();
  const revokeAccess = useRevokeHackLabAccess();
  const upsertLesson = useUpsertHackLabLesson();
  const deleteLesson = useDeleteHackLabLesson();

  const [tab, setTab] = useState<Tab>('lessons');
  const [editLesson, setEditLesson] = useState<Record<string, unknown> | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantMonths, setGrantMonths] = useState(1);
  const [grantNotes, setGrantNotes] = useState('');

  const handleSaveLesson = async () => {
    if (!editLesson?.title) { toast.error('სათაური სავალდებულოა'); return; }
    try {
      await upsertLesson.mutateAsync(editLesson);
      toast.success('ლექცია შეინახა');
      setShowLessonForm(false);
      setEditLesson(null);
    } catch { toast.error('შეცდომა'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('წაიშალოს?')) return;
    try {
      await deleteLesson.mutateAsync(id);
      toast.success('წაიშალა');
    } catch { toast.error('შეცდომა'); }
  };

  const handleGrantAccess = async () => {
    if (!grantEmail || !user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', grantEmail)
        .single();
      if (!profile) { toast.error('მომხმარებელი ვერ მოიძებნა'); return; }
      await grantAccess.mutateAsync({ userId: profile.user_id, grantedBy: user.id, months: grantMonths, notes: grantNotes });
      toast.success(`წვდომა მიენიჭა (${grantMonths} თვე)`);
      setGrantEmail(''); setGrantNotes('');
    } catch { toast.error('შეცდომა'); }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm('წვდომა გაუქმდეს?')) return;
    try {
      await revokeAccess.mutateAsync(userId);
      toast.success('წვდომა გაუქმდა');
    } catch { toast.error('შეცდომა'); }
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'lessons', label: 'ლექციები', icon: 'school' },
    { id: 'subscriptions', label: 'გამოწერები', icon: 'people' },
    { id: 'settings', label: 'პარამეტრები', icon: 'settings' },
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 0 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              Ethical Hacking Lab
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              {lessons.length} ლექცია · {subscriptions.filter((s: { status: string }) => s.status === 'active').length} აქტიური გამოწერა
            </p>
          </div>
          <Link to="/hack-lab" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            borderRadius: 10, background: 'rgba(95,19,202,0.15)', border: '1px solid rgba(95,19,202,0.3)',
            color: '#7B3FD6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>open_in_new</span>
            გვერდი
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 9, cursor: 'pointer',
              background: tab === t.id ? 'rgba(95,19,202,0.25)' : 'transparent',
              color: tab === t.id ? '#7B3FD6' : 'rgba(255,255,255,0.4)',
              fontWeight: tab === t.id ? 700 : 500, fontSize: '0.85rem',
              border: tab === t.id ? '1px solid rgba(95,19,202,0.3)' : '1px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 15 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* --- LESSONS TAB --- */}
        {tab === 'lessons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => { setEditLesson({ ...EMPTY_LESSON }); setShowLessonForm(true); }} style={{
                padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
                ახალი ლექცია
              </button>
            </div>

            {showLessonForm && editLesson && (
              <div style={{
                background: 'rgba(95,19,202,0.06)', border: '1px solid rgba(95,19,202,0.25)',
                borderRadius: 16, padding: 24, marginBottom: 20,
              }}>
                <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 18, fontSize: '1rem' }}>
                  {editLesson.id ? 'ლექციის რედაქტირება' : 'ახალი ლექცია'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { key: 'title', label: 'სათაური', type: 'text', full: true },
                    { key: 'description', label: 'აღწერა', type: 'text', full: true },
                    { key: 'module_name', label: 'მოდული', type: 'text' },
                    { key: 'order_index', label: 'თანმიმდევრობა', type: 'number' },
                    { key: 'difficulty', label: 'სირთულე', type: 'select', options: ['beginner', 'easy', 'medium', 'hard', 'expert'] },
                    { key: 'duration_min', label: 'ხანგრძლივობა (წთ)', type: 'number' },
                  ].map(f => (
                    <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 5 }}>{f.label}</label>
                      {f.type === 'select' ? (
                        <select
                          value={String(editLesson[f.key] ?? '')}
                          onChange={e => setEditLesson({ ...editLesson, [f.key]: e.target.value })}
                          style={{
                            width: '100%', padding: '9px 12px', borderRadius: 9,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: '0.88rem',
                          }}
                        >
                          {f.options!.map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          value={String(editLesson[f.key] ?? '')}
                          onChange={e => setEditLesson({ ...editLesson, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                          style={{
                            width: '100%', padding: '9px 12px', borderRadius: 9,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box',
                          }}
                        />
                      )}
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 5 }}>კონტენტი (Markdown)</label>
                    <textarea
                      value={String(editLesson.content ?? '')}
                      onChange={e => setEditLesson({ ...editLesson, content: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 9,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={Boolean(editLesson.is_published)} onChange={e => setEditLesson({ ...editLesson, is_published: e.target.checked })} />
                      გამოქვეყნებული
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={Boolean(editLesson.is_free)} onChange={e => setEditLesson({ ...editLesson, is_free: e.target.checked })} />
                      უფასო
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button onClick={handleSaveLesson} disabled={upsertLesson.isPending} style={{
                    padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)',
                    color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                  }}>
                    {upsertLesson.isPending ? 'ინახება...' : 'შენახვა'}
                  </button>
                  <button onClick={() => { setShowLessonForm(false); setEditLesson(null); }} style={{
                    padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.88rem',
                  }}>
                    გაუქმება
                  </button>
                </div>
              </div>
            )}

            {lessonsLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>იტვირთება...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(lessons as { id: string; title: string; module_name: string; difficulty: string; order_index: number; is_published: boolean; is_free: boolean }[]).map(lesson => (
                  <div key={lesson.id} style={{
                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', width: 28, flexShrink: 0 }}>#{lesson.order_index}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: 2 }}>{lesson.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', display: 'flex', gap: 10 }}>
                        <span>{lesson.module_name}</span>
                        <span>{lesson.difficulty}</span>
                      </div>
                    </div>
                    {lesson.is_free && <span style={{ fontSize: '0.68rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>უფასო</span>}
                    <span style={{
                      fontSize: '0.68rem', padding: '2px 7px', borderRadius: 5, fontWeight: 700,
                      background: lesson.is_published ? 'rgba(95,19,202,0.15)' : 'rgba(255,255,255,0.05)',
                      color: lesson.is_published ? '#7B3FD6' : 'rgba(255,255,255,0.3)',
                    }}>
                      {lesson.is_published ? 'გამოქვეყნებული' : 'Draft'}
                    </span>
                    <button onClick={() => { setEditLesson({ ...lesson }); setShowLessonForm(true); }} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4,
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>edit</span>
                    </button>
                    <button onClick={() => handleDelete(lesson.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: 4,
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- SUBSCRIPTIONS TAB --- */}
        {tab === 'subscriptions' && (
          <div>
            {/* Grant access */}
            <div style={{
              background: 'rgba(95,19,202,0.06)', border: '1px solid rgba(95,19,202,0.2)',
              borderRadius: 14, padding: 20, marginBottom: 24,
            }}>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>
                წვდომის მინიჭება
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>ელფოსტა</label>
                  <input
                    type="email" value={grantEmail} onChange={e => setGrantEmail(e.target.value)}
                    placeholder="user@example.com"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 9,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>თვე</label>
                  <select value={grantMonths} onChange={e => setGrantMonths(Number(e.target.value))} style={{
                    padding: '9px 12px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.88rem',
                  }}>
                    {[1, 3, 6, 12].map(m => <option key={m} value={m} style={{ background: '#111' }}>{m} თვე</option>)}
                  </select>
                </div>
                <button onClick={handleGrantAccess} disabled={!grantEmail || grantAccess.isPending} style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)',
                  color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                }}>
                  მინიჭება
                </button>
              </div>
              <input
                type="text" value={grantNotes} onChange={e => setGrantNotes(e.target.value)}
                placeholder="შენიშვნა (სურვილისამებრ)"
                style={{
                  width: '100%', marginTop: 10, padding: '9px 12px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(subscriptions as { user_id: string; status: string; expires_at: string; notes?: string; profiles?: { full_name?: string; email?: string } }[]).map(sub => {
                const isActive = sub.status === 'active' && new Date(sub.expires_at) > new Date();
                return (
                  <div key={sub.user_id} style={{
                    background: 'rgba(255,255,255,0.025)', border: `1px solid ${isActive ? 'rgba(95,19,202,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 12, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                        {sub.profiles?.full_name || sub.profiles?.email || 'მომხმარებელი'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', display: 'flex', gap: 10, marginTop: 2 }}>
                        <span>{sub.profiles?.email}</span>
                        <span>ვადა: {new Date(sub.expires_at).toLocaleDateString('ka-GE')}</span>
                        {sub.notes && <span>· {sub.notes}</span>}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', padding: '3px 9px', borderRadius: 6, fontWeight: 700,
                      background: isActive ? 'rgba(95,19,202,0.15)' : 'rgba(239,68,68,0.1)',
                      color: isActive ? '#7B3FD6' : '#ef4444',
                    }}>
                      {isActive ? 'აქტიური' : 'გაუქმებული'}
                    </span>
                    {isActive && (
                      <button onClick={() => handleRevoke(sub.user_id)} style={{
                        padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        გაუქმება
                      </button>
                    )}
                  </div>
                );
              })}
              {subscriptions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.25)' }}>
                  გამოწერები არ არის
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {tab === 'settings' && (
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 28,
          }}>
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>პარამეტრები</h3>
            {settings ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'ყოველთვიური ფასი (₾)', value: settings.monthly_price_gel },
                  { label: 'მინიმალური ასაკი', value: settings.min_age },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{s.label}</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{s.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>ასაკის ვერიფიკაცია</span>
                  <span style={{ color: settings.age_verification_required ? '#22c55e' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                    {settings.age_verification_required ? 'ჩართული' : 'გამორთული'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>სტატუსი</span>
                  <span style={{ color: settings.is_active ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                    {settings.is_active ? 'აქტიური' : 'გათიშული'}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 8 }}>
                  პარამეტრების შეცვლისთვის გამოიყენე SQL Editor Supabase-ში (hack_lab_settings ცხრილი).
                </p>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 32 }}>
                პარამეტრები არ მოიძებნა — გაუშვი SQL migration.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHackLab;
