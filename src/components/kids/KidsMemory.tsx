import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KidsHeader from "@/components/kids/KidsHeader";
import { getLesson, markLessonComplete, getKidsLevel } from "@/data/kidsLessons";
import { useKidsProgress, useMarkLessonComplete, useKidsSubscription } from "@/hooks/useKidsProgress";
import { usePartialProgress } from "@/hooks/usePartialProgress";
import { ArrowRight, CheckCircle, Zap, RotateCcw, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Card {
  id: string;
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const KidsMemory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = getLesson(id || '');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
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

  // Timer
  useEffect(() => {
    if (!started || completed) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, completed]);

  // Initialize cards
  useEffect(() => {
    if (!lesson?.puzzlePieces || lesson.type !== 'memory') return;
    const pairs = lesson.puzzlePieces.map((p, i) => ({
      id: `card-${i}-a`,
      content: p.content,
      pairId: p.id,
      isFlipped: false,
      isMatched: false,
    }));
    const matches = lesson.puzzlePieces.map((p, i) => ({
      id: `card-${i}-b`,
      content: lesson.correctOrder?.[i] || p.order.toString(),
      pairId: p.id,
      isFlipped: false,
      isMatched: false,
    }));
    const all = [...pairs, ...matches].sort(() => Math.random() - 0.5);
    setCards(all);
  }, [lesson]);

  if (authLoading || !user || (isChild && subLoading)) return null;
  if (!isAdmin && isChild && !subscription) return null;

  if (!lesson || lesson.type !== 'memory' || !lesson.puzzlePieces) {
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

  const totalPairs = lesson.puzzlePieces.length;

  const handleCardClick = useCallback((cardId: string) => {
    if (!started) setStarted(true);
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedIds.length >= 2) return;

    const newFlipped = [...flippedIds, cardId];
    setFlippedIds(newFlipped);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = cards.find(c => c.id === firstId);
      const second = cards.find(c => c.id === secondId);

      if (first && second && first.pairId === second.pairId) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          ));
          setFlippedIds([]);
          setMatchedCount(m => {
            const newCount = m + 1;
            if (lesson?.id) {
              updateProgress(lesson.id, newCount, totalPairs);
            }
            if (newCount === totalPairs) {
              finishGame(newCount);
            }
            return newCount;
          });
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedIds([]);
        }, 1000);
      }
    }
  }, [cards, flippedIds, started, totalPairs]);

  const finishGame = (finalMatched: number) => {
    setCompleted(true);
    setShowConfetti(true);
    if (lesson?.id) clearProgress(lesson.id);
    const alreadyDone = progressData.some(p => p.lesson_id === lesson.id);
    const timeBonus = timer < 60 ? 10 : timer < 120 ? 5 : 0;
    const moveBonus = moves <= totalPairs * 2 ? 5 : 0;
    const totalXP = (lesson.xpReward || 0) + timeBonus + moveBonus;
    if (!alreadyDone) {
      markComplete.mutate({ lessonId: lesson.id, xpReward: totalXP });
      setXpEarned(totalXP);
    }
    markLessonComplete(lesson.id);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleRestart = () => {
    setCards(prev => prev.map(c => ({ ...c, isFlipped: false, isMatched: false })).sort(() => Math.random() - 0.5));
    setFlippedIds([]);
    setMatchedCount(0);
    setMoves(0);
    setTimer(0);
    setStarted(false);
    setCompleted(false);
    setXpEarned(0);
    if (lesson?.id) clearProgress(lesson.id);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      {showConfetti && <div className="kids-confetti" />}
      <KidsHeader title={lesson.title} xp={xp + xpEarned} level={getKidsLevel(xp + xpEarned)} />

      <div style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
        {/* Stats bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, padding: '10px 16px', borderRadius: 12,
          background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatTime(timer)}</span>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed' }}>
            {matchedCount} / {totalPairs} წყვილი
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            {moves} სვლა
          </div>
        </div>

        {!completed ? (
          <>
            {/* Memory grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(4, cards.length)}, 1fr)`,
              gap: 10,
            }}>
              {cards.map(card => {
                const isRevealed = card.isFlipped || card.isMatched;
                return (
                  <button key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.isMatched || card.isFlipped}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 12,
                      border: `2px solid ${card.isMatched ? 'rgba(34,197,94,0.4)' : isRevealed ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      background: card.isMatched ? 'rgba(34,197,94,0.1)' : isRevealed ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: card.isMatched || card.isFlipped ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      transform: isRevealed ? 'rotateY(0deg)' : 'rotateY(0deg)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isRevealed ? 'var(--text-primary)' : 'transparent',
                      fontFamily: 'var(--font-mono), monospace',
                      padding: 8,
                      textAlign: 'center',
                      wordBreak: 'break-word',
                    }}
                  >
                    {isRevealed ? (
                      card.content
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>❓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instruction */}
            <p style={{
              textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)',
              marginTop: 16, fontFamily: 'var(--font-georgian)',
            }}>
              დააჭირე ბარათებს და იპოვე ერთმანეთის შესაბამისი წყვილები!
            </p>
          </>
        ) : (
          /* Results */
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-georgian)' }}>
              ყველა წყვილი იპოვე!
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 16 }}>
              {formatTime(timer)} · {moves} სვლა
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

export default KidsMemory;
