import { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBooks, useCategories } from "@/hooks/useBooks";
import { useUsers, usePurchasesCount, useTotalUsersCount } from "@/hooks/useUsers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";

// Single-series charts: one brand hue (validated ≥3:1 against the card surface)
const SERIES = '#8B5CF6';
const AXIS_TICK = { fill: '#8a8a99', fontSize: 11 };
const GRID = 'rgba(255,255,255,0.06)';

const gel = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ₾`;
const num = (n: number) => n.toLocaleString('en-US');

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const { data: books = [] } = useBooks();
  const { data: categories = [] } = useCategories();
  const { data: users = [] } = useUsers();
  const { data: purchasesCount = 0 } = usePurchasesCount();
  const { data: totalUsersCount = 0 } = useTotalUsersCount();

  // Fetch all purchases with book info
  const { data: purchases = [] } = useQuery({
    queryKey: ['admin-all-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, books:book_id(title, price)')
        .order('purchased_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch payments for revenue
  const { data: payments = [] } = useQuery({
    queryKey: ['admin-all-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch credit purchases for revenue
  const { data: creditPurchases = [] } = useQuery({
    queryKey: ['admin-credit-purchases-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_purchases')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch gift cards
  const { data: giftCards = [] } = useQuery({
    queryKey: ['admin-gift-cards-dashboard'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('gift_cards').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch course subscriptions
  const { data: courseSubscriptions = [] } = useQuery({
    queryKey: ['admin-course-subs-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('course_subscriptions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch promo codes
  const { data: promoCodes = [] } = useQuery({
    queryKey: ['admin-promo-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('promo_codes').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Daily registrations (last 14 days)
    const dailyUsers: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('ka-GE', { month: 'short', day: 'numeric' });
      const count = users.filter(u => {
        const ud = new Date(u.created_at);
        return ud.getFullYear() === d.getFullYear() && ud.getMonth() === d.getMonth() && ud.getDate() === d.getDate();
      }).length;
      dailyUsers.push({ date: dateStr, count });
    }

    // Monthly registrations (last 6 months)
    const monthlyUsers: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('ka-GE', { month: 'short', year: '2-digit' });
      const count = users.filter(u => {
        const ud = new Date(u.created_at);
        return ud.getFullYear() === d.getFullYear() && ud.getMonth() === d.getMonth();
      }).length;
      monthlyUsers.push({ month: monthStr, count });
    }

    // Revenue (last 6 months from payments)
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('ka-GE', { month: 'short', year: '2-digit' });
      const rev = payments
        .filter(p => {
          const pd = new Date(p.created_at);
          return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const creditRev = creditPurchases
        .filter(c => {
          const cd = new Date(c.created_at);
          return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
        })
        .reduce((sum, c) => sum + Number(c.amount_gel), 0);
      monthlyRevenue.push({ month: monthStr, revenue: Math.round((rev + creditRev) * 100) / 100 });
    }

    // Popular books
    const bookPurchaseCount: Record<string, { title: string; count: number }> = {};
    purchases.forEach((p: any) => {
      const bookId = p.book_id;
      const title = (p.books as any)?.title || 'უცნობი';
      if (!bookPurchaseCount[bookId]) bookPurchaseCount[bookId] = { title, count: 0 };
      bookPurchaseCount[bookId].count++;
    });
    const popularBooks = Object.values(bookPurchaseCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Today's stats
    const todayUsers = users.filter(u => new Date(u.created_at) >= today).length;
    const thisMonthUsers = users.filter(u => new Date(u.created_at) >= thisMonth).length;
    const todayRevenue = payments
      .filter(p => new Date(p.created_at) >= today)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const thisMonthRevenue = payments
      .filter(p => new Date(p.created_at) >= thisMonth)
      .reduce((sum, p) => sum + Number(p.amount), 0) +
      creditPurchases
        .filter(c => new Date(c.created_at) >= thisMonth)
        .reduce((sum, c) => sum + Number(c.amount_gel), 0);
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0) +
      creditPurchases.reduce((sum, c) => sum + Number(c.amount_gel), 0);

    // Gift card stats
    const gcTotal = giftCards.length;
    const gcActive = giftCards.filter((c: any) => !c.is_redeemed && new Date(c.expires_at) > now).length;
    const gcRedeemed = giftCards.filter((c: any) => c.is_redeemed).length;
    const gcThisMonth = giftCards.filter((c: any) => new Date(c.created_at) >= thisMonth).length;

    // Course stats
    const activeSubs = courseSubscriptions.filter((s: any) => s.status === 'active').length;
    const totalSubs = courseSubscriptions.length;

    // Promo stats
    const activePromos = promoCodes.filter((p: any) => p.is_active).length;
    const totalPromoUsage = promoCodes.reduce((sum: number, p: any) => sum + (p.current_uses || 0), 0);

    // Recent purchases (last 10)
    const recentPurchases = purchases.slice(0, 10);

    // Conversion rate (purchases / users)
    const conversionRate = users.length > 0 ? Math.round((purchases.length / users.length) * 100) : 0;

    return {
      dailyUsers,
      monthlyUsers,
      monthlyRevenue,
      popularBooks,
      todayUsers,
      thisMonthUsers,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      gcTotal, gcActive, gcRedeemed, gcThisMonth,
      activeSubs, totalSubs,
      activePromos, totalPromoUsage,
      recentPurchases,
      conversionRate,
    };
  }, [users, purchases, payments, creditPurchases, giftCards, courseSubscriptions, promoCodes]);

  // Redirect non-admins (kept above any early return so hook order is stable)
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) navigate("/");
  }, [isLoading, user, isAdmin, navigate]);

  if (isLoading) {
    return (
      <AdminLayout title="დეშბორდი" titleIcon="space_dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) return null;

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
      <div style={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ color: 'var(--text-white)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: SERIES }} />
          {p.name === 'revenue' ? gel(p.value) : `${num(p.value)} რეგისტრაცია`}
        </div>
      </div>
    );
  };

  const maxBook = Math.max(1, ...analytics.popularBooks.map((b) => b.count));

  return (
    <AdminLayout
      title="დეშბორდი"
      titleIcon="space_dashboard"
      actions={
        <>
          <Link to="/admin/payments" className="btn btn-ghost btn-sm">გადახდები</Link>
          <Link to="/admin/books" className="btn btn-gold btn-sm">
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>
            წიგნის დამატება
          </Link>
        </>
      }
    >
      {/* Headline numbers */}
      <section className="dash-kpis" aria-label="მთავარი მაჩვენებლები">
        <div className="dash-kpi">
          <div className="dash-kpi__label">სულ შემოსავალი</div>
          <div className="dash-kpi__value">{gel(analytics.totalRevenue)}</div>
          <div className="dash-kpi__sub">ამ თვეს {gel(analytics.thisMonthRevenue)} · დღეს {gel(analytics.todayRevenue)}</div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi__label">მომხმარებლები</div>
          <div className="dash-kpi__value">{num(totalUsersCount)}</div>
          <div className="dash-kpi__sub">ამ თვეს +{num(analytics.thisMonthUsers)} · დღეს +{num(analytics.todayUsers)}</div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi__label">შეძენები</div>
          <div className="dash-kpi__value">{num(purchasesCount)}</div>
          <div className="dash-kpi__sub">კონვერსია {analytics.conversionRate}% (შეძენა / რეგისტრაცია)</div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi__label">წიგნები</div>
          <div className="dash-kpi__value">{num(books.length)}</div>
          <div className="dash-kpi__sub">{num(categories.length)} კატეგორია</div>
        </div>
      </section>

      <div className="dash-grid">
        <section className="dash-card">
          <div className="dash-card__head">
            <h2 className="dash-card__title">შემოსავალი თვეების მიხედვით</h2>
            <span className="dash-card__meta">ბოლო 6 თვე, ₾</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.monthlyRevenue} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke={SERIES} strokeWidth={2} fill={SERIES} fillOpacity={0.12} activeDot={{ r: 4, stroke: '#111116', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="dash-card">
          <div className="dash-card__head">
            <h2 className="dash-card__title">ახალი რეგისტრაციები</h2>
            <span className="dash-card__meta">ბოლო 14 დღე</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.dailyUsers} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" name="users" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="dash-card">
          <div className="dash-card__head">
            <h2 className="dash-card__title">რეგისტრაციები თვეების მიხედვით</h2>
            <span className="dash-card__meta">ბოლო 6 თვე</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.monthlyUsers} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" name="users" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="dash-card">
          <div className="dash-card__head">
            <h2 className="dash-card__title">ყველაზე გაყიდვადი წიგნები</h2>
            <span className="dash-card__meta">შეძენების რაოდენობა</span>
          </div>
          {analytics.popularBooks.length > 0 ? (
            <ol className="dash-rank">
              {analytics.popularBooks.map((book, i) => (
                <li key={i}>
                  <span className="dash-rank__name">{book.title}</span>
                  <span className="dash-rank__val">{num(book.count)}</span>
                  <span className="dash-rank__bar"><span style={{ width: `${(book.count / maxBook) * 100}%` }} /></span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="dash-empty">შეძენები ჯერ არ არის</p>
          )}
        </section>
      </div>

      <div className="dash-grid">
        <section className="dash-card">
          <div className="dash-card__head">
            <h2 className="dash-card__title">ბოლო შეძენები</h2>
            <Link to="/admin/payments" className="dash-card__link">ყველა →</Link>
          </div>
          {analytics.recentPurchases.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr><th>წიგნი</th><th>თარიღი</th><th className="num">ფასი</th></tr>
                </thead>
                <tbody>
                  {analytics.recentPurchases.map((p: any, i: number) => (
                    <tr key={i}>
                      <td>{(p.books as any)?.title || 'უცნობი'}</td>
                      <td>{new Date(p.purchased_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="num">{gel(Number((p.books as any)?.price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="dash-empty">შეძენები ჯერ არ არის</p>
          )}
        </section>

        <section className="dash-card">
          <div className="dash-card__head">
            <h2 className="dash-card__title">სხვა მაჩვენებლები</h2>
          </div>
          <table className="dash-table">
            <tbody>
              <tr>
                <td><Link to="/admin/courses" className="dash-card__link">კურსის გამოწერები</Link></td>
                <td>{num(analytics.activeSubs)} აქტიური</td>
                <td className="num">{num(analytics.totalSubs)}</td>
              </tr>
              <tr>
                <td><Link to="/admin/promo-codes" className="dash-card__link">აქტიური პრომო კოდები</Link></td>
                <td>{num(analytics.totalPromoUsage)}-ჯერ გამოყენებული</td>
                <td className="num">{num(analytics.activePromos)}</td>
              </tr>
              <tr>
                <td>გიფთქარდები</td>
                <td>{num(analytics.gcActive)} აქტიური · {num(analytics.gcRedeemed)} გამოყენებული</td>
                <td className="num">{num(analytics.gcTotal)}</td>
              </tr>
              <tr>
                <td>გიფთქარდები ამ თვეს</td>
                <td></td>
                <td className="num">{num(analytics.gcThisMonth)}</td>
              </tr>
            </tbody>
          </table>
          <div className="dash-quick" style={{ marginTop: 20 }}>
            <Link to="/admin/users" className="btn btn-ghost btn-sm">მომხმარებლები</Link>
            <Link to="/admin/chats" className="btn btn-ghost btn-sm">ჩატები</Link>
            <Link to="/admin/activity" className="btn btn-ghost btn-sm">აქტივობა</Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default Admin;
