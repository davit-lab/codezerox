import { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBooks, useCategories } from "@/hooks/useBooks";
import { useUsers, usePurchasesCount, useTotalUsersCount } from "@/hooks/useUsers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ['#d4a853', '#c49a47', '#b48d3b', '#a47f2f', '#947223', '#846517'];

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

  if (isLoading) {
    return (
      <AdminLayout title="📊 ანალიტიკა">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  // Handle navigation in useEffect instead of during render
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return null;
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-white)', fontSize: '0.85rem' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ margin: '4px 0 0', color: 'var(--gold)' }}>
              {p.name === 'revenue' ? `${p.value} ₾` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout title="📊 ანალიტიკა">
              {/* Summary Stats */}
              <div className="admin-stats" style={{ marginBottom: '32px' }}>
                <div className="admin-stat">
                  <span className="material-symbols-rounded" style={{ fontSize: '28px', color: 'var(--gold)', marginBottom: '8px' }}>menu_book</span>
                  <div className="admin-stat-value">{books.length}</div>
                  <div className="admin-stat-label">წიგნები</div>
                </div>
                <div className="admin-stat">
                  <span className="material-symbols-rounded" style={{ fontSize: '28px', color: 'var(--gold)', marginBottom: '8px' }}>group</span>
                  <div className="admin-stat-value">{totalUsersCount}</div>
                  <div className="admin-stat-label">მომხმარებლები</div>
                </div>
                <div className="admin-stat">
                  <span className="material-symbols-rounded" style={{ fontSize: '28px', color: 'var(--gold)', marginBottom: '8px' }}>shopping_cart</span>
                  <div className="admin-stat-value">{purchasesCount}</div>
                  <div className="admin-stat-label">შეძენები</div>
                </div>
                <div className="admin-stat">
                  <span className="material-symbols-rounded" style={{ fontSize: '28px', color: 'var(--gold)', marginBottom: '8px' }}>payments</span>
                  <div className="admin-stat-value">{analytics.totalRevenue}₾</div>
                  <div className="admin-stat-label">სულ შემოსავალი</div>
                </div>
              </div>

              {/* Today & This Month highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>დღეს რეგისტრაცია</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.8rem', fontWeight: 700 }}>{analytics.todayUsers}</div>
                </div>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>ამ თვეს რეგისტრაცია</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.8rem', fontWeight: 700 }}>{analytics.thisMonthUsers}</div>
                </div>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>დღეს შემოსავალი</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.8rem', fontWeight: 700 }}>{analytics.todayRevenue}₾</div>
                </div>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>ამ თვეს შემოსავალი</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.8rem', fontWeight: 700 }}>{analytics.thisMonthRevenue}₾</div>
                </div>
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Daily Registrations */}
                <div style={cardStyle}>
                  <h3 style={{ color: 'var(--text-white)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px', color: 'var(--gold)' }}>person_add</span>
                    ბოლო 14 დღის რეგისტრაციები
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.dailyUsers}>
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="მომხმარებლები" fill="#d4a853" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Revenue */}
                <div style={cardStyle}>
                  <h3 style={{ color: 'var(--text-white)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px', color: 'var(--gold)' }}>trending_up</span>
                    ყოველთვიური შემოსავალი
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analytics.monthlyRevenue}>
                      <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" name="revenue" stroke="#d4a853" strokeWidth={2} fill="rgba(212,168,83,0.15)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Monthly Users */}
                <div style={cardStyle}>
                  <h3 style={{ color: 'var(--text-white)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px', color: 'var(--gold)' }}>groups</span>
                    ყოველთვიური რეგისტრაციები
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.monthlyUsers}>
                      <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="მომხმარებლები" fill="#c49a47" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Popular Books */}
                <div style={cardStyle}>
                  <h3 style={{ color: 'var(--text-white)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px', color: 'var(--gold)' }}>star</span>
                    პოპულარული წიგნები
                  </h3>
                  {analytics.popularBooks.length > 0 ? (
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={analytics.popularBooks} dataKey="count" nameKey="title" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                            {analytics.popularBooks.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ flex: 1 }}>
                        {analytics.popularBooks.map((book, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < analytics.popularBooks.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</span>
                            </div>
                            <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.85rem' }}>{book.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>შეძენები ჯერ არ არის</p>
                  )}
                </div>
              </div>

              {/* Extra Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>გიფთქარდები</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.6rem', fontWeight: 700 }}>{analytics.gcTotal}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{analytics.gcActive} აქტიური • {analytics.gcRedeemed} გამოყენებული</div>
                </div>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>კურსის გამოწერები</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.6rem', fontWeight: 700 }}>{analytics.totalSubs}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{analytics.activeSubs} აქტიური</div>
                </div>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>პრომო კოდები</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.6rem', fontWeight: 700 }}>{analytics.activePromos}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{analytics.totalPromoUsage} ჯერ გამოყენებული</div>
                </div>
                <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>კონვერსია</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.6rem', fontWeight: 700 }}>{analytics.conversionRate}%</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>შეძენა / რეგისტრაცია</div>
                </div>
              </div>

              {/* Recent Purchases */}
              <div style={{ ...cardStyle, marginBottom: '32px' }}>
                <h3 style={{ color: 'var(--text-white)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px', color: 'var(--gold)' }}>receipt_long</span>
                  ბოლო შეძენები
                </h3>
                {analytics.recentPurchases.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['წიგნი', 'ფასი', 'თარიღი'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentPurchases.map((p: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{(p.books as any)?.title || 'უცნობი'}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>{(p.books as any)?.price || 0}₾</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.purchased_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>შეძენები ჯერ არ არის</p>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/admin/books" className="btn btn-gold">
                  <span className="material-symbols-rounded">add</span>
                  წიგნის დამატება
                </Link>
                <Link to="/admin/courses" className="btn btn-gold">
                  <span className="material-symbols-rounded">school</span>
                  კურსები
                </Link>
                <Link to="/admin/gift-cards" className="btn btn-gold">
                  <span className="material-symbols-rounded">redeem</span>
                  გიფთქარდები
                </Link>
                <Link to="/admin/users" className="btn btn-ghost">
                  <span className="material-symbols-rounded">group</span>
                  მომხმარებლები
                </Link>
                <Link to="/admin/payments" className="btn btn-ghost">
                  <span className="material-symbols-rounded">account_balance</span>
                  გადახდები
                </Link>
                <Link to="/admin/promo-codes" className="btn btn-ghost">
                  <span className="material-symbols-rounded">loyalty</span>
                  პრომო კოდები
                </Link>
                <Link to="/admin/chats" className="btn btn-ghost">
                  <span className="material-symbols-rounded">chat</span>
                  ჩატები
                </Link>
                <Link to="/admin/activity" className="btn btn-ghost">
                  <span className="material-symbols-rounded">timeline</span>
                  აქტივობა
                </Link>
              </div>
    </AdminLayout>
  );
};

export default Admin;
