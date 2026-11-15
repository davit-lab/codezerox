import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Download, FileCode2, Loader2, Lock, Globe2, ArrowUpRight, EyeOff, X } from "lucide-react";
import { buildWebDocument, getLanguage, ProjectFile } from "./project";

interface Props {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  language: string;
  files: ProjectFile[];
  title: string;
  onTitleChange: (t: string) => void;
  snippetId: string | null;
  isPublic: boolean;
  hideCode: boolean;
  busy: boolean;
  onPublish: (opts: { isPublic: boolean; hideCode: boolean }) => Promise<void>;
  onVisibilityChange: (opts: { isPublic: boolean; hideCode: boolean }) => Promise<void>;
  onDownloadZip: () => void;
  onDownloadHtml?: () => void;
}

type Tab = "link" | "embed";

const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };
  return { copied, copy };
};

const ShareDialog = (p: Props) => {
  const [tab, setTab] = useState<Tab>("link");
  const [isPublic, setIsPublic] = useState(p.isPublic);
  const [hideCode, setHideCode] = useState(p.hideCode);
  const [embedHeight, setEmbedHeight] = useState(420);
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (p.open) {
      setIsPublic(p.snippetId ? p.isPublic : true);
      setHideCode(p.hideCode);
    }
  }, [p.open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!p.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && p.onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p.open, p.onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  const lang = getLanguage(p.language);
  const isWeb = p.language === "web";
  const url = p.snippetId ? `${window.location.origin}/code/${p.snippetId}` : "";
  const embedCode = p.snippetId
    ? `<iframe src="${url}?embed=1" width="100%" height="${embedHeight}" style="border:0;border-radius:6px" loading="lazy" title="${(p.title || "CodeZero პროექტი").replace(/"/g, "&quot;")}"></iframe>`
    : "";

  const thumbDoc = useMemo(
    () => (p.open && isWeb ? buildWebDocument(p.files, { console: false }) : ""),
    [p.open, isWeb, p.files]
  );
  const excerpt = useMemo(() => (p.files[0]?.content ?? "").split("\n").slice(0, 14).join("\n"), [p.files]);

  if (!p.open) return null;

  const shareText = `${p.title || "ჩემი პროექტი"} — შექმნილია CodeZero-ს კოდის ედიტორში`;
  const targets = [
    { name: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}` },
    { name: "ელფოსტა", href: `mailto:?subject=${encodeURIComponent(p.title || "კოდი")}&body=${encodeURIComponent(shareText + "\n\n" + url)}` },
  ];
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  const changeVisibility = async (next: { isPublic: boolean; hideCode: boolean }) => {
    setIsPublic(next.isPublic);
    setHideCode(next.hideCode);
    if (p.snippetId) await p.onVisibilityChange(next);
  };

  return (
    <div className="pg-overlay" onMouseDown={p.onClose}>
      <div className="pg-share" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="პროექტის გაზიარება">
        {/* Card preview */}
        <aside className="pg-share-card">
          <div className="pg-share-thumb">
            {isWeb ? (
              <iframe srcDoc={thumbDoc} title="thumbnail" sandbox="allow-scripts" tabIndex={-1} />
            ) : (
              <pre>{excerpt}</pre>
            )}
          </div>
          <div className="pg-share-card-meta">
            <span className="pg-dot" style={{ background: lang.hue }} />
            <span>{lang.name}</span>
            <span>·</span>
            <span>{p.files.length} ფაილი</span>
          </div>
          <h3 className="pg-share-card-title">{p.title || "უსათაურო პროექტი"}</h3>
        </aside>

        <section className="pg-share-body">
          <header className="pg-share-head">
            <h2 className="pg-share-h">{p.snippetId ? "გაზიარება" : "გამოქვეყნება"}</h2>
            <button className="pg-icon-btn" onClick={p.onClose} aria-label="დახურვა">
              <X size={16} />
            </button>
          </header>

          {!p.isLoggedIn ? (
            <div className="pg-share-signin">
              <p>ლინკის შესაქმნელად საჭიროა ავტორიზაცია. შენი კოდი არ დაიკარგება — ის ამ ბრაუზერშია შენახული.</p>
              <div className="pg-share-row">
                <Link to="/auth" className="pg-btn pg-btn-primary">
                  შესვლა <ArrowUpRight size={14} />
                </Link>
                <button className="pg-btn" onClick={p.onDownloadZip}>
                  <Download size={14} /> ჩამოტვირთვა
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="pg-field">
                <span>სახელი</span>
                <input
                  value={p.title}
                  onChange={(e) => p.onTitleChange(e.target.value)}
                  placeholder="მაგ: ჩემი პირველი საიტი"
                  maxLength={80}
                  autoFocus={!p.snippetId}
                />
              </label>

              <div className="pg-field">
                <span>ვის შეუძლია ლინკის გახსნა</span>
                <div className="pg-seg">
                  <button
                    className={!isPublic ? "is-on" : ""}
                    onClick={() => changeVisibility({ isPublic: false, hideCode })}
                    disabled={p.busy}
                  >
                    <Lock size={13} /> მხოლოდ მე
                  </button>
                  <button
                    className={isPublic ? "is-on" : ""}
                    onClick={() => changeVisibility({ isPublic: true, hideCode })}
                    disabled={p.busy}
                  >
                    <Globe2 size={13} /> ყველას (გალერეაშიც გამოჩნდება)
                  </button>
                </div>
                {!isPublic && p.snippetId && (
                  <p className="pg-note">პირადი ლინკი მხოლოდ შენთვის იხსნება. სხვებისთვის გასაზიარებლად აირჩიე „ყველას“.</p>
                )}
              </div>

              <label className="pg-check">
                <input
                  type="checkbox"
                  checked={hideCode}
                  onChange={(e) => changeVisibility({ isPublic, hideCode: e.target.checked })}
                  disabled={p.busy}
                />
                <span className="pg-check-box" />
                <span>
                  <EyeOff size={13} /> კოდის დამალვა — სხვები მხოლოდ შედეგს ნახავენ
                </span>
              </label>

              {!p.snippetId ? (
                <button
                  className="pg-btn pg-btn-primary pg-btn-wide"
                  disabled={p.busy || !p.title.trim()}
                  onClick={() => p.onPublish({ isPublic, hideCode })}
                >
                  {p.busy ? <Loader2 size={14} className="pg-spin" /> : null}
                  გამოქვეყნება და ლინკის შექმნა
                </button>
              ) : (
                <>
                  <div className="pg-tabs-mini">
                    <button className={tab === "link" ? "is-on" : ""} onClick={() => setTab("link")}>
                      ლინკი
                    </button>
                    <button className={tab === "embed" ? "is-on" : ""} onClick={() => setTab("embed")}>
                      საიტზე ჩასმა
                    </button>
                  </div>

                  {tab === "link" ? (
                    <>
                      <div className="pg-copy">
                        <code>{url.replace(/^https?:\/\//, "")}</code>
                        <button className="pg-btn" onClick={() => copy("link", url)}>
                          {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
                          {copied === "link" ? "დაკოპირდა" : "კოპირება"}
                        </button>
                      </div>
                      <ul className="pg-targets">
                        {targets.map((t) => (
                          <li key={t.name}>
                            <a href={t.href} target="_blank" rel="noreferrer noopener">
                              {t.name}
                              <ArrowUpRight size={12} />
                            </a>
                          </li>
                        ))}
                        {canNativeShare && (
                          <li>
                            <button
                              onClick={() =>
                                navigator.share({ title: p.title, text: shareText, url }).catch(() => undefined)
                              }
                            >
                              სხვა…
                            </button>
                          </li>
                        )}
                      </ul>
                      <a className="pg-open-link" href={url} target="_blank" rel="noreferrer">
                        გვერდის გახსნა <ArrowUpRight size={12} />
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="pg-embed">
                        <pre>{embedCode}</pre>
                        <div className="pg-share-row">
                          <label className="pg-inline-field">
                            სიმაღლე
                            <input
                              type="number"
                              min={200}
                              max={1200}
                              step={20}
                              value={embedHeight}
                              onChange={(e) => setEmbedHeight(Number(e.target.value) || 420)}
                            />
                            px
                          </label>
                          <button className="pg-btn" onClick={() => copy("embed", embedCode)}>
                            {copied === "embed" ? <Check size={14} /> : <Copy size={14} />}
                            {copied === "embed" ? "დაკოპირდა" : "კოდის კოპირება"}
                          </button>
                        </div>
                      </div>
                      <p className="pg-note">ჩასვი ეს კოდი შენს საიტზე ან ბლოგზე. ყოველი შენახვისას იქაც განახლდება.</p>
                    </>
                  )}
                </>
              )}

              <footer className="pg-share-foot">
                <span className="pg-label">ჩამოტვირთვა</span>
                <div className="pg-share-row">
                  <button className="pg-btn pg-btn-ghost" onClick={p.onDownloadZip}>
                    <Download size={14} /> {p.files.length > 1 ? "ZIP არქივი" : "ფაილი"}
                  </button>
                  {p.onDownloadHtml && (
                    <button className="pg-btn pg-btn-ghost" onClick={p.onDownloadHtml}>
                      <FileCode2 size={14} /> ერთი .html ფაილი
                    </button>
                  )}
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShareDialog;
