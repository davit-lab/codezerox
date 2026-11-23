import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown, Search, Users, GraduationCap, Ban } from 'lucide-react';

type Row = { user_id: string; email: string | null; full_name: string | null; learner_name: string | null; lessons_done: number; last_active: string | null; pro_status: string | null; pro_expires: string | null };
const db = supabase as any;
const isActive = (r: Row) => r.pro_status === 'active' && !!r.pro_expires && Date.parse(r.pro_expires) > Date.now();
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('ka-GE') : '—');

const AdminCodelingo = () => {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'pro' | 'free'>('all');
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(30);

  const load = async () => {
    const { data, error } = await db.rpc('admin_codelingo_overview');
    if (error) toast.error('ჩატვირთვა ვერ მოხერხდა'); else setRows(data || []);
  };
  useEffect(() => { if (!isLoading && !isAdmin) navigate('/'); if (isAdmin) load(); }, [isAdmin, isLoading]);

  const setPro = async (userId: string, d: number) => {
    const { error } = await db.rpc('admin_set_codelingo_pro', { _user_id: userId, _days: d });
    if (error) return toast.error('ვერ შესრულდა');
    toast.success(d > 0 ? `Pro გაიცა ${d} დღით` : 'Pro გაუქმდა'); load();
  };
  const grantByEmail = async () => {
    const { data } = await db.rpc('find_user_by_email', { search_email: email.trim() });
    const u = data?.[0]; if (!u) return toast.error('მომხმარებელი ვერ მოიძებნა');
    await setPro(u.user_id, days); setEmail('');
  };

  const list = useMemo(() => rows.filter(r => (filter === 'all' || (filter === 'pro') === isActive(r)) && [r.email, r.full_name, r.learner_name].join(' ').toLowerCase().includes(q.toLowerCase())), [rows, q, filter]);
  const pro = rows.filter(isActive).length;
  const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.lessons_done, 0) / rows.length) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">კოდელინგო</h1><p className="text-muted-foreground text-sm">მოსწავლეები, პროგრესი და Pro გამოწერები</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ i: Users, l: 'მოსწავლეები', v: rows.length }, { i: Crown, l: 'აქტიური Pro', v: pro }, { i: GraduationCap, l: 'საშ. გაკვეთილი', v: `${avg}/48` }].map(s => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"><s.i className="w-8 h-8 text-primary" /><div><div className="text-2xl font-bold">{s.v}</div><div className="text-sm text-muted-foreground">{s.l}</div></div></div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row gap-3">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="მომხმარებლის ელფოსტა" className="flex-1 rounded-lg border border-input bg-background px-3 py-2" />
          <input type="number" min={1} value={days} onChange={e => setDays(Number(e.target.value))} className="w-28 rounded-lg border border-input bg-background px-3 py-2" />
          <button onClick={grantByEmail} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium">Pro-ს მინიჭება</button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="ძებნა" className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2" /></div>
          <div className="flex gap-2">{(['all', 'pro', 'free'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-2 text-sm border ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{f === 'all' ? 'ყველა' : f === 'pro' ? 'Pro' : 'უფასო'}</button>)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground"><tr className="border-b border-border">{['მომხმარებელი', 'პროგრესი', 'ბოლო აქტივობა', 'Pro', 'მოქმედება'].map(h => <th key={h} className="text-left p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{list.map(r => (
              <tr key={r.user_id} className="border-b border-border/50">
                <td className="p-3"><div className="font-medium">{r.learner_name || r.full_name || '—'}</div><div className="text-xs text-muted-foreground">{r.email}</div></td>
                <td className="p-3"><div className="w-28 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${r.lessons_done / 48 * 100}%` }} /></div><span className="text-xs text-muted-foreground">{r.lessons_done}/48</span></td>
                <td className="p-3">{fmt(r.last_active)}</td>
                <td className="p-3">{isActive(r) ? <span className="text-primary font-medium">{fmt(r.pro_expires)}-მდე</span> : <span className="text-muted-foreground">უფასო</span>}</td>
                <td className="p-3"><div className="flex gap-2"><button onClick={() => setPro(r.user_id, 30)} className="rounded-md border border-border px-2 py-1 text-xs">+30 დღე</button>{isActive(r) && <button onClick={() => setPro(r.user_id, 0)} className="rounded-md border border-destructive text-destructive px-2 py-1 text-xs flex items-center gap-1"><Ban className="w-3 h-3" />გაუქმება</button>}</div></td>
              </tr>))}
              {!list.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">ჩანაწერი არ არის</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
export default AdminCodelingo;
