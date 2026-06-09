import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGrantCredits, useSiteCreditsHistory } from '@/hooks/useSiteCredits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wallet, Search, Send, History } from 'lucide-react';

interface UserMatch {
  user_id: string;
  full_name: string | null;
  email: string;
}

const AdminCredits = () => {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const grant = useGrantCredits();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<UserMatch | null>(null);
  const [results, setResults] = useState<UserMatch[]>([]);
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'refund' | 'admin_grant' | 'admin_deduct'>('refund');
  const [balance, setBalance] = useState<number | null>(null);

  const { data: history = [] } = useSiteCreditsHistory(selected?.user_id);

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate('/');
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (!selected) { setBalance(null); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from('site_credits_wallet').select('balance')
        .eq('user_id', selected.user_id).maybeSingle();
      setBalance(data ? Number(data.balance) : 0);
    })();
  }, [selected, grant.isSuccess]);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    const { data } = await (supabase as any).from('profiles')
      .select('user_id, full_name, email')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);
    setResults(data || []);
  };

  const handleGrant = async () => {
    if (!selected || amount === 0) return;
    const signedAmount = type === 'admin_deduct' ? -Math.abs(amount) : Math.abs(amount);
    try {
      await grant.mutateAsync({
        userId: selected.user_id,
        amount: signedAmount,
        reason: reason || (type === 'refund' ? 'ანაზღაურება' : 'ადმინი'),
        type,
      });
      toast.success('კრედიტი დარიცხდა');
      setAmount(0); setReason('');
    } catch (e: any) {
      toast.error(e.message || 'შეცდომა');
    }
  };

  return (
    <AdminLayout title="კრედიტების მართვა" titleIcon="account_balance_wallet">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Search */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3 inline-flex items-center gap-2"><Search className="w-4 h-4" /> მომხმარებლის ძებნა</h3>
          <div className="flex gap-2 mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="email ან სახელი"
              className="flex-1 h-10 px-3 bg-muted/30 border border-border rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="h-10 px-4 bg-primary text-primary-foreground rounded-lg font-semibold">ძებნა</button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {results.map((r) => (
              <button key={r.user_id} onClick={() => setSelected(r)}
                className={`w-full text-left p-2.5 rounded-lg text-sm hover:bg-muted/30 transition ${selected?.user_id === r.user_id ? 'bg-muted/50' : ''}`}>
                <div className="font-medium">{r.full_name || '—'}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Grant */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3 inline-flex items-center gap-2"><Wallet className="w-4 h-4" /> კრედიტის გაცემა</h3>
          {!selected ? (
            <p className="text-sm text-muted-foreground">აირჩიე მომხმარებელი მარცხნივ</p>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">{selected.email}</div>
                <div className="text-lg font-bold mt-1">{balance?.toFixed(2) ?? '...'} ₾</div>
                <div className="text-[10px] text-muted-foreground/60">მიმდინარე ბალანსი</div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">ტიპი</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 mt-1 bg-muted/30 border border-border rounded-lg">
                  <option value="refund">ანაზღაურება (refund)</option>
                  <option value="admin_grant">საჩუქარი (grant)</option>
                  <option value="admin_deduct">ჩამოჭრა (deduct)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">თანხა (₾)</label>
                <input type="number" min={0} step="0.5" value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-10 px-3 mt-1 bg-muted/30 border border-border rounded-lg" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">მიზეზი</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="მაგ: წიგნის ანაზღაურება"
                  className="w-full h-10 px-3 mt-1 bg-muted/30 border border-border rounded-lg" />
              </div>

              <button onClick={handleGrant} disabled={grant.isPending || amount === 0}
                className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" /> გაცემა
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {selected && (
          <div className="bg-card border border-border rounded-2xl p-5 lg:col-span-2">
            <h3 className="font-semibold mb-3 inline-flex items-center gap-2"><History className="w-4 h-4" /> ისტორია</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">ცარიელია</p>
              ) : history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 text-sm">
                  <div>
                    <div className="font-medium">{h.reason || h.type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString('ka-GE')} · {h.type}</div>
                  </div>
                  <div className={`font-mono font-semibold ${Number(h.amount) >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                    {Number(h.amount) >= 0 ? '+' : ''}{Number(h.amount).toFixed(2)} ₾
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCredits;
