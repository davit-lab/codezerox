import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Prism from "prismjs";
import { ArrowUpRight, Check, Copy, GitFork, Download, Eye, Home } from "lucide-react";
import "@/components/playground/CodeEditor"; // registers Prism grammars
import FileGlyph, { FileName } from "@/components/playground/FileGlyph";
import {
  buildWebDocument, buildZip, downloadBlob, fileKind, filesFromRow, getLanguage, slugify, type SnippetRow,
} from "@/components/playground/project";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";
import "@/components/playground/playground.css";

const highlight = (code: string, name: string) => {
  const lang = fileKind(name).prism;
  const grammar = Prism.languages[lang];
  return grammar
    ? Prism.highlight(code, grammar, lang)
    : code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

const CodePreview = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const embed = params.get("embed") === "1";
  const { getSnippet } = useCodeSnippets();
  const [row, setRow] = useState<SnippetRow | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [view, setView] = useState<"result" | "code">("result");
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return setState("missing");
    getSnippet(id, { countView: !embed }).then((data) => {
      if (!data) return setState("missing");
      setRow(data);
      setView(data.language === "web" ? "result" : "code");
      setState("ready");
    });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const files = useMemo(() => (row ? filesFromRow(row) : []), [row]);
  const doc = useMemo(() => (row?.language === "web" ? buildWebDocument(files, { console: false }) : ""), [row, files]);

  if (state === "loading") {
    return (
      <div className="pg pg-public">
        <div className="pg-public-center">
          <span className="pg-public-loading" />
        </div>
      </div>
    );
  }

  if (state === "missing" || !row) {
    return (
      <div className="pg pg-public">
        <div className="pg-public-center">
          <h1 className="pg-public-h1">პროექტი ვერ მოიძებნა</h1>
          <p className="pg-note">შესაძლოა ლინკი არასწორია, პროექტი პირადია ან წაიშალა.</p>
          <Link to="/playground" className="pg-btn pg-btn-primary">
            ახალი პროექტის შექმნა <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const lang = getLanguage(row.language);
  const isWeb = row.language === "web";
  const hidden = !!row.hide_code;
  const file = files[activeFile] ?? files[0];
  const date = new Date(row.created_at).toLocaleDateString("ka-GE", { year: "numeric", month: "long", day: "numeric" });

  const copyCode = async () => {
    await navigator.clipboard.writeText(file?.content ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () =>
    files.length === 1
      ? downloadBlob(new Blob([files[0].content], { type: "text/plain" }), files[0].name)
      : downloadBlob(buildZip(files, slugify(row.title)), `${slugify(row.title)}.zip`);

  const codeView = (
    <div className="pg-public-code">
      <div className="pg-tabs">
        {files.map((f, i) => (
          <div key={f.name} className={`pg-tab ${i === activeFile ? "is-active" : ""}`} onClick={() => setActiveFile(i)}>
            <FileGlyph name={f.name} size={13} />
            <FileName name={f.name} />
          </div>
        ))}
        <div className="pg-tabs-fill" />
        <button className="pg-btn pg-btn-ghost pg-public-copy" onClick={copyCode}>
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "დაკოპირდა" : "კოპირება"}
        </button>
      </div>
      <div className="pg-code pg-public-pre">
        <div className="pg-code-scroll">
          <div className="pg-code-inner">
            <div className="pg-gutter" aria-hidden="true">
              {(file?.content ?? "").split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="pg-code-body">
              <pre className="pg-code-highlight">
                <code dangerouslySetInnerHTML={{ __html: highlight(file?.content ?? "", file?.name ?? "") }} />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const resultView = isWeb ? (
    <iframe className="pg-public-frame" srcDoc={doc} title={row.title} sandbox="allow-scripts allow-modals allow-forms allow-popups" />
  ) : (
    codeView
  );

  if (embed) {
    return (
      <div className="pg pg-public pg-embed-mode">
        <header className="pg-embed-bar">
          <span className="pg-embed-title">{row.title}</span>
          {isWeb && !hidden && (
            <div className="pg-seg pg-seg-sm">
              <button className={view === "result" ? "is-on" : ""} onClick={() => setView("result")}>შედეგი</button>
              <button className={view === "code" ? "is-on" : ""} onClick={() => setView("code")}>კოდი</button>
            </div>
          )}
          <a className="pg-embed-brand" href={`/code/${row.id}`} target="_blank" rel="noreferrer">
            CodeZero <ArrowUpRight size={11} />
          </a>
        </header>
        <div className="pg-public-stage">{view === "code" && !hidden ? codeView : resultView}</div>
      </div>
    );
  }

  return (
    <div className="pg pg-public">
      <header className="pg-top">
        <div className="pg-top-left">
          <Link to="/" className="pg-home" title="მთავარ გვერდზე დაბრუნება">
            <Home size={15} />
            <span className="pg-hide-sm">მთავარი</span>
          </Link>
          <span className="pg-divider" />
          <h1 className="pg-public-title">{row.title}</h1>
          <span className="pg-lang-pill">
            <span className="pg-dot" style={{ background: lang.hue }} /> {lang.name}
          </span>
        </div>
        <div className="pg-top-right">
          <span className="pg-public-meta pg-hide-sm">
            <Eye size={12} /> {row.views} ნახვა · {date}
          </span>
          {isWeb && !hidden && (
            <div className="pg-seg">
              <button className={view === "result" ? "is-on" : ""} onClick={() => setView("result")}>შედეგი</button>
              <button className={view === "code" ? "is-on" : ""} onClick={() => setView("code")}>კოდი</button>
            </div>
          )}
          {!hidden && (
            <>
              <button className="pg-btn pg-btn-ghost" onClick={download} title="ჩამოტვირთვა">
                <Download size={13} />
              </button>
              <Link to={`/playground?fork=${row.id}`} className="pg-btn pg-btn-primary">
                <GitFork size={13} /> ასლის შექმნა
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="pg-public-stage">{view === "code" && !hidden ? codeView : resultView}</main>
      <footer className="pg-statusbar">
        <span>{files.length} ფაილი · {lang.runtime}</span>
        <span className="pg-sb-spacer" />
        {hidden && <span>ავტორმა კოდი დამალა</span>}
        <Link to="/playground" className="pg-public-made">შექმნილია CodeZero-ს კოდის ედიტორში ↗</Link>
      </footer>
    </div>
  );
};

export default CodePreview;
