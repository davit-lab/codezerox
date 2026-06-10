import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface SimulationRendererProps {
  html: string;
  css: string;
  js: string;
  config: any;
  onSuccess?: (flag: string) => void;
}

const SimulationRenderer = ({ html, css, js, config, onSuccess }: SimulationRendererProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [flagInput, setFlagInput] = useState('');
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SIMULATION_SUCCESS' && event.data?.flag) {
        setSolved(true);
        toast.success(`სიმულაცია წარმატებით გაიარე! Flag: ${event.data.flag}`);
        if (onSuccess) onSuccess(event.data.flag);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${css || ''}</style>
</head>
<body>${html || ''}<script>${js || ''}</script></body>
</html>`;

  const handleManualSubmit = () => {
    if (flagInput.trim() === (config?.flag || '')) {
      setSolved(true);
      toast.success(`სწორია! Flag: ${config?.flag}`);
      if (onSuccess) onSuccess(config?.flag);
    } else {
      toast.error('არასწორი flag-ი');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.1)',
        borderRadius: 12, padding: '14px 18px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
      }}>
        <div style={{ fontWeight: 700, color: '#00ff41', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-rounded">info</span>
          სიმულაციის ინსტრუქცია
        </div>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          ქვემოთ გამოსახულია სიმულირებული ვებგვერდი. შენი მიზანია იპოვო სუსტი ადგილი და "ჰაკაო".
        </p>
        {config?.hint && (
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
            <strong style={{ color: '#00ff41' }}>მინიშნება:</strong> {config.hint}
          </p>
        )}
      </div>

      <div style={{
        border: '1px solid rgba(0,255,65,0.15)', borderRadius: 12, overflow: 'hidden',
        background: '#0a0a0a',
      }}>
        <div style={{
          background: '#1a1a1a', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid rgba(0,255,65,0.1)',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginLeft: 8, fontFamily: 'monospace' }}>
            cyber-lab-simulation://sandbox
          </span>
        </div>
        <iframe
          ref={iframeRef}
          title="cyber-simulation"
          srcDoc={doc}
          style={{ width: '100%', height: 400, border: 'none', display: 'block' }}
          sandbox="allow-scripts"
        />
      </div>

      {solved ? (
        <div style={{
          background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.3)',
          borderRadius: 12, padding: '18px 24px', textAlign: 'center',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#00ff41', marginBottom: 8, display: 'block' }}>check_circle</span>
          <h3 style={{ color: '#00ff41', margin: '0 0 8px' }}>გილოცავ!</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>შენ წარმატებით გაიარე სიმულაცია.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 10, fontWeight: 600 }}>
            შეიყვანე მიღებული Flag-ი:
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={flagInput}
              onChange={e => setFlagInput(e.target.value)}
              placeholder="CZ{...}"
              style={{
                flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#00ff41', fontFamily: 'monospace', fontSize: '0.95rem', outline: 'none',
              }}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!flagInput.trim()}
              style={{
                padding: '12px 28px', borderRadius: 10, border: 'none',
                background: '#00ff41', color: '#000', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span className="material-symbols-rounded">send</span>
              შემოწმება
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationRenderer;
