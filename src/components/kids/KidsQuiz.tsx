import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KidsHeader from "@/components/kids/KidsHeader";
import { getLesson, markLessonComplete, getKidsLevel } from "@/data/kidsLessons";
import { useKidsProgress, useMarkLessonComplete, useKidsSubscription } from "@/hooks/useKidsProgress";
import { ArrowRight, CheckCircle, XCircle, Zap, RotateCcw, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const KidsQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = getLesson(id || '');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
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

  if (!lesson || lesson.type !== 'quiz' || !lesson.quizQuestions) {
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

  const questions = lesson.quizQuestions;
  const q = questions[currentQ];
  const isCorrect = selected === q.correctIndex;
  const isLastQ = currentQ === questions.length - 1;
  const allCorrect = correctCount === questions.length;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = i === q.correctIndex;
    if (correct) {
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setMaxStreak(s => Math.max(s, streak));
      setStreak(0);
    }

    setTimeout(() => {
      if (isLastQ) {
        setMaxStreak(s => Math.max(s, streak + (correct ? 1 : 0)));
        finishQuiz(correctCount + (correct ? 1 : 0));
      } else {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
      }
    }, 1500);
  };

  const finishQuiz = (finalCorrect: number) => {
    setCompleted(true);
    setShowConfetti(true);
    const alreadyDone = progressData.some(p => p.lesson_id === lesson.id);
    const pct = finalCorrect / questions.length;
    const bonusXP = pct === 1 ? 10 : pct >= 0.7 ? 5 : 0;
    const totalXP = (lesson.xpReward || 0) + bonusXP;
    if (!alreadyDone) {
      markComplete.mutate({ lessonId: lesson.id, xpReward: totalXP });
      setXpEarned(totalXP);
    }
    markLessonComplete(lesson.id);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setCompleted(false);
    setXpEarned(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      {showConfetti && <div className="kids-confetti" />}
      <KidsHeader title={lesson.title} xp={xp + xpEarned} level={getKidsLevel(xp + xpEarned)} />

      <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 6 }}>
            <span>კითხვა {currentQ + 1} / {questions.length}</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{correctCount} სწორი</span>
          </div>
          <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 4, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Streak indicator */}
        {streak >= 2 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
            padding: '6px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            width: 'fit-content',
          }}>
            <Zap size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>🔥 {streak} ზედიზედ!</span>
          </div>
        )}

        {!completed ? (
          <>
            {/* Question card */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '22px 24px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: '1.3rem' }}>{lesson.emoji}</span>
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-georgian)' }}>
                  {q.question}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, i) => {
                  const isSel = selected === i;
                  const isCorrectOpt = i === q.correctIndex;
                  const showResult = answered && isSel;
                  const showCorrect = answered && isCorrectOpt && !isSel;
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={answered}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '14px 18px', borderRadius: 12,
                        background: showResult ? (isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)') :
                          showCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${showResult ? (isCorrect ? 'rgba(34,197,94,0.4)' : 'rgba(244,63,94,0.4)') :
                          showCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: showResult ? (isCorrect ? '#22c55e' : '#f43f5e') :
                          showCorrect ? '#22c55e' : 'var(--text-primary)',
                        fontSize: '0.88rem', textAlign: 'left', cursor: answered ? 'default' : 'pointer',
                        fontFamily: 'var(--font-georgian)', fontWeight: 600, transition: 'all 0.2s',
                      }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: showResult ? (isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)') :
                          showCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${showResult ? (isCorrect ? '#22c55e' : '#f43f5e') :
                          showCorrect ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                        color: showResult ? (isCorrect ? '#22c55e' : '#f43f5e') :
                          showCorrect ? '#22c55e' : 'var(--text-dim)',
                        fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                      }}>{String.fromCharCode(65 + i)}</span>
                      {showResult && (isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />)}
                      {showCorrect && !isSel && <CheckCircle size={18} />}
                      {opt}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 10,
                  background: isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(244,63,94,0.06)',
                  border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)'}`,
                }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'var(--font-georgian)' }}>
                    <Lightbulb size={13} style={{ color: '#f59e0b', marginRight: 6, verticalAlign: 'middle' }} />
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Results screen */
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '32px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: allCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${allCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
              {allCorrect ? <CheckCircle size={32} style={{ color: '#22c55e' }} /> : <Zap size={32} style={{ color: '#f59e0b' }} />}
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              {allCorrect ? 'შესანიშნავი! 🎉' : 'კარგია!'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'var(--font-georgian)' }}>
              {correctCount} / {questions.length} სწორი პასუხი
            </p>
            {maxStreak >= 3 && (
              <p style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, marginBottom: 12 }}>
                🔥 მაქსიმალური სერია: {maxStreak}!
              </p>
            )}
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

export default KidsQuiz;
