import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Atmosphere from "@/components/layout/Atmosphere";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import {
  useHackLabLesson,
  useHackLabLessons,
  useHackLabSubscription,
  useHackLabProgress,
  useCompleteLesson,
} from "@/hooks/useHackLab";
import { toast } from "sonner";

const DIFF_COLORS: Record<string, string> = {
  beginner: '#22c55e', easy: '#84cc16', medium: '#eab308',
  hard: '#f97316', expert: '#ef4444',
};
const DIFF_LABELS: Record<string, string> = {
  beginner: 'დამწყები', easy: 'მარტივი', medium: 'საშუალო',
  hard: 'რთული', expert: 'ექსპერტი',
};

const EthicalHackingLessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: lesson, isLoading } = useHackLabLesson(id!);
  const { data: allLessons = [] } = useHackLabLessons();
  const { data: subscription } = useHackLabSubscription(user?.id);
  const { data: progress = [] } = useHackLabProgress(user?.id);
  const completeLesson = useCompleteLesson();

  const [tab, setTab] = useState<'theory' | 'challenge'>('theory');

  const hasAccess = subscription?.status === 'active' && new Date(subscription.expires_at) > new Date();
  const completedIds = new Set(progress.map((p: { lesson_id: string }) => p.lesson_id));
  const isCompleted = id ? completedIds.has(id) : false;

  const currentIdx = allLessons.findIndex((l: { id: string }) => l.id === id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const handleComplete = async () => {
    if (!user || !id) return;
    if (!hasAccess && !(lesson as { is_free?: boolean })?.is_free) {
      navigate('/hack-lab');
      return;
    }
    try {
      await completeLesson.mutateAsync({ userId: user.id, lessonId: id });
      toast.success('ლექცია დასრულებულია!');
      if (nextLesson) navigate(`/hack-lab/lesson/${(nextLesson as { id: string }).id}`);
    } catch {
      toast.error('შეცდომა');
    }
  };

  if (isLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="page-content">
          <div className="container" style={{ paddingTop: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>hourglass_empty</span>
            იტვირთება...
          </div>
        </main>
      </>
    );
  }

  if (!lesson) return null;

  const l = lesson as {
    id: string; title: string; description: string; content?: string;
    module_name: string; difficulty: string; duration_min: number; is_free: boolean;
  };

  const canAccess = hasAccess || l.is_free;

  return (
    <>
      <SEOHead title={`${l.title} — Ethical Hacking Lab`} description={l.description} />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container" style={{ maxWidth: 860 }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '24px 0 20px', fontSize: '0.82rem' }}>
            <Link to="/hack-lab" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Ethical Hacking Lab</Link>
            <span className="material-symbols-rounded" style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>chevron_right</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>{l.module_name}</span>
            <span className="material-symbols-rounded" style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>chevron_right</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{l.title}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, color: DIFF_COLORS[l.difficulty] || '#888',
                border: `1px solid ${(DIFF_COLORS[l.difficulty] || '#888')}40`, padding: '2px 8px', borderRadius: 6,
              }}>
                {DIFF_LABELS[l.difficulty] || l.difficulty}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 13 }}>schedule</span>
                {l.duration_min} წთ
              </span>
              {l.is_free && (
                <span style={{ fontSize: '0.68rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                  უფასო
                </span>
              )}
              {isCompleted && (
                <span style={{ fontSize: '0.68rem', background: 'rgba(95,19,202,0.15)', color: '#7B3FD6', padding: '2px 7px', borderRadius: 6, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 12 }}>check_circle</span>
                  დასრულებული
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>{l.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.92rem', lineHeight: 1.6 }}>{l.description}</p>
          </div>

          {/* Paywall */}
          {!canAccess ? (
            <div style={{
              background: 'rgba(95,19,202,0.08)', border: '1px solid rgba(95,19,202,0.3)',
              borderRadius: 16, padding: '48px 32px', textAlign: 'center',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 52, color: '#5F13CA', display: 'block', marginBottom: 16 }}>lock</span>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>ეს ლექცია ჩაკეტილია</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginBottom: 24 }}>
                სრული წვდომისთვის გამოიწერე Ethical Hacking Lab
              </p>
              <Link to="/hack-lab" style={{
                padding: '12px 28px', borderRadius: 12, textDecoration: 'none',
                background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
              }}>
                გამოწერის გვერდი →
              </Link>
            </div>
          ) : (
            <>
              {/* Tabs */}
              {l.content && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
                  {(['theory', 'challenge'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      style={{
                        padding: '8px 20px', borderRadius: 9, cursor: 'pointer',
                        background: tab === t ? 'rgba(95,19,202,0.25)' : 'transparent',
                        color: tab === t ? '#7B3FD6' : 'rgba(255,255,255,0.4)',
                        fontWeight: tab === t ? 700 : 500, fontSize: '0.85rem',
                        border: tab === t ? '1px solid rgba(95,19,202,0.3)' : '1px solid transparent',
                      }}
                    >
                      {t === 'theory' ? 'თეორია' : 'დავალება'}
                    </button>
                  ))}
                </div>
              )}

              {/* Content */}
              <div style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '28px 28px', marginBottom: 28,
                minHeight: 300,
              }}>
                {!l.content ? (
                  <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '60px 0' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>edit_note</span>
                    კონტენტი მალე დაემატება
                  </div>
                ) : (
                  <div style={{
                    color: 'rgba(255,255,255,0.82)', fontSize: '0.94rem', lineHeight: 1.8,
                    whiteSpace: 'pre-wrap', fontFamily: 'inherit',
                  }}>
                    {l.content}
                  </div>
                )}
              </div>

              {/* Complete button */}
              {!isCompleted && (
                <button
                  onClick={handleComplete}
                  disabled={completeLesson.isPending}
                  style={{
                    padding: '13px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #5F13CA, #7B3FD6)',
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28,
                    opacity: completeLesson.isPending ? 0.7 : 1,
                  }}
                >
                  <span className="material-symbols-rounded">check_circle</span>
                  {nextLesson ? 'დასრულება და შემდეგი' : 'ლექციის დასრულება'}
                </button>
              )}
            </>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', paddingBottom: 40 }}>
            {prevLesson ? (
              <Link to={`/hack-lab/lesson/${(prevLesson as { id: string }).id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
                {(prevLesson as { title: string }).title}
              </Link>
            ) : <div />}
            {nextLesson && canAccess && (
              <Link to={`/hack-lab/lesson/${(nextLesson as { id: string }).id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12,
                background: 'rgba(95,19,202,0.1)', border: '1px solid rgba(95,19,202,0.25)',
                color: '#7B3FD6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
              }}>
                {(nextLesson as { title: string }).title}
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>
              </Link>
            )}
          </div>

        </div>
      </main>
    </>
  );
};

export default EthicalHackingLessonDetail;
