import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowUpRight } from "lucide-react";
import FileGlyph, { FileName } from "./FileGlyph";
import { getLanguage, ProjectFile } from "./project";

export interface SavedProject {
  id: string;
  title: string;
  language: string;
  updated_at: string;
  is_public: boolean;
}

interface Props {
  files: ProjectFile[];
  active: string | null;
  canEditFiles: boolean;
  onOpen: (name: string) => void;
  onCreate: (name: string) => string | null; // returns error message
  onRename: (from: string, to: string) => string | null;
  onDelete: (name: string) => void;
  projects: SavedProject[] | null; // null = not signed in
  currentId: string | null;
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "ახლა";
  if (s < 3600) return `${Math.floor(s / 60)} წთ`;
  if (s < 86400) return `${Math.floor(s / 3600)} სთ`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} დღე`;
  return new Date(iso).toLocaleDateString("ka-GE", { month: "short", day: "numeric" });
};

const NameInput = ({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: string;
  onSubmit: (v: string) => string | null;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const v = value.trim();
    if (!v || v === initial) return onCancel();
    const err = onSubmit(v);
    if (err) setError(err);
  };
  return (
    <div className="pg-file-edit">
      <input
        autoFocus
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onFocus={(e) => {
          const dot = e.target.value.lastIndexOf(".");
          e.target.setSelectionRange(0, dot > 0 ? dot : e.target.value.length);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={submit}
        spellCheck={false}
      />
      {error && <p className="pg-file-error">{error}</p>}
    </div>
  );
};

const Explorer = (p: Props) => {
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);

  return (
    <div className="pg-explorer">
      <div className="pg-section-head">
        <span className="pg-label">ფაილები</span>
        {p.canEditFiles && (
          <button className="pg-icon-btn" onClick={() => setCreating(true)} title="ახალი ფაილი" aria-label="ახალი ფაილი">
            <Plus size={14} />
          </button>
        )}
      </div>

      <ul className="pg-files">
        {p.files.map((f) => (
          <li key={f.name}>
            {renaming === f.name ? (
              <NameInput
                initial={f.name}
                onCancel={() => setRenaming(null)}
                onSubmit={(v) => {
                  const err = p.onRename(f.name, v);
                  if (!err) setRenaming(null);
                  return err;
                }}
              />
            ) : (
              <div
                className={`pg-file ${p.active === f.name ? "is-active" : ""}`}
                onClick={() => p.onOpen(f.name)}
                onDoubleClick={() => p.canEditFiles && setRenaming(f.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && p.onOpen(f.name)}
              >
                <FileGlyph name={f.name} />
                <FileName name={f.name} />
                {p.canEditFiles && (
                  <span className="pg-file-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenaming(f.name);
                      }}
                      title="სახელის შეცვლა"
                      aria-label={`${f.name} — სახელის შეცვლა`}
                    >
                      <Pencil size={12} />
                    </button>
                    {p.files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          p.onDelete(f.name);
                        }}
                        title="წაშლა"
                        aria-label={`${f.name} — წაშლა`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
        {creating && (
          <li>
            <NameInput
              initial=""
              onCancel={() => setCreating(false)}
              onSubmit={(v) => {
                const err = p.onCreate(v);
                if (!err) setCreating(false);
                return err;
              }}
            />
          </li>
        )}
      </ul>
      {p.canEditFiles && (
        <p className="pg-explorer-hint">
          ახალი ფაილის დასამატებლად დააჭირე +. სახელის შესაცვლელად — ორჯერ დააწკაპუნე.
          <br />
          ფაილებს სახელით აკავშირებ: <code>href="style.css"</code>
        </p>
      )}

      <div className="pg-section-head pg-section-gap">
        <span className="pg-label">ჩემი პროექტები</span>
        <button className="pg-icon-btn" onClick={p.onNewProject} title="ახალი პროექტი" aria-label="ახალი პროექტი">
          <Plus size={14} />
        </button>
      </div>

      {p.projects === null ? (
        <p className="pg-explorer-hint">
          <Link to="/auth">შედი ანგარიშზე</Link>, რომ პროექტები შეინახო. მანამდე კოდი ამ ბრაუზერში ინახება.
        </p>
      ) : p.projects.length === 0 ? (
        <p className="pg-explorer-hint">ჯერ არაფერი შეგინახავს. დააჭირე Ctrl + S.</p>
      ) : (
        <ul className="pg-projects">
          {p.projects.map((proj) => {
            const lang = getLanguage(proj.language);
            return (
              <li key={proj.id}>
                <button
                  className={`pg-project ${p.currentId === proj.id ? "is-active" : ""}`}
                  onClick={() => p.onOpenProject(proj.id)}
                >
                  <span className="pg-dot" style={{ background: lang.hue }} title={lang.name} />
                  <span className="pg-project-title">{proj.title}</span>
                  <span className="pg-project-time">{timeAgo(proj.updated_at)}</span>
                </button>
              </li>
            );
          })}
          <li>
            <Link to="/my-projects" className="pg-project-all">
              ყველა პროექტი <ArrowUpRight size={11} />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Explorer;
