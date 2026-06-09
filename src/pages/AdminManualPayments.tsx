import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Book { id: string; title: string; }
interface Link {
  id: string;
  title: string;
  description: string | null;
  payment_url: string;
  book_id: string | null;
  amount: number | null;
  currency: string;
  callback_token: string;
  is_active: boolean;
  created_at: string;
}

const AdminManualPayments = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", payment_url: "", book_id: "", amount: "",
  });
  const [callbackBase, setCallbackBase] = useState("");

  useEffect(() => {
    if (isAdmin) {
      load();
      const url = (import.meta as any).env?.VITE_SUPABASE_URL || "";
      setCallbackBase(`${url}/functions/v1/manual-payment-callback`);
    }
  }, [isAdmin]);

  const load = async () => {
    setLoading(true);
    const [{ data: l }, { data: b }] = await Promise.all([
      supabase.from("manual_payment_links").select("*").order("created_at", { ascending: false }),
      supabase.from("books").select("id,title").order("title"),
    ]);
    setLinks((l as any) || []);
    setBooks((b as any) || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.payment_url) {
      toast.error("შეავსეთ სათაური და გადახდის ბმული");
      return;
    }
    const { error } = await supabase.from("manual_payment_links").insert({
      title: form.title,
      description: form.description || null,
      payment_url: form.payment_url,
      book_id: form.book_id || null,
      amount: form.amount ? Number(form.amount) : null,
    });
    if (error) { toast.error("შეცდომა: " + error.message); return; }
    toast.success("ბმული დაემატა");
    setForm({ title: "", description: "", payment_url: "", book_id: "", amount: "" });
    setShowForm(false);
    load();
  };

  const toggleActive = async (link: Link) => {
    await supabase.from("manual_payment_links").update({ is_active: !link.is_active }).eq("id", link.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("წავშალო?")) return;
    await supabase.from("manual_payment_links").delete().eq("id", id);
    load();
  };

  const copyCallback = (link: Link) => {
    const url = `${callbackBase}?token=${link.callback_token}&user_id=USER_UUID_HERE`;
    navigator.clipboard.writeText(url);
    toast.success("Callback URL დაკოპირდა");
  };

  if (authLoading) return <AdminLayout><div style={{ padding: 80, textAlign: 'center' }}>...</div></AdminLayout>;
  if (!user || !isAdmin) { navigate("/"); return null; }

  return (
    <AdminLayout title="Manual Payment ბმულები" titleIcon="link">
      <div style={{ marginBottom: 16, padding: 16, background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', borderRadius: 12 }}>
        <p style={{ color: 'var(--text-white)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
          📌 აქ შეგიძლია დაამატო ხელით შექმნილი გადახდის ბმულები (მაგ. BOG/TBC/PayPal direct link).
          მომხმარებელი გადახდის შემდეგ ვერ მიიღებს წვდომას, სანამ შენ არ დაუდასტურდება <strong>callback URL</strong>-ით ან admin panel-დან ხელით.
        </p>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: 16, padding: '10px 20px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
      >
        {showForm ? "✕ დახურვა" : "+ ახალი ბმული"}
      </button>

      {showForm && (
        <div style={{ padding: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 12, marginBottom: 24, display: 'grid', gap: 12 }}>
          <input placeholder="სათაური *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)' }} />
          <input placeholder="აღწერა" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)' }} />
          <input placeholder="გადახდის URL *" value={form.payment_url} onChange={e => setForm({ ...form, payment_url: e.target.value })} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)' }} />
          <select value={form.book_id} onChange={e => setForm({ ...form, book_id: e.target.value })} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)' }}>
            <option value="">— წიგნი არ არის (custom) —</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
          <input type="number" placeholder="თანხა (₾)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)' }} />
          <button onClick={handleCreate} style={{ padding: 10, background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>შენახვა</button>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>იტვირთება...</p> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {links.map(link => (
            <div key={link.id} style={{ padding: 16, background: 'var(--bg-elevated)', border: `1px solid ${link.is_active ? 'rgba(76,175,80,0.3)' : 'var(--border-subtle)'}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, color: 'var(--text-white)', fontSize: '1rem' }}>{link.title}</h4>
                  {link.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0' }}>{link.description}</p>}
                  <a href={link.payment_url} target="_blank" rel="noopener" style={{ color: 'var(--gold)', fontSize: '0.8rem', wordBreak: 'break-all' }}>{link.payment_url}</a>
                  {link.amount && <div style={{ color: 'var(--text-white)', marginTop: 6, fontWeight: 600 }}>{link.amount} ₾</div>}
                  {link.book_id && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>📚 {books.find(b => b.id === link.book_id)?.title || link.book_id}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => copyCallback(link)} title="Callback URL" style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>📋 Callback</button>
                  <button onClick={() => toggleActive(link)} style={{ padding: '6px 10px', background: link.is_active ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: link.is_active ? '#66bb6a' : 'var(--text-muted)', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>{link.is_active ? "● აქტიური" : "○ გამორთ."}</button>
                  <button onClick={() => remove(link.id)} style={{ padding: '6px 10px', background: 'rgba(244,67,54,0.1)', color: '#f44', border: '1px solid rgba(244,67,54,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
          {!links.length && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>ჯერ ბმული არ არის დამატებული</p>}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManualPayments;
