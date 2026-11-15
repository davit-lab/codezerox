import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

export interface PaletteItem {
  id: string;
  label: string;
  group: string;
  hint?: string;
  icon?: React.ReactNode;
  run: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
}

const score = (label: string, q: string) => {
  const l = label.toLowerCase();
  if (!q) return 1;
  if (l.startsWith(q)) return 3;
  if (l.includes(q)) return 2;
  // subsequence match
  let i = 0;
  for (const ch of l) if (ch === q[i]) i++;
  return i === q.length ? 1 : 0;
};

const CommandPalette = ({ open, onClose, items }: Props) => {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .map((item) => ({ item, s: score(item.label, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.item);
  }, [items, query]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!open) return null;

  const run = (item?: PaletteItem) => {
    if (!item) return;
    onClose();
    // let the palette unmount before the action grabs focus
    setTimeout(item.run, 0);
  };

  let lastGroup = "";

  return (
    <div className="pg-overlay" onMouseDown={onClose}>
      <div className="pg-palette" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="ბრძანებები">
        <div className="pg-palette-input">
          <Search size={15} className="pg-palette-prompt" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="მოძებნე ფაილი ან ბრძანება…"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                run(results[index]);
              }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="pg-palette-list" ref={listRef}>
          {results.length === 0 && <div className="pg-palette-empty">„{query}“ — ვერაფერი მოიძებნა.</div>}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <div key={item.id}>
                {header && <div className="pg-palette-group">{header}</div>}
                <button
                  data-index={i}
                  className={`pg-palette-item ${i === index ? "is-active" : ""}`}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(item)}
                >
                  <span className="pg-palette-icon">{item.icon}</span>
                  <span className="pg-palette-label">{item.label}</span>
                  {item.hint && <span className="pg-palette-hint">{item.hint}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
