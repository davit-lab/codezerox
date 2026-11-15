import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultFiles, extOf, isValidFileName, NEW_FILE_TEMPLATES, ProjectFile, WEB_EXTENSIONS } from "./project";

const DRAFT_KEY = "cz-playground-draft-v2";

export interface ProjectState {
  language: string;
  files: ProjectFile[];
  title: string;
  snippetId: string | null;
  ownerId: string | null;
  isPublic: boolean;
  hideCode: boolean;
}

const fresh = (language = "web"): ProjectState => ({
  language,
  files: defaultFiles(language),
  title: "",
  snippetId: null,
  ownerId: null,
  isPublic: false,
  hideCode: false,
});

const readDraft = (): (ProjectState & { tabs?: string[]; active?: string }) | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!Array.isArray(d.files) || d.files.length === 0) return null;
    return d;
  } catch {
    return null;
  }
};

const snapshot = (s: Pick<ProjectState, "title" | "files">) => JSON.stringify([s.title, s.files]);

export const useProject = () => {
  const initial = useRef(readDraft());
  const [state, setState] = useState<ProjectState>(() => initial.current ?? fresh());
  const [tabs, setTabs] = useState<string[]>(
    () => initial.current?.tabs?.filter((t) => initial.current!.files.some((f) => f.name === t)) ?? state.files.map((f) => f.name)
  );
  const [active, setActive] = useState<string | null>(() => initial.current?.active ?? state.files[0]?.name ?? null);
  const [savedSnap, setSavedSnap] = useState<string | null>(() => (initial.current?.snippetId ? null : snapshot(state)));
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(initial.current ? Date.now() : null);

  // Persist a local draft (debounced) so nothing is ever lost.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...state, tabs, active }));
        setDraftSavedAt(Date.now());
      } catch {
        /* storage full or disabled */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [state, tabs, active]);

  const dirty = useMemo(() => savedSnap !== snapshot(state), [savedSnap, state]);
  const markSaved = useCallback(() => setSavedSnap(snapshot(state)), [state]);

  const load = useCallback((next: ProjectState, opts: { clean?: boolean } = {}) => {
    setState(next);
    setTabs(next.files.map((f) => f.name));
    setActive(next.files[0]?.name ?? null);
    setSavedSnap(opts.clean === false ? null : snapshot(next));
  }, []);

  const reset = useCallback((language: string) => load(fresh(language)), [load]);

  const patch = useCallback((p: Partial<ProjectState>) => setState((s) => ({ ...s, ...p })), []);

  const setContent = useCallback((name: string, content: string) => {
    setState((s) => ({ ...s, files: s.files.map((f) => (f.name === name ? { ...f, content } : f)) }));
  }, []);

  const open = useCallback((name: string) => {
    setTabs((t) => (t.includes(name) ? t : [...t, name]));
    setActive(name);
  }, []);

  const close = useCallback(
    (name: string) => {
      setTabs((t) => {
        const i = t.indexOf(name);
        const next = t.filter((x) => x !== name);
        if (active === name) setActive(next[Math.min(i, next.length - 1)] ?? null);
        return next;
      });
    },
    [active]
  );

  const validate = (name: string, except?: string) => {
    if (!isValidFileName(name)) return "სახელი ასე დაწერე: about.html";
    if (!WEB_EXTENSIONS.includes(extOf(name))) return `დაშვებულია: ${WEB_EXTENSIONS.join(", ")}`;
    if (state.files.some((f) => f.name.toLowerCase() === name.toLowerCase() && f.name !== except)) {
      return "ასეთი ფაილი უკვე არსებობს";
    }
    return null;
  };

  const create = (name: string) => {
    const err = validate(name);
    if (err) return err;
    setState((s) => ({ ...s, files: [...s.files, { name, content: NEW_FILE_TEMPLATES[extOf(name)] ?? "" }] }));
    open(name);
    return null;
  };

  const rename = (from: string, to: string) => {
    const err = validate(to, from);
    if (err) return err;
    setState((s) => ({ ...s, files: s.files.map((f) => (f.name === from ? { ...f, name: to } : f)) }));
    setTabs((t) => t.map((x) => (x === from ? to : x)));
    setActive((a) => (a === from ? to : a));
    return null;
  };

  const remove = (name: string) => {
    setState((s) => ({ ...s, files: s.files.filter((f) => f.name !== name) }));
    close(name);
  };

  return {
    state,
    patch,
    tabs,
    active,
    dirty,
    draftSavedAt,
    markSaved,
    load,
    reset,
    setContent,
    open,
    close,
    create,
    rename,
    remove,
    restoredDraft: !!initial.current,
  };
};
