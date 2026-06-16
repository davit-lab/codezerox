import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KidsHeader from "@/components/kids/KidsHeader";
import TheoryRenderer from "@/components/kids/TheoryRenderer";
import { getLesson, markLessonComplete, getKidsLevel } from "@/data/kidsLessons";
import { useKidsProgress, useMarkLessonComplete, useKidsSubscription } from "@/hooks/useKidsProgress";
import { usePartialProgress } from "@/hooks/usePartialProgress";
import { ArrowRight, CheckCircle, Zap, RotateCcw, Lightbulb, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const KidsFillBlanks = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = getLesson(id || '');
  const [currentTask, setCurrentTask] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showTheory, setShowTheory] = useState(!!lesson?.theory);
  const { data: progressData = [] } = useKidsProgress();
  const { user, isLoading: authLoading, isAdmin, isChild } = useAuth();
  const { data: subscription, isLoading: subLoading } = useKidsSubscription();
  const xp = progressData.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
  const markComplete = useMarkLessonComplete();
  const { updateProgress, clearProgress } = usePartialProgress();

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

  if (!lesson || lesson.type !== 'fillblanks' || !lesson.fillBlanks) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)', marginBottom: 14 }}>გაკვეთილი ვერ მოიძებნა</p>
          <button onClick={() => navigate('/kids')} style={{
            padding: '10px 24px', borderRadius: 10,
            background: '#7c3aed', color: '#fff', border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font-georgian)', fontWeight: 700,
          }}>უკან</button>
        </div>
      </div>
    );
  }

  const tasks = lesson.fillBlanks;
  const task = tasks[currentTask];
  const isLastTask = currentTask === tasks.length - 1;

  // Parse template to render inputs
  const renderTemplate = () => {
    const parts = task.template.split(/(__\d+__)/g);
    return parts.map((part, i) => {
      const match = part.match(/^__(\d+)__$/);
      if (match) {
        const blankId = match[1];
        const blank = task.blanks.find(b => b.id === blankId);
        const val = answers[blankId] || '';
        const isRight = checked && blank && val.trim().toLowerCase() === blank.answer.toLowerCase();
        const isWrong = checked && blank && val.trim().toLowerCase() !== blank.answer.toLowerCase();
        return (
          <input key={i}
            value={val}
            onChange={e => {
              setAnswers(prev => ({ ...prev, [blankId]: e.target.value }));
              setChecked(false);
            }}
            disabled={checked && isRight}
            placeholder="?"
            style={{
              display: 'inline-block', width: Math.max(60, (blank?.answer.length || 3) * 12 + 16),
              padding: '4px 8px', borderRadius: 6,
              background: isRight ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(244,63,94,0.1)' : 'rgba(124,58,237,0.06)',
              border: `2px solid ${isRight ? 'rgba(34,197,94,0.4)' : isWrong ? 'rgba(244,63,94,0.4)' : 'rgba(124,58,237,0.2)'}`,
              color: isRight ? '#22c55e' : isWrong ? '#f43f5e' : 'var(--text-primary)',
              fontFamily: 'var(--font-mono), monospace', fontSize: '0.82rem',
              textAlign: 'center', outline: 'none',
            }}
          />
        );
      }
      return <span key={i} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{part}</span>;
    });
  };

  const handleCheck = () => {
    let allRight = true;
    for (const b of task.blanks) {
      const val = (answers[b.id] || '').trim().toLowerCase();
      if (val !== b.answer.toLowerCase()) allRight = false;
    }
    setChecked(true);
    setIsCorrect(allRight);
    if (allRight) {
      const tasksDone = currentTask + 1;
      if (lesson?.id) {
        updateProgress(lesson.id, tasksDone, tasks.length);
      }
      setTimeout(() => {
        if (isLastTask) {
          finishLesson();
        } else {
          setCurrentTask(c => c + 1);
          setAnswers({});
          setChecked(false);
          setShowHint(false);
          setHintIdx(0);
        }
      }, 1000);
    }
  };

  const finishLesson = () => {
    setCompleted(true);
    setShowConfetti(true);
    if (lesson?.id) clearProgress(lesson.id);
    const alreadyDone = progressData.some(p => p.lesson_id === lesson.id);
    if (!alreadyDone) {
      markComplete.mutate({ lessonId: lesson.id, xpReward: lesson.xpReward || 0 });
      setXpEarned(lesson.xpReward || 0);
    }
    markLessonComplete(lesson.id);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleShowHint = () => {
    if (!showHint) { setShowHint(true); return; }
    if (hintIdx < task.blanks[0]?.hints.length - 1) setHintIdx(h => h + 1);
  };

  const handleRestart = () => {
    setCurrentTask(0);
    setAnswers({});
    setChecked(false);
    setShowHint(false);
    setHintIdx(0);
    setCompleted(false);
    setXpEarned(0);
    if (lesson?.id) clearProgress(lesson.id);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      {showConfetti && <div className="kids-confetti" />}
      <KidsHeader title={lesson.title} xp={xp + xpEarned} level={getKidsLevel(xp + xpEarned)} />

      <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 6 }}>
            <span>დავალება {currentTask + 1} / {tasks.length}</span>
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>{Math.round(((currentTask + (checked && isCorrect ? 1 : 0)) / tasks.length) * 100)}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${((currentTask + (checked && isCorrect ? 1 : 0)) / tasks.length) * 100}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 4, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Theory */}
        {lesson.theory && showTheory && (
          <div style={{ marginBottom: 16 }}>
            <TheoryRenderer text={lesson.theory} onComplete={() => setShowTheory(false)} />
          </div>
        )}

        {!completed ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '22px 24px',
          }}>
            {/* Instruction */}
            <p style={{
              fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: 16, fontFamily: 'var(--font-georgian)', lineHeight: 1.5,
            }}>
              <span style={{ fontSize: '1.1rem', marginRight: 6 }}>{lesson.emoji}</span>
              {task.instruction}
            </p>

            {/* Code template with blanks */}
            <div style={{
              background: '#0f0f1a', border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 12, padding: '16px 18px', marginBottom: 16,
              fontFamily: 'var(--font-mono), monospace', fontSize: '0.85rem',
              lineHeight: 1.8, color: '#e2e8f0',
            }}>
              {renderTemplate()}
            </div>

            {/* Hint */}
            {showHint && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 14,
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <p style={{ fontSize: '0.78rem', color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lightbulb size={13} />
                  {task.blanks[0]?.hints[hintIdx] || 'სცადე კიდევ ერთხელ!'}
                </p>
              </div>
            )}

            {/* Feedback */}
            {checked && !isCorrect && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 14,
                background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
              }}>
                <p style={{ fontSize: '0.8rem', color: '#f43f5e', margin: 0, fontWeight: 700, fontFamily: 'var(--font-georgian)' }}>
                  არასწორია. სცადე კიდევ!
                </p>
              </div>
            )}
            {checked && isCorrect && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 14,
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
              }}>
                <p style={{ fontSize: '0.8rem', color: '#22c55e', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} /> სწორია!
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleShowHint} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 10,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-georgian)',
              }}>
                <Lightbulb size={14} /> მინიშნება
              </button>
              <button onClick={handleCheck} disabled={checked && isCorrect}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 22px', borderRadius: 10,
                  background: checked && isCorrect ? 'rgba(34,197,94,0.15)' : '#7c3aed',
                  border: 'none', color: checked && isCorrect ? '#22c55e' : '#fff',
                  fontWeight: 700, cursor: checked && isCorrect ? 'default' : 'pointer',
                  fontSize: '0.85rem', fontFamily: 'var(--font-georgian)',
                }}>
                {checked && isCorrect ? <><CheckCircle size={14} /> სწორია!</> : <><ChevronRight size={14} /> შემოწმება</>}
              </button>
            </div>
          </div>
        ) : (
          /* Completion screen */
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '32px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(34,197,94,0.3)',
            }}>
              <CheckCircle size={32} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              გილოცავ! 🎉
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'var(--font-georgian)' }}>
              ყველა დავალება დასრულებულია!
            </p>
            {xpEarned > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                marginBottom: 20,
              }}>
                <Zap size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>+{xpEarned} XP</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleRestart} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10,
                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
                color: '#7c3aed', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-georgian)',
              }}>
                <RotateCcw size={14} /> კიდევ ერთხელ
              </button>
              <button onClick={() => navigate('/kids')} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10,
                background: '#7c3aed', border: 'none',
                color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-georgian)',
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

export default KidsFillBlanks;
