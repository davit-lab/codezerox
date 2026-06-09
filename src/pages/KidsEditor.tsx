import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KidsHeader from "@/components/kids/KidsHeader";
import TheoryRenderer from "@/components/kids/TheoryRenderer";
import LivePreview from "@/components/kids/LivePreview";
import { getLesson, markLessonComplete, getKidsLevel } from "@/data/kidsLessons";
import { useKidsProgress, useMarkLessonComplete, useKidsSubscription } from "@/hooks/useKidsProgress";
import { ArrowRight, Lightbulb, CheckCircle, RotateCcw, BookOpen, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

const KidsEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = getLesson(id || '');
  const [code, setCode] = useState(lesson?.starterCode || '');
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [showTheory, setShowTheory] = useState(!!lesson?.theory);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
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

  if (!lesson || lesson.type !== 'editor') {
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

  const steps = lesson.steps || [];
  const step = steps[currentStep];
  const allDone = currentStep >= steps.length;

  const checkStep = () => {
    if (!step) return;
    const userNorm = normalize(code);
    const expectedNorm = normalize(step.expectedCode);
    
    const prevCode = currentStep > 0 
      ? normalize(steps[currentStep - 1].expectedCode)
      : normalize(lesson.starterCode || '');
    
    let newPart = expectedNorm;
    if (prevCode && expectedNorm.includes(prevCode)) {
      newPart = expectedNorm.replace(prevCode, '');
    }
    
    const isCorrect = userNorm.includes(expectedNorm) || 
                       userNorm === expectedNorm ||
                       (newPart.length > 0 && userNorm.includes(newPart));
    
    if (isCorrect) {
      setFeedback('correct');
      setErrorMsg(null);
      const next = currentStep + 1;
      setTimeout(() => {
        setCurrentStep(next);
        setShowHint(false);
        setFeedback(null);
        if (next >= steps.length) {
          setShowConfetti(true);
          const alreadyDone = progressData.some(p => p.lesson_id === lesson.id);
          if (!alreadyDone) {
            markComplete.mutate({ lessonId: lesson.id, xpReward: lesson.xpReward || 0 });
            setXpEarned(lesson.xpReward || 0);
          }
          markLessonComplete(lesson.id);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      }, 800);
    } else {
      setFeedback('wrong');
      const msg = generateErrorMessage(code, step.expectedCode);
      setErrorMsg(msg);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const generateErrorMessage = (userCode: string, expected: string): string => {
    const user = userCode.trim();
    const exp = expected.trim();
    
    if (!user) return 'კოდი ცარიელია. დაწერე კოდი რედაქტორში.';
    
    const expectedTags = exp.match(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/g) || [];
    const userTags = user.match(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/g) || [];
    
    const missingTags = expectedTags.filter(tag => {
      const tagName = tag.replace(/\s+/g, '').toLowerCase();
      return !userTags.some(ut => ut.replace(/\s+/g, '').toLowerCase() === tagName);
    });
    
    if (missingTags.length > 0) {
      return `ვერ მოიძებნა: ${missingTags[0]} — დაამატე ეს თეგი შენს კოდში.`;
    }
    
    const expectedTexts = exp.match(/>([^<]+)</g)?.map(t => t.slice(1, -1).trim()).filter(t => t.length > 0) || [];
    const userTexts = user.match(/>([^<]+)</g)?.map(t => t.slice(1, -1).trim()).filter(t => t.length > 0) || [];
    
    for (const txt of expectedTexts) {
      if (!userTexts.some(ut => ut.toLowerCase().includes(txt.toLowerCase().substring(0, 5)))) {
        return `ტექსტი არასწორია. მოსალოდნელია: "${txt}"`;
      }
    }
    
    const openTags = user.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*(?<!\/)>/g) || [];
    const closeTags = user.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [];
    if (openTags.length > closeTags.length) {
      return 'ზოგი თეგი დაუხურავი დარჩა. შეამოწმე დამხურავი თეგები.';
    }
    
    return 'კოდი არ ემთხვევა მოსალოდნელს. შეადარე ინსტრუქციას და სცადე თავიდან.';
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

        {/* Current step */}
        {!allDone && step && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: '14px 18px', marginBottom: 12,
            border: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '0.82rem',
              }}>{currentStep + 1}</div>
              <div>
                <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-georgian)', fontWeight: 700, fontSize: '0.85rem' }}>
                  {step.instruction}
                </p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontFamily: 'var(--font-georgian)', marginTop: 1 }}>
                  ნაბიჯი {currentStep + 1}/{steps.length}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setShowHint(!showHint)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
                color: '#7c3aed', fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-georgian)',
              }}>
                <Lightbulb size={13} /> მინიშნება
              </button>
              <button onClick={checkStep} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 16px', borderRadius: 10,
                background: feedback === 'correct' ? '#059669' : feedback === 'wrong' ? '#e11d48' : '#7c3aed',
                border: 'none',
                color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-georgian)',
                transition: 'all 0.15s',
              }}>
                <CheckCircle size={13} /> {feedback === 'correct' ? 'სწორია' : feedback === 'wrong' ? 'არასწორია' : 'შემოწმება'}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {!allDone && (
          <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                height: 4, flex: 1, borderRadius: 4,
                background: i < currentStep ? '#059669' : i === currentStep ? '#7c3aed' : 'var(--bg-elevated)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}

        {/* Hint */}
        {showHint && step && (
          <div style={{
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
            color: '#7c3aed', fontSize: '0.82rem',
            fontFamily: 'var(--font-georgian)',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <Lightbulb size={14} style={{ marginTop: 2, flexShrink: 0 }} /> {step.hint}
          </div>
        )}

        {/* Error */}
        {errorMsg && feedback === 'wrong' && (
          <div style={{
            background: 'rgba(244,63,94,0.04)',
            border: '1px solid rgba(244,63,94,0.15)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
            color: '#e11d48', fontSize: '0.82rem',
            fontFamily: 'var(--font-georgian)',
            lineHeight: 1.5,
          }}>
            {errorMsg}
          </div>
        )}

        {/* Editor + Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
              }}>index.html</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              placeholder="დაწერე HTML კოდი აქ..."
              style={{
                width: '100%', height: 360, padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '0.85rem',
                background: '#0a0a12', color: '#a5f3fc',
                border: 'none', resize: 'none', outline: 'none',
                lineHeight: 1.7,
                caretColor: '#7c3aed',
              }}
            />
          </div>

          <div className="kids-editor-panel">
            <div style={{
              background: 'rgba(13,13,20,0.7)', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: '1px solid var(--border-light)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{
                color: 'var(--text-muted)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600,
              }}>პრევიუ</span>
            </div>
            <div style={{ height: 360 }}>
              <LivePreview html={code} />
            </div>
          </div>
        </div>

        {allDone && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <div className="kids-completion-card">
              <p style={{
                color: 'var(--emerald)', fontSize: '1.15rem', fontWeight: 800,
                fontFamily: 'var(--font-georgian)', marginBottom: 6,
              }}>
                დავალება შესრულებულია
              </p>
              {xpEarned > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,215,0,0.08)', padding: '4px 12px', borderRadius: 8,
                }}>
                  <Zap size={13} style={{ color: 'var(--gold)' }} />
                  <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-georgian)' }}>+{xpEarned} XP</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <button onClick={() => { setCode(lesson.starterCode || ''); setCurrentStep(0); setXpEarned(0); }} style={{
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

export default KidsEditor;
