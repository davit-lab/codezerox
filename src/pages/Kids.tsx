import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LessonCard from "@/components/kids/LessonCard";
import { kidsLessons, type LessonType, getKidsLevel, getModules } from "@/data/kidsLessons";
import { useKidsProgress, useKidsSubscription } from "@/hooks/useKidsProgress";
import { Puzzle, Code, Eye, Trophy, Zap, BookOpen, LogOut, GraduationCap, Search, X, Star, Lock, ShieldCheck } from "lucide-react";

const typeFilters: { key: LessonType | 'all'; label: string; icon: any; color: string }[] = [
  { key: 'all', label: 'ყველა', icon: BookOpen, color: '#7c3aed' },
  { key: 'puzzle', label: 'პაზლები', icon: Puzzle, color: '#a78bfa' },
  { key: 'editor', label: 'რედაქტორი', icon: Code, color: '#34d399' },
  { key: 'challenge', label: 'გამოწვევები', icon: Eye, color: '#f59e0b' },
];

const Kids = () => {
  const { user, signOut, isLoading: authLoading, isAdmin, isChild } = useAuth();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<LessonType | 'all'>('all');
  const [moduleFilter, setModuleFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: progressData = [] } = useKidsProgress();
  const { data: subscription, isLoading: subLoading } = useKidsSubscription();

  // Require login before showing any kids content
  useEffect(() => {
    if (!authLoading && !user) navigate('/kids/login', { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading) return null;
  if (!user) return null;

  // Admins and non-child users (parents) always have access; children need subscription
  const hasPaid = isAdmin || !isChild || !!subscription;
  const completed = progressData.map(p => p.lesson_id);
  const xp = progressData.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
  const level = getKidsLevel(xp);
  const modules = getModules();


  const filtered = useMemo(() => {
    return kidsLessons.filter(l => {
      if (typeFilter !== 'all' && l.type !== typeFilter) return false;
      if (moduleFilter !== 'all' && l.moduleNumber !== moduleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!l.title.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q) && !l.module.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [typeFilter, moduleFilter, searchQuery]);

  const totalLessons = kidsLessons.length;
  const completedCount = completed.length;
  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/kids/login');
  };

  const puzzleCount = kidsLessons.filter(l => l.type === 'puzzle').length;
  const editorCount = kidsLessons.filter(l => l.type === 'editor').length;
  const challengeCount = kidsLessons.filter(l => l.type === 'challenge').length;

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(13,13,20,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(124,58,237,0.1)',
      }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#7c3aed' }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <div>
              <h1 className="text-sm font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                CodeZero Kids
              </h1>
              <p className="text-[0.62rem]" style={{ color: 'var(--text-dim)' }}>
                HTML & CSS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {level && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.7rem]" style={{
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.12)',
              }}>
                <Star size={12} style={{ color: 'var(--gold)' }} />
                <span className="font-black" style={{ color: 'var(--gold)' }}>
                  Lv.{level.level}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem]" style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.1)',
            }}>
              <Zap size={12} style={{ color: 'var(--gold)' }} />
              <span className="font-bold" style={{ color: 'var(--gold)' }}>{xp} XP</span>
            </div>
            {user && (
              <button onClick={handleSignOut} className="p-2 rounded-lg" style={{
                background: 'rgba(124,58,237,0.05)',
                border: '1px solid rgba(124,58,237,0.1)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}>
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero */}
        <div className="px-5 pt-6">
          <div className="rounded-2xl p-6" style={{
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.1)',
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <h2 className="text-lg sm:text-xl font-black mb-1.5" style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-georgian)',
                }}>
                  ისწავლე HTML & CSS
                </h2>
                <p className="text-sm mb-3" style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-georgian)',
                }}>
                  {totalLessons} გაკვეთილი · {modules.length} მოდული
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: Puzzle, count: puzzleCount, label: 'პაზლი', color: '#a78bfa' },
                    { icon: Code, count: editorCount, label: 'რედაქტორი', color: '#34d399' },
                    { icon: Eye, count: challengeCount, label: 'გამოწვევა', color: '#f59e0b' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[0.7rem] font-semibold px-2.5 py-1 rounded-md" style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      color: stat.color,
                      fontFamily: 'var(--font-georgian)',
                    }}>
                      <stat.icon size={11} />
                      {stat.count} {stat.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm:w-[200px] shrink-0">
                <div className="flex justify-between text-[0.7rem] mb-1.5">
                  <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                    <Trophy size={11} style={{ color: 'var(--gold)' }} />
                    {completedCount}/{totalLessons}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--gold)' }}>
                    {xp} XP
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{
                    width: `${progressPct}%`,
                    background: 'var(--gold)',
                  }} />
                </div>
                <p className="text-[0.65rem] mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-georgian)' }}>
                  {progressPct > 0 ? `${Math.round(progressPct)}% დასრულებული` : 'დაიწყე სწავლა'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="px-5 pt-4">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ძებნა..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-georgian)',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded" style={{
                background: 'rgba(124,58,237,0.08)',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {typeFilters.map(f => {
              const Icon = f.icon;
              const active = typeFilter === f.key;
              return (
                <button key={f.key} onClick={() => setTypeFilter(f.key)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[0.78rem] font-bold"
                  style={{
                    background: active ? f.color : 'var(--bg-card)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border-light)'}`,
                    color: active ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-georgian)',
                    transition: 'all 0.15s',
                  }}>
                  <Icon size={13} /> {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1.5" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setModuleFilter('all')}
              className="shrink-0 px-2.5 py-1 rounded-md text-[0.68rem] font-bold"
              style={{
                background: moduleFilter === 'all' ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                border: `1px solid ${moduleFilter === 'all' ? 'rgba(124,58,237,0.2)' : 'var(--border-light)'}`,
                color: moduleFilter === 'all' ? '#7c3aed' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-georgian)',
              }}>
              ყველა
            </button>
            {modules.map(m => (
              <button key={m.number} onClick={() => setModuleFilter(m.number)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.68rem] font-semibold"
                style={{
                  background: moduleFilter === m.number ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                  border: `1px solid ${moduleFilter === m.number ? 'rgba(124,58,237,0.2)' : 'var(--border-light)'}`,
                  color: moduleFilter === m.number ? '#7c3aed' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-georgian)',
                  whiteSpace: 'nowrap',
                }}>
                <span className="w-3.5 h-3.5 rounded text-[0.55rem] font-black flex items-center justify-center" style={{
                  background: moduleFilter === m.number ? '#7c3aed' : 'var(--bg-elevated)',
                  color: moduleFilter === m.number ? '#fff' : 'var(--text-dim)',
                }}>
                  {m.number}
                </span>
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Paywall or Content */}
        {!subLoading && !hasPaid ? (
          <div className="px-5 py-10">
            <div className="rounded-2xl p-8 text-center" style={{
              background: 'rgba(124,58,237,0.04)',
              border: '1px solid rgba(124,58,237,0.15)',
              maxWidth: 520,
              margin: '0 auto',
            }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{
                background: 'rgba(124,58,237,0.1)',
              }}>
                <Lock size={28} style={{ color: '#7c3aed' }} />
              </div>
              <h3 className="text-lg font-black mb-2" style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-georgian)',
              }}>
                წვდომა შეზღუდულია
              </h3>
              <p className="text-sm mb-5" style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-georgian)',
                lineHeight: 1.7,
              }}>
                {totalLessons} გაკვეთილზე, პაზლებზე და გამოწვევებზე წვდომისთვის საჭიროა ანგარიშის აქტივაცია. სთხოვე მშობელს გააქტიუროს შენი ანგარიში.
              </p>
                <div className="flex items-center justify-center gap-2 text-xl font-black mb-5" style={{ color: 'var(--gold)' }}>
                20₾
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: '#22c55e',
                }}>
                  ერთჯერადი
                </span>
              </div>
              <Link to="/parent" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold" style={{
                background: '#7c3aed',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: 'var(--font-georgian)',
              }}>
                <ShieldCheck size={16} />
                მშობლის პანელი
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Count */}
            <div className="px-5 pt-2.5 pb-1">
              <p className="text-[0.7rem] font-medium" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-georgian)' }}>
                ნაპოვნია {filtered.length} გაკვეთილი
              </p>
            </div>

            {/* Grid */}
            <div className="px-5 pb-10">
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
                {filtered.map((lesson, i) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    completed={completed.includes(lesson.id)}
                    index={i}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-14">
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
                    გაკვეთილები ვერ მოიძებნა
                  </p>
                  <button onClick={() => { setSearchQuery(''); setTypeFilter('all'); setModuleFilter('all'); }}
                    className="text-xs px-4 py-2 rounded-lg"
                    style={{
                      background: 'rgba(124,58,237,0.08)',
                      border: '1px solid rgba(124,58,237,0.15)',
                      color: '#7c3aed',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-georgian)',
                    }}>
                    ფილტრების გასუფთავება
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center pb-8 pt-2 px-5" style={{ borderTop: '1px solid var(--border-light)' }}>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg mt-4" style={{
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontFamily: 'var(--font-georgian)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
          }}>
            მთავარ გვერდზე
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Kids;
