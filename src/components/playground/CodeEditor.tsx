import { useState, useRef, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  html: "markup",
  css: "css",
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  csharp: "csharp",
  cpp: "javascript", // Fallback
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "javascript", // Fallback
  swift: "swift",
  kotlin: "kotlin",
  sql: "sql",
  web: "markup",
};

const CodeEditor = ({ value, onChange, language, placeholder }: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    const prismLang = LANGUAGE_MAP[language] || "javascript";
    const grammar = Prism.languages[prismLang];
    
    if (grammar && value) {
      const highlighted = Prism.highlight(value, grammar, prismLang);
      setHighlightedCode(highlighted);
    } else {
      setHighlightedCode(escapeHtml(value));
    }
  }, [value, language]);

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="code-editor-container">
      <pre
        ref={preRef}
        className="code-editor-highlight"
        aria-hidden="true"
      >
        <code
          dangerouslySetInnerHTML={{ 
            __html: highlightedCode + (value.endsWith("\n") ? " " : "\n ") 
          }}
        />
      </pre>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="code-editor-textarea"
        spellCheck={false}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CodeEditor;
