import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Atmosphere from '@/components/layout/Atmosphere';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Users, Plus, Trash2, GraduationCap, CheckCircle, AlertCircle,
  CreditCard, Zap, Star, BookOpen, Trophy, TrendingUp, Activity,
  ChevronDown, ChevronUp, Lock, HelpCircle, PenTool, Brain, Eye, Puzzle, Code
} from 'lucide-react';
import { usePrice } from '@/hooks/usePricing';
import { daysRemaining, formatExpiryDate } from '@/lib/dateUtils';
import { getKidsLevel, kidsLessons } from '@/data/kidsLessons';
import { calculateBadges } from '@/hooks/useKidsBadges';

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

interface ChildProgress {
  lesson_id: string;
  xp_earned: number;
  completed_at: string;
}

const TOTAL_LESSONS = kidsLessons.length;

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string; border: string }> = {
  puzzle: { icon: Puzzle, label: 'პაზლი', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  editor: { icon: Code, label: 'რედაქტორი', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  challenge: { icon: Eye, label: 'გამოწვევა', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  quiz: { icon: HelpCircle, label: 'ქვიზი', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  fillblanks: { icon: PenTool, label: 'ჩასაწერი', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  memory: { icon: Brain, label: 'მეხსიერება', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
};

// Fetch a single child's detailed progress
function useChildDetailedProgress(childId: string | undefined) {
  const [progress, setProgress] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    supabase
      .from('kids_lesson_progress')
      .select('lesson_id, xp_earned, completed_at')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setProgress(data || []);
        setLoading(false);
      });
  }, [childId]);

  return { progress, loading };
}

const ParentDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const KIDS_ACCOUNT_PRICE = usePrice('kids_monthly', 20);
  const [children, setChildren] = useState<Child[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
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

  const toggleExpand = (childId: string) => {
    setExpandedChild(prev => prev === childId ? null : childId);
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
      <main className="page-content min-h-screen">
        <div className="max-w-[860px] mx-auto px-5 pb-20 pt-8">

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-7">
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">CodeZero Kids</h1>
              <p className="text-[0.82rem] text-stone-500">მშობლის პანელი · მართეთ ბავშვების ანგარიშები</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Users, label: 'ბავშვი', value: children.length, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
              { icon: CheckCircle, label: 'აქტიური', value: activeCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { icon: Zap, label: 'სულ XP', value: totalXP, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-4 border ${s.border} ${s.bg}`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <s.icon size={16} className={s.color} />
                  <span className="text-[0.72rem] text-stone-500 font-medium">{s.label}</span>
                </div>
                <div className="text-[1.5rem] font-black text-white">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Pricing banner */}
          <div className="rounded-2xl p-5 border border-[#5F13CA]/20 bg-[#5F13CA]/5 mb-6">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <GraduationCap size={22} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-extrabold text-[0.95rem] text-white mb-1">CodeZero Kids — ერთჯერადი გადახდა</h2>
                <p className="text-[0.82rem] text-stone-400 leading-relaxed mb-2">
                  შექმენით ბავშვის ანგარიში და გაააქტიურეთ სამუდამო წვდომა {TOTAL_LESSONS}+ გაკვეთილზე, პაზლებზე და პრაქტიკულ გამოწვევებზე.
                </p>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-black text-amber-400">{KIDS_ACCOUNT_PRICE}₾</span>
                  <span className="text-[0.72rem] px-2.5 py-[3px] rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                    ერთჯერადი
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: <BookOpen size={14} className="text-stone-400" />, text: `${TOTAL_LESSONS}+ გაკვეთილი` },
                { icon: <Puzzle size={14} className="text-violet-400" />, text: 'პაზლები' },
                { icon: <Code size={14} className="text-emerald-400" />, text: 'რედაქტორი' },
                { icon: <Trophy size={14} className="text-amber-400" />, text: 'XP სისტემა' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[0.78rem] font-semibold px-2.5 py-2 rounded-xl bg-stone-900/50 border border-white/5 text-stone-400">
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Create child button / form */}
          <div className="mb-7">
            {!showCreate ? (
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-[0.9rem] hover:bg-violet-700 transition-colors cursor-pointer">
                <Plus size={18} /> ბავშვის ანგარიშის შექმნა
              </button>
            ) : (
              <div className="rounded-2xl p-6 border border-white/8 bg-stone-900/80">
                <h2 className="font-extrabold text-[0.95rem] text-white mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-violet-400" /> ახალი ბავშვის ანგარიში
                </h2>
                <div className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[0.72rem] font-semibold text-stone-500 mb-1.5">მომხმარებლის სახელი (ლათინური)</label>
                    <input value={newUsername} onChange={e => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} placeholder="magalitad: nini2015" maxLength={20}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/80 border border-white/10 text-white text-[0.88rem] outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[0.72rem] font-semibold text-stone-500 mb-1.5">სახელი (ქართული)</label>
                    <input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} placeholder="მაგ: ნინი"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/80 border border-white/10 text-white text-[0.88rem] outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[0.72rem] font-semibold text-stone-500 mb-1.5">პაროლი (მინ. 4 სიმბოლო)</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/80 border border-white/10 text-white text-[0.88rem] outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                </div>
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[0.78rem] text-stone-400 flex gap-2">
                  <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  ანგარიშის შექმნის შემდეგ საჭიროა გააქტიურება ({KIDS_ACCOUNT_PRICE}₾) სრულ კონტენტზე წვდომისთვის.
                </div>
                <div className="flex gap-2.5 mt-4">
                  <button onClick={handleCreate} disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-[0.88rem] disabled:opacity-60 disabled:cursor-wait hover:bg-violet-700 transition-colors cursor-pointer">
                    {creating ? 'იქმნება...' : 'შექმნა'}
                  </button>
                  <button onClick={() => setShowCreate(false)}
                    className="px-4 py-2.5 rounded-xl bg-transparent border border-white/10 text-stone-400 font-medium text-[0.88rem] hover:text-white transition-colors cursor-pointer">
                    გაუქმება
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Children list */}
          <div className="flex items-center gap-2.5 mb-4">
            <Users size={18} className="text-violet-500" />
            <h2 className="text-base font-extrabold text-white">ბავშვების ანგარიშები</h2>
            <span className="text-[0.72rem] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-bold">
              {children.length}/20
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-600">იტვირთება...</div>
          ) : children.length === 0 ? (
            <div className="rounded-2xl p-12 border border-white/5 bg-stone-900/50 text-center">
              <span className="text-5xl block mb-3">👶</span>
              <p className="text-[0.88rem] text-stone-500">ჯერ ბავშვის ანგარიში არ შეგიქმნიათ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {children.map(child => (
                <ChildCard
                  key={child.id}
                  child={child}
                  isActive={!!(getChildSub(child.child_id) && new Date(getChildSub(child.child_id)!.expires_at) > new Date())}
                  sub={getChildSub(child.child_id)}
                  xp={child.xp || 0}
                  lessonsCompleted={child.lessons_completed || 0}
                  totalLessons={TOTAL_LESSONS}
                  expanded={expandedChild === child.id}
                  onToggle={() => toggleExpand(child.id)}
                  onDelete={() => handleDelete(child.child_id, child.child_username)}
                  onActivate={() => handleActivate(child.child_id)}
                  price={KIDS_ACCOUNT_PRICE}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

// ---- Child Card Component ----
interface ChildCardProps {
  child: Child;
  isActive: boolean;
  sub: Subscription | undefined;
  xp: number;
  lessonsCompleted: number;
  totalLessons: number;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onActivate: () => void;
  price: number;
  key?: string;
}

function ChildCard({ child, isActive, sub, xp, lessonsCompleted, totalLessons, expanded, onToggle, onDelete, onActivate, price }: ChildCardProps) {
  const level = getKidsLevel(xp);
  const progressPct = Math.round((lessonsCompleted / totalLessons) * 100);
  const initial = (child.child_display_name || child.child_username || 'U')[0].toUpperCase();

  // Get detailed progress for expanded view
  const { progress: detailedProgress } = useChildDetailedProgress(expanded ? child.child_id : undefined);
  const completedIds = detailedProgress.map(p => p.lesson_id);
  const badges = calculateBadges(completedIds, xp);

  // Lesson type breakdown
  const typeCounts: Record<string, number> = {};
  completedIds.forEach(id => {
    const lesson = kidsLessons.find(l => l.id === id);
    if (lesson) typeCounts[lesson.type] = (typeCounts[lesson.type] || 0) + 1;
  });

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      isActive ? 'border-emerald-500/15 bg-stone-900/80' : 'border-white/5 bg-stone-900/50'
    }`}>
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl shrink-0 bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-lg font-black text-white">
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <div>
                <div className="font-extrabold text-[0.95rem] text-white">{child.child_display_name}</div>
                <div className="text-[0.75rem] text-stone-500">@{child.child_username}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={onToggle} className="p-1.5 rounded-lg bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer">
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button onClick={onDelete} className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="flex items-center gap-1 text-[0.7rem] px-2 py-[3px] rounded-lg bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20">
                <Star size={11} /> Lv.{level.level} — {level.title}
              </span>
              <span className="flex items-center gap-1 text-[0.7rem] px-2 py-[3px] rounded-lg bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                <Zap size={11} /> {xp} XP
              </span>
              {isActive ? (
                <span className="flex items-center gap-1 text-[0.7rem] px-2 py-[3px] rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  <CheckCircle size={11} /> აქტიური
                </span>
              ) : (
                <button onClick={onActivate} className="flex items-center gap-1 text-[0.7rem] px-2.5 py-[3px] rounded-lg bg-amber-400 text-stone-900 font-bold cursor-pointer hover:bg-amber-300 transition-colors">
                  <CreditCard size={11} /> გააქტიურება ({price}₾)
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-1.5">
              <div className="flex justify-between text-[0.72rem] text-stone-500 mb-1">
                <span>{lessonsCompleted}/{totalLessons} გაკვეთილი</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700" style={{ width: `${Math.max(progressPct, 1)}%` }} />
              </div>
            </div>

            {/* Date info */}
            {isActive && sub && (
              <div className="flex justify-between text-[0.7rem] text-stone-500 mt-1.5">
                <span>{formatExpiryDate(sub.expires_at)}</span>
                <span>{daysRemaining(sub.expires_at)} დღე დარჩა</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          {/* Level progress */}
          <div className="pt-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.75rem] font-bold text-stone-400">დონის პროგრესი</span>
              <span className="text-[0.72rem] text-stone-500">Lv.{level.level} → Lv.{level.level + 1}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${level.progress}%` }} />
            </div>
            <div className="text-[0.65rem] text-stone-600 mt-1 text-right">{Math.round(level.progress)}% — შემდეგ დონამდე</div>
          </div>

          {/* Lesson type breakdown */}
          {Object.keys(typeCounts).length > 0 && (
            <div className="mb-4">
              <div className="text-[0.75rem] font-bold text-stone-400 mb-2.5">გაკვეთილების განაწილება</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.editor;
                  const Icon = cfg.icon;
                  return (
                    <div key={type} className={`flex items-center gap-1.5 text-[0.7rem] font-semibold px-2 py-1.5 rounded-lg ${cfg.bg} ${cfg.border} border ${cfg.color}`}>
                      <Icon size={12} />
                      {count} {cfg.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Badges earned */}
          {badges.earned.length > 0 && (
            <div className="mb-3">
              <div className="text-[0.75rem] font-bold text-stone-400 mb-2.5">მიღებული მედლები ({badges.earnedCount}/{badges.total})</div>
              <div className="flex flex-wrap gap-1.5">
                {badges.earned.map(badge => (
                  <div key={badge.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-bold"
                    style={{ background: `${badge.color}18`, border: `1px solid ${badge.color}40`, color: badge.color }}>
                    <span>{badge.emoji}</span>
                    {badge.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          {detailedProgress.length > 0 && (
            <div>
              <div className="text-[0.75rem] font-bold text-stone-400 mb-2.5">ბოლო აქტივობა</div>
              <div className="flex flex-col gap-1.5">
                {detailedProgress.slice(0, 5).map(p => {
                  const lesson = kidsLessons.find(l => l.id === p.lesson_id);
                  return (
                    <div key={p.lesson_id} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/[0.02]">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                        <span className="text-[0.72rem] text-stone-300 truncate">{lesson?.title || p.lesson_id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[0.65rem] text-amber-400 font-bold">+{p.xp_earned} XP</span>
                        <span className="text-[0.6rem] text-stone-600">{new Date(p.completed_at).toLocaleDateString('ka-GE')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;
