import { forwardRef, useEffect, useRef, useState } from "react";
import { Monitor, Tablet, Smartphone, RotateCw, ExternalLink, Maximize2, Minimize2, Trash2, Loader2 } from "lucide-react";

/* ================================ Preview ================================ */

type Device = "full" | "tablet" | "phone";
const DEVICE_WIDTH: Record<Device, number | null> = { full: null, tablet: 768, phone: 390 };

interface PreviewProps {
  doc: string;
  runKey: number;
  autoRun: boolean;
  onToggleAutoRun: () => void;
  onRun: () => void;
  onOpenExternal: () => void;
}

export const PreviewPane = forwardRef<HTMLIFrameElement, PreviewProps>(
  ({ doc, runKey, autoRun, onToggleAutoRun, onRun, onOpenExternal }, ref) => {
    const [device, setDevice] = useState<Device>("full");
    const [full, setFull] = useState(false);

    useEffect(() => {
      if (!full) return;
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [full]);

    const width = DEVICE_WIDTH[device];

    return (
      <div className={`pg-pane pg-preview ${full ? "is-full" : ""}`}>
        <div className="pg-pane-head">
          <span className="pg-label">პრევიუ</span>
          <div className="pg-seg pg-seg-sm" role="group" aria-label="ეკრანის ზომა">
            {(
              [
                ["full", Monitor, "სრული სიგანე"],
                ["tablet", Tablet, "ტაბლეტი · 768px"],
                ["phone", Smartphone, "ტელეფონი · 390px"],
              ] as const
            ).map(([id, Icon, label]) => (
              <button key={id} className={device === id ? "is-on" : ""} onClick={() => setDevice(id)} title={label} aria-label={label}>
                <Icon size={13} />
              </button>
            ))}
          </div>
          <div className="pg-pane-tools">
            <label className="pg-switch" title="ავტომატური განახლება წერისას">
              <input type="checkbox" checked={autoRun} onChange={onToggleAutoRun} />
              <span className="pg-switch-track" />
              ლაივ
            </label>
            <button className="pg-icon-btn" onClick={onRun} title="განახლება (Ctrl+Enter)" aria-label="განახლება">
              <RotateCw size={13} />
            </button>
            <button className="pg-icon-btn" onClick={onOpenExternal} title="ახალ ტაბში გახსნა" aria-label="ახალ ტაბში გახსნა">
              <ExternalLink size={13} />
            </button>
            <button
              className="pg-icon-btn"
              onClick={() => setFull((f) => !f)}
              title={full ? "გასვლა (Esc)" : "სრული ეკრანი"}
              aria-label="სრული ეკრანი"
            >
              {full ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>
        <div className={`pg-stage ${width ? "is-device" : ""}`}>
          <div className="pg-frame" style={{ width: width ?? "100%" }}>
            <iframe
              ref={ref}
              key={runKey}
              srcDoc={doc}
              title="პრევიუ"
              sandbox="allow-scripts allow-modals allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    );
  }
);
PreviewPane.displayName = "PreviewPane";

/* ================================ Terminal ================================ */

export type TermKind = "cmd" | "log" | "info" | "warn" | "error" | "debug" | "result" | "sys" | "ok";

export interface TermLine {
  id: number;
  kind: TermKind;
  text: string;
  count: number;
}

interface TerminalProps {
  lines: TermLine[];
  /** "js" = evaluates in the preview page, "run" = runs the program */
  mode: "js" | "run";
  prompt: string;
  busy?: boolean;
  onSubmit: (input: string) => void;
  onClear: () => void;
  onToggle?: () => void;
  stdin?: string;
  onStdinChange?: (v: string) => void;
}

export const Terminal = ({
  lines, mode, prompt, busy, onSubmit, onClear, onToggle, stdin, onStdinChange,
}: TerminalProps) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const [showStdin, setShowStdin] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, busy]);

  const errors = lines.filter((l) => l.kind === "error").length;

  const submit = () => {
    const value = input.trim();
    if (!value || busy) return;
    setHistory((h) => [value, ...h.filter((x) => x !== value)].slice(0, 50));
    setHIndex(-1);
    setInput("");
    onSubmit(value);
  };

  return (
    <div className="pg-pane pg-term" onClick={(e) => {
      if ((e.target as HTMLElement).closest("button, textarea, a")) return;
      if (!window.getSelection()?.toString()) inputRef.current?.focus();
    }}>
      <div className="pg-pane-head" onDoubleClick={onToggle}>
        <button className="pg-term-title" onClick={onToggle}>
          <span className="pg-label">ტერმინალი</span>
          {errors > 0 && <span className="pg-count is-error">{errors} შეცდომა</span>}
        </button>
        <div className="pg-pane-tools">
          {onStdinChange && (
            <button
              className={`pg-chip ${showStdin || stdin ? "is-on" : ""}`}
              onClick={() => setShowStdin((s) => !s)}
              title="პროგრამისთვის შესაყვანი მონაცემები (input)"
            >
              input{stdin ? ` · ${stdin.split("\n").length}` : ""}
            </button>
          )}
          <button className="pg-icon-btn" onClick={onClear} title="გასუფთავება" aria-label="გასუფთავება">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {onStdinChange && showStdin && (
        <div className="pg-stdin">
          <textarea
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder={"აქ ჩაწერე ის, რასაც პროგრამა input()-ით წაიკითხავს.\nყოველი მნიშვნელობა — ახალ ხაზზე."}
            rows={3}
            spellCheck={false}
          />
        </div>
      )}

      <div className="pg-term-body" ref={bodyRef}>
        {lines.length === 0 && (
          <p className="pg-term-hint">
            {mode === "js"
              ? "აქ გამოჩნდება console.log(). ჩაწერე JavaScript და დააჭირე Enter — ის გვერდზე შესრულდება. help — ბრძანებების სია."
              : "ჩაწერე run ან დააჭირე Ctrl+Enter პროგრამის გასაშვებად. help — ბრძანებების სია."}
          </p>
        )}
        {lines.map((l) => (
          <div key={l.id} className={`pg-tl is-${l.kind}`}>
            {l.kind === "cmd" ? <span className="pg-tl-prompt">{prompt}</span> : l.kind === "result" ? <span className="pg-tl-prompt">←</span> : null}
            <pre>{l.text}</pre>
            {l.count > 1 && <span className="pg-count">{l.count}</span>}
          </div>
        ))}
        {busy && (
          <div className="pg-tl is-sys">
            <Loader2 size={12} className="pg-spin" />
            <pre>მუშავდება…</pre>
          </div>
        )}
        <div className="pg-term-input">
          <span className="pg-tl-prompt">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const i = Math.min(hIndex + 1, history.length - 1);
                if (history[i] !== undefined) {
                  setHIndex(i);
                  setInput(history[i]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const i = hIndex - 1;
                setHIndex(Math.max(i, -1));
                setInput(i >= 0 ? history[i] : "");
              } else if (e.key === "l" && e.ctrlKey) {
                e.preventDefault();
                onClear();
              }
            }}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="ტერმინალის ბრძანება"
            disabled={busy}
          />
        </div>
      </div>
    </div>
  );
};
