import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfRendererProps {
  url: string;
  initialPage?: number;
  onPageChange?: (page: number, totalPages: number) => void;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  maxPages?: number;
}

const PAGE_BUFFER = 2;
const MAX_CANVASES = 7;
const MIN_ZOOM = 1.0;
const MAX_ZOOM = 2.0;

const PdfRenderer = ({ url, initialPage = 1, onPageChange, zoom, onZoomChange, maxPages }: PdfRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderedPagesRef = useRef<Map<number, number>>(new Map());
  const activeCanvasRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pageWrappersRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const hasScrolledToInitial = useRef(false);
  const currentPageRef = useRef(initialPage);
  const zoomRef = useRef(zoom);
  const totalPagesRef = useRef(0);
  const estimatedHeightRef = useRef(800);
  const renderingRef = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Pinch-to-zoom refs
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);
  const zoomDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  zoomRef.current = zoom;

  const getContainerWidth = useCallback((container: HTMLDivElement) => {
    return container.clientWidth || container.getBoundingClientRect().width || 800;
  }, []);

  // Render a single page — use a separate hi-res viewport for the canvas
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfDocRef.current;
    if (!pdf || renderingRef.current.has(pageNum)) return;

    const currentZoom = zoomRef.current;
    if (renderedPagesRef.current.get(pageNum) === currentZoom) return;

    const wrapper = pageWrappersRef.current.get(pageNum);
    if (!wrapper) return;

    renderingRef.current.add(pageNum);

    try {
      const page = await pdf.getPage(pageNum);
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = getContainerWidth(container);
      const baseViewport = page.getViewport({ scale: 1 });
      const maxWidth = Math.min(containerWidth - 32, 1600);
      const fitScale = maxWidth / baseViewport.width;
      // zoom 1.0 = fit-to-width, zoom 2.0 = 2x fit-to-width
      const displayScale = fitScale * currentZoom;

      // Display viewport (CSS size)
      const displayViewport = page.getViewport({ scale: displayScale });

      // Render at high resolution — never render below native PDF scale to avoid blur
      const renderScale = Math.max(displayScale * 2, 2.0);
      const renderViewport = page.getViewport({ scale: renderScale });

      // Reuse or create canvas
      let canvas = activeCanvasRef.current.get(pageNum);
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        const label = wrapper.querySelector('.pdf-page-label');
        if (label) wrapper.insertBefore(canvas, label);
        else wrapper.appendChild(canvas);
        activeCanvasRef.current.set(pageNum, canvas);
      }

      // Canvas pixel size = render viewport (2x), CSS size = display viewport (1x)
      canvas.width = Math.floor(renderViewport.width);
      canvas.height = Math.floor(renderViewport.height);
      canvas.style.width = `${Math.floor(displayViewport.width)}px`;
      canvas.style.height = `${Math.floor(displayViewport.height)}px`;
      canvas.style.display = 'block';

      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Render directly at hi-res scale — no context.scale needed
      await page.render({
        canvasContext: context,
        viewport: renderViewport,
      }).promise;

      renderedPagesRef.current.set(pageNum, currentZoom);
      wrapper.style.minHeight = `${Math.floor(displayViewport.height)}px`;
      wrapper.style.width = `${Math.floor(displayViewport.width)}px`;
    } catch (err) {
      if ((err as any)?.name !== 'RenderingCancelledException') {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    } finally {
      renderingRef.current.delete(pageNum);
    }
  }, [getContainerWidth]);

  const cleanupDistantCanvases = useCallback(() => {
    if (activeCanvasRef.current.size <= MAX_CANVASES) return;
    const current = currentPageRef.current;
    const entries = [...activeCanvasRef.current.entries()];
    entries.sort((a, b) => Math.abs(b[0] - current) - Math.abs(a[0] - current));

    while (entries.length > 0 && activeCanvasRef.current.size > MAX_CANVASES) {
      const [pageNum, canvas] = entries.shift()!;
      if (Math.abs(pageNum - current) > PAGE_BUFFER + 2) {
        canvas.remove();
        activeCanvasRef.current.delete(pageNum);
        renderedPagesRef.current.delete(pageNum);
      }
    }
  }, []);

  const renderVisiblePages = useCallback(() => {
    const current = currentPageRef.current;
    const total = totalPagesRef.current;
    if (!total) return;

    cleanupDistantCanvases();

    const start = Math.max(1, current - PAGE_BUFFER);
    const end = Math.min(total, current + PAGE_BUFFER);

    const order = [current];
    for (let d = 1; d <= PAGE_BUFFER; d++) {
      if (current - d >= 1) order.push(current - d);
      if (current + d <= total) order.push(current + d);
    }

    for (const p of order) {
      if (p >= start && p <= end) renderPage(p);
    }
  }, [renderPage, cleanupDistantCanvases]);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let mostVisiblePage = currentPageRef.current;

        for (const entry of entries) {
          const page = parseInt((entry.target as HTMLElement).dataset.page || '0');
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisiblePage = page;
          }
        }

        if (mostVisiblePage !== currentPageRef.current && maxRatio > 0.1) {
          currentPageRef.current = mostVisiblePage;
          onPageChange?.(mostVisiblePage, totalPagesRef.current);
          renderVisiblePages();
        }
      },
      { root: container, threshold: [0, 0.1, 0.25, 0.5, 0.75] }
    );
  }, [onPageChange, renderVisiblePages]);

  // Pinch-to-zoom
  const getTouchDist = (touches: TouchList) =>
    Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      pinchStartDistRef.current = getTouchDist(e.touches);
      pinchStartZoomRef.current = zoomRef.current;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2 || pinchStartDistRef.current === null) return;
    e.preventDefault();

    const dist = getTouchDist(e.touches);
    const ratio = dist / pinchStartDistRef.current;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * ratio));

    const container = containerRef.current;
    if (container) {
      container.style.transformOrigin = 'top center';
      container.style.transform = `scale(${ratio})`;
    }

    if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
    zoomDebounceRef.current = setTimeout(() => {
      onZoomChange?.(parseFloat(newZoom.toFixed(2)));
    }, 60);
  }, [onZoomChange]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (pinchStartDistRef.current === null) return;

    const dist =
      e.touches.length >= 2
        ? getTouchDist(e.touches)
        : pinchStartDistRef.current;

    const ratio = dist / pinchStartDistRef.current;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * ratio));

    const container = containerRef.current;
    if (container) {
      container.style.transform = '';
      container.style.transformOrigin = '';
    }

    pinchStartDistRef.current = null;
    if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
    onZoomChange?.(parseFloat(newZoom.toFixed(2)));
  }, [onZoomChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      renderedPagesRef.current.clear();
      activeCanvasRef.current.clear();
      pageWrappersRef.current.clear();
      renderingRef.current.clear();

      try {
        const loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          enableXfa: true,
        });
        const pdf = await loadingTask.promise;
        if (cancelled) { pdf.destroy(); return; }

        pdfDocRef.current = pdf;
        const effectivePages = maxPages ? Math.min(pdf.numPages, maxPages) : pdf.numPages;
        totalPagesRef.current = effectivePages;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const firstPage = await pdf.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1 });
        const containerWidth = getContainerWidth(container);
        const maxWidth = Math.min(containerWidth - 32, 1600);
        const fitScale = maxWidth / baseViewport.width;
        const estimatedHeight = baseViewport.height * fitScale;
        estimatedHeightRef.current = estimatedHeight;

        const fragment = document.createDocumentFragment();
        for (let i = 1; i <= effectivePages; i++) {
          const wrapper = document.createElement('div');
          wrapper.className = 'pdf-page-wrapper';
          wrapper.dataset.page = String(i);
          wrapper.style.minHeight = `${estimatedHeight}px`;

          const label = document.createElement('div');
          label.className = 'pdf-page-label';
          label.textContent = `${i} / ${effectivePages}`;
          wrapper.appendChild(label);

          fragment.appendChild(wrapper);
          pageWrappersRef.current.set(i, wrapper);
        }
        container.appendChild(fragment);

        setupObserver();
        pageWrappersRef.current.forEach((wrapper) => observerRef.current?.observe(wrapper));

        setLoading(false);

        if (initialPage > 1 && !hasScrolledToInitial.current) {
          hasScrolledToInitial.current = true;
          const target = pageWrappersRef.current.get(initialPage);
          if (target) {
            requestAnimationFrame(() => {
              target.scrollIntoView({ behavior: 'auto', block: 'start' });
              currentPageRef.current = initialPage;
              renderVisiblePages();
            });
          }
        } else {
          currentPageRef.current = 1;
          renderVisiblePages();
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('PDF load error:', err);
          setError('PDF-ის ჩატვირთვა ვერ მოხერხდა');
          setLoading(false);
        }
      }
    };

    if (url) loadPdf();
    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
      pdfDocRef.current?.destroy();
    };
  }, [url]);

  // Re-render on zoom change
  useEffect(() => {
    if (!pdfDocRef.current || totalPagesRef.current === 0) return;
    renderedPagesRef.current.clear();
    renderVisiblePages();
  }, [zoom, renderVisiblePages]);

  // Scroll debounce backup
  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalPagesRef.current === 0) return;

    let renderTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(renderTimeout);
      renderTimeout = setTimeout(() => renderVisiblePages(), 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(renderTimeout);
    };
  }, [renderVisiblePages]);

  // Go-to-page event
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const pageNum = e.detail.page;
      const wrapper = pageWrappersRef.current.get(pageNum);
      if (wrapper) {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        currentPageRef.current = pageNum;
        setTimeout(() => renderVisiblePages(), 300);
      }
    };
    window.addEventListener('pdf-goto-page' as any, handler as any);
    return () => window.removeEventListener('pdf-goto-page' as any, handler as any);
  }, [renderVisiblePages]);

  if (error) {
    return (
      <div className="pdf-error-state">
        <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--text-muted)' }}>error</span>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {loading && (
        <div className="pdf-loading-state">
          <div className="pdf-loading-spinner">
            <span
              className="material-symbols-rounded"
              style={{ fontSize: '40px', color: 'var(--gold)', animation: 'spin 1s linear infinite' }}
            >
              progress_activity
            </span>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.85rem' }}>იტვირთება...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="pdf-scroll-container"
        style={{ touchAction: 'pan-y' }}
      />
    </div>
  );
};

export default PdfRenderer;
