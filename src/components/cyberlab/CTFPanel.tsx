import { useState } from "react";
import { useSubmitCyberFlag } from "@/hooks/useCyberLab";
import { toast } from "sonner";

const CTFPanel = ({ challenge, isSolved }: { challenge: any; isSolved: boolean }) => {
  const [flag, setFlag] = useState('');
  const submitFlag = useSubmitCyberFlag();
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!flag.trim()) return;
    try {
      const res = await submitFlag.mutateAsync({ challengeId: challenge.id, flag: flag.trim() });
      setResult(res);
      if (res.success) toast.success(res.alreadySolved ? 'უკვე ამოხსნილია' : `სწორია! +${res.points} XP`);
      else toast.error(res.message || 'არასწორი flag-ი');
    } catch (e: any) { toast.error(e?.message || 'შეცდომა'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {challenge.scenario?.instructions && (
        <div style={{ background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12, padding: '16px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: '#00ff41', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-rounded">info</span>ინსტრუქცია
          </div>
          {challenge.scenario.instructions}
        </div>
      )}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 24px' }}>
        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 10, fontWeight: 600 }}>
          შეიყვანე flag-ი ({challenge.flag_format || 'CZ{...}'}):
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="text" value={flag} onChange={e => setFlag(e.target.value)} disabled={isSolved || submitFlag.isPending}
            placeholder={challenge.flag_format || 'CZ{...}'}
            style={{ flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#00ff41', fontFamily: 'monospace', fontSize: '0.95rem', outline: 'none' }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={handleSubmit} disabled={isSolved || submitFlag.isPending || !flag.trim()}
            style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: isSolved ? 'rgba(0,255,65,0.15)' : '#00ff41', color: isSolved ? '#00ff41' : '#000', fontWeight: 700, cursor: isSolved ? 'default' : 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            {submitFlag.isPending ? <span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span> : <span className="material-symbols-rounded">send</span>}
            {isSolved ? 'ამოხსნილია' : 'გაგზავნა'}
          </button>
        </div>
        {result && !result.success && <p style={{ color: '#ef4444', marginTop: 12, fontSize: '0.85rem' }}>{result.message || 'არასწორი flag-ი'}</p>}
        {result?.success && <p style={{ color: '#00ff41', marginTop: 12, fontSize: '0.85rem', fontWeight: 600 }}>{result.alreadySolved ? 'უკვე ამოხსნილია' : `სწორია! +${result.points} XP`}</p>}
      </div>
    </div>
  );
};

export default CTFPanel;
