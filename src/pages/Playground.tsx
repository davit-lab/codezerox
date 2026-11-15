import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import {
  Play, Share2, Save, Command, ChevronDown, X, PanelLeft, Loader2, Download, FilePlus2, SquareTerminal, Check, Home,
} from "lucide-react";
import CodeEditor, { type CursorInfo, type CodeEditorHandle } from "@/components/playground/CodeEditor";
import Explorer, { type SavedProject } from "@/components/playground/Explorer";
import FileGlyph, { FileName } from "@/components/playground/FileGlyph";
import ShareDialog from "@/components/playground/ShareDialog";
import CommandPalette, { type PaletteItem } from "@/components/playground/CommandPalette";
import { PreviewPane, Terminal, type TermLine, type TermKind } from "@/components/playground/PreviewPane";
import { useProject } from "@/components/playground/useProject";
import {
  LANGUAGES, buildWebDocument, buildZip, defaultFiles, downloadBlob, fileKind, filesFromRow, getLanguage, slugify,
} from "@/components/playground/project";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import "@/components/playground/playground.css";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

const useMedia = (query: string) => {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
};

const Playground = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: busy, saveProject, updateProject, getSnippet } = useCodeSnippets();
  const project = useProject();
  const { state, tabs, active } = project;
  const isWeb = state.language === "web";
  const lang = getLanguage(state.language);
  const isOwner = !!state.snippetId && !!user && state.ownerId === user.id;

  const compact = useMedia("(max-width: 899px)");
  const [mobileView, setMobileView] = useState<"files" | "code" | "result">("code");

  const [cursor, setCursor] = useState<CursorInfo>({ line: 1, col: 1, selected: 0 });
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("cz-pg-font")) || 13.5);
  const [autoRun, setAutoRun] = useState(true);
  const [doc, setDoc] = useState(() => (isWeb ? buildWebDocument(state.files) : ""));
  const [runKey, setRunKey] = useState(0);
  const [logs, setLogs] = useState<TermLine[]>([]);
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState("");
  const [projects, setProjects] = useState<SavedProject[] | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<CodeEditorHandle>(null);
  const explorerPanel = useRef<ImperativePanelHandle>(null);
  const consolePanel = useRef<ImperativePanelHandle>(null);
  const logId = useRef(0);

  useEffect(() => localStorage.setItem("cz-pg-font", String(fontSize)), [fontSize]);

  /* ------------------------------ loading ------------------------------ */

  const fetchProjects = useCallback(async () => {
    if (!user) return setProjects(null);
    const { data } = await supabase
      .from("code_snippets")
      .select("id, title, language, updated_at, is_public")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30);
    setProjects((data as SavedProject[]) ?? []);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchProjects();
  }, [authLoading, fetchProjects]);

  useEffect(() => {
    const editId = params.get("edit");
    const forkId = params.get("fork");
    const id = editId || forkId;
    if (!id || authLoading) return;
    if (id === state.snippetId) return;
    (async () => {
      const row = await getSnippet(id, { countView: !editId });
      if (!row) {
        toast({ title: "ვერ მოიძებნა", description: "პროექტი ვერ ჩაიტვირთა.", variant: "destructive" });
        return;
      }
      const mine = !!editId && !!user && row.user_id === user.id;
      project.load(
        {
          language: row.language || "web",
          files: filesFromRow(row),
          title: mine ? row.title : `${row.title} (fork)`,
          snippetId: mine ? row.id : null,
          ownerId: mine ? row.user_id : null,
          isPublic: mine ? row.is_public : false,
          hideCode: mine ? !!row.hide_code : false,
        },
        { clean: mine }
      );
      if (forkId) setParams({}, { replace: true });
      setLogs([]);
    })();
  }, [params, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------ preview ------------------------------ */

  const runPreview = useCallback(() => {
    setDoc(buildWebDocument(project.state.files));
    setRunKey((k) => k + 1);
  }, [project.state.files]);

  useEffect(() => {
    if (!isWeb || !autoRun) return;
    const t = setTimeout(() => {
      setDoc(buildWebDocument(state.files));
    }, 450);
    return () => clearTimeout(t);
  }, [state.files, isWeb, autoRun]);

  const print = useCallback((kind: TermKind, text: string) => {
    setLogs((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.text === text && last.kind === kind && kind !== "cmd") {
        return [...prev.slice(0, -1), { ...last, count: last.count + 1 }];
      }
      return [...prev.slice(-499), { id: ++logId.current, kind, text, count: 1 }];
    });
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e.data?.__cz || e.source !== iframeRef.current?.contentWindow) return;
      if (e.data.level === "clear") return setLogs([]);
      print(e.data.level as TermKind, (e.data.args as string[]).join(" "));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [print]);

  const openExternal = () => {
    const url = URL.createObjectURL(new Blob([buildWebDocument(state.files, { console: false })], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  /* ------------------------------ running ------------------------------ */

  const runCode = async () => {
    if (isWeb) {
      print("sys", "— გვერდი განახლდა —");
      return runPreview();
    }
    if (running) return;
    if (compact) setMobileView("result");
    setRunning(true);
    const file = state.files[0];
    print("cmd", `run ${file?.name ?? ""}`);
    const t0 = performance.now();
    try {
      const { data, error } = await supabase.functions.invoke("run-code", {
        body: { language: state.language, code: file?.content ?? "", stdin },
      });
      const ms = Math.round(performance.now() - t0);
      if (error) print("error", error.message || "გაშვება ვერ მოხერხდა");
      else if (data?.error) print("error", data.error);
      else {
        if (data?.output) print("log", data.output);
        if (data?.stderr) print("error", data.stderr);
        if (!data?.output && !data?.stderr) print("sys", "(პროგრამამ არაფერი დაბეჭდა)");
        print(data?.stderr ? "error" : "ok", `${data?.stderr ? "✗ დასრულდა შეცდომით" : "✓ დასრულდა"} · ${ms}ms`);
      }
    } catch (err) {
      print("error", err instanceof Error ? err.message : "ქსელის შეცდომა");
    } finally {
      setRunning(false);
    }
  };

  const HELP_WEB = [
    "ბრძანებები:",
    "  run          გვერდის თავიდან ჩატვირთვა",
    "  ls           ფაილების სია",
    "  cat <ფაილი>  ფაილის შიგთავსის ნახვა",
    "  clear        ეკრანის გასუფთავება (Ctrl+L)",
    "  ნებისმიერი სხვა ტექსტი შესრულდება როგორც JavaScript გვერდზე,",
    "  მაგ: document.title  ან  2 + 2",
  ].join("\n");
  const HELP_RUN = [
    "ბრძანებები:",
    "  run          პროგრამის გაშვება (Ctrl+Enter)",
    "  ls           ფაილების სია",
    "  cat <ფაილი>  ფაილის შიგთავსის ნახვა",
    "  clear        ეკრანის გასუფთავება (Ctrl+L)",
    "  input-ის მონაცემები ჩაწერე ზემოთ, ღილაკ \"input\"-ში.",
  ].join("\n");

  const onTerminal = (raw: string) => {
    const [cmd, ...rest] = raw.split(/\s+/);
    const arg = rest.join(" ");
    if (cmd === "clear" || cmd === "cls") return setLogs([]);
    print("cmd", raw);
    if (cmd === "help") return print("info", isWeb ? HELP_WEB : HELP_RUN);
    if (cmd === "ls") return print("log", state.files.map((f) => f.name).join("   "));
    if (cmd === "cat") {
      const f = state.files.find((x) => x.name === arg);
      return f ? print("log", f.content) : print("error", `cat: ${arg || "?"}: ასეთი ფაილი არ არსებობს`);
    }
    if (cmd === "run" || cmd === "python" || cmd === "node") {
      setLogs((l) => l.slice(0, -1)); // runCode prints its own command line
      return runCode();
    }
    if (isWeb) {
      const win = iframeRef.current?.contentWindow;
      if (!win) return print("error", "პრევიუ ჯერ არ ჩატვირთულა");
      win.postMessage({ __czEval: 1, code: raw }, "*");
      return;
    }
    print("error", `${cmd}: უცნობი ბრძანება. ჩაწერე help`);
  };

  /* ------------------------------ saving ------------------------------ */

  const payload = (extra: { isPublic?: boolean; hideCode?: boolean } = {}) => ({
    title: state.title.trim() || "უსათაურო პროექტი",
    language: state.language,
    files: state.files,
    ...extra,
  });

  const save = async () => {
    if (!user) {
      toast({ title: "ავტორიზაცია საჭიროა", description: "კოდი ამ ბრაუზერშია შენახული. ღრუბელში შესანახად შედი ანგარიშზე." });
      return;
    }
    if (isOwner && state.snippetId) {
      if (await updateProject(state.snippetId, payload())) {
        project.markSaved();
        fetchProjects();
        toast({ title: "შენახულია ✓" });
      }
      return;
    }
    const id = await saveProject(payload({ isPublic: false, hideCode: state.hideCode }));
    if (id) {
      project.patch({ snippetId: id, ownerId: user.id, isPublic: false, title: payload().title });
      project.markSaved();
      setParams({ edit: id }, { replace: true });
      fetchProjects();
      toast({ title: "შენახულია ✓", description: "პროექტი პირადად შეინახა. ლინკისთვის დააჭირე „გაზიარებას“." });
    }
  };

  const publish = async (opts: { isPublic: boolean; hideCode: boolean }) => {
    if (!user) return;
    if (isOwner && state.snippetId) {
      if (await updateProject(state.snippetId, payload(opts))) {
        project.patch(opts);
        project.markSaved();
      }
      return;
    }
    const id = await saveProject(payload(opts));
    if (id) {
      project.patch({ ...opts, snippetId: id, ownerId: user.id, title: payload().title });
      project.markSaved();
      setParams({ edit: id }, { replace: true });
      fetchProjects();
    }
  };

  const changeVisibility = async (opts: { isPublic: boolean; hideCode: boolean }) => {
    if (!state.snippetId) return;
    if (await updateProject(state.snippetId, payload(opts))) {
      project.patch(opts);
      project.markSaved();
    }
  };

  const downloadZip = () => {
    const name = slugify(state.title || "playground");
    if (state.files.length === 1) {
      const f = state.files[0];
      downloadBlob(new Blob([f.content], { type: "text/plain" }), f.name);
    } else {
      downloadBlob(buildZip(state.files, name), `${name}.zip`);
    }
  };

  const downloadHtml = () =>
    downloadBlob(
      new Blob([buildWebDocument(state.files, { console: false })], { type: "text/html" }),
      `${slugify(state.title || "playground")}.html`
    );

  /* ------------------------------ project ops ------------------------------ */

  const confirmDiscard = () =>
    !project.dirty || window.confirm("გაქვს შეუნახავი ცვლილებები. მაინც დავიწყოთ თავიდან?");

  const newProject = (language = state.language) => {
    if (!confirmDiscard()) return;
    project.reset(language);
    setLogs([]);
    setParams({}, { replace: true });
    if (language === "web") setDoc(buildWebDocument(defaultFiles("web")));
  };

  const switchLanguage = (id: string) => {
    setLangOpen(false);
    if (id !== state.language) newProject(id);
  };

  const openProject = (id: string) => {
    if (id === state.snippetId) return;
    if (!confirmDiscard()) return;
    navigate(`/playground?edit=${id}`);
  };

  const deleteFile = (name: string) => {
    const file = state.files.find((f) => f.name === name);
    if (file?.content.trim() && !window.confirm(`წავშალოთ ${name}?`)) return;
    project.remove(name);
  };

  const toggleExplorer = () => {
    if (compact) return setMobileView((v) => (v === "files" ? "code" : "files"));
    const p = explorerPanel.current;
    if (p?.isCollapsed()) p.expand();
    else p?.collapse();
  };

  const toggleConsole = () => {
    const p = consolePanel.current;
    if (p?.isCollapsed()) p.expand();
    else p?.collapse();
  };

  /* ------------------------------ shortcuts ------------------------------ */

  const actions = useRef({ save, runCode, toggleExplorer, toggleConsole });
  actions.current = { save, runCode, toggleExplorer, toggleConsole };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        actions.current.save();
      } else if (k === "enter") {
        e.preventDefault();
        actions.current.runCode();
      } else if (k === "k" || k === "p") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (k === "b") {
        e.preventDefault();
        actions.current.toggleExplorer();
      } else if (k === "`" || k === "j") {
        e.preventDefault();
        actions.current.toggleConsole();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (project.dirty && state.snippetId) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [project.dirty, state.snippetId]);

  /* ------------------------------ palette ------------------------------ */

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = state.files.map((f) => ({
      id: `file:${f.name}`,
      group: "ფაილები",
      label: f.name,
      icon: <FileGlyph name={f.name} size={14} />,
      run: () => {
        project.open(f.name);
        if (compact) setMobileView("code");
        editorRef.current?.focus();
      },
    }));
    const cmd = (id: string, label: string, run: () => void, hint?: string, icon?: React.ReactNode): PaletteItem => ({
      id, label, run, hint, icon, group: "ბრძანებები",
    });
    items.push(
      cmd("run", isWeb ? "პრევიუს განახლება" : "კოდის გაშვება", runCode, `${MOD} ↵`, <Play size={13} />),
      cmd("save", "შენახვა", save, `${MOD} S`, <Save size={13} />),
      cmd("share", "გაზიარება…", () => setShareOpen(true), undefined, <Share2 size={13} />),
      cmd("zip", state.files.length > 1 ? ".zip-ის ჩამოტვირთვა" : "ფაილის ჩამოტვირთვა", downloadZip, undefined, <Download size={13} />),
      cmd("new", "ახალი პროექტი", () => newProject(), undefined, <FilePlus2 size={13} />),
      cmd("explorer", "ფაილების პანელი", toggleExplorer, `${MOD} B`, <PanelLeft size={13} />),
      cmd("terminal", "ტერმინალი", toggleConsole, `${MOD} J`, <SquareTerminal size={13} />),
      cmd("font+", "შრიფტის გაზრდა", () => setFontSize((s) => Math.min(s + 1, 22))),
      cmd("font-", "შრიფტის შემცირება", () => setFontSize((s) => Math.max(s - 1, 10)))
    );
    if (isWeb) {
      items.push(
                cmd("live", autoRun ? "ლაივ პრევიუს გამორთვა" : "ლაივ პრევიუს ჩართვა", () => setAutoRun((a) => !a)),
        cmd("external", "პრევიუს ახალ ტაბში გახსნა", openExternal),
        cmd("html", "ერთ .html ფაილად ჩამოტვირთვა", downloadHtml)
      );
    }
    LANGUAGES.forEach((l) =>
      items.push({
        id: `lang:${l.id}`,
        group: "ახალი პროექტი ენაზე",
        label: `${l.name} — ${l.runtime}`,
        icon: <span className="pg-dot" style={{ background: l.hue }} />,
        run: () => switchLanguage(l.id),
      })
    );
    return items;
  }, [state.files, isWeb, autoRun, compact, state.language, project.dirty]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------ render ------------------------------ */

  const activeFile = state.files.find((f) => f.name === active) ?? null;

  const status = !user
    ? { tone: "draft", label: "ბრაუზერში შენახული" }
    : !state.snippetId
      ? { tone: "draft", label: "ჯერ არ შენახულა" }
      : project.dirty
        ? { tone: "dirty", label: "შეუნახავი ცვლილებები" }
        : { tone: "ok", label: state.isPublic ? "შენახულია · საჯარო" : "შენახულია · პირადი" };

  const explorer = (
    <Explorer
      files={state.files}
      active={active}
      canEditFiles={isWeb}
      onOpen={(name) => {
        project.open(name);
        if (compact) setMobileView("code");
      }}
      onCreate={project.create}
      onRename={project.rename}
      onDelete={deleteFile}
      projects={user ? projects : null}
      currentId={state.snippetId}
      onOpenProject={openProject}
      onNewProject={() => newProject()}
    />
  );

  const editor = (
    <div className="pg-pane pg-editor">
      <div className="pg-tabs" role="tablist">
        {tabs.map((name) => (
          <div
            key={name}
            role="tab"
            aria-selected={name === active}
            className={`pg-tab ${name === active ? "is-active" : ""}`}
            onClick={() => project.open(name)}
            onMouseDown={(e) => e.button === 1 && (e.preventDefault(), project.close(name))}
          >
            <FileGlyph name={name} size={13} />
            <FileName name={name} />
            <button
              className="pg-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                project.close(name);
              }}
              aria-label={`${name} — დახურვა`}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <div className="pg-tabs-fill" />
      </div>
      {activeFile ? (
        <CodeEditor
          ref={editorRef}
          key={activeFile.name}
          value={activeFile.content}
          onChange={(v) => project.setContent(activeFile.name, v)}
          language={fileKind(activeFile.name).prism}
          fontSize={fontSize}
          onCursor={setCursor}
          placeholder="დაიწყე წერა…"
        />
      ) : (
        <div className="pg-editor-empty">
          <p className="pg-editor-empty-title">ფაილი არ არის გახსნილი</p>
          <p>
            აირჩიე ფაილი მარცხნივ ან დააჭირე <kbd>{MOD} K</kbd>
          </p>
        </div>
      )}
    </div>
  );

  const terminal = (
    <Terminal
      lines={logs}
      mode={isWeb ? "js" : "run"}
      prompt={isWeb ? ">" : "$"}
      busy={running}
      onSubmit={onTerminal}
      onClear={() => setLogs([])}
      onToggle={compact || !isWeb ? undefined : toggleConsole}
      stdin={isWeb ? undefined : stdin}
      onStdinChange={isWeb ? undefined : setStdin}
    />
  );

  const preview = (
    <PreviewPane
      ref={iframeRef}
      doc={doc}
      runKey={runKey}
      autoRun={autoRun}
      onToggleAutoRun={() => setAutoRun((a) => !a)}
      onRun={runPreview}
      onOpenExternal={openExternal}
    />
  );

  const result_ = !isWeb ? (
    terminal
  ) : compact ? (
    <div className="pg-stack">
      {preview}
      {terminal}
    </div>
  ) : (
    <PanelGroup direction="vertical" autoSaveId="pg-v">
      <Panel minSize={20} defaultSize={68} order={1}>
        {preview}
      </Panel>
      <PanelResizeHandle className="pg-handle pg-handle-h" />
      <Panel ref={consolePanel} order={2} defaultSize={32} minSize={12} collapsible collapsedSize={5}>
        {terminal}
      </Panel>
    </PanelGroup>
  );

  return (
    <div className="pg" data-lang={state.language}>
      <header className="pg-top">
        <div className="pg-top-left">
          <Link to="/" className="pg-home" title="მთავარ გვერდზე დაბრუნება">
            <Home size={15} />
            <span className="pg-hide-sm">მთავარი</span>
          </Link>
          <span className="pg-divider" />
          <button className="pg-icon-btn" onClick={toggleExplorer} title={`ფაილები (${MOD} B)`} aria-label="ფაილების პანელი">
            <PanelLeft size={15} />
          </button>
          <input
            className="pg-title"
            value={state.title}
            onChange={(e) => project.patch({ title: e.target.value })}
            placeholder="უსათაურო პროექტი"
            size={Math.max(state.title.length, 16)}
            maxLength={80}
            aria-label="პროექტის სახელი"
            spellCheck={false}
          />
          <span className={`pg-status-dot is-${status.tone}`} title={status.label} />
        </div>

        <div className="pg-top-right">
          <div className="pg-lang">
            <button className="pg-btn pg-btn-ghost" onClick={() => setLangOpen((o) => !o)} aria-expanded={langOpen}>
              <span className="pg-dot" style={{ background: lang.hue }} />
              {lang.name}
              <ChevronDown size={13} />
            </button>
            {langOpen && (
              <>
                <div className="pg-click-away" onClick={() => setLangOpen(false)} />
                <div className="pg-lang-menu" role="menu">
                  <p className="pg-label">ახალი პროექტი ენაზე:</p>
                  <div className="pg-lang-grid">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.id}
                        role="menuitem"
                        className={l.id === state.language ? "is-on" : ""}
                        onClick={() => switchLanguage(l.id)}
                      >
                        <span className="pg-dot" style={{ background: l.hue }} />
                        <span className="pg-lang-name">{l.name}</span>
                        <span className="pg-lang-rt">{l.runtime}</span>
                        {l.id === state.language && <Check size={13} className="pg-lang-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="pg-btn pg-btn-ghost pg-hide-sm" onClick={() => setPaletteOpen(true)} title="ბრძანებები">
            <Command size={13} /> <kbd>{MOD} K</kbd>
          </button>

          <button className="pg-btn" onClick={save} disabled={busy} title={`შენახვა (${MOD} S)`}>
            {busy ? <Loader2 size={13} className="pg-spin" /> : <Save size={13} />}
            <span className="pg-hide-sm">შენახვა</span>
          </button>

          {(!isWeb || !autoRun) && (
            <button className="pg-btn pg-btn-primary" onClick={runCode} disabled={running} title={`გაშვება (${MOD} Enter)`}>
              {running ? <Loader2 size={13} className="pg-spin" /> : <Play size={13} fill="currentColor" />}
              გაშვება
            </button>
          )}

          <button className={`pg-btn ${isWeb && autoRun ? "pg-btn-primary" : ""}`} onClick={() => setShareOpen(true)}>
            <Share2 size={13} /> <span className="pg-hide-xs">გაზიარება</span>
          </button>
        </div>
      </header>

      <main className="pg-main">
        {compact ? (
          <>
            <div className="pg-mobile-switch" role="tablist">
              {(
                [
                  ["files", "ფაილები"],
                  ["code", "კოდი"],
                  ["result", isWeb ? "შედეგი" : "ტერმინალი"],
                ] as const
              ).map(([v, label]) => (
                <button key={v} className={mobileView === v ? "is-on" : ""} onClick={() => setMobileView(v)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="pg-mobile-body">
              {mobileView === "files" ? explorer : mobileView === "code" ? editor : result_}
            </div>
          </>
        ) : (
          <PanelGroup direction="horizontal" autoSaveId="pg-h">
            <Panel
              ref={explorerPanel}
              order={1}
              defaultSize={16}
              minSize={11}
              maxSize={30}
              collapsible
              collapsedSize={0}
              onCollapse={() => setExplorerCollapsed(true)}
              onExpand={() => setExplorerCollapsed(false)}
              className={explorerCollapsed ? "pg-collapsed" : undefined}
            >
              {explorer}
            </Panel>
            <PanelResizeHandle className="pg-handle" />
            <Panel order={2} defaultSize={44} minSize={25}>
              {editor}
            </Panel>
            <PanelResizeHandle className="pg-handle" />
            <Panel order={3} defaultSize={40} minSize={20}>
              {result_}
            </Panel>
          </PanelGroup>
        )}
      </main>

      <footer className="pg-statusbar">
        <span className={`pg-sb-state is-${status.tone}`}>
          <span className="pg-status-dot" /> {status.label}
        </span>
        <span className="pg-sb-spacer" />
        {activeFile && (
          <>
            <span>
              ხაზი {cursor.line}, სვეტი {cursor.col}
              {cursor.selected > 0 && ` (${cursor.selected} მონიშნული)`}
            </span>
            <span className="pg-hide-sm">{fileKind(activeFile.name).label.toUpperCase()}</span>
          </>
        )}
        <span className="pg-sb-font pg-hide-sm">
          <button onClick={() => setFontSize((s) => Math.max(s - 1, 10))} aria-label="შრიფტის შემცირება">−</button>
          {Math.round(fontSize)}px
          <button onClick={() => setFontSize((s) => Math.min(s + 1, 22))} aria-label="შრიფტის გაზრდა">+</button>
        </span>
      </footer>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        isLoggedIn={!!user}
        language={state.language}
        files={state.files}
        title={state.title}
        onTitleChange={(t) => project.patch({ title: t })}
        snippetId={isOwner ? state.snippetId : null}
        isPublic={state.isPublic}
        hideCode={state.hideCode}
        busy={busy}
        onPublish={publish}
        onVisibilityChange={changeVisibility}
        onDownloadZip={downloadZip}
        onDownloadHtml={isWeb ? downloadHtml : undefined}
      />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
    </div>
  );
};

export default Playground;
