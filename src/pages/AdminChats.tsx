import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminChatRooms, useChatMessages, useSendMessage, useMarkMessagesRead,
  useChatQuickReplies, useUpsertChatQuickReply, useDeleteChatQuickReply,
  type ChatQuickReply,
} from "@/hooks/useChat";
import { useAdminSupportTickets, useUpdateTicketStatus, useDeleteTicket, type SupportTicket } from "@/hooks/useSupportTickets";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getNotificationPermission, requestNotificationPermission, type PermissionState } from "@/lib/notifications";

const ATTACH_PREFIX = "[[attachment]]";
const parseAttachment = (content: string) => {
  if (!content.startsWith(ATTACH_PREFIX)) return null;
  try { return JSON.parse(content.slice(ATTACH_PREFIX.length)); } catch { return null; }
};

const CAT_ICONS: Record<string, string> = {
  "წიგნები": "📚",
  "ფრილანსერი": "💼",
  "ვაკანსიები": "📋",
  "ციფრული პროდუქტები": "🛒",
  "სერტიფიკატები": "🏆",
  "ჰაბი & გალერეა": "🌐",
  "ტექნიკური": "⚙️",
  "ზოგადი": "💬",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Btn = ({ icon, color, onClick, title }: { icon: string; color: string; onClick: () => void; title?: string }) => (
  <button onClick={onClick} title={title}
    style={{ width: 24, height: 24, border: "none", borderRadius: 6, background: "transparent", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}
    onMouseEnter={e => (e.currentTarget.style.background = color + "22")}
    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
    <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{icon}</span>
  </button>
);

const TabBtn = ({ active, onClick, icon, label, badge, badgeColor = "#ef4444" }: any) => (
  <button onClick={onClick}
    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 9,
      background: active ? "var(--gold)" : "transparent", color: active ? "#000" : "var(--text-muted)",
      border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem", transition: "all .15s" }}>
    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{icon}</span>
    {label}
    {badge > 0 && (
      <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 10, background: badgeColor,
        color: "#fff", fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </button>
);

const StatusBadge = ({ status }: { status: SupportTicket["status"] }) => {
  const cfg = {
    new: { bg: "rgba(59,130,246,.18)", c: "#3b82f6", l: "ახალი" },
    in_progress: { bg: "rgba(245,158,11,.18)", c: "#f59e0b", l: "მუშავდება" },
    resolved: { bg: "rgba(16,185,129,.18)", c: "#10b981", l: "✓" },
  }[status];
  return <span style={{ padding: "2px 8px", borderRadius: 8, background: cfg.bg, color: cfg.c, fontSize: "0.68rem", fontWeight: 700 }}>{cfg.l}</span>;
};

const InfoCell = ({ icon, label, value }: any) => (
  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: 4 }}>
      <span className="material-symbols-rounded" style={{ fontSize: 13 }}>{icon}</span>{label}
    </div>
    <div style={{ color: "var(--text-white)", fontSize: "0.9rem", fontWeight: 500 }}>{value}</div>
  </div>
);

// ─── Add / Edit modal ─────────────────────────────────────────────────────────
const AddEditModal = ({ item, existingCats, onSave, onClose }: {
  item: Partial<ChatQuickReply>; existingCats: string[];
  onSave: (v: Partial<ChatQuickReply>) => void; onClose: () => void;
}) => {
  const [form, setForm] = useState({ category: item.category || "ზოგადი", question: item.question || "", answer: item.answer || "", id: item.id });
  const [customCat, setCustomCat] = useState("");
  const allCats = [...new Set([...existingCats, "ზოგადი"])];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 480, maxWidth: "calc(100vw - 32px)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1rem" }}>
            {item.id ? "შაბლონის რედაქტირება" : "ახალი შაბლონი"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6, display: "block" }}>კატეგორია</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ flex: 1, padding: "8px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.88rem" }}>
                {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__new__">ახალი კატეგორია...</option>
              </select>
              {form.category === "__new__" && (
                <input value={customCat} onChange={e => setCustomCat(e.target.value)} placeholder="კატეგორიის სახელი"
                  style={{ flex: 1, padding: "8px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.88rem" }} />
              )}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6, display: "block" }}>კითხვა *</label>
            <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="მომხმარებლის კითხვა..."
              style={{ width: "100%", padding: "9px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.88rem" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6, display: "block" }}>პასუხი *</label>
            <textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              rows={6} placeholder="გამზადებული პასუხი..."
              style={{ width: "100%", padding: "9px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.88rem", resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose}
              style={{ padding: "9px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 9, color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>
              გაუქმება
            </button>
            <button onClick={() => {
              const cat = form.category === "__new__" ? customCat.trim() || "ზოგადი" : form.category;
              onSave({ ...form, category: cat });
            }} disabled={!form.question.trim() || !form.answer.trim()}
              style={{ padding: "9px 20px", background: "var(--gold)", border: "none", borderRadius: 9, color: "#000", cursor: "pointer", fontWeight: 700, opacity: (!form.question.trim() || !form.answer.trim()) ? 0.5 : 1 }}>
              შენახვა
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Quick-reply item ─────────────────────────────────────────────────────────
const QuickItem = ({ item, onInsert, onEdit, onDelete }: { item: ChatQuickReply; onInsert: (t: string) => void; onEdit: (i: Partial<ChatQuickReply>) => void; onDelete: (id: string) => void }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "7px 9px 7px 30px", borderRadius: 8, background: hov ? "var(--bg-card)" : "transparent", cursor: "pointer", transition: "background .12s" }}>
      <div style={{ flex: 1, minWidth: 0 }} onClick={() => onInsert(item.answer)}>
        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.78rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{item.question}</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.answer.slice(0, 55)}{item.answer.length > 55 ? "…" : ""}</div>
      </div>
      {hov && (
        <div style={{ display: "flex", gap: 2, flexShrink: 0, marginTop: 1 }}>
          <Btn icon="content_copy" color="var(--gold)" onClick={() => onInsert(item.answer)} title="ჩაწერე" />
          <Btn icon="edit" color="#4f8ef7" onClick={() => onEdit(item)} title="რედაქტირება" />
          <Btn icon="delete" color="#ef4444" onClick={() => { if (confirm("შაბლონი წაიშალოს?")) onDelete(item.id); }} title="წაშლა" />
        </div>
      )}
    </div>
  );
};

// ─── Quick-replies panel ──────────────────────────────────────────────────────
const QuickRepliesPanel = ({ onInsert }: { onInsert: (text: string) => void }) => {
  const { data: replies = [] } = useChatQuickReplies();
  const upsert = useUpsertChatQuickReply();
  const del = useDeleteChatQuickReply();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["წიგნები"]));
  const [editItem, setEditItem] = useState<Partial<ChatQuickReply> | null>(null);

  const categorized = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q ? replies.filter(r => r.question.toLowerCase().includes(q) || r.answer.toLowerCase().includes(q)) : replies;
    const grouped: Record<string, ChatQuickReply[]> = {};
    filtered.forEach(r => { if (!grouped[r.category]) grouped[r.category] = []; grouped[r.category].push(r); });
    return grouped;
  }, [replies, search]);

  const existingCats = [...new Set(replies.map(r => r.category))];
  const toggle = (cat: string) => setExpanded(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  return (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.12)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "13px 14px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="material-symbols-rounded" style={{ fontSize: 18, color: "var(--gold)" }}>bolt</span>
        <span style={{ flex: 1, fontWeight: 700, color: "var(--text-primary)", fontSize: "0.85rem" }}>სწრაფი პასუხები</span>
        <button onClick={() => setEditItem({ category: "ზოგადი", question: "", answer: "" })} title="ახალი შაბლონი"
          style={{ width: 28, height: 28, borderRadius: 8, background: "var(--gold-glow)", border: "1px solid var(--border-accent)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, color: "var(--gold)" }}>add</span>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ position: "relative" }}>
          <span className="material-symbols-rounded" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 15, pointerEvents: "none" }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ძებნა..."
            style={{ width: "100%", padding: "7px 9px 7px 30px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.8rem", outline: "none" }} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
        {Object.keys(categorized).length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", padding: "20px", textAlign: "center" }}>შაბლონები არ მოიძებნა</p>
        )}
        {Object.entries(categorized).map(([cat, items]) => {
          const icon = CAT_ICONS[cat] || "💬";
          const open = search ? true : expanded.has(cat);
          return (
            <div key={cat} style={{ marginBottom: 2 }}>
              <button onClick={() => toggle(cat)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", background: "transparent", border: "none", cursor: "pointer", borderRadius: 8, transition: "background .12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ flex: 1, fontWeight: 600, color: "var(--text-primary)", fontSize: "0.8rem", textAlign: "left" }}>{cat}</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 8 }}>{items.length}</span>
                <span className="material-symbols-rounded" style={{ fontSize: 15, color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .15s" }}>expand_more</span>
              </button>
              {open && items.map(item => (
                <QuickItem key={item.id} item={item} onInsert={onInsert} onEdit={setEditItem}
                  onDelete={id => { if (confirm("შაბლონი წაიშალოს?")) del.mutate(id); }} />
              ))}
            </div>
          );
        })}
      </div>

      {editItem !== null && (
        <AddEditModal item={editItem} existingCats={existingCats}
          onSave={data => upsert.mutate(data as any, { onSuccess: () => { setEditItem(null); toast.success("შაბლონი შენახულია"); } })}
          onClose={() => setEditItem(null)} />
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
type Tab = "chats" | "tickets";

const AdminChats = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();

  const [tab, setTab] = useState<Tab>("chats");
  const [permission, setPermission] = useState<PermissionState>("default");
  const [showQR, setShowQR] = useState(true);

  const { data: chatRooms = [] } = useAdminChatRooms();
  const { data: tickets = [] } = useAdminSupportTickets();

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState<"all" | SupportTicket["status"]>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: messages = [] } = useChatMessages(selectedRoom || undefined);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const updateTicket = useUpdateTicketStatus();
  const deleteTicket = useDeleteTicket();

  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setPermission(getNotificationPermission()); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (selectedRoom) markRead.mutate(selectedRoom); }, [selectedRoom]);

  const filteredRooms = useMemo(() => {
    const q = chatSearch.trim().toLowerCase();
    return q ? chatRooms.filter(r => { const p: any = (r as any).profile; return [p?.full_name, p?.email].some((v: any) => v?.toLowerCase().includes(q)); }) : chatRooms;
  }, [chatRooms, chatSearch]);

  const filteredTickets = useMemo(() =>
    ticketFilter === "all" ? tickets : tickets.filter(t => t.status === ticketFilter), [tickets, ticketFilter]);

  const totalUnread = useMemo(() => chatRooms.reduce((s, r) => s + (r.unread_count ?? 0), 0), [chatRooms]);
  const newTickets = useMemo(() => tickets.filter(t => t.status === "new").length, [tickets]);

  if (isLoading) return <AdminLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><span className="material-symbols-rounded" style={{ fontSize: 48, color: "var(--gold)", animation: "spin 1s linear infinite" }}>progress_activity</span></div></AdminLayout>;
  if (!user || !isAdmin) { navigate("/"); return null; }

  const handleSend = async () => {
    if (!message.trim() || !selectedRoom) return;
    await sendMessage.mutateAsync({ roomId: selectedRoom, content: message.trim() });
    setMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom || !user) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("ფაილი ძალიან დიდია (max 10MB)"); return; }
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("chat-attachments").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("chat-attachments").getPublicUrl(path);
      await sendMessage.mutateAsync({ roomId: selectedRoom, content: ATTACH_PREFIX + JSON.stringify({ url: publicUrl, name: file.name, type: file.type, text: message.trim() }) });
      setMessage("");
      toast.success("ფაილი გაიგზავნა");
    } catch { toast.error("ფაილის ატვირთვა ვერ მოხერხდა"); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const selectedRoomData = chatRooms.find(r => r.id === selectedRoom);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const S = {
    panel: { background: "var(--bg-elevated)", borderRadius: 14, border: "1px solid var(--border-subtle)", overflow: "hidden", minHeight: 660, display: "flex" } as React.CSSProperties,
    sidebar: { width: 260, flexShrink: 0, borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" as const, background: "rgba(0,0,0,0.15)" },
    chatArea: { flex: 1, display: "flex", flexDirection: "column" as const, minWidth: 0, maxHeight: 660, overflow: "hidden" },
  };

  return (
    <AdminLayout title="ჩატები & მხარდაჭერა" titleIcon="chat">

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, padding: 6, background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
          <TabBtn active={tab === "chats"} onClick={() => setTab("chats")} icon="forum" label="Live ჩატები" badge={totalUnread} />
          <TabBtn active={tab === "tickets"} onClick={() => setTab("tickets")} icon="contact_mail" label="ფორმები" badge={newTickets} badgeColor="#3b82f6" />
        </div>
        {permission !== "granted" && permission !== "unsupported" && (
          <button onClick={async () => { const r = await requestNotificationPermission(); setPermission(r); if (r === "granted") toast.success("✅ ნოტიფიკაციები ჩართულია"); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "linear-gradient(135deg, var(--gold), #d4a017)", color: "#000", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>notifications_active</span>
            ნოტიფიკაცია
          </button>
        )}
      </div>

      {/* ══ CHATS TAB ══ */}
      {tab === "chats" && (
        <div style={S.panel}>
          {/* Room list */}
          <div style={S.sidebar}>
            <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-rounded" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 16, pointerEvents: "none" }}>search</span>
                <input value={chatSearch} onChange={e => setChatSearch(e.target.value)} placeholder="ძებნა..."
                  style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 9, color: "var(--text-white)", fontSize: "0.82rem", outline: "none" }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
              {filteredRooms.length === 0
                ? <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "24px 12px", textAlign: "center" }}>ჩატები არ მოიძებნა</p>
                : filteredRooms.map(room => {
                  const p: any = (room as any).profile;
                  const sel = selectedRoom === room.id;
                  const unread = (room.unread_count ?? 0) > 0;
                  return (
                    <div key={room.id} onClick={() => setSelectedRoom(room.id)}
                      style={{ padding: "10px 12px", background: sel ? "var(--gold-glow)" : unread ? "rgba(255,255,255,.035)" : "transparent", border: sel ? "1px solid var(--border-accent)" : "1px solid transparent", borderRadius: 10, marginBottom: 3, cursor: "pointer", transition: "all .15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, var(--gold), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 }}>
                          {(p?.full_name || p?.email || "U")[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: unread ? 700 : 600, color: "var(--text-white)", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p?.full_name || p?.email || "User"}
                            </span>
                            {unread && <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: "#ef4444", color: "#fff", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{room.unread_count}</span>}
                          </div>
                          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
                            {new Date(room.last_message_at || room.created_at).toLocaleString("ka-GE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Chat area */}
          <div style={S.chatArea}>
            {selectedRoom ? (
              <>
                {/* Header */}
                <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.1)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--gold), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700, flexShrink: 0 }}>
                    {((selectedRoomData as any)?.profile?.full_name || (selectedRoomData as any)?.profile?.email || "U")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-white)", fontSize: "0.95rem" }}>{(selectedRoomData as any)?.profile?.full_name || "User"}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{(selectedRoomData as any)?.profile?.email}</div>
                  </div>
                  <button onClick={() => setShowQR(v => !v)} title="სწრაფი პასუხები"
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: showQR ? "var(--gold-glow)" : "var(--bg-card)", border: `1px solid ${showQR ? "var(--border-accent)" : "var(--border-subtle)"}`, borderRadius: 9, cursor: "pointer", color: showQR ? "var(--gold)" : "var(--text-muted)", fontSize: "0.78rem", fontWeight: 600, transition: "all .15s" }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>bolt</span>
                    შაბლონები
                  </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {messages.length === 0 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: 10, paddingTop: 80 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 52, opacity: 0.3 }}>chat</span>
                      <span style={{ fontSize: "0.85rem" }}>შეტყობინებები არ არის</span>
                    </div>
                  )}
                  {messages.map((msg, idx) => {
                    const att = parseAttachment(msg.content);
                    const isImg = att?.type?.startsWith("image/");
                    const fromAdmin = msg.is_admin;
                    const prev = messages[idx - 1];
                    const grouped = prev && prev.is_admin === msg.is_admin && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) < 60000;
                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: fromAdmin ? "flex-end" : "flex-start", marginTop: grouped ? 1 : 8 }}>
                        <div style={{ maxWidth: "72%" }}>
                          <div style={{ padding: "9px 13px", background: fromAdmin ? "linear-gradient(135deg, var(--gold), #d4a017)" : "var(--bg-card)", color: fromAdmin ? "#000" : "var(--text-white)", border: fromAdmin ? "none" : "1px solid var(--border-subtle)", borderRadius: grouped ? 13 : (fromAdmin ? "13px 13px 4px 13px" : "13px 13px 13px 4px"), fontSize: "0.88rem", lineHeight: 1.55, wordBreak: "break-word" as const }}>
                            {att ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                {isImg
                                  ? <a href={att.url} target="_blank" rel="noopener noreferrer"><img src={att.url} alt={att.name} style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, objectFit: "cover", display: "block" }} /></a>
                                  : <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 11px", background: "rgba(0,0,0,.2)", borderRadius: 8, textDecoration: "none", color: "inherit" }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>attach_file</span><span style={{ fontSize: "0.8rem" }}>{att.name}</span></a>}
                                {att.text && <div>{att.text}</div>}
                              </div>
                            ) : <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>}
                          </div>
                          {!grouped && <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2, textAlign: fromAdmin ? "right" : "left", padding: "0 3px" }}>{new Date(msg.created_at).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })}</div>}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-subtle)", background: "rgba(0,0,0,0.1)" }}>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFileUpload} style={{ display: "none" }} />
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                      style={{ width: 40, height: 40, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 9, color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isUploading
                        ? <span className="material-symbols-rounded" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>progress_activity</span>
                        : <span className="material-symbols-rounded" style={{ fontSize: 18 }}>attach_file</span>}
                    </button>
                    <textarea ref={textareaRef} value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="დაწერეთ პასუხი... (Enter გასაგზავნად)" rows={1}
                      style={{ flex: 1, padding: "9px 12px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 9, color: "var(--text-white)", fontSize: "0.88rem", resize: "none", minHeight: 40, maxHeight: 120, outline: "none", fontFamily: "inherit" }} />
                    <button onClick={handleSend} disabled={!message.trim() || sendMessage.isPending}
                      style={{ width: 40, height: 40, background: "linear-gradient(135deg, var(--gold), #d4a017)", border: "none", borderRadius: 9, color: "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: !message.trim() ? 0.4 : 1, transition: "opacity .15s" }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: 14 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 64, opacity: 0.25 }}>forum</span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>აირჩიეთ ჩატი</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>მარცხენა სიიდან აირჩიეთ მომხმარებელი</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies panel */}
          {showQR && selectedRoom && <QuickRepliesPanel onInsert={text => { setMessage(text); setTimeout(() => textareaRef.current?.focus(), 50); }} />}
        </div>
      )}

      {/* ══ TICKETS TAB ══ */}
      {tab === "tickets" && (
        <div style={S.panel}>
          {/* Ticket list */}
          <div style={{ ...S.sidebar, width: 360 }}>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 5, flexWrap: "wrap" }}>
              {(["all", "new", "in_progress", "resolved"] as const).map(s => (
                <button key={s} onClick={() => setTicketFilter(s)}
                  style={{ padding: "5px 11px", borderRadius: 8, fontSize: "0.76rem", fontWeight: 600, cursor: "pointer", background: ticketFilter === s ? "var(--gold)" : "var(--bg-card)", color: ticketFilter === s ? "#000" : "var(--text-muted)", border: "1px solid var(--border-subtle)", transition: "all .15s" }}>
                  {s === "all" ? "ყველა" : s === "new" ? `ახალი${newTickets > 0 ? ` (${newTickets})` : ""}` : s === "in_progress" ? "მუშავდება" : "დასრულებული"}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 6 }}>
              {filteredTickets.length === 0
                ? <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "24px 12px", textAlign: "center" }}>ფორმები არ მოიძებნა</p>
                : filteredTickets.map(t => (
                  <div key={t.id} onClick={() => setSelectedTicketId(t.id)}
                    style={{ padding: "10px 12px", background: selectedTicketId === t.id ? "var(--gold-glow)" : "transparent", border: selectedTicketId === t.id ? "1px solid var(--border-accent)" : "1px solid transparent", borderRadius: 10, marginBottom: 3, cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-white)", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 3 }}>
                      {new Date(t.created_at).toLocaleString("ka-GE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Ticket detail */}
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 660 }}>
            {selectedTicket ? (
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ color: "var(--text-white)", fontSize: "1.3rem", marginBottom: 5, fontWeight: 700 }}>{selectedTicket.topic}</h2>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{new Date(selectedTicket.created_at).toLocaleString("ka-GE")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value={selectedTicket.status}
                      onChange={e => updateTicket.mutate({ id: selectedTicket.id, status: e.target.value as SupportTicket["status"] })}
                      style={{ padding: "7px 11px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-white)", fontSize: "0.85rem" }}>
                      <option value="new">ახალი</option>
                      <option value="in_progress">მუშავდება</option>
                      <option value="resolved">დასრულებული</option>
                    </select>
                    <button onClick={() => { if (confirm("წაშალე ფორმა?")) { deleteTicket.mutate(selectedTicket.id); setSelectedTicketId(null); } }}
                      style={{ padding: "7px 11px", background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.35)", borderRadius: 8, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 15 }}>delete</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10, marginBottom: 18 }}>
                  <InfoCell icon="person" label="სახელი" value={selectedTicket.name} />
                  <InfoCell icon="mail" label="ელ.ფოსტა" value={<a href={`mailto:${selectedTicket.email}`} style={{ color: "var(--gold)", textDecoration: "none" }}>{selectedTicket.email}</a>} />
                  {selectedTicket.phone && <InfoCell icon="call" label="ტელეფონი" value={<a href={`tel:${selectedTicket.phone}`} style={{ color: "var(--gold)", textDecoration: "none" }}>{selectedTicket.phone}</a>} />}
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 600 }}>შეტყობინება</div>
                  <div style={{ color: "var(--text-white)", lineHeight: 1.6, whiteSpace: "pre-wrap", fontSize: "0.93rem" }}>{selectedTicket.message}</div>
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 600 }}>ადმინის ჩანაწერი</div>
                  <textarea defaultValue={selectedTicket.admin_notes ?? ""}
                    onBlur={e => { if (e.target.value !== (selectedTicket.admin_notes ?? "")) updateTicket.mutate({ id: selectedTicket.id, admin_notes: e.target.value }); }}
                    placeholder="დაწერეთ შენიშვნა..." rows={3}
                    style={{ width: "100%", padding: "9px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-white)", fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: 12, height: "100%", minHeight: 400 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 60, opacity: 0.25 }}>contact_mail</span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>აირჩიეთ ფორმა</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>მარცხნიდან აირჩიეთ ფორმა</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminChats;
