import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import BookCard from "@/components/books/BookCard";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { useAllReadingProgress } from "@/hooks/useReadingProgress";

type FilterTab = 'all' | 'reading' | 'completed' | 'new';

const MyBooks = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: purchases = [], isLoading } = usePurchases();
  const { data: allProgress = [] } = useAllReadingProgress();
  const [filter, setFilter] = useState<FilterTab>('all');

  const progressMap = new Map(allProgress.map(p => [p.book_id, p]));

  const stats = useMemo(() => {
    let total = 0, completed = 0, reading = 0, notStarted = 0;
    let totalPages = 0, readPages = 0;
    purchases.forEach(p => {
      if (!p.book) return;
      total++;
      const prog = progressMap.get(p.book.id);
      const pages = p.book.pages || 0;
      const lastPage = prog?.last_page || 0;
      totalPages += pages;
      readPages += Math.min(lastPage, pages);
      const pct = pages > 0 ? Math.round((lastPage / pages) * 100) : 0;
      if (pct >= 100) completed++;
      else if (lastPage > 1) reading++;
      else notStarted++;
    });
    return { total, completed, reading, notStarted, totalPages, readPages };
  }, [purchases, allProgress]);

  const lastRead = useMemo(() => {
    if (allProgress.length === 0) return null;
    const sorted = [...allProgress].sort((a, b) =>
      new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime()
    );
    for (const prog of sorted) {
      const purchase = purchases.find(p => p.book?.id === prog.book_id);
      if (purchase?.book) {
        const pct = purchase.book.pages ? Math.round((prog.last_page / purchase.book.pages) * 100) : 0;
        if (pct < 100 && prog.last_page > 1) return { book: purchase.book, progress: prog, pct };
      }
    }
    return null;
  }, [purchases, allProgress]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (!p.book) return false;
      if (filter === 'all') return true;
      const prog = progressMap.get(p.book.id);
      const pages = p.book.pages || 0;
      const lastPage = prog?.last_page || 0;
      const pct = pages > 0 ? Math.round((lastPage / pages) * 100) : 0;
      if (filter === 'completed') return pct >= 100;
      if (filter === 'reading') return lastPage > 1 && pct < 100;
      if (filter === 'new') return lastPage <= 1;
      return true;
    });
  }, [purchases, filter, allProgress]);

  if (authLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: '#9333ea', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main style={{ paddingTop: '140px', paddingBottom: '80px' }}>
          <div className="container">
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '80px', color: 'var(--text-muted)', marginBottom: '24px', display: 'block' }}>login</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px' }}>გთხოვთ შეხვიდეთ სისტემაში წიგნების სანახავად</p>
              <Link to="/auth" className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors">
                <span className="material-symbols-rounded">login</span>
                შესვლა
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const tabs: { key: FilterTab; label: string; icon: string; count: number }[] = [
    { key: 'all', label: 'ყველა', icon: 'library_books', count: stats.total },
    { key: 'reading', label: 'ვკითხულობ', icon: 'auto_stories', count: stats.reading },
    { key: 'completed', label: 'წაკითხული', icon: 'check_circle', count: stats.completed },
    { key: 'new', label: 'ახალი', icon: 'fiber_new', count: stats.notStarted },
  ];

  return (
    <>
      <Atmosphere />
      <Header />
      <ChatWidget />
      
      <main style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">
              <span className="material-symbols-rounded">auto_stories</span>
              ბიბლიოთეკა
            </div>
            <h1 className="section-title">
              ჩემი <span className="accent">წიგნები</span>
            </h1>
            <p className="section-subtitle">
              შენი შეძენილი წიგნების კოლექცია
            </p>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
              <p style={{ marginTop: '16px' }}>იტვირთება...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 24px',
                background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#9333ea', opacity: 0.6 }}>library_books</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '8px', fontWeight: 600 }}>ჯერ არ გაქვს შეძენილი წიგნები</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>დაათვალიერე კატალოგი და იპოვე შენთვის საინტერესო</p>
              <Link to="/books" className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors">
                <span className="material-symbols-rounded">explore</span>
                წიგნების დათვალიერება
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px', marginBottom: '28px',
              }}>
                <div style={{
                  padding: '16px 20px', borderRadius: '16px',
                  background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.1)',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#9333ea', lineHeight: 1.2 }}>{stats.total}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>სულ წიგნი</div>
                </div>
                <div style={{
                  padding: '16px 20px', borderRadius: '16px',
                  background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.1)',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', lineHeight: 1.2 }}>{stats.completed}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>წაკითხული</div>
                </div>
                <div style={{
                  padding: '16px 20px', borderRadius: '16px',
                  background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.1)',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa', lineHeight: 1.2 }}>{stats.reading}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>ვკითხულობ</div>
                </div>
                <div style={{
                  padding: '16px 20px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.2 }}>{stats.readPages}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>წაკითხული გვერდი</div>
                </div>
              </div>

              {/* Continue Reading */}
              {lastRead && (
                <Link to={`/read/${lastRead.book.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '28px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 20px', borderRadius: '16px',
                    background: 'rgba(147,51,234,0.04)', border: '1px solid rgba(147,51,234,0.1)',
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(147,51,234,0.25)'; e.currentTarget.style.background = 'rgba(147,51,234,0.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(147,51,234,0.1)'; e.currentTarget.style.background = 'rgba(147,51,234,0.04)'; }}
                  >
                    <div style={{
                      width: '48px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
                      background: 'rgba(255,255,255,0.05)',
                    }}>
                      {lastRead.book.cover_url ? (
                        <img src={lastRead.book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '24px', color: 'var(--text-muted)' }}>menu_book</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', color: '#9333ea', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>play_arrow</span>
                        გააგრძელე კითხვა
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastRead.book.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {lastRead.progress.last_page}/{lastRead.book.pages || '?'} გვერდი · {lastRead.pct}%
                      </div>
                    </div>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(147,51,234,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '22px', color: '#9333ea' }}>arrow_forward</span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Filter Tabs */}
              <div style={{
                display: 'flex', gap: '8px', marginBottom: '24px',
                overflowX: 'auto', paddingBottom: '4px',
              }}>
                {tabs.map(tab => (
                  <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    background: filter === tab.key ? 'rgba(147,51,234,0.12)' : 'rgba(255,255,255,0.03)',
                    color: filter === tab.key ? '#9333ea' : 'var(--text-muted)',
                    outline: filter === tab.key ? '1px solid rgba(147,51,234,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{tab.icon}</span>
                    {tab.label}
                    {tab.count > 0 && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '1px 6px', borderRadius: '6px',
                        background: filter === tab.key ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.06)',
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Books Grid */}
              {filteredPurchases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', opacity: 0.4 }}>search_off</span>
                  <p style={{ fontSize: '0.9rem' }}>ამ კატეგორიაში წიგნები არ მოიძებნა</p>
                </div>
              ) : (
                <div className="books-grid">
                  {filteredPurchases.map((purchase) => {
                    const book = purchase.book;
                    if (!book) return null;
                    return (
                      <BookCard 
                        key={purchase.id} 
                        book={book} 
                        showOwnedBadge 
                        readingProgress={progressMap.get(book.id)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default MyBooks;
