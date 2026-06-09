import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Atmosphere from '@/components/layout/Atmosphere';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Plus, Trash2, BookOpen, ShieldCheck, GraduationCap, Sparkles, CheckCircle, AlertCircle, CreditCard, Clock } from 'lucide-react';
import { usePrice } from '@/hooks/usePricing';
import { daysRemaining, formatExpiryDate } from '@/lib/dateUtils';

interface Child {
  id: string;
  parent_id: string;
  child_id: string;
  child_username: string;
  child_display_name: string;
  created_at: string;
}

interface Subscription {
  id: string;
  child_id: string;
  status: string;
  expires_at: string;
  amount_gel: number;
}

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

  return (
    <>
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#7c3aed' }}>
                <ShieldCheck size={24} color="#fff" />
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  მშობლის პანელი
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                  მართეთ ბავშვების ანგარიშები
                </p>
              </div>
            </div>
          </div>

          {/* Pricing info banner */}
          <div className="rounded-2xl p-6 mb-8" style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
          }}>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,215,0,0.12)' }}>
                <GraduationCap size={24} style={{ color: 'var(--gold)' }} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-georgian)' }}>
                  CodeZero Kids — ერთჯერადი გადახდა
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                  შექმენით ბავშვის ანგარიში და გაააქტიურეთ სამუდამო წვდომა 280+ გაკვეთილზე, პაზლებზე და პრაქტიკულ გამოწვევებზე.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl font-black" style={{ color: 'var(--gold)' }}>
                    {KIDS_ACCOUNT_PRICE}₾
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{
                    background: 'rgba(34,197,94,0.12)',
                    color: '#22c55e',
                    fontFamily: 'var(--font-georgian)',
                  }}>
                    ერთჯერადი • სამუდამო
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: '📚', text: '280+ გაკვეთილი' },
                { icon: '🧩', text: 'პაზლები' },
                { icon: '💻', text: 'კოდ რედაქტორი' },
                { icon: '🏆', text: 'XP სისტემა' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2" style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-georgian)',
                }}>
                  <span>{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Create child button */}
          <div className="mb-8">
            {!showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{
                  background: '#7c3aed',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-georgian)',
                }}
              >
                <Plus size={18} /> ბავშვის ანგარიშის შექმნა
              </button>
            ) : (
              <div className="rounded-2xl p-6" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
              }}>
                <h3 className="font-bold text-base mb-5" style={{ 
                  color: 'var(--text-primary)', 
                  fontFamily: 'var(--font-georgian)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Plus size={18} style={{ color: '#7c3aed' }} />
                  ახალი ბავშვის ანგარიში
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                      მომხმარებლის სახელი (ლათინური)
                    </label>
                    <input
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="magalitad: nini2015"
                      maxLength={20}
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                      სახელი (ქართული)
                    </label>
                    <input
                      value={newDisplayName}
                      onChange={e => setNewDisplayName(e.target.value)}
                      placeholder="მაგ: ნინი"
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                      პაროლი (მინ. 4 სიმბოლო)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl text-xs" style={{
                  background: 'rgba(255,215,0,0.06)',
                  border: '1px solid rgba(255,215,0,0.12)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-georgian)',
                }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={14} style={{ color: 'var(--gold)' }} />
                    <span className="font-semibold" style={{ color: 'var(--gold)' }}>მნიშვნელოვანი</span>
                  </div>
                  ანგარიშის შექმნის შემდეგ საჭიროა გააქტიურება ({KIDS_ACCOUNT_PRICE}₾ ერთჯერადი გადახდა) სრულ კონტენტზე წვდომისთვის.
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: '#7c3aed',
                      border: 'none',
                      color: '#fff',
                      cursor: creating ? 'wait' : 'pointer',
                      opacity: creating ? 0.6 : 1,
                      fontFamily: 'var(--font-georgian)',
                    }}
                  >
                    {creating ? 'იქმნება...' : 'შექმნა'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-5 py-2.5 rounded-xl text-sm transition-all"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-georgian)',
                    }}
                  >
                    გაუქმება
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Children list */}
          <div className="flex items-center gap-2 mb-5">
            <Users size={20} style={{ color: '#7c3aed' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-georgian)' }}>
              ბავშვების ანგარიშები
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{
              background: 'rgba(124,58,237,0.1)',
              color: '#7c3aed',
            }}>
              {children.length}/20
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
            </div>
          ) : children.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
            }}>
              <span className="text-5xl block mb-4">👶</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                ჯერ ბავშვის ანგარიში არ შეგიქმნიათ
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-georgian)' }}>
                დააჭირეთ ზემოთ "ბავშვის ანგარიშის შექმნა" ღილაკს
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {children.map(child => {
                const sub = getChildSub(child.child_id);
                const isActive = sub && new Date(sub.expires_at) > new Date();
                return (
                  <div key={child.id} className="rounded-2xl p-5" style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${isActive ? 'rgba(34,197,94,0.2)' : 'var(--border-light)'}`,
                  }}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{
                          background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(124,58,237,0.1)',
                        }}>
                          {isActive ? '✅' : '👤'}
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {child.child_display_name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                            @{child.child_username}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg" style={{
                              background: 'rgba(34,197,94,0.1)',
                              color: '#22c55e',
                            }}>
                              <CheckCircle size={14} />
                              აქტიური · {daysRemaining(sub!.expires_at)} დღე
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                              <Clock size={10} className="inline mr-1" />
                              {formatExpiryDate(sub!.expires_at)}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleActivate(child.child_id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all hover:opacity-90"
                            style={{
                              background: 'var(--gold)',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-georgian)',
                            }}
                          >
                            <CreditCard size={14} />
                            გააქტიურება ({KIDS_ACCOUNT_PRICE}₾)
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(child.child_id, child.child_username)}
                          className="p-2 rounded-lg transition-all hover:opacity-80"
                          style={{
                            background: 'rgba(244,63,94,0.08)',
                            border: 'none',
                            color: '#f43f5e',
                            cursor: 'pointer',
                          }}
                          title="ანგარიშის წაშლა"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {!isActive && (
                      <div className="mt-3 pt-3 text-xs flex items-center gap-2" style={{
                        borderTop: '1px solid var(--border-light)',
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-georgian)',
                      }}>
                        <AlertCircle size={12} />
                        ანგარიში შექმნილია, მაგრამ კონტენტზე წვდომისთვის საჭიროა გააქტიურება
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* How it works */}
          <div className="mt-10 rounded-2xl p-6" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
          }}>
            <h3 className="font-bold text-sm mb-4" style={{ 
              color: 'var(--text-primary)', 
              fontFamily: 'var(--font-georgian)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Sparkles size={16} style={{ color: 'var(--gold)' }} />
              როგორ მუშაობს?
            </h3>
            <div className="grid gap-3">
              {[
                { step: '1', text: 'შექმენით ბავშვის ანგარიში (სახელი + პაროლი)' },
                { step: '2', text: `გაააქტიურეთ ერთჯერადი ${KIDS_ACCOUNT_PRICE}₾ გადახდით` },
                { step: '3', text: 'ბავშვი შედის Kids Login-ის გვერდიდან' },
                { step: '4', text: 'სწავლობს HTML/CSS-ს 280+ ინტერაქტიული გაკვეთილით' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{
                    background: 'rgba(124,58,237,0.1)',
                    color: '#7c3aed',
                  }}>
                    {item.step}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ParentDashboard;
