import { useState, useRef, useEffect } from "react";
import { useSubmitCyberFlag } from "@/hooks/useCyberLab";
import { toast } from "sonner";

const TerminalPanel = ({ challenge, isSolved }: { challenge: any; isSolved: boolean }) => {
  const [lines, setLines] = useState<string[]>(['Cyber Lab Terminal v1.0', 'დაწერე "help" ხელმისაწვდომი ბრძანებების სანახავად.', '']);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const submitFlag = useSubmitCyberFlag();

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [lines]);

  const commands: Record<string, string[]> = {
    help: ['ხელმისაწვდომი ბრძანებები:', '  ls          — ფაილების სია', '  cat <file>  — ფაილის წაკითხვა', '  nmap <host> — ჰოსტის სკანირება', '  whoami      — მომხმარებელი', '  submit <flag> — flag-ის გაგზავნა'],
    ls: ['secret.txt', 'notes.md'],
    whoami: ['guest'],
  };
  const nmapResults: Record<string, string[]> = {
    'localhost': ['Nmap scan report for localhost', 'PORT   STATE SERVICE', '22/tcp open  ssh', '80/tcp open  http'],
    'target.com': ['Nmap scan report for target.com', 'PORT    STATE SERVICE', '80/tcp  open  http', '443/tcp open  https', '3306/tcp open mysql'],
  };
  const catFiles: Record<string, string[]> = {
    'secret.txt': ['username: admin', 'password: admin123'],
    'notes.md': ['# Pentest Notes', '- SQL injection შესაძლებელია /login-ზე', '- სცადე \' OR 1=1 --'],
  };

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    setLines(prev => [...prev, `$ ${trimmed}`]);
    const parts = trimmed.split(' ');
    const base = parts[0].toLowerCase();

    if (base === 'submit') {
      const f = parts.slice(1).join(' ');
      if (f) {
        submitFlag.mutateAsync({ challengeId: challenge.id, flag: f }).then(res => {
          if (res.success) { setLines(prev => [...prev, '[+] სწორი flag!', `    +${res.points || challenge.base_points} XP`]); toast.success('Flag accepted!'); }
          else setLines(prev => [...prev, '[-] არასწორი flag.']);
        }).catch(() => setLines(prev => [...prev, '[-] შეცდომა.']));
      }
      return;
    }

    const response = (() => {
      if (commands[base]) return commands[base];
      if (base === 'nmap') { const host = parts[1] || 'localhost'; return nmapResults[host] || [`Host ${host} not found`]; }
      if (base === 'cat') { const file = parts[1]; return file ? (catFiles[file] || [`cat: ${file}: No such file`]) : ['Usage: cat <file>']; }
      if (base === 'clear') { setLines([]); return []; }
      return [`bash: ${base}: command not found`];
    })();
    setLines(prev => [...prev, ...response, '']);
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
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 12, padding: '16px 20px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#00ff41', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', maxHeight: 400, marginBottom: 12 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {line.startsWith('$') ? <span style={{ color: '#22c55e' }}>{line}</span> : line.startsWith('[-]') ? <span style={{ color: '#ef4444' }}>{line}</span> : line.startsWith('[+]') ? <span style={{ color: '#22c55e' }}>{line}</span> : line}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid rgba(0,255,65,0.1)', paddingTop: 10 }}>
          <span style={{ color: '#22c55e' }}>$</span>
          <input value={input} onChange={e => setInput(e.target.value)}
            disabled={isSolved}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#00ff41', fontFamily: 'monospace', fontSize: '0.85rem' }}
            onKeyDown={e => {
              if (e.key === 'Enter') { runCommand(input); setInput(''); }
            }}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
