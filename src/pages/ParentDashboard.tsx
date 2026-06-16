import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Atmosphere from '@/components/layout/Atmosphere';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Plus, Trash2, GraduationCap, CheckCircle, AlertCircle, CreditCard, Zap, Star } from 'lucide-react';
import { usePrice } from '@/hooks/usePricing';
import { daysRemaining, formatExpiryDate } from '@/lib/dateUtils';

interface Child {
  id: string;
  parent_id: string;
  child_id: string;
  child_username: string;
  child_display_name: string;
  created_at: string;
  xp?: number;
  lessons_completed?: number;
  total_lessons?: number;
}

interface Subscription {
  id: string;
  child_id: string;
  status: string;
  expires_at: string;
  amount_gel: number;
}

const TOTAL_LESSONS = 282;

const getLevelLabel = (xp: number) => {
  if (xp < 100) return 'Lv.1 - დამწყები';
  if (xp < 300) return 'Lv.2 - საშუალო';
  if (xp < 600) return 'Lv.3 - გამოცდილი';
  return 'Lv.4 - ექსპერტი';
};

// price comes from pricing_config (admin-editable)

const ParentDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const KIDS_ACCOUNT_PRICE = usePrice('kids_monthly', 20);
  const [children, setChildren] = useState<Child[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-child-account', {
      body: { action: 'list' },
    });
    if (!error && data) {
      setChildren(data.children || []);
      setSubscriptions(data.subscriptions || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error('შეავსე ყველა ველი');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('პაროლი მინიმუმ 4 სიმბოლო უნდა იყოს');
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke('create-child-account', {
      body: {
        action: 'create',
        username: newUsername.trim(),
        password: newPassword.trim(),
        display_name: newDisplayName.trim() || newUsername.trim(),
      },
    });
    setCreating(false);
    if (error || data?.error) {
      toast.error(data?.error || 'შეცდომა');
      return;
    }
    toast.success('ბავშვის ანგარიში შეიქმნა!');
    setNewUsername('');
    setNewPassword('');
    setNewDisplayName('');
    setShowCreate(false);
    fetchChildren();
  };

  const handleDelete = async (childId: string, username: string) => {
    if (!confirm(`წაიშალოს "${username}"-ის ანგარიში?`)) return;
    const { data, error } = await supabase.functions.invoke('create-child-account', {
      body: { action: 'delete', child_id: childId },
    });
    if (error || data?.error) {
      toast.error(data?.error || 'შეცდომა');
      return;
    }
    toast.success('ანგარიში წაიშალა');
    fetchChildren();
  };

  const handleActivate = async (childId: string) => {
    if (!user) return;
    toast.loading('გადახდის გვერდზე გადამისამართება...');
    try {
      if (KIDS_ACCOUNT_PRICE <= 0) {
        toast.dismiss();
        toast.error('Kids ფასი ჯერ არ არის გამართული ადმინ პანელში');
        return;
      }

      const { data, error } = await supabase.functions.invoke('flitt-payment', {
        body: {
          action: 'initiate',
          items: [{
            type: 'kids_activation',
            child_id: childId,
            name: 'Kids ანგარიშის გააქტიურება',
            price: KIDS_ACCOUNT_PRICE,
          }],
        },
      });
      toast.dismiss();
      if (error || !data?.success) {
        toast.error(data?.error || 'გადახდა ვერ მოხერხდა');
        return;
      }
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error(e?.message || 'შეცდომა');
    }
  };

  const getChildSub = (childId: string) => {
    return subscriptions.find(s => s.child_id === childId && s.status === 'active');
  };

  if (authLoading || !user) return null;

  const totalXP = children.reduce((sum, c) => sum + (c.xp || 0), 0);
  const activeCount = children.filter(c => {
    const sub = getChildSub(c.child_id);
    return sub && new Date(sub.expires_at) > new Date();
  }).length;

  return (
    <>
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GraduationCap size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>CodeZero Kids</h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                მშობლის პანელი · მართეთ ბავშვების ანგარიშები
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { icon: <Users size={18} />, label: 'ბავშვი', value: children.length, color: '#7c3aed' },
              { icon: <CheckCircle size={18} />, label: 'აქტიური', value: activeCount, color: '#22c55e' },
              { icon: <Zap size={18} />, label: 'სულ XP', value: totalXP, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Pricing banner */}
          <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={22} style={{ color: 'var(--gold)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'var(--font-georgian)' }}>
                  CodeZero Kids — ერთჯერადი გადახდა
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)', lineHeight: 1.5, marginBottom: 8 }}>
                  შექმენით ბავშვის ანგარიში და გაააქტიურეთ სამუდამო წვდომა {TOTAL_LESSONS}+ გაკვეთილზე, პაზლებზე და პრაქტიკულ გამოწვევებზე.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold)' }}>{KIDS_ACCOUNT_PRICE}₾</span>
                  <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 700, fontFamily: 'var(--font-georgian)' }}>
                    ერთჯერადი
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { icon: '📚', text: `${TOTAL_LESSONS}+ გაკვეთილი` },
                { icon: '🧩', text: 'პაზლები' },
                { icon: '💻', text: 'რედაქტირი' },
                { icon: '🏆', text: 'XP სისტება' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem',
                  fontWeight: 600, padding: '8px 10px', borderRadius: 10,
                  background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-georgian)',
                }}>
                  <span>{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Create child button / form */}
          <div style={{ marginBottom: 28 }}>
            {!showCreate ? (
              <button onClick={() => setShowCreate(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                borderRadius: 12, background: '#7c3aed', border: 'none', color: '#fff',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-georgian)',
              }}>
                <Plus size={18} /> ბავშვის ანგარიშის შექმნა
              </button>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-georgian)' }}>
                  <Plus size={16} style={{ color: '#7c3aed' }} /> ახალი ბავშვის ანგარიში
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'მომხმარებლის სახელი (ლათინური)', value: newUsername, onChange: (v: string) => setNewUsername(v.replace(/[^a-zA-Z0-9_]/g, '')), placeholder: 'magalitad: nini2015', maxLength: 20 },
                    { label: 'სახელი (ქართული)', value: newDisplayName, onChange: (v: string) => setNewDisplayName(v), placeholder: 'მაგ: ნინი' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-georgian)' }}>{f.label}</label>
                      <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} maxLength={f.maxLength}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-georgian)' }}>პაროლი (მინ. 4 სიმბოლო)</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)', display: 'flex', gap: 8 }}>
                  <AlertCircle size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }} />
                  ანგარიშის შექმნის შემდეგ საჭიროა გააქტიურება ({KIDS_ACCOUNT_PRICE}₾) სრულ კონტენტზე წვდომისთვის.
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={handleCreate} disabled={creating} style={{
                    padding: '10px 22px', borderRadius: 10, background: '#7c3aed', border: 'none',
                    color: '#fff', fontWeight: 700, cursor: creating ? 'wait' : 'pointer', opacity: creating ? 0.6 : 1, fontSize: '0.88rem', fontFamily: 'var(--font-georgian)',
                  }}>{creating ? 'იქმნება...' : 'შექმნა'}</button>
                  <button onClick={() => setShowCreate(false)} style={{
                    padding: '10px 18px', borderRadius: 10, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'var(--font-georgian)',
                  }}>გაუქმება</button>
                </div>
              </div>
            )}
          </div>

          {/* Children list */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Users size={18} style={{ color: '#7c3aed' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-georgian)' }}>
              ბავშვების ანგარიშები
            </h2>
            <span style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: 20, background: 'rgba(124,58,237,0.12)', color: '#7c3aed', fontWeight: 700 }}>
              {children.length}/20
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)' }}>იტვირთება...</div>
          ) : children.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>👶</span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>ჯერ ბავშვის ანგარიში არ შეგიქმნიათ</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {children.map(child => {
                const sub = getChildSub(child.child_id);
                const isActive = sub && new Date(sub.expires_at) > new Date();
                const xp = child.xp || 0;
                const lessonsCompleted = child.lessons_completed || 0;
                const progressPct = Math.round((lessonsCompleted / TOTAL_LESSONS) * 100);
                const initial = (child.child_display_name || child.child_username || 'U')[0].toUpperCase();

                return (
                  <div key={child.id} style={{
                    background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: '18px 20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', fontWeight: 900, color: '#fff',
                      }}>
                        {initial}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{child.child_display_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>@{child.child_username}</div>
                          </div>
                          <button onClick={() => handleDelete(child.child_id, child.child_username)} style={{
                            background: 'rgba(244,63,94,0.08)', border: 'none', color: '#f43f5e',
                            cursor: 'pointer', padding: '6px', borderRadius: 8,
                          }}>
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                          <span style={{ fontSize: '0.7rem', padding: '3px 9px', borderRadius: 7, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={11} /> {getLevelLabel(xp)}
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '3px 9px', borderRadius: 7, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Zap size={11} /> {xp} XP
                          </span>
                          {isActive ? (
                            <span style={{ fontSize: '0.7rem', padding: '3px 9px', borderRadius: 7, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle size={11} /> აქტიური
                            </span>
                          ) : (
                            <button onClick={() => handleActivate(child.child_id)} style={{
                              fontSize: '0.7rem', padding: '3px 11px', borderRadius: 7,
                              background: 'var(--gold)', border: 'none', color: '#fff',
                              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              <CreditCard size={11} /> გААქტიურება ({KIDS_ACCOUNT_PRICE}₾)
                            </button>
                          )}
                        </div>

                        {/* Progress */}
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 4 }}>
                            <span>{lessonsCompleted}/{TOTAL_LESSONS} გაკვეთილი</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 4, minWidth: progressPct > 0 ? 4 : 0 }} />
                          </div>
                        </div>

                        {/* Date info */}
                        {isActive && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-georgian)' }}>
                            <span>{formatExpiryDate(sub!.expires_at)}</span>
                            <span>{daysRemaining(sub!.expires_at)} დღე დარჩა</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ParentDashboard;
