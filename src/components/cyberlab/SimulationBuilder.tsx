import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface SimulationBuilderProps {
  challengeId: string;
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  initialConfig?: any;
  onSave: (payload: { custom_html: string; custom_css: string; custom_js: string; simulation_config: any }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_HTML = `<div class="login-box">
  <h2>ადმინ პანელი</h2>
  <p class="hint">შეიყვანე username და password</p>
  <form id="loginForm">
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <button type="submit">შესვლა</button>
  </form>
  <div id="message"></div>
</div>`;

const DEFAULT_CSS = `body {
  background: #0a0a0a;
  color: #00ff41;
  font-family: monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.login-box {
  background: #111;
  border: 1px solid #00ff41;
  border-radius: 8px;
  padding: 32px;
  width: 300px;
}
h2 { margin: 0 0 16px; }
.hint { color: #666; font-size: 12px; margin-bottom: 20px; }
input {
  width: 100%; padding: 10px; margin-bottom: 12px;
  background: #000; border: 1px solid #00ff41;
  color: #00ff41; font-family: monospace; box-sizing: border-box;
}
button {
  width: 100%; padding: 10px; background: #00ff41;
  color: #000; border: none; font-weight: bold; cursor: pointer;
}
#error { color: #ff4444; margin-top: 12px; }
#success { color: #00ff41; margin-top: 12px; }`;

const DEFAULT_JS = `document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const msg = document.getElementById('message');
  
  // Vulnerable SQL query simulation
  // SELECT * FROM users WHERE username=' + u + ' AND password=' + p + '
  
  if (u.includes("' OR '1'='1") && p.includes("' OR '1'='1")) {
    msg.innerHTML = '<div id="success">✓ წარმატება! Flag: CZ{sql_injection_master}</div>';
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'SIMULATION_SUCCESS', flag: 'CZ{sql_injection_master}' }, '*');
    }
  } else if (u === 'admin' && p === 'admin123') {
    msg.innerHTML = '<div id="success">✓ მარტივი პაროლი! მაგრამ ეს არ არის ჰაკინგი.</div>';
  } else {
    msg.innerHTML = '<div id="error">✗ არასწორი მონაცემები</div>';
  }
});`;

const SimulationBuilder = ({ challengeId, initialHtml, initialCss, initialJs, initialConfig, onSave, open, onOpenChange }: SimulationBuilderProps) => {
  const [html, setHtml] = useState(initialHtml || DEFAULT_HTML);
  const [css, setCss] = useState(initialCss || DEFAULT_CSS);
  const [js, setJs] = useState(initialJs || DEFAULT_JS);
  const [config, setConfig] = useState<any>(initialConfig || { flag: "CZ{sql_injection_master}", hint: "გაიხსენი SQL Injection-ის პრინციპი" });
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview'>('html');

  const previewDoc = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${css}</style>
</head>
<body>${html}<script>${js}</script></body>
</html>`;

  const handleSave = () => {
    onSave({ custom_html: html, custom_css: css, custom_js: js, simulation_config: config });
    toast.success('სიმულაცია შენახულია');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: 1100, maxHeight: '90vh', background: '#111', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-rounded" style={{ color: '#00ff41' }}>build</span>
            სიმულაციის რედაქტორი — მოდი Figma-სებურად ააწყვე ჰაკერული გვერდი
          </DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
          {(['html', 'css', 'js', 'preview'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{
                padding: '6px 16px', borderRadius: 6, border: 'none',
                background: activeTab === t ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.05)',
                color: activeTab === t ? '#00ff41' : 'rgba(255,255,255,0.5)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', textTransform: 'uppercase',
              }}>
              {t === 'html' ? 'HTML' : t === 'css' ? 'CSS' : t === 'js' ? 'JavaScript' : '👁 ნახვა'}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={handleSave}
              style={{
                padding: '6px 20px', borderRadius: 6, border: 'none',
                background: '#00ff41', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
              }}>
              💾 შენახვა
            </button>
          </div>
        </div>

        {activeTab === 'preview' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: 8 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>info</span>
              ეს ისე გამოიყურება, როგორც სტუდენტს ენახება (sandboxed iframe-ში)
            </div>
            <iframe
              title="simulation-preview"
              srcDoc={previewDoc}
              style={{ flex: 1, border: '1px solid rgba(0,255,65,0.2)', borderRadius: 8, background: '#0a0a0a', minHeight: 300 }}
              sandbox="allow-scripts"
            />
            <div style={{ background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 8, padding: 12, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              <strong style={{ color: '#00ff41' }}>მინიშნება:</strong> {config.hint}
              <br/>
              <strong style={{ color: '#00ff41' }}>Flag:</strong> {config.flag}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                {activeTab === 'html' ? 'HTML — გვერდის სტრუქტურა' : activeTab === 'css' ? 'CSS — სტილები' : 'JavaScript — ლოგიკა'}
              </label>
              <textarea
                value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
                onChange={e => {
                  if (activeTab === 'html') setHtml(e.target.value);
                  else if (activeTab === 'css') setCss(e.target.value);
                  else setJs(e.target.value);
                }}
                spellCheck={false}
                style={{
                  flex: 1, minHeight: 300, padding: 14, borderRadius: 8,
                  background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                  color: activeTab === 'css' ? '#ff79c6' : activeTab === 'js' ? '#f1fa8c' : '#00ff41',
                  fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5, resize: 'none', outline: 'none',
                }}
              />
            </div>
            <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem', marginBottom: 10 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>settings</span>
                    სიმულაციის კონფიგურაცია
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Flag (სწორი პასუხი)</label>
                    <input value={config.flag} onChange={e => setConfig({ ...config, flag: e.target.value })}
                      style={{ padding: 8, borderRadius: 6, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#00ff41', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>მინიშნება (სტუდენტს ენახება)</label>
                    <textarea value={config.hint} onChange={e => setConfig({ ...config, hint: e.target.value })}
                      rows={2}
                      style={{ padding: 8, borderRadius: 6, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.8rem', resize: 'none' }} />
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem', marginBottom: 10 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>help</span>
                    ხშირად დასმული კითხვები
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    <p><strong style={{ color: '#00ff41' }}>როგორ მუშაობს?</strong></p>
                    <p>აქ წერ HTML/CSS/JS-ს და სტუდენტს sandboxed iframe-ში ენახება. JS-ში შეგიძლია <code style={{ color: '#f1fa8c' }}>window.parent.postMessage()</code> გამოიყენო flag-ის გასაგზავნად.</p>
                    <p style={{ marginTop: 8 }}><strong style={{ color: '#00ff41' }}>რა შემიძლია ავაწყო?</strong></p>
                    <p>• SQL Injection login form</p>
                    <p>• XSS comment box</p>
                    <p>• IDOR admin panel</p>
                    <p>• Command injection terminal</p>
                    <p>• File upload bypass</p>
                  </div>
                </div>
              </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimulationBuilder;
