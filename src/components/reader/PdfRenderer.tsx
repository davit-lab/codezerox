import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PdfViewerEngine } from "./pdfViewerEngine";

interface PdfRendererProps {
  url: string;
  initialPage?: number;
  onPageChange?: (page: number, totalPages: number) => void;
  /** 1 = fit to width. */
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  maxPages?: number;
}

type Focal = { x: number; y: number };

const PdfRenderer = ({ url, initialPage = 1, onPageChange, zoom, onZoomChange, maxPages }: PdfRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PdfViewerEngine | null>(null);
  const pendingFocalRef = useRef<Focal | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Keep latest props reachable from the engine without re-creating it
  const latest = useRef({ onPageChange, onZoomChange, zoom, initialPage });
  latest.current = { onPageChange, onZoomChange, zoom, initialPage };

  // Create the engine and load the document
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !url) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    const engine = new PdfViewerEngine(container, {
      onPageChange: (page, total) => latest.current.onPageChange?.(page, total),
      onProgress: setProgress,
      onZoomRequest: (z, focal) => {
        const handler = latest.current.onZoomChange;
        if (handler) {
          pendingFocalRef.current = focal;
          handler(z);
        } else {
          engine.setZoom(z, focal);
        }
      },
    });
    engineRef.current = engine;

    engine
      .load(url, { maxPages, initialPage: latest.current.initialPage, zoom: latest.current.zoom })
      .then(() => setLoading(false))
      .catch((err) => {
        if (engineRef.current !== engine) return;
        console.error("PDF load error:", err);
        setError("PDF-ის ჩატვირთვა ვერ მოხერხდა");
        setLoading(false);
      });

    return () => {
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [url, maxPages]);

  // Apply zoom changes (buttons, keyboard, pinch) keeping the focal point in place
  useLayoutEffect(() => {
    const focal = pendingFocalRef.current ?? undefined;
    pendingFocalRef.current = null;
    engineRef.current?.setZoom(zoom, focal);
  }, [zoom]);

  // Go-to-page event from the toolbar / bookmarks
  useEffect(() => {
    const handler = (e: Event) => {
      const page = (e as CustomEvent<{ page: number }>).detail?.page;
      if (page) engineRef.current?.goToPage(page);
    };
    window.addEventListener("pdf-goto-page", handler);
    return () => window.removeEventListener("pdf-goto-page", handler);
  }, []);

  if (error) {
    return (
      <div className="pdf-error-state">
        <span className="material-symbols-rounded" style={{ fontSize: "64px", color: "var(--text-muted)" }}>error</span>
        <p style={{ color: "var(--text-muted)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", position: "relative" }}>
      {loading && (
        <div className="pdf-loading-state">
          <div className="pdf-loading-spinner">
            <span
              className="material-symbols-rounded"
              style={{ fontSize: "40px", color: "var(--gold)", animation: "spin 1s linear infinite" }}
            >
              progress_activity
            </span>
            <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "0.85rem" }}>
              იტვირთება{progress > 0 ? ` ${Math.round(progress * 100)}%` : "..."}
            </p>
            {progress > 0 && (
              <div className="pdf-loading-bar">
                <div style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={containerRef} className="pdf-scroll-container" />
    </div>
  );
};

export default PdfRenderer;
