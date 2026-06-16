import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, CheckCircle, XCircle, Lightbulb, Sparkles } from 'lucide-react';

interface TheoryStep {
  emoji: string;
  title: string;
  content: string[];
  codeBlocks: string[];
}

function parseTheory(text: string): TheoryStep[] {
  const lines = text.split('\n');
  const steps: TheoryStep[] = [];
  let current: TheoryStep | null = null;
  let codeBuffer: string[] = [];
  let inCode = false;

  const flushStep = () => {
    if (current) {
      if (codeBuffer.length) {
        current.codeBlocks.push(codeBuffer.join('\n'));
        codeBuffer = [];
      }
      steps.push(current);
      current = null;
    }
  };

  const flushCode = () => {
    if (codeBuffer.length && current) {
      current.codeBlocks.push(codeBuffer.join('\n'));
      codeBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect code blocks (indented or starts with < or CSS-like)
    const isCodeLine = !trimmed.startsWith('•') && !trimmed.startsWith('-') && !/^\d+[\.\)]/.test(trimmed) &&
      (line.startsWith('  ') || line.startsWith('\t') ||
       trimmed.startsWith('<') || trimmed.startsWith('{') || trimmed.startsWith('.') || trimmed.startsWith('#') ||
       /^[a-z-]+\s*\{/.test(trimmed) || /^(margin|padding|color|background|font|width|height|border|display):/.test(trimmed));

    const isEmpty = !trimmed;
    const isNewSection = isEmpty && (i === 0 || !lines[i - 1]?.trim());

    // Extract emoji from start of line
    const emojiMatch = trimmed.match(/^[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{2702}-\u{27B0}\u{1F1E0}-\u{1F1FF}]+\s*/gu);
    const emoji = emojiMatch ? emojiMatch[0].trim() : '';
    const noEmoji = trimmed.replace(/^[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{2702}-\u{27B0}\u{1F1E0}-\u{1F1FF}]+\s*/gu, '');

    // Header detection: short line with emoji or ending with :/? or first non-empty after gap
    const isHeader = !isCodeLine && !isBulletLine(trimmed) && !isNumberedLine(trimmed) && trimmed.length > 0 &&
      (trimmed.length < 60 && (trimmed.endsWith(':') || trimmed.endsWith('?') || emoji || i === 0 || isNewSection));

    if (isHeader && !inCode) {
      flushStep();
      current = { emoji: emoji || '💡', title: noEmoji.replace(/[\?:]$/, ''), content: [], codeBlocks: [] };
      continue;
    }

    if (!current) {
      current = { emoji: '💡', title: 'თეორია', content: [], codeBlocks: [] };
    }

    if (isCodeLine && trimmed) {
      inCode = true;
      codeBuffer.push(line);
      continue;
    }

    if (inCode && (!isCodeLine || isEmpty)) {
      flushCode();
      inCode = false;
    }

    if (!isEmpty) {
      current.content.push(trimmed);
    }
  }

  flushStep();

  // If parsing failed, create one big step
  if (steps.length === 0) {
    return [{ emoji: '📚', title: 'თეორია', content: lines.filter(l => l.trim()), codeBlocks: [] }];
  }

  return steps;
}

function isBulletLine(s: string) { return s.startsWith('•') || s.startsWith('- '); }
function isNumberedLine(s: string) { return /^\d+[\.\)]\s/.test(s); }

function CodeBlock({ code }: { code: string }) {
  return (
    <pre style={{
      background: '#0f0f1a',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: 10,
      padding: '12px 14px',
      margin: '8px 0',
      overflow: 'auto',
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '0.78rem',
      lineHeight: 1.6,
      color: '#e2e8f0',
    }}>
      <code>{code}</code>
    </pre>
  );
}

function InlineCode({ children }: { children: string }) {
  return (
    <code style={{
      background: 'rgba(124,58,237,0.1)',
      padding: '1px 6px',
      borderRadius: 5,
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '0.82em',
      color: '#a78bfa',
      fontWeight: 600,
    }}>
      {children}
    </code>
  );
}

function formatText(text: string): any[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, j) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <span key={j}><InlineCode>{part.slice(1, -1)}</InlineCode></span>;
    }
    return <span key={j}>{part}</span>;
  });
}

// ---- Mini Quiz Component ----
interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

function extractQuizFromTheory(steps: TheoryStep[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (const step of steps) {
    // Look for lines that look like questions (end with ?)
    for (const line of step.content) {
      if (line.endsWith('?') && line.length > 10 && line.length < 100) {
        // Generate fake options based on content
        const topic = step.title;
        questions.push({
          question: line,
          options: [`${topic} სწორია`, 'არასწორია', 'შესაძლოა', 'არ ვიცი'],
          correctIndex: 0,
        });
      }
    }
  }
  // If no questions found, generate from key concepts
  if (questions.length === 0 && steps.length > 0) {
    const step = steps[0];
    questions.push({
      question: `რა არის ${step.title}?`,
      options: [step.content[0]?.slice(0, 40) + '...' || 'სწორი პასუხი', 'არასწორი', 'არ ვიცი', 'სხვა'],
      correctIndex: 0,
    });
  }
  return questions.slice(0, 2);
}

function TheoryQuiz({ questions, onComplete }: { questions: QuizQuestion[]; onComplete: (correct: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (idx >= questions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Sparkles size={32} style={{ color: '#f59e0b', marginBottom: 8 }} />
        <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>თეორია დასრულებულია!</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {correctCount}/{questions.length} სწორი პასუხი
        </p>
      </div>
    );
  }

  const q = questions[idx];
  const isCorrect = selected === q.correctIndex;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correctIndex) setCorrectCount(c => c + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        onComplete(correctCount + (i === q.correctIndex ? 1 : 0));
      }
      setIdx(idx + 1);
      setSelected(null);
      setAnswered(false);
    }, 1200);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Lightbulb size={14} style={{ color: '#f59e0b' }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>სწრაფი ქვიზი {idx + 1}/{questions.length}</span>
      </div>
      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        {q.question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {q.options.map((opt, i) => {
          const isSel = selected === i;
          const isCorrectOpt = i === q.correctIndex;
          const showResult = answered && isSel;
          const showCorrect = answered && isCorrectOpt && !isSel;
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={answered}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                background: showResult ? (isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)') :
                  showCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showResult ? (isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(244,63,94,0.3)') :
                  showCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
                color: showResult ? (isCorrect ? '#22c55e' : '#f43f5e') :
                  showCorrect ? '#22c55e' : 'var(--text-secondary)',
                fontSize: '0.82rem', textAlign: 'left', cursor: answered ? 'default' : 'pointer',
                fontFamily: 'var(--font-georgian)', transition: 'all 0.2s',
              }}>
              {showResult && (isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />)}
              {showCorrect && !isSel && <CheckCircle size={14} />}
              {!showResult && !showCorrect && <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)' }} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Main TheoryRenderer ----
interface TheoryRendererProps {
  text: string;
  onComplete?: () => void;
}

const TheoryRenderer = ({ text, onComplete }: TheoryRendererProps) => {
  const steps = useMemo(() => parseTheory(text), [text]);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) return;
    setCurrentStep(s => s + 1);
  };
  const handlePrev = () => setCurrentStep(s => Math.max(0, s - 1));

  const handleQuizComplete = () => {
    setQuizDone(true);
    onComplete?.();
  };

  const quizQuestions = useMemo(() => extractQuizFromTheory(steps), [steps]);

  return (
    <div style={{
      background: 'rgba(124,58,237,0.04)',
      border: '1px solid rgba(124,58,237,0.12)',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <BookOpen size={16} style={{ color: '#7c3aed' }} />
        <h3 style={{
          fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)',
          margin: 0, fontFamily: 'var(--font-georgian)',
        }}>თეორია</h3>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed',
          marginLeft: 'auto',
        }}>{currentStep + 1} / {steps.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.06)', marginBottom: 14, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
          borderRadius: 3, transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Step card */}
      {step && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>{step.emoji}</span>
            <h4 style={{
              fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)',
              margin: 0, fontFamily: 'var(--font-georgian)',
            }}>{step.title}</h4>
          </div>

          {step.content.map((line, i) => {
            const isBullet = line.startsWith('•') || line.startsWith('- ');
            const content = isBullet ? line.replace(/^[•\-]\s*/, '') : line;
            const isNum = /^\d+[\.\)]\s/.test(line);
            return (
              <p key={i} style={{
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                lineHeight: 1.65,
                margin: isBullet || isNum ? '3px 0' : '6px 0',
                paddingLeft: isBullet ? 14 : isNum ? 6 : 0,
                position: 'relative',
              }}>
                {isBullet && <span style={{ position: 'absolute', left: 0, color: '#7c3aed' }}>·</span>}
                {formatText(content)}
              </p>
            );
          })}

          {step.codeBlocks.map((code, i) => (
            <span key={i}><CodeBlock code={code} /></span>
          ))}
        </div>
      )}

      {/* Quiz at end */}
      {isLast && !quizDone && quizQuestions.length > 0 && (
        <TheoryQuiz questions={quizQuestions} onComplete={handleQuizComplete} />
      )}

      {isLast && quizDone && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <CheckCircle size={24} style={{ color: '#22c55e', marginBottom: 6 }} />
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#22c55e' }}>
            თეორია დასრულებულია! 🎉
          </p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <button onClick={handlePrev} disabled={currentStep === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '7px 14px', borderRadius: 8,
            background: currentStep === 0 ? 'transparent' : 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.15)', color: '#7c3aed',
            cursor: currentStep === 0 ? 'default' : 'pointer',
            fontSize: '0.78rem', fontWeight: 700, opacity: currentStep === 0 ? 0.4 : 1,
            fontFamily: 'var(--font-georgian)',
          }}>
          <ChevronLeft size={14} /> უკან
        </button>

        <button onClick={handleNext} disabled={isLast}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '7px 14px', borderRadius: 8,
            background: isLast ? 'transparent' : '#7c3aed',
            border: 'none', color: isLast ? 'var(--text-dim)' : '#fff',
            cursor: isLast ? 'default' : 'pointer',
            fontSize: '0.78rem', fontWeight: 700, opacity: isLast ? 0.4 : 1,
            fontFamily: 'var(--font-georgian)',
          }}>
          შემდეგი <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default TheoryRenderer;
