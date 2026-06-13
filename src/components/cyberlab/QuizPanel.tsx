import { useState, useEffect } from "react";
import { useCyberQuizQuestions, useCyberUserProgressForChallenge, useSubmitCyberQuiz } from "@/hooks/useCyberLab";
import { toast } from "sonner";

const QuizPanel = ({ challenge, isSolved }: { challenge: any; isSolved: boolean }) => {
  const { data: questions = [] } = useCyberQuizQuestions(challenge?.id);
  const { data: progress } = useCyberUserProgressForChallenge(challenge?.id);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const submitQuiz = useSubmitCyberQuiz();

  useEffect(() => {
    if (progress?.quiz_answers) { setAnswers(progress.quiz_answers); setSubmitted(true); }
  }, [progress]);

  const handleAnswer = (qid: string, idx: number) => {
    if (submitted || isSolved) return;
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) { toast.error('გთხოვ, უპასუხე ყველა კითხვას'); return; }
    try {
      const res = await submitQuiz.mutateAsync({ challengeId: challenge.id, answers });
      setResult(res); setSubmitted(true);
      if (res.passed) toast.success(`გილოცავ! ქვიზი ჩაბარებულია — ${res.score}/${res.maxScore}`);
      else toast.error(`ქვიზი ჩაჭრილია — ${res.score}/${res.maxScore}`);
    } catch (e: any) { toast.error(e?.message || 'შეცდომა'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isSolved || (submitted && result?.passed) ? (
        <div style={{ background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 16, padding: '24px 24px', textAlign: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#00ff41', marginBottom: 12, display: 'block' }}>check_circle</span>
          <h3 style={{ color: '#00ff41', marginBottom: 8 }}>გილოცავ!</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>შენ წარმატებით ჩააბარე ეს ქვიზი.{result && ` შედეგი: ${result.score}/${result.maxScore}`}</p>
        </div>
      ) : null}

      {questions.map((q, idx) => {
        const userAns = answers[q.id];
        const detail = submitted ? result?.detailed?.find((d: any) => d.questionId === q.id) : null;
        return (
          <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 10, textTransform: 'uppercase' }}>კითხვა {idx + 1} / {questions.length} — {q.points} ქულა</div>
            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{q.question_ka}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(q.options || []).map((opt: string, optIdx: number) => {
                let border = '1px solid rgba(255,255,255,0.1)';
                let bg = 'rgba(255,255,255,0.03)';
                if (submitted) {
                  if (optIdx === q.correct_option_index) { border = '1px solid #22c55e'; bg = 'rgba(34,197,94,0.08)'; }
                  else if (userAns === optIdx) { border = '1px solid #ef4444'; bg = 'rgba(239,68,68,0.08)'; }
                } else if (userAns === optIdx) { border = '1px solid rgba(0,255,65,0.4)'; bg = 'rgba(0,255,65,0.08)'; }
                return (
                  <button key={optIdx} onClick={() => handleAnswer(q.id, optIdx)} disabled={submitted || isSolved}
                    style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 10, background: bg, border, color: '#fff', cursor: submitted || isSolved ? 'default' : 'pointer', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation_ka && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                <strong style={{ color: '#00ff41' }}>განმარტება:</strong> {q.explanation_ka}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && !isSolved && (
        <button onClick={handleSubmit} disabled={submitQuiz.isPending}
          style={{ padding: '14px 32px', borderRadius: 12, border: 'none', background: '#00ff41', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', alignSelf: 'center' }}>
          {submitQuiz.isPending ? '...' : 'ქვიზის დასრულება'}
        </button>
      )}
    </div>
  );
};

export default QuizPanel;
