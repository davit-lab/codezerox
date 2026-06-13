import { useState, useEffect } from "react";
import { useCyberChallengeSteps, useCyberUserProgressForChallenge, useSubmitCyberInteractive } from "@/hooks/useCyberLab";
import { toast } from "sonner";

const InteractivePanel = ({ challenge, isSolved }: { challenge: any; isSolved: boolean }) => {
  const { data: steps = [] } = useCyberChallengeSteps(challenge?.id);
  const { data: progress } = useCyberUserProgressForChallenge(challenge?.id);
  const [currentStepId, setCurrentStepId] = useState<string | null>(progress?.current_step_id || (steps[0]?.id ?? null));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const submit = useSubmitCyberInteractive();

  useEffect(() => {
    if (progress?.current_step_id) setCurrentStepId(progress.current_step_id);
    else if (steps[0]) setCurrentStepId(steps[0].id);
  }, [progress, steps]);

  const currentStep = steps.find(s => s.id === currentStepId);
  const completedIdx = steps.findIndex(s => s.id === (progress?.current_step_id || currentStepId));

  const handleSubmit = async () => {
    if (!currentStep) return;
    try {
      const res = await submit.mutateAsync({ challengeId: challenge.id, stepId: currentStep.id, answer });
      setFeedback(res);
      if (res.correct) {
        toast.success('სწორია!');
        if (res.nextStepId) setCurrentStepId(res.nextStepId);
        if (res.completed) toast.success(`გილოცავ! +${res.points} XP`);
      } else toast.error('არასწორი პასუხი');
      setAnswer('');
    } catch (e: any) { toast.error(e?.message || 'შეცდომა'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {steps.map((s, idx) => (
          <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: idx <= completedIdx ? '#00ff41' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
        ))}
      </div>
      {isSolved ? (
        <div style={{ background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#00ff41', marginBottom: 12, display: 'block' }}>check_circle</span>
          <h3 style={{ color: '#00ff41', marginBottom: 8 }}>გილოცავ!</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>შენ ამოიხსნა ეს სიმულაცია.</p>
        </div>
      ) : currentStep ? (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 24px' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ნაბიჯი {steps.findIndex(s => s.id === currentStep.id) + 1} / {steps.length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{currentStep.content_ka}</div>

          {currentStep.step_type === 'form' && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} disabled={submit.isPending}
                placeholder="შეიყვანე პასუხი..."
                style={{ flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={handleSubmit} disabled={submit.isPending || !answer.trim()}
                style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: '#00ff41', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                {submit.isPending ? '...' : 'შემოწმება'}
              </button>
            </div>
          )}

          {currentStep.step_type === 'choice' && currentStep.expected_answer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(() => { try { return JSON.parse(currentStep.expected_answer); } catch { return []; } })().map((opt: string, idx: number) => (
                <button key={idx} onClick={() => setAnswer(String(idx))} disabled={submit.isPending}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 10, background: answer === String(idx) ? 'rgba(0,255,65,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${answer === String(idx) ? 'rgba(0,255,65,0.4)' : 'rgba(255,255,255,0.1)'}`, color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>
                  {opt}
                </button>
              ))}
              <button onClick={handleSubmit} disabled={submit.isPending || answer === ''}
                style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: '#00ff41', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', marginTop: 8 }}>
                {submit.isPending ? '...' : 'შემოწმება'}
              </button>
            </div>
          )}

          {feedback && !feedback.correct && (
            <p style={{ color: '#ef4444', marginTop: 12, fontSize: '0.85rem' }}>
              არასწორი პასუხი. {currentStep.hint_ka ? `მინიშნება: ${currentStep.hint_ka}` : ''}
            </p>
          )}
        </div>
      ) : (
        <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>ამ სიმულაციას ჯერ არ აქვს ნაბიჯები.</div>
      )}
    </div>
  );
};

export default InteractivePanel;
