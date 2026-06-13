import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KidsHeader from "@/components/kids/KidsHeader";
import TheoryRenderer from "@/components/kids/TheoryRenderer";
import DragDropPuzzle from "@/components/kids/DragDropPuzzle";
import LivePreview from "@/components/kids/LivePreview";
import { getLesson, markLessonComplete, getKidsLevel } from "@/data/kidsLessons";
import { useKidsProgress, useMarkLessonComplete, useKidsSubscription } from "@/hooks/useKidsProgress";
import { ArrowRight, RotateCcw, BookOpen, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const KidsPuzzle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = getLesson(id || '');
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showTheory, setShowTheory] = useState(!!lesson?.theory);
  const { data: progressData = [] } = useKidsProgress();
  const { user, isLoading: authLoading, isAdmin, isChild } = useAuth();
  const { data: subscription, isLoading: subLoading } = useKidsSubscription();
  const xp = progressData.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
  const markComplete = useMarkLessonComplete();

  useEffect(() => {
    if (!authLoading && !user) navigate('/kids/login', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && user && !subLoading && !isAdmin && isChild && !subscription) {
      navigate('/kids', { replace: true });
    }
  }, [authLoading, user, subLoading, isAdmin, isChild, subscription, navigate]);

  if (authLoading || !user || (isChild && subLoading)) return null;
  if (!isAdmin && isChild && !subscription) return null;

  if (!lesson || lesson.type !== 'puzzle') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)', fontSize: '1rem', marginBottom: 14 }}>გაკვეთილი ვერ მოიძებნა</p>
          <button onClick={() => navigate('/kids')} style={{
            padding: '10px 24px', borderRadius: 10,
            background: '#7c3aed', color: '#fff', border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font-georgian)', fontWeight: 700, fontSize: '0.85rem',
          }}>უკან</button>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    setCompleted(true);
    setShowConfetti(true);
    const alreadyDone = progressData.some(p => p.lesson_id === lesson.id);
    if (!alreadyDone) {
      markComplete.mutate({ lessonId: lesson.id, xpReward: lesson.xpReward || 0 });
      setXpEarned(lesson.xpReward || 0);
    }
    markLessonComplete(lesson.id); // localStorage fallback
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      {showConfetti && <div className="kids-confetti" />}
      <KidsHeader title={lesson.title} xp={xp + xpEarned} level={getKidsLevel(xp + xpEarned)} />

      <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Theory */}
        {lesson.theory && showTheory && (
          <div className="kids-theory-panel" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BookOpen size={16} style={{ color: '#7c3aed' }} />
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-georgian)', margin: 0, fontSize: '0.92rem' }}>
                თეორია
              </h3>
            </div>
            <TheoryRenderer text={lesson.theory} />
            <button onClick={() => setShowTheory(false)} style={{
              marginTop: 16, padding: '9px 20px', borderRadius: 10,
              background: '#7c3aed',
              border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-georgian)',
            }}>
              გასაგებია, დავიწყო
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {/* Puzzle area */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: 24,
            border: '1px solid var(--border-light)',
          }}>
            <h2 style={{
              fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: 16, fontFamily: 'var(--font-georgian)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              აწყვე კოდი
              {lesson.xpReward && (
                <span style={{
                  fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(255,215,0,0.08)', color: 'var(--gold)',
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  <Zap size={10} /> +{lesson.xpReward} XP
                </span>
              )}
            </h2>
            <DragDropPuzzle pieces={lesson.puzzlePieces || []} correctOrder={lesson.correctOrder || []} onComplete={handleComplete} />
          </div>

          {/* Result preview */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: 24,
            border: '1px solid var(--border-light)',
          }}>
            <h2 style={{
              fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: 16, fontFamily: 'var(--font-georgian)',
            }}>შედეგი</h2>
            <div style={{
              height: 240, borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--border-light)',
            }}>
              {completed && lesson.resultHtml ? (
                <LivePreview html={lesson.resultHtml} />
              ) : (
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-elevated)',
                }}>
                  <p style={{
                    color: 'var(--text-dim)', fontFamily: 'var(--font-georgian)',
                    textAlign: 'center', padding: '0 20px', fontSize: '0.85rem',
                  }}>
                    აწყვე პაზლი შედეგის სანახავად
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {completed && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <div className="kids-completion-card">
              <p style={{
                color: 'var(--emerald)', fontSize: '1.2rem', fontWeight: 800,
                fontFamily: 'var(--font-georgian)', marginBottom: 6,
              }}>
                სწორია!
              </p>
              {xpEarned > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,215,0,0.08)', padding: '4px 12px', borderRadius: 8,
                }}>
                  <Zap size={13} style={{ color: 'var(--gold)' }} />
                  <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700 }}>+{xpEarned} XP</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <button onClick={() => window.location.reload()} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '10px 20px', borderRadius: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-georgian)',
              }}>
                <RotateCcw size={14} /> თავიდან
              </button>
              <button onClick={() => navigate('/kids')} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '10px 20px', borderRadius: 10,
                background: '#7c3aed', border: 'none',
                color: '#fff', fontSize: '0.84rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-georgian)',
              }}>
                შემდეგი <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidsPuzzle;
