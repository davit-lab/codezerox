import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  useAllCyberCategories,
  useAllCyberChallenges,
  useUpsertCyberCategory,
  useDeleteCyberCategory,
  useUpsertCyberChallenge,
  useDeleteCyberChallenge,
  type CyberCategory,
  type CyberChallenge,
} from "@/hooks/useCyberLab";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SimulationBuilder from "@/components/cyberlab/SimulationBuilder";

const emptyCategory: Partial<CyberCategory> = { slug: '', name_ka: '', name_en: '', description_ka: '', icon: '', color: '#00ff41', sort: 0 };
const emptyChallenge: Partial<CyberChallenge> = { slug: '', title_ka: '', title_en: '', story_md: '', difficulty: 'easy', engine: 'static', base_points: 25, status: 'draft', tags: [], price_gel: 0, price_credits: 0, is_free: true };

const AdminCyberLab = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: categories = [], isLoading: catLoading } = useAllCyberCategories();
  const { data: challenges = [], isLoading: chalLoading } = useAllCyberChallenges();
  const upsertCat = useUpsertCyberCategory();
  const deleteCat = useDeleteCyberCategory();
  const upsertChal = useUpsertCyberChallenge();
  const deleteChal = useDeleteCyberChallenge();

  const [tab, setTab] = useState<'categories' | 'challenges'>('categories');
  const [editingCategory, setEditingCategory] = useState<Partial<CyberCategory> | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Partial<CyberChallenge> | null>(null);
  const [simChallenge, setSimChallenge] = useState<Partial<CyberChallenge> | null>(null);

  if (authLoading) return <div style={{ padding: 80, textAlign: 'center' }}>იტვირთება...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    if (!editingCategory.slug || !editingCategory.name_ka) { toast.error('slug და name_ka აუცილებელია'); return; }
    try { await upsertCat.mutateAsync(editingCategory); toast.success('შენახულია'); setEditingCategory(null); }
    catch (e: any) { toast.error(e?.message || 'შეცდომა'); }
  };

  const handleSaveChallenge = async () => {
    if (!editingChallenge) return;
    if (!editingChallenge.slug || !editingChallenge.title_ka) { toast.error('slug და title_ka აუცილებელია'); return; }
    try { await upsertChal.mutateAsync(editingChallenge); toast.success('შენახულია'); setEditingChallenge(null); }
    catch (e: any) { toast.error(e?.message || 'შეცდომა'); }
  };

  return (
    <AdminLayout title="Cyber Lab ადმინი" titleIcon="security">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>კატეგორიები</TabButton>
        <TabButton active={tab === 'challenges'} onClick={() => setTab('challenges')}>თასქები</TabButton>
      </div>

      {tab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>კატეგორიები ({categories.length})</h3>
            <button onClick={() => setEditingCategory({ ...emptyCategory })} className="btn btn-gold" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>დამატება
            </button>
          </div>
          {catLoading ? <p style={{ color: 'var(--text-muted)' }}>იტვირთება...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="material-symbols-rounded" style={{ color: cat.color || '#00ff41' }}>{cat.icon || 'folder'}</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{cat.name_ka}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: 12 }}>{cat.slug}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingCategory(cat)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>რედაქტირება</button>
                    <button onClick={() => { if (confirm('წავშალო?')) deleteCat.mutate(cat.id); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>წაშლა</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'challenges' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>თასქები ({challenges.length})</h3>
            <button onClick={() => setEditingChallenge({ ...emptyChallenge })} className="btn btn-gold" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>დამატება
            </button>
          </div>
          {chalLoading ? <p style={{ color: 'var(--text-muted)' }}>იტვირთება...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {challenges.map(ch => (
                <div key={ch.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    color: ch.difficulty === 'easy' ? '#22c55e' : ch.difficulty === 'medium' ? '#eab308' : ch.difficulty === 'hard' ? '#f97316' : '#ef4444',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 6,
                  }}>{ch.difficulty}</span>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', flex: 1, minWidth: 150 }}>{ch.title_ka}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{ch.engine}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{ch.status}</span>
                  <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                    <button onClick={() => setEditingChallenge(ch)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>რედაქტირება</button>
                    {ch.engine === 'custom' && (
                      <button onClick={() => setSimChallenge(ch)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(0,255,65,0.3)', background: 'transparent', color: '#00ff41', cursor: 'pointer', fontSize: '0.8rem' }}>🛠 სიმულაცია</button>
                    )}
                    <button onClick={() => { if (confirm('წავშალო?')) deleteChal.mutate(ch.id); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>წაშლა</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent style={{ maxWidth: 480, background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader><DialogTitle style={{ color: '#fff' }}>კატეგორია</DialogTitle></DialogHeader>
          {editingCategory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="slug"><Input value={editingCategory.slug || ''} onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })} /></Field>
              <Field label="name_ka"><Input value={editingCategory.name_ka || ''} onChange={e => setEditingCategory({ ...editingCategory, name_ka: e.target.value })} /></Field>
              <Field label="name_en"><Input value={editingCategory.name_en || ''} onChange={e => setEditingCategory({ ...editingCategory, name_en: e.target.value })} /></Field>
              <Field label="description_ka"><Textarea value={editingCategory.description_ka || ''} onChange={e => setEditingCategory({ ...editingCategory, description_ka: e.target.value })} /></Field>
              <Field label="icon"><Input value={editingCategory.icon || ''} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} placeholder="material icon name" /></Field>
              <Field label="color"><Input value={editingCategory.color || ''} onChange={e => setEditingCategory({ ...editingCategory, color: e.target.value })} /></Field>
              <Field label="sort"><Input type="number" value={editingCategory.sort || 0} onChange={e => setEditingCategory({ ...editingCategory, sort: Number(e.target.value) })} /></Field>
              <button onClick={handleSaveCategory} className="btn btn-gold" style={{ marginTop: 8 }}>შენახვა</button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Challenge Dialog */}
      <Dialog open={!!editingChallenge} onOpenChange={() => setEditingChallenge(null)}>
        <DialogContent style={{ maxWidth: 560, background: '#111', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader><DialogTitle style={{ color: '#fff' }}>თასქი</DialogTitle></DialogHeader>
          {editingChallenge && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="slug"><Input value={editingChallenge.slug || ''} onChange={e => setEditingChallenge({ ...editingChallenge, slug: e.target.value })} /></Field>
              <Field label="title_ka"><Input value={editingChallenge.title_ka || ''} onChange={e => setEditingChallenge({ ...editingChallenge, title_ka: e.target.value })} /></Field>
              <Field label="title_en"><Input value={editingChallenge.title_en || ''} onChange={e => setEditingChallenge({ ...editingChallenge, title_en: e.target.value })} /></Field>
              <Field label="category_id">
                <select value={editingChallenge.category_id || ''} onChange={e => setEditingChallenge({ ...editingChallenge, category_id: e.target.value || null })} style={{ width: '100%', padding: 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                  <option value="">— აირჩიე —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_ka}</option>)}
                </select>
              </Field>
              <Field label="story_md"><Textarea value={editingChallenge.story_md || ''} onChange={e => setEditingChallenge({ ...editingChallenge, story_md: e.target.value })} rows={3} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="difficulty">
                  <select value={editingChallenge.difficulty || 'easy'} onChange={e => setEditingChallenge({ ...editingChallenge, difficulty: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    {['easy','medium','hard','insane','flagship'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="engine">
                  <select value={editingChallenge.engine || 'static'} onChange={e => setEditingChallenge({ ...editingChallenge, engine: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    {['static','interactive','quiz','terminal','ai','custom'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="base_points"><Input type="number" value={editingChallenge.base_points || 25} onChange={e => setEditingChallenge({ ...editingChallenge, base_points: Number(e.target.value) })} /></Field>
                <Field label="price_gel (₾)"><Input type="number" value={editingChallenge.price_gel || 0} onChange={e => setEditingChallenge({ ...editingChallenge, price_gel: Number(e.target.value), is_free: Number(e.target.value) === 0 })} /></Field>
                <Field label="price_credits"><Input type="number" value={editingChallenge.price_credits || 0} onChange={e => setEditingChallenge({ ...editingChallenge, price_credits: Number(e.target.value) })} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="is_free">
                  <select value={String(editingChallenge.is_free ?? true)} onChange={e => setEditingChallenge({ ...editingChallenge, is_free: e.target.value === 'true' })} style={{ width: '100%', padding: 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    <option value="true">უფასო</option>
                    <option value="false">ფასიანი</option>
                  </select>
                </Field>
                <Field label="status">
                  <select value={editingChallenge.status || 'draft'} onChange={e => setEditingChallenge({ ...editingChallenge, status: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    {['draft','review','published','archived'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="flag_hash (CTF only)"><Input value={(editingChallenge as any).flag_hash || ''} onChange={e => setEditingChallenge({ ...(editingChallenge as any), flag_hash: e.target.value })} /></Field>
              <Field label="flag_format"><Input value={(editingChallenge as any).flag_format || 'CZ{...}'} onChange={e => setEditingChallenge({ ...(editingChallenge as any), flag_format: e.target.value })} /></Field>
              <Field label="tags (comma separated)"><Input value={(editingChallenge.tags || []).join(', ')} onChange={e => setEditingChallenge({ ...editingChallenge, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} /></Field>
              <button onClick={handleSaveChallenge} className="btn btn-gold" style={{ marginTop: 8 }}>შენახვა</button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Simulation Builder */}
      <SimulationBuilder
        challengeId={simChallenge?.id || ''}
        open={!!simChallenge}
        onOpenChange={(open) => { if (!open) setSimChallenge(null); }}
        initialHtml={simChallenge?.custom_html}
        initialCss={simChallenge?.custom_css}
        initialJs={simChallenge?.custom_js}
        initialConfig={simChallenge?.simulation_config}
        onSave={(payload) => {
          if (simChallenge?.id) {
            upsertChal.mutateAsync({ id: simChallenge.id, ...payload } as any);
          }
        }}
      />
    </AdminLayout>
  );
};

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} style={{
    padding: '8px 16px', borderBottom: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
    color: active ? 'var(--text-primary)' : 'var(--text-muted)', background: 'none', border: 'none',
    borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: active ? 'var(--gold)' : 'transparent',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
  }}>{children}</button>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4, fontWeight: 600 }}>{label}</label>
    {children}
  </div>
);

export default AdminCyberLab;
