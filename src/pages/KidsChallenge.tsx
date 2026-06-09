import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KidsHeader from "@/components/kids/KidsHeader";
import TheoryRenderer from "@/components/kids/TheoryRenderer";
import LivePreview from "@/components/kids/LivePreview";
import { getLesson, markLessonComplete, getKidsLevel } from "@/data/kidsLessons";
import { useKidsProgress, useMarkLessonComplete, useKidsSubscription } from "@/hooks/useKidsProgress";
import { ArrowRight, Lightbulb, Eye, EyeOff, RotateCcw, BookOpen, Zap, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const KidsChallenge = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = getLesson(id || '');
  const [css, setCss] = useState(lesson?.starterCss || '');
  const [hintIndex, setHintIndex] = useState(-1);
  const [showTarget, setShowTarget] = useState(true);
  const [showTheory, setShowTheory] = useState(!!lesson?.theory);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
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

  if (!lesson || lesson.type !== 'challenge') {
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

  const hints = lesson.hints || [];

  const handleShowHint = () => {
    if (hintIndex < hints.length - 1) setHintIndex(hintIndex + 1);
  };

  const handleComplete = () => {
    setCompleted(true);
    setShowConfetti(true);
    const alreadyDone = progressData.some(p => p.lesson_id === lesson.id);
    if (!alreadyDone) {
      markComplete.mutate({ lessonId: lesson.id, xpReward: lesson.xpReward || 0 });
      setXpEarned(lesson.xpReward || 0);
    }
    markLessonComplete(lesson.id);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      {showConfetti && <div className="kids-confetti" />}
      <KidsHeader title={lesson.title} xp={xp + xpEarned} level={getKidsLevel(xp + xpEarned)} />

      <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Theory */}
        {lesson.theory && showTheory && (
          <div className="kids-theory-panel" style={{ marginBottom: 18 }}>
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
              გასაგებია
            </button>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 14, padding: '14px 18px', marginBottom: 12,
          border: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Eye size={16} color="#fff" />
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-georgian)', fontWeight: 700, fontSize: '0.85rem' }}>
                {lesson.description}
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontFamily: 'var(--font-georgian)', marginTop: 1 }}>
                დაწერე CSS და მიუახლოვდი სამიზნეს
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setShowTarget(!showTarget)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 10,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer',
            }}>
              {showTarget ? <EyeOff size={13} /> : <Eye size={13} />}
              {showTarget ? 'დამალე' : 'სამიზნე'}
            </button>
            <button onClick={handleShowHint} disabled={hintIndex >= hints.length - 1} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 10,
              background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)',
              color: '#7c3aed', fontSize: '0.78rem', fontWeight: 600,
              cursor: hintIndex >= hints.length - 1 ? 'default' : 'pointer',
              opacity: hintIndex >= hints.length - 1 ? 0.4 : 1,
              fontFamily: 'var(--font-georgian)',
            }}>
              <Lightbulb size={13} /> მინიშნება ({hintIndex + 1}/{hints.length})
            </button>
            {!completed && (
              <button onClick={handleComplete} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 16px', borderRadius: 10,
                background: '#059669', border: 'none',
                color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-georgian)',
              }}>
                <CheckCircle size={13} /> დავასრულე
              </button>
            )}
          </div>
        </div>

        {/* Hints */}
        {hintIndex >= 0 && (
          <div style={{
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
            fontSize: '0.82rem', fontFamily: 'var(--font-georgian)',
          }}>
            {hints.slice(0, hintIndex + 1).map((h, i) => (
              <p key={i} style={{
                color: '#7c3aed',
                display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4,
              }}>
                <Lightbulb size={13} style={{ marginTop: 2, flexShrink: 0 }} /> {h}
              </p>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Left: target + user preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {showTarget && (
              <div className="kids-editor-panel">
                <div style={{
                  background: 'rgba(13,13,20,0.7)', padding: '10px 14px',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{
                    color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600,
                  }}>სამიზნე</span>
                </div>
                <div style={{ height: 190, background: '#fff' }}>
                  <LivePreview html={lesson.challengeHtml || ''} css={lesson.targetCss} />
                </div>
              </div>
            )}

            <div className="kids-editor-panel">
              <div style={{
                background: 'rgba(13,13,20,0.7)', padding: '10px 14px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{
                  color: 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600,
                }}>შენი შედეგი</span>
              </div>
              <div style={{ height: 190, background: '#fff' }}>
                <LivePreview html={lesson.challengeHtml || ''} css={css} />
              </div>
            </div>
          </div>

          {/* Right: CSS editor */}
          <div className="kids-editor-panel">
            <div style={{
              background: 'rgba(13,13,20,0.7)', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: '1px solid var(--border-light)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{
                marginLeft: 8, color: 'var(--text-dim)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
              }}>style.css</span>
              {lesson.xpReward && (
                <span style={{
                  marginLeft: 'auto', fontSize: '0.65rem',
                  background: 'rgba(255,215,0,0.08)', color: 'var(--gold)',
                  padding: '2px 8px', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <Zap size={9} /> +{lesson.xpReward}
                </span>
              )}
            </div>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              spellCheck={false}
              placeholder="დაწერე CSS აქ..."
              style={{
                width: '100%', height: 392, padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '0.85rem',
                background: '#0a0a12', color: '#67e8f9',
                border: 'none', resize: 'none', outline: 'none',
                lineHeight: 1.7,
                caretColor: '#7c3aed',
              }}
            />
          </div>
        </div>

        {completed && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <div className="kids-completion-card">
              <p style={{
                color: 'var(--emerald)', fontSize: '1.15rem', fontWeight: 800,
                fontFamily: 'var(--font-georgian)', marginBottom: 6,
              }}>
                გამოწვევა დასრულდა
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
              <button onClick={() => { setCss(lesson.starterCss || ''); setCompleted(false); setHintIndex(-1); setXpEarned(0); }} style={{
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

export default KidsChallenge;
