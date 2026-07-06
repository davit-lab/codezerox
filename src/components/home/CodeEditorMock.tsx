import { useEffect, useState } from "react";

const LINES = [
  { code: `// მოგესალმებით CodeZero Academy-ში`, cls: "text-emerald-400/80" },
  { code: `import { Learn } from "codezero";`, cls: "text-purple-300" },
  { code: ``, cls: "" },
  { code: `const student = new Learn({`, cls: "text-text-white" },
  { code: `  name: "შენ",`, cls: "text-text-white" },
  { code: `  goal: "პროგრამისტი",`, cls: "text-text-white" },
  { code: `  track: ["React", "Python", "SQL"],`, cls: "text-text-white" },
  { code: `});`, cls: "text-text-white" },
  { code: ``, cls: "" },
  { code: `student.start(); // 🚀`, cls: "text-gold" },
];

const CodeEditorMock = () => {
  const [rendered, setRendered] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= LINES.length) {
      // restart after pause
      const t = setTimeout(() => {
        setRendered([]);
        setCurrentLine(0);
        setCurrentChar(0);
      }, 4000);
      return () => clearTimeout(t);
    }
    const line = LINES[currentLine].code;
    if (currentChar > line.length) {
      const t = setTimeout(() => {
        setRendered((r) => [...r, line]);
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 220);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrentChar((c) => c + 1), 32);
    return () => clearTimeout(t);
  }, [currentChar, currentLine]);

  const activeLine = currentLine < LINES.length ? LINES[currentLine].code.slice(0, currentChar) : "";

  return (
    <div className="code-mock">
      <div className="code-mock-titlebar">
        <div className="code-mock-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="code-mock-tab">
          <span className="material-symbols-rounded text-[14px] text-gold">code</span>
          welcome.ts
        </div>
        <span className="code-mock-lang">TypeScript</span>
      </div>
      <div className="code-mock-body">
        <div className="code-mock-gutter">
          {Array.from({ length: LINES.length }).map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre className="code-mock-content">
          {rendered.map((l, i) => (
            <div key={i} className={LINES[i]?.cls || ""}>{l || "\u00A0"}</div>
          ))}
          {currentLine < LINES.length && (
            <div className={LINES[currentLine]?.cls || ""}>
              {activeLine}
              <span className="code-mock-caret">▍</span>
            </div>
          )}
        </pre>
      </div>
      <div className="code-mock-status">
        <span className="code-mock-status-dot" />
        Ready
        <span className="ml-auto text-text-muted">UTF-8 · LF · TS</span>
      </div>
    </div>
  );
};

export default CodeEditorMock;
