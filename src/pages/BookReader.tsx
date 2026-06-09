import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useCallback, useState } from "react";
import Atmosphere from "@/components/layout/Atmosphere";
import { useBook } from "@/hooks/useBooks";
import { usePurchase, useBookPdfUrl, useBookPreviewPdfUrl } from "@/hooks/usePurchases";
import { useAuth } from "@/hooks/useAuth";
import { useReadingProgress, useUpdateReadingProgress } from "@/hooks/useReadingProgress";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";
import PdfRenderer from "@/components/reader/PdfRenderer";
import BookmarkPanel from "@/components/reader/BookmarkPanel";
const PROTECTION_STYLES = `
  .reader-protected {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
  }
  @media print {
    .reader-protected, .reader-protected * {
      display: none !important;
      visibility: hidden !important;
    }
    body::after {
      content: "ბეჭდვა აკრძალულია";
      display: block !important;
      font-size: 48px;
      text-align: center;
      padding-top: 200px;
      color: red;
    }
  }
  .reader-watermark-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 10;
    background: rgba(95, 19, 202, 0.02);
  }
  .reader-screenshot-guard {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99999;
    background: black;
    display: none;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    font-family: var(--font-georgian);
  }
  .reader-screenshot-guard.active {
    display: flex !important;
  }
`;

const ZOOM_LEVELS = [1, 1.25, 1.5, 1.75, 2];

const BookReader = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const PREVIEW_MAX_PAGES = 15;
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredProgress = useRef(false);
  const initialPageRef = useRef<number | null>(null);

  const { data: book, isLoading: bookLoading } = useBook(id!);
  const { data: purchase, isLoading: purchaseLoading } = usePurchase(id!);
  const { data: pdfUrl, isLoading: pdfLoading } = useBookPdfUrl(id!, book?.pdf_url || null, book?.is_free || false);
  const { data: previewPdfUrl, isLoading: previewPdfLoading } = useBookPreviewPdfUrl(id!, isPreview ? (book?.preview_pdf_url || book?.pdf_url || null) : null);
  const { data: progress } = useReadingProgress(id!);
  const updateProgress = useUpdateReadingProgress();

  const [screenshotBlocked, setScreenshotBlocked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [bgTheme, setBgTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: bookmarks = [] } = useBookmarks(id!);
  const currentPageHasBookmark = bookmarks.some(b => b.page_number === currentPage);

  // Inject protection styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = PROTECTION_STYLES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const resetTimer = () => {
      setShowControls(true);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 4000);
    };
    const handleMove = () => resetTimer();
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchstart', handleMove);
    resetTimer();
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchstart', handleMove);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  // Block keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault(); e.stopPropagation();
        toast.error('ბეჭდვა/შენახვა აკრძალულია');
        return false;
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setScreenshotBlocked(true);
        navigator.clipboard.writeText('').catch(() => {});
        toast.error('სქრინშოტი აკრძალულია');
        setTimeout(() => setScreenshotBlocked(false), 2000);
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault(); return false;
      }
      // Keyboard navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePageStep('prev');
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handlePageStep('next');
      }
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoom('in');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoom('out');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setScreenshotBlocked(true);
        setTimeout(() => setScreenshotBlocked(false), 1500);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPage, totalPages]);

  const saveProgress = useCallback((page: number) => {
    if (!id || !user || isPreview) return;
    updateProgress.mutate({ bookId: id, lastPage: page });
  }, [id, user, updateProgress, isPreview]);

  const handlePageChange = useCallback((page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveProgress(page), 2000);
  }, [saveProgress]);

  useEffect(() => {
    if (progress?.last_page && progress.last_page > 1 && initialPageRef.current === null) {
      initialPageRef.current = progress.last_page;
      setCurrentPage(progress.last_page);
    }
  }, [progress?.last_page]);

  useEffect(() => {
    if (progress && progress.last_page > 1 && !hasRestoredProgress.current) {
      hasRestoredProgress.current = true;
      toast.info(`კითხვის გაგრძელება გვერდი ${progress.last_page}-დან`, { duration: 3000 });
    }
  }, [progress]);

  useEffect(() => {
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, []);

  useEffect(() => {
    if (id && user && pdfUrl) {
      updateProgress.mutate({ bookId: id, lastPage: progress?.last_page ?? 1 });
    }
  }, [id, user, pdfUrl]);

  const handlePageStep = useCallback((direction: 'prev' | 'next') => {
    const maxPages = totalPages || book?.pages || 9999;
    const newPage = direction === 'next'
      ? Math.min(currentPage + 1, maxPages)
      : Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    window.dispatchEvent(new CustomEvent('pdf-goto-page', { detail: { page: newPage } }));
  }, [currentPage, totalPages, book?.pages]);

  const handleZoom = useCallback((dir: 'in' | 'out') => {
    setZoom(prev => {
      const idx = ZOOM_LEVELS.findIndex(z => z >= prev);
      if (dir === 'in') return ZOOM_LEVELS[Math.min(idx + 1, ZOOM_LEVELS.length - 1)] || prev;
      return ZOOM_LEVELS[Math.max((idx === -1 ? ZOOM_LEVELS.length : idx) - 1, 0)] || prev;
    });
  }, []);

  const handleGoToPage = useCallback((page: number) => {
    const maxPages = totalPages || book?.pages || 9999;
    if (page >= 1 && page <= maxPages) {
      setCurrentPage(page);
      window.dispatchEvent(new CustomEvent('pdf-goto-page', { detail: { page } }));
    }
  }, [totalPages, book?.pages]);

  // Loading state
  if (bookLoading || (!isPreview && (authLoading || purchaseLoading))) {
    return (
      <>
        <Atmosphere />
        <div className="reader-loading-screen">
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--gold)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        </div>
      </>
    );
  }

  if (!isPreview && !user) { navigate("/auth"); return null; }

  if (!book) {
    return (
      <>
        <Atmosphere />
        <div className="reader-loading-screen">
          <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--text-muted)' }}>error</span>
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>წიგნი ვერ მოიძებნა</p>
          <Link to="/my-books" className="btn btn-gold" style={{ marginTop: '16px' }}>ჩემი წიგნები</Link>
        </div>
      </>
    );
  }

  const hasAccess = isPreview || book.is_free || !!purchase;
  if (!hasAccess) {
    return (
      <>
        <Atmosphere />
        <div className="reader-loading-screen">
          <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--ruby)' }}>lock</span>
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>არ გაქვთ წვდომა</p>
          <Link to={`/books/${id}`} className="btn btn-gold" style={{ marginTop: '16px' }}>შეძენა</Link>
        </div>
      </>
    );
  }

  const activePdfUrl = isPreview ? previewPdfUrl : pdfUrl;
  const activePdfLoading = isPreview ? previewPdfLoading : pdfLoading;

  if (!book.pdf_url) {
    return (
      <>
        <Atmosphere />
        <div className="reader-loading-screen">
          <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--text-muted)' }}>description_off</span>
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>PDF ფაილი არ არის ატვირთული</p>
          <Link to="/my-books" className="btn btn-ghost" style={{ marginTop: '16px' }}>უკან</Link>
        </div>
      </>
    );
  }

  const progressPercent = totalPages > 0
    ? Math.min(Math.round((currentPage / totalPages) * 100), 100)
    : 0;

  const bgColors = { dark: '#2a2a2e', light: '#e8e4df', sepia: '#f4ecd8' };

  return (
    <div className="reader-protected">
      <div className={`reader-screenshot-guard ${screenshotBlocked ? 'active' : ''}`}>
        <span>სქრინშოტი აკრძალულია</span>
      </div>

      {/* Top Bar */}
      <div className={`reader-topbar ${showControls ? 'visible' : 'hidden'}`}>
        <div className="reader-topbar-left">
          <Link to="/my-books" className="reader-icon-btn" title="უკან">
            <span className="material-symbols-rounded">arrow_back</span>
          </Link>
          <div className="reader-title-block">
            <h1 className="reader-title">{book.title}</h1>
            <p className="reader-author">{book.author}</p>
          </div>
        </div>

        <div className="reader-topbar-center">
          {/* Page nav */}
          <button onClick={() => handlePageStep('prev')} className="reader-icon-btn" disabled={currentPage <= 1}>
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
          <PageInput current={currentPage} total={totalPages || book?.pages || 0} onGo={handleGoToPage} />
          <button onClick={() => handlePageStep('next')} className="reader-icon-btn" disabled={currentPage >= (totalPages || book?.pages || 9999)}>
            <span className="material-symbols-rounded">chevron_right</span>
          </button>
        </div>

        <div className="reader-topbar-right">
          {/* Zoom */}
          <div className="reader-zoom-group">
            <button onClick={() => handleZoom('out')} className="reader-icon-btn reader-icon-btn-sm" disabled={zoom <= ZOOM_LEVELS[0]}>
              <span className="material-symbols-rounded">remove</span>
            </button>
            <button onClick={() => setZoom(1)} className="reader-zoom-label" title="ზუმის აღდგენა">
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={() => handleZoom('in')} className="reader-icon-btn reader-icon-btn-sm" disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}>
              <span className="material-symbols-rounded">add</span>
            </button>
          </div>

          {/* Background theme */}
          <div className="reader-bg-switcher">
            {(['dark', 'light', 'sepia'] as const).map(t => (
              <button
                key={t}
                onClick={() => setBgTheme(t)}
                className={`reader-bg-dot ${bgTheme === t ? 'active' : ''}`}
                style={{ background: bgColors[t] }}
                title={t === 'dark' ? 'მუქი' : t === 'light' ? 'ღია' : 'სეფია'}
              />
            ))}
          </div>

          {/* Bookmark toggle */}
          <button
            onClick={() => setShowBookmarks(prev => !prev)}
            className={`reader-icon-btn ${currentPageHasBookmark ? 'reader-bookmark-active' : ''}`}
            title="სანიშნეები"
          >
            <span className="material-symbols-rounded">
              {currentPageHasBookmark ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className={`reader-bottom-bar ${showControls ? 'visible' : 'hidden'}`}>
        <div className="reader-progress-track">
          <div className="reader-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="reader-progress-label">{progressPercent}% · გვერდი {currentPage}/{totalPages || '?'}</span>
      </div>

      {/* PDF Area */}
      <main className="reader-main" style={{ background: bgColors[bgTheme] }}>
        <div className="reader-watermark-overlay" />
        {activePdfLoading ? (
          <div className="reader-loading-screen" style={{ background: bgColors[bgTheme] }}>
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--gold)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
          </div>
        ) : activePdfUrl ? (
          <>
            <PdfRenderer
              url={activePdfUrl}
              initialPage={isPreview ? 1 : (initialPageRef.current ?? 1)}
              onPageChange={handlePageChange}
              zoom={zoom}
              maxPages={isPreview ? PREVIEW_MAX_PAGES : undefined}
            />
            {/* Preview end overlay */}
            {isPreview && totalPages > 0 && currentPage >= totalPages && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center" style={{ background: bgColors[bgTheme] }}>
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-rounded text-4xl text-primary">lock</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">წინასწარი ნახვა დასრულდა</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  თქვენ ნახეთ პირველი {PREVIEW_MAX_PAGES} გვერდი. სრული წიგნის წასაკითხად შეიძინეთ ან მიიღეთ უფასოდ.
                </p>
                <Link
                  to={`/books/${id}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
                >
                  <span className="material-symbols-rounded">shopping_cart</span>
                  სრული წიგნის შეძენა
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="reader-loading-screen">
            <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--text-muted)' }}>error</span>
            <p style={{ color: 'var(--text-muted)' }}>PDF ვერ ჩაიტვირთა</p>
          </div>
        )}
      </main>

      {/* Bookmark Panel */}
      <BookmarkPanel
        bookId={id!}
        currentPage={currentPage}
        onGoToPage={handleGoToPage}
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
      />
    </div>
  );
};

// Inline page input component
const PageInput = ({ current, total, onGo }: { current: number; total: number; onGo: (p: number) => void }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');

  if (editing) {
    return (
      <input
        type="number"
        className="reader-page-input-inline"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { onGo(parseInt(val, 10)); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        autoFocus
        min={1}
        max={total}
      />
    );
  }

  return (
    <button
      className="reader-page-display"
      onClick={() => { setVal(String(current)); setEditing(true); }}
      title="გვერდზე გადასვლა"
    >
      <span>{current}</span>
      <span className="reader-page-sep">/</span>
      <span>{total || '?'}</span>
    </button>
  );
};

export default BookReader;