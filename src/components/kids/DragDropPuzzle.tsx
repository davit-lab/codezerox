import { useState, useCallback } from "react";
import { type PuzzlePiece } from "@/data/kidsLessons";
import { CheckCircle, RotateCcw, Lightbulb } from "lucide-react";

interface DragDropPuzzleProps {
  pieces: PuzzlePiece[];
  correctOrder: string[];
  onComplete: () => void;
}

const DragDropPuzzle = ({ pieces, correctOrder, onComplete }: DragDropPuzzleProps) => {
  const [shuffledPieces, setShuffledPieces] = useState<PuzzlePiece[]>(() =>
    [...pieces].sort(() => Math.random() - 0.5)
  );
  const [placedPieces, setPlacedPieces] = useState<PuzzlePiece[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
    setWrongAttempt(false);
  };

  const handleDrop = useCallback(() => {
    if (!draggedId) return;
    const piece = shuffledPieces.find(p => p.id === draggedId);
    if (!piece) return;
    const nextIndex = placedPieces.length;
    const expectedId = correctOrder[nextIndex];
    if (draggedId === expectedId) {
      const newPlaced = [...placedPieces, piece];
      setPlacedPieces(newPlaced);
      setShuffledPieces(prev => prev.filter(p => p.id !== draggedId));
      setWrongAttempt(false);
      if (newPlaced.length === correctOrder.length) {
        setIsCorrect(true);
        setTimeout(onComplete, 500);
      }
    } else {
      setWrongAttempt(true);
    }
    setDraggedId(null);
  }, [draggedId, placedPieces, shuffledPieces, correctOrder, onComplete]);

  const handleReset = () => {
    setShuffledPieces([...pieces].sort(() => Math.random() - 0.5));
    setPlacedPieces([]);
    setIsCorrect(false);
    setWrongAttempt(false);
    setShowHint(false);
  };

  const handleTapPlace = (piece: PuzzlePiece) => {
    const nextIndex = placedPieces.length;
    const expectedId = correctOrder[nextIndex];
    if (piece.id === expectedId) {
      const newPlaced = [...placedPieces, piece];
      setPlacedPieces(newPlaced);
      setShuffledPieces(prev => prev.filter(p => p.id !== piece.id));
      setWrongAttempt(false);
      if (newPlaced.length === correctOrder.length) {
        setIsCorrect(true);
        setTimeout(onComplete, 500);
      }
    } else {
      setWrongAttempt(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          minHeight: 120,
          borderRadius: 12,
          border: `2px dashed ${isCorrect ? '#059669' : wrongAttempt ? '#e11d48' : 'var(--border-accent)'}`,
          background: isCorrect ? 'rgba(5,150,105,0.04)' : wrongAttempt ? 'rgba(225,29,72,0.04)' : 'var(--bg-elevated)',
          padding: 14,
          transition: 'all 0.2s',
        }}
      >
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-georgian)' }}>
          გადმოიტანე აქ სწორი თანმიმდევრობით:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {placedPieces.map((piece) => (
            <div key={piece.id} style={{
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              borderRadius: 8, padding: '6px 12px',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              color: '#059669',
              display: 'flex', alignItems: 'center', gap: 5,
              whiteSpace: 'pre-wrap',
            }}>
              <CheckCircle size={12} />
              {piece.content}
            </div>
          ))}
          {!isCorrect && placedPieces.length < correctOrder.length && (
            <div style={{
              border: '2px dashed var(--border-light)',
              borderRadius: 8, padding: '6px 12px',
              color: 'var(--text-dim)', fontSize: '0.75rem',
            }}>
              {placedPieces.length + 1}-ე ელემენტი...
            </div>
          )}
        </div>
        {wrongAttempt && (
          <p style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: 8, fontFamily: 'var(--font-georgian)' }}>
            არასწორი თანმიმდევრობა. სცადე სხვა ელემენტი.
          </p>
        )}
        {isCorrect && (
          <p style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 700, marginTop: 8, fontFamily: 'var(--font-georgian)' }}>
            სწორია!
          </p>
        )}
      </div>

      {/* Available pieces */}
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-georgian)' }}>
          აირჩიე სწორი თანმიმდევრობა:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {shuffledPieces.map((piece) => (
            <div
              key={piece.id}
              draggable
              onDragStart={() => handleDragStart(piece.id)}
              onClick={() => handleTapPlace(piece)}
              style={{
                cursor: 'grab',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-accent)',
                borderRadius: 8, padding: '6px 12px',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                color: '#7c3aed',
                transition: 'all 0.15s',
                userSelect: 'none',
                whiteSpace: 'pre-wrap',
                opacity: draggedId === piece.id ? 0.3 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {piece.content}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={handleReset} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border-light)',
          color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-georgian)',
        }}>
          <RotateCcw size={13} /> თავიდან
        </button>
        <button onClick={() => setShowHint(!showHint)} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border-light)',
          color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-georgian)',
        }}>
          <Lightbulb size={13} /> მინიშნება
        </button>
      </div>

      {showHint && (
        <div style={{
          background: 'rgba(124,58,237,0.04)',
          border: '1px solid rgba(124,58,237,0.12)',
          borderRadius: 10, padding: 12,
          color: '#7c3aed', fontSize: '0.8rem',
          fontFamily: 'var(--font-georgian)',
        }}>
          მინიშნება: პირველი ელემენტი უნდა იყოს <code style={{
            background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4,
            fontFamily: 'var(--font-mono)',
          }}>{pieces[0]?.content}</code>
        </div>
      )}
    </div>
  );
};

export default DragDropPuzzle;
