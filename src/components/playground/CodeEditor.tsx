import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";

export interface CursorInfo {
  line: number;
  col: number;
  selected: number;
}

export interface CodeEditorHandle {
  focus: () => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Prism grammar name (markup, css, javascript, python…) */
  language: string;
  placeholder?: string;
  fontSize?: number;
  onCursor?: (info: CursorInfo) => void;
}

const LINE_HEIGHT = 1.7;
const INDENT = "  ";

const PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
const CLOSERS = new Set([")", "]", "}", '"', "'", "`"]);
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr",
]);

const COMMENT: Record<string, [string, string?]> = {
  markup: ["<!--", "-->"],
  css: ["/*", "*/"],
  python: ["#"],
  ruby: ["#"],
  sql: ["--"],
  markdown: ["<!--", "-->"],
};

const HTML_BOILERPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

</body>
</html>`;

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Insert text through the browser so native undo/redo keeps working. */
const insertText = (el: HTMLTextAreaElement, text: string, start: number, end: number) => {
  el.focus();
  el.setSelectionRange(start, end);
  const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
  if (!ok) {
    el.setRangeText(text, start, end, "end");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
};

const lineStartOf = (value: string, pos: number) => value.lastIndexOf("\n", pos - 1) + 1;
const lineEndOf = (value: string, pos: number) => {
  const i = value.indexOf("\n", pos);
  return i === -1 ? value.length : i;
};

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  ({ value, onChange, language, placeholder, fontSize = 13.5, onCursor }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [activeLine, setActiveLine] = useState(0);
    const [focused, setFocused] = useState(false);

    useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }));

    const highlighted = useMemo(() => {
      const grammar = Prism.languages[language];
      const html = grammar ? Prism.highlight(value, grammar, language) : escapeHtml(value);
      // trailing newline keeps the overlay height in sync with the textarea
      return html + "\n";
    }, [value, language]);

    const lineCount = useMemo(() => value.split("\n").length, [value]);

    const reportCursor = () => {
      const el = textareaRef.current;
      if (!el) return;
      const before = el.value.slice(0, el.selectionStart);
      const line = before.split("\n").length - 1;
      setActiveLine(line);
      onCursor?.({
        line: line + 1,
        col: el.selectionStart - lineStartOf(el.value, el.selectionStart) + 1,
        selected: Math.abs(el.selectionEnd - el.selectionStart),
      });
    };

    useEffect(reportCursor, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      const { selectionStart: start, selectionEnd: end, value: v } = el;
      const mod = e.metaKey || e.ctrlKey;
      const hasSelection = start !== end;

      // Toggle comment — Ctrl/Cmd + /
      if (mod && e.key === "/") {
        e.preventDefault();
        const [open, close] = COMMENT[language] ?? ["//"];
        const from = lineStartOf(v, start);
        const to = lineEndOf(v, end);
        const lines = v.slice(from, to).split("\n");
        if (close) {
          const block = v.slice(from, to);
          const trimmed = block.trim();
          const next =
            trimmed.startsWith(open) && trimmed.endsWith(close)
              ? block.replace(open + " ", "").replace(open, "").replace(" " + close, "").replace(close, "")
              : block.replace(/^(\s*)/, `$1${open} `) + ` ${close}`;
          insertText(el, next, from, to);
          el.setSelectionRange(from, from + next.length);
        } else {
          const active = lines.filter((l) => l.trim());
          const allCommented = active.length > 0 && active.every((l) => l.trimStart().startsWith(open));
          const minIndent = Math.min(...active.map((l) => l.match(/^\s*/)![0].length), Infinity);
          const next = lines
            .map((l) => {
              if (!l.trim()) return l;
              if (allCommented) return l.replace(new RegExp(`^(\\s*)${open.replace(/[/#-]/g, "\\$&")} ?`), "$1");
              return l.slice(0, minIndent) + open + " " + l.slice(minIndent);
            })
            .join("\n");
          insertText(el, next, from, to);
          el.setSelectionRange(from, from + next.length);
        }
        return;
      }

      // Duplicate line(s) — Shift + Alt + ArrowDown
      if (e.altKey && e.shiftKey && e.key === "ArrowDown") {
        e.preventDefault();
        const from = lineStartOf(v, start);
        const to = lineEndOf(v, end);
        const block = v.slice(from, to);
        insertText(el, "\n" + block, to, to);
        const shift = block.length + 1;
        el.setSelectionRange(start + shift, end + shift);
        return;
      }

      // Move line(s) — Alt + ArrowUp / ArrowDown
      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const from = lineStartOf(v, start);
        const to = lineEndOf(v, end);
        const block = v.slice(from, to);
        if (e.key === "ArrowUp" && from > 0) {
          const prevStart = lineStartOf(v, from - 1);
          const prev = v.slice(prevStart, from - 1);
          insertText(el, block + "\n" + prev, prevStart, to);
          const shift = prev.length + 1;
          el.setSelectionRange(start - shift, end - shift);
        } else if (e.key === "ArrowDown" && to < v.length) {
          const nextEnd = lineEndOf(v, to + 1);
          const next = v.slice(to + 1, nextEnd);
          insertText(el, next + "\n" + block, from, nextEnd);
          const shift = next.length + 1;
          el.setSelectionRange(start + shift, end + shift);
        }
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const from = lineStartOf(v, start);

        // "!" + Tab in an html file -> boilerplate
        if (!e.shiftKey && language === "markup" && v.slice(from, start).trim() === "!" && !hasSelection) {
          insertText(el, HTML_BOILERPLATE, from, start);
          const caret = from + HTML_BOILERPLATE.indexOf("<body>") + 9;
          el.setSelectionRange(caret, caret);
          return;
        }

        if (!hasSelection && !e.shiftKey) {
          insertText(el, INDENT, start, end);
          return;
        }

        const to = lineEndOf(v, end - (end > start && v[end - 1] === "\n" ? 1 : 0));
        const lines = v.slice(from, to).split("\n");
        let firstDelta = 0;
        const next = lines
          .map((l, i) => {
            if (e.shiftKey) {
              const removed = l.startsWith(INDENT) ? INDENT.length : l.startsWith(" ") || l.startsWith("\t") ? 1 : 0;
              if (i === 0) firstDelta = -removed;
              return l.slice(removed);
            }
            if (i === 0) firstDelta = INDENT.length;
            return INDENT + l;
          })
          .join("\n");
        insertText(el, next, from, to);
        if (hasSelection) el.setSelectionRange(Math.max(from, start + firstDelta), from + next.length);
        else el.setSelectionRange(Math.max(from, start + firstDelta), Math.max(from, start + firstDelta));
        return;
      }

      if (e.key === "Enter" && !mod) {
        e.preventDefault();
        const from = lineStartOf(v, start);
        const line = v.slice(from, start);
        const indent = line.match(/^[ \t]*/)![0];
        const prevChar = v[start - 1];
        const nextChar = v[end];
        const opensBlock =
          (prevChar && "{[(".includes(prevChar)) ||
          (language === "python" && /:\s*$/.test(line)) ||
          (language === "markup" && /<([a-z][\w-]*)(\s[^<>]*)?>$/i.test(line) && !/<\/[^>]+>$/.test(line));
        const closesRight =
          (prevChar === "{" && nextChar === "}") ||
          (prevChar === "[" && nextChar === "]") ||
          (prevChar === "(" && nextChar === ")") ||
          (prevChar === ">" && v.slice(end, end + 2) === "</");

        if (opensBlock && closesRight) {
          const inner = "\n" + indent + INDENT;
          insertText(el, inner + "\n" + indent, start, end);
          el.setSelectionRange(start + inner.length, start + inner.length);
        } else if (opensBlock) {
          insertText(el, "\n" + indent + INDENT, start, end);
        } else {
          insertText(el, "\n" + indent, start, end);
        }
        return;
      }

      if (e.key === "Backspace" && !hasSelection && start > 0) {
        const prev = v[start - 1];
        if (PAIRS[prev] && v[start] === PAIRS[prev]) {
          e.preventDefault();
          insertText(el, "", start - 1, start + 1);
          return;
        }
        // remove a full indent level of spaces
        const from = lineStartOf(v, start);
        const before = v.slice(from, start);
        if (before.length >= INDENT.length && /^ +$/.test(before) && before.length % INDENT.length === 0) {
          e.preventDefault();
          insertText(el, "", start - INDENT.length, start);
          return;
        }
      }

      if (mod || e.altKey) return;

      // Skip over an auto-inserted closer
      if (CLOSERS.has(e.key) && !hasSelection && v[start] === e.key) {
        e.preventDefault();
        el.setSelectionRange(start + 1, start + 1);
        return;
      }

      // Auto-close pairs / wrap selection
      if (PAIRS[e.key]) {
        const isQuote = e.key === '"' || e.key === "'" || e.key === "`";
        const prevChar = v[start - 1] ?? "";
        const nextChar = v[end] ?? "";
        if (hasSelection) {
          e.preventDefault();
          const inner = v.slice(start, end);
          insertText(el, e.key + inner + PAIRS[e.key], start, end);
          el.setSelectionRange(start + 1, start + 1 + inner.length);
          return;
        }
        // don't pair quotes in the middle of a word (it's, don't…)
        if (isQuote && /\w/.test(prevChar)) return;
        if (nextChar && /\w/.test(nextChar)) return;
        e.preventDefault();
        insertText(el, e.key + PAIRS[e.key], start, end);
        el.setSelectionRange(start + 1, start + 1);
        return;
      }

      // Auto-close html tags
      if (e.key === ">" && language === "markup" && !hasSelection) {
        const from = lineStartOf(v, start);
        const match = v.slice(from, start).match(/<([a-zA-Z][\w-]*)(\s[^<>]*)?$/);
        if (match && !match[0].endsWith("/") && !VOID_TAGS.has(match[1].toLowerCase())) {
          e.preventDefault();
          const closing = `></${match[1]}>`;
          insertText(el, closing, start, end);
          el.setSelectionRange(start + 1, start + 1);
        }
      }
    };

    const lineHeightPx = fontSize * LINE_HEIGHT;

    return (
      <div className={`pg-code ${focused ? "is-focused" : ""}`} style={{ fontSize, lineHeight: LINE_HEIGHT }}>
        <div className="pg-code-scroll">
          <div className="pg-code-inner">
            <div className="pg-gutter" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className={i === activeLine && focused ? "is-active" : undefined}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="pg-code-body">
              {focused && (
                <div
                  className="pg-active-line"
                  style={{ top: activeLine * lineHeightPx, height: lineHeightPx }}
                  aria-hidden="true"
                />
              )}
              <pre className="pg-code-highlight" aria-hidden="true">
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onSelect={reportCursor}
                onClick={reportCursor}
                onKeyUp={reportCursor}
                onFocus={() => {
                  setFocused(true);
                  reportCursor();
                }}
                onBlur={() => setFocused(false)}
                className="pg-code-input"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                wrap="off"
                placeholder={placeholder}
                aria-label="Code editor"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";

export default CodeEditor;
