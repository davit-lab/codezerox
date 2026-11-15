import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 4;

/** Widest a page is allowed to be at zoom 1 ("fit width"), in CSS px. */
const MAX_FIT_WIDTH = 1100;
/** Gap between pages and height of the page-number label, CSS px. */
const PAGE_GAP = 14;
const LABEL_HEIGHT = 22;
/**
 * Max device pixels for one full-page canvas. Browsers (especially iOS Safari)
 * silently fail or downscale huge canvases, which was the main cause of blurry
 * zoom. Above this limit we cap the full-page canvas and draw a sharp "detail"
 * canvas covering only the visible part of the page.
 */
const MAX_PAGE_CANVAS_PIXELS = 8_388_608;
const MAX_DETAIL_CANVAS_PIXELS = 12_582_912;
/** Pages rendered beyond the visible ones, and pages kept in memory. */
const RENDER_AHEAD = 1;
const KEEP_AROUND = 3;

type Focal = { x: number; y: number };

interface PageSlot {
  index: number;
  slot: HTMLDivElement;
  sheet: HTMLDivElement;
  /** Unscaled page size in PDF units; null until the page is loaded. */
  size: { w: number; h: number } | null;
  proxy: PDFPageProxy | null;
  canvas: HTMLCanvasElement | null;
  canvasScale: number;
  task: RenderTask | null;
  taskScale: number;
  detail: HTMLCanvasElement | null;
  detailKey: string;
  detailTask: RenderTask | null;
  detailTaskKey: string;
  // layout (CSS px, content coordinates)
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PdfViewerCallbacks {
  onPageChange?: (page: number, total: number) => void;
  /** Called when the user zooms with a gesture; the host decides the final zoom. */
  onZoomRequest?: (zoom: number, focal: Focal) => void;
  onProgress?: (fraction: number) => void;
}

const isCancel = (err: unknown) =>
  err instanceof pdfjsLib.RenderingCancelledException ||
  (err as { name?: string })?.name === "RenderingCancelledException";

export const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export class PdfViewerEngine {
  private container: HTMLDivElement;
  private content: HTMLDivElement;
  private callbacks: PdfViewerCallbacks;

  private loadingTask: PDFDocumentLoadingTask | null = null;
  private doc: PDFDocumentProxy | null = null;
  private pages: PageSlot[] = [];
  private defaultSize = { w: 612, h: 792 };
  private zoom = 1;
  private fitScale = 1;
  private viewWidth = 0;
  private currentPage = 1;
  private destroyed = false;

  private rafId = 0;
  private detailTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // gestures
  private pinch: { dist: number; focal: Focal } | null = null;
  private previewRatio = 1;
  private previewFocal: Focal | null = null;
  private wheelTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTap: { t: number; x: number; y: number } | null = null;
  private touchMoved = false;
  private touchStart: Focal | null = null;

  constructor(container: HTMLDivElement, callbacks: PdfViewerCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.content = document.createElement("div");
    this.content.className = "pdf-content";
    container.appendChild(this.content);

    container.addEventListener("scroll", this.onScroll, { passive: true });
    container.addEventListener("wheel", this.onWheel, { passive: false });
    container.addEventListener("touchstart", this.onTouchStart, { passive: false });
    container.addEventListener("touchmove", this.onTouchMove, { passive: false });
    container.addEventListener("touchend", this.onTouchEnd, { passive: false });
    container.addEventListener("touchcancel", this.onTouchEnd, { passive: false });

    this.resizeObserver = new ResizeObserver(() => {
      const w = this.container.clientWidth;
      if (!this.doc || Math.abs(w - this.viewWidth) < 1) return;
      this.relayout({ x: this.container.clientWidth / 2, y: 0 });
    });
    this.resizeObserver.observe(container);
  }

  setCallbacks(callbacks: PdfViewerCallbacks) {
    this.callbacks = callbacks;
  }

  // ---------------------------------------------------------------- loading

  async load(url: string, opts: { maxPages?: number; initialPage?: number; zoom?: number }) {
    this.zoom = clampZoom(opts.zoom ?? 1);
    const base = import.meta.env.BASE_URL || "/";
    this.loadingTask = pdfjsLib.getDocument({
      url,
      cMapUrl: `${base}pdfjs/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${base}pdfjs/standard_fonts/`,
    });
    this.loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
      if (total > 0) this.callbacks.onProgress?.(Math.min(1, loaded / total));
    };

    const doc = await this.loadingTask.promise;
    if (this.destroyed) {
      doc.destroy();
      return;
    }
    this.doc = doc;

    const numPages = opts.maxPages ? Math.min(doc.numPages, opts.maxPages) : doc.numPages;
    const first = await doc.getPage(1);
    if (this.destroyed) return;
    const vp = first.getViewport({ scale: 1 });
    this.defaultSize = { w: vp.width, h: vp.height };

    this.content.innerHTML = "";
    this.pages = [];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < numPages; i++) {
      const slot = document.createElement("div");
      slot.className = "pdf-page-wrapper";
      slot.dataset.page = String(i + 1);
      const sheet = document.createElement("div");
      sheet.className = "pdf-page-sheet";
      const label = document.createElement("div");
      label.className = "pdf-page-label";
      label.textContent = `${i + 1} / ${numPages}`;
      slot.append(sheet, label);
      frag.appendChild(slot);
      this.pages.push({
        index: i, slot, sheet,
        size: null, proxy: null,
        canvas: null, canvasScale: 0, task: null, taskScale: 0,
        detail: null, detailKey: "", detailTask: null, detailTaskKey: "",
        left: 0, top: 0, width: 0, height: 0,
      });
    }
    this.pages[0].proxy = first;
    this.pages[0].size = { ...this.defaultSize };
    this.content.appendChild(frag);

    this.computeFit();
    this.layout();

    const start = Math.min(Math.max(1, opts.initialPage ?? 1), numPages);
    this.currentPage = start;
    if (start > 1) this.container.scrollTop = Math.max(0, this.pages[start - 1].top - 8);
    this.callbacks.onPageChange?.(start, numPages);
    this.update();
  }

  get totalPages() {
    return this.pages.length;
  }

  // ----------------------------------------------------------------- layout

  private get scale() {
    return this.fitScale * this.zoom;
  }

  private get padTop() {
    return this.viewWidth < 768 ? 56 : 68;
  }

  private get padX() {
    return this.viewWidth < 768 ? 8 : 24;
  }

  private computeFit() {
    this.viewWidth = this.container.clientWidth || 800;
    const avail = Math.max(200, Math.min(this.viewWidth - this.padX * 2, MAX_FIT_WIDTH));
    this.fitScale = avail / this.defaultSize.w;
  }

  private layout() {
    const s = this.scale;
    let maxW = 0;
    let y = this.padTop;
    for (const p of this.pages) {
      const size = p.size ?? this.defaultSize;
      p.width = Math.round(size.w * s);
      p.height = Math.round(size.h * s);
      p.top = y;
      y += p.height + LABEL_HEIGHT + PAGE_GAP;
      if (p.width > maxW) maxW = p.width;
    }
    const contentW = Math.max(this.viewWidth, maxW + this.padX * 2);
    const contentH = y + 48;
    this.content.style.width = `${contentW}px`;
    this.content.style.height = `${contentH}px`;
    for (const p of this.pages) {
      p.left = Math.round((contentW - p.width) / 2);
      const st = p.slot.style;
      st.transform = `translate(${p.left}px, ${p.top}px)`;
      st.width = `${p.width}px`;
      p.sheet.style.height = `${p.height}px`;
      // detail canvases are positioned for the old layout — drop them
      this.dropDetail(p);
    }
  }

  /** Find the page index containing content-y (binary search). */
  private pageAtY(y: number) {
    let lo = 0;
    let hi = this.pages.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.pages[mid].top <= y) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  /** Re-layout while keeping the point under `focal` (container coords) fixed. */
  private relayout(focal: Focal, apply?: () => void) {
    if (!this.pages.length) return;
    const c = this.container;
    const docX = c.scrollLeft + focal.x;
    const docY = c.scrollTop + focal.y;
    const p = this.pages[this.pageAtY(docY)];
    const fx = (docX - p.left) / p.width;
    const fy = (docY - p.top) / p.height;

    apply?.();
    this.computeFit();
    this.layout();

    c.scrollTop = p.top + fy * p.height - focal.y;
    c.scrollLeft = p.left + fx * p.width - focal.x;
    this.update();
  }

  setZoom(zoom: number, focal?: Focal) {
    zoom = clampZoom(zoom);
    this.clearPreview();
    if (!this.doc || Math.abs(zoom - this.zoom) < 1e-4) {
      this.zoom = zoom;
      return;
    }
    const f = focal ?? { x: this.container.clientWidth / 2, y: this.container.clientHeight / 3 };
    this.relayout(f, () => {
      this.zoom = zoom;
    });
  }

  goToPage(page: number) {
    const p = this.pages[page - 1];
    if (!p) return;
    const target = Math.max(0, p.top - 8);
    const far = Math.abs(target - this.container.scrollTop) > this.container.clientHeight * 3;
    this.container.scrollTo({ top: target, behavior: far ? "auto" : "smooth" });
  }

  // -------------------------------------------------------------- rendering

  private onScroll = () => {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.update();
    });
  };

  private update() {
    if (!this.doc || !this.pages.length || this.destroyed) return;
    const c = this.container;
    const top = c.scrollTop;
    const bottom = top + c.clientHeight;
    const first = this.pageAtY(top);
    const last = this.pageAtY(bottom);

    // current page = page with the most visible height
    let best = first;
    let bestVis = -1;
    for (let i = first; i <= last; i++) {
      const p = this.pages[i];
      const vis = Math.min(bottom, p.top + p.height) - Math.max(top, p.top);
      if (vis > bestVis + 1) {
        bestVis = vis;
        best = i;
      }
    }
    if (best + 1 !== this.currentPage) {
      this.currentPage = best + 1;
      this.callbacks.onPageChange?.(this.currentPage, this.pages.length);
    }

    // render visible pages first (current one first), then neighbours
    const order = [best];
    for (let i = first; i <= last; i++) if (i !== best) order.push(i);
    for (let d = 1; d <= RENDER_AHEAD; d++) {
      if (first - d >= 0) order.push(first - d);
      if (last + d < this.pages.length) order.push(last + d);
    }
    for (const i of order) this.renderPage(this.pages[i]);

    // free memory of far pages
    for (const p of this.pages) {
      if ((p.canvas || p.task || p.proxy) && (p.index < first - KEEP_AROUND || p.index > last + KEEP_AROUND)) {
        this.releasePage(p);
      }
    }

    if (this.detailTimer) clearTimeout(this.detailTimer);
    this.detailTimer = setTimeout(() => {
      this.detailTimer = null;
      this.updateDetails(first, last);
    }, 120);
  }

  private get dpr() {
    return Math.min(window.devicePixelRatio || 1, 3);
  }

  /** Device-pixel scale used for a full-page canvas (capped by MAX_PAGE_CANVAS_PIXELS). */
  private pageCanvasScale(p: PageSlot) {
    const size = p.size ?? this.defaultSize;
    const ideal = this.scale * this.dpr;
    const cap = Math.sqrt(MAX_PAGE_CANVAS_PIXELS / (size.w * size.h));
    return Math.min(ideal, cap);
  }

  private async getProxy(p: PageSlot) {
    if (p.proxy) return p.proxy;
    const proxy = await this.doc!.getPage(p.index + 1);
    p.proxy = proxy;
    if (!p.size) {
      const vp = proxy.getViewport({ scale: 1 });
      p.size = { w: vp.width, h: vp.height };
      // Page differs from the first page — fix layout without jumping
      if (Math.abs(vp.width - this.defaultSize.w) > 0.5 || Math.abs(vp.height - this.defaultSize.h) > 0.5) {
        this.relayout({ x: this.container.clientWidth / 2, y: 0 });
      }
    }
    return proxy;
  }

  private async renderPage(p: PageSlot) {
    if (!this.doc) return;
    let proxy: PDFPageProxy;
    try {
      proxy = await this.getProxy(p);
    } catch (err) {
      console.error(`PDF page ${p.index + 1} load error`, err);
      return;
    }
    if (this.destroyed) return;

    const scale = this.pageCanvasScale(p);
    const close = (a: number, b: number) => Math.abs(a - b) / b < 0.01;
    if (p.canvas && close(p.canvasScale, scale)) return;
    if (p.task && close(p.taskScale, scale)) return;
    p.task?.cancel();

    const viewport = proxy.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.className = "pdf-page-canvas";
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const task = proxy.render({ canvasContext: ctx, viewport, background: "#ffffff" });
    p.task = task;
    p.taskScale = scale;
    try {
      await task.promise;
    } catch (err) {
      if (!isCancel(err)) console.error(`PDF page ${p.index + 1} render error`, err);
      freeCanvas(canvas);
      return;
    } finally {
      if (p.task === task) p.task = null;
    }
    if (this.destroyed) return;

    // Swap only when the new bitmap is ready — the old one stays visible
    // (stretched) in the meantime, so zooming never flashes blank.
    const old = p.canvas;
    p.sheet.insertBefore(canvas, p.sheet.firstChild);
    p.canvas = canvas;
    p.canvasScale = scale;
    if (old) {
      old.remove();
      freeCanvas(old);
    }
    if (this.detailTimer === null) this.updateDetails(this.pageAtY(this.container.scrollTop), this.pageAtY(this.container.scrollTop + this.container.clientHeight));
  }

  /** For pages whose full canvas is capped, render the visible region at full sharpness. */
  private updateDetails(first: number, last: number) {
    const c = this.container;
    for (const p of this.pages) {
      if (p.index < first || p.index > last) this.dropDetail(p);
    }
    for (let i = first; i <= last; i++) {
      const p = this.pages[i];
      if (!p.proxy) continue;
      const ideal = this.scale * this.dpr;
      if (this.pageCanvasScale(p) >= ideal * 0.98) {
        this.dropDetail(p);
        continue;
      }
      const x0 = Math.max(0, Math.floor(c.scrollLeft - p.left));
      const y0 = Math.max(0, Math.floor(c.scrollTop - p.top));
      const x1 = Math.min(p.width, Math.ceil(c.scrollLeft + c.clientWidth - p.left));
      const y1 = Math.min(p.height, Math.ceil(c.scrollTop + c.clientHeight - p.top));
      if (x1 <= x0 || y1 <= y0) {
        this.dropDetail(p);
        continue;
      }
      this.renderDetail(p, x0, y0, x1, y1);
    }
  }

  private async renderDetail(p: PageSlot, x0: number, y0: number, x1: number, y1: number) {
    const w = x1 - x0;
    const h = y1 - y0;
    let ratio = this.dpr;
    if (w * h * ratio * ratio > MAX_DETAIL_CANVAS_PIXELS) ratio = Math.sqrt(MAX_DETAIL_CANVAS_PIXELS / (w * h));
    const key = `${this.scale.toFixed(4)}|${ratio.toFixed(3)}|${x0}|${y0}|${x1}|${y1}`;
    if (p.detailKey === key || p.detailTaskKey === key) return;
    p.detailTask?.cancel();

    const proxy = p.proxy!;
    const viewport = proxy.getViewport({ scale: this.scale * ratio });
    const canvas = document.createElement("canvas");
    canvas.className = "pdf-page-detail";
    canvas.width = Math.ceil(w * ratio);
    canvas.height = Math.ceil(h * ratio);
    canvas.style.left = `${x0}px`;
    canvas.style.top = `${y0}px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const task = proxy.render({
      canvasContext: ctx,
      viewport,
      transform: [1, 0, 0, 1, -x0 * ratio, -y0 * ratio],
      background: "#ffffff",
    });
    p.detailTask = task;
    p.detailTaskKey = key;
    try {
      await task.promise;
    } catch (err) {
      if (!isCancel(err)) console.error(`PDF detail render error`, err);
      freeCanvas(canvas);
      return;
    } finally {
      if (p.detailTask === task) {
        p.detailTask = null;
        p.detailTaskKey = "";
      }
    }
    if (this.destroyed) return;
    const old = p.detail;
    p.sheet.appendChild(canvas);
    p.detail = canvas;
    p.detailKey = key;
    if (old) {
      old.remove();
      freeCanvas(old);
    }
  }

  private dropDetail(p: PageSlot) {
    p.detailTask?.cancel();
    p.detailTask = null;
    p.detailTaskKey = "";
    if (p.detail) {
      p.detail.remove();
      freeCanvas(p.detail);
      p.detail = null;
    }
    p.detailKey = "";
  }

  private releasePage(p: PageSlot) {
    p.task?.cancel();
    p.task = null;
    this.dropDetail(p);
    if (p.canvas) {
      p.canvas.remove();
      freeCanvas(p.canvas);
      p.canvas = null;
    }
    p.canvasScale = 0;
    if (p.proxy && p.index !== 0) {
      p.proxy.cleanup();
      p.proxy = null;
    }
  }

  // --------------------------------------------------------------- gestures

  private localPoint(clientX: number, clientY: number): Focal {
    const r = this.container.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  /** Visual-only zoom preview (CSS transform) while a gesture is in progress. */
  private preview(ratio: number, focal: Focal) {
    ratio = clampZoom(this.zoom * ratio) / this.zoom;
    this.previewRatio = ratio;
    this.previewFocal = focal;
    const c = this.container;
    this.content.style.transformOrigin = `${c.scrollLeft + focal.x}px ${c.scrollTop + focal.y}px`;
    this.content.style.transform = `scale(${ratio})`;
  }

  private clearPreview() {
    this.content.style.transform = "";
    this.content.style.transformOrigin = "";
    this.previewRatio = 1;
    this.previewFocal = null;
  }

  private commitPreview() {
    const ratio = this.previewRatio;
    const focal = this.previewFocal;
    if (!focal || Math.abs(ratio - 1) < 0.01) {
      this.clearPreview();
      return;
    }
    const zoom = Math.round(clampZoom(this.zoom * ratio) * 100) / 100;
    if (this.callbacks.onZoomRequest) this.callbacks.onZoomRequest(zoom, focal);
    else this.setZoom(zoom, focal);
    // If the host ignores the request, don't leave the page stuck scaled
    requestAnimationFrame(() => {
      if (this.previewFocal) this.clearPreview();
    });
  }

  private onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; // trackpad pinch / ctrl+wheel
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    const next = this.previewRatio * Math.exp(-delta * 0.01);
    this.preview(next, this.previewFocal ?? this.localPoint(e.clientX, e.clientY));
    if (this.wheelTimer) clearTimeout(this.wheelTimer);
    this.wheelTimer = setTimeout(() => {
      this.wheelTimer = null;
      this.commitPreview();
    }, 180);
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      this.pinch = {
        dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        focal: this.localPoint((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2),
      };
      this.touchStart = null;
    } else if (e.touches.length === 1) {
      this.touchMoved = false;
      this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (this.pinch && e.touches.length === 2) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      this.preview(dist / this.pinch.dist, this.pinch.focal);
      return;
    }
    if (this.touchStart && e.touches.length === 1) {
      const t = e.touches[0];
      if (Math.hypot(t.clientX - this.touchStart.x, t.clientY - this.touchStart.y) > 10) this.touchMoved = true;
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (this.pinch) {
      if (e.touches.length < 2) {
        this.pinch = null;
        this.commitPreview();
      }
      return;
    }
    // double-tap to zoom
    if (e.touches.length === 0 && this.touchStart && !this.touchMoved && e.changedTouches.length === 1) {
      const t = e.changedTouches[0];
      const now = performance.now();
      const last = this.lastTap;
      if (last && now - last.t < 300 && Math.hypot(t.clientX - last.x, t.clientY - last.y) < 30) {
        e.preventDefault();
        this.lastTap = null;
        const focal = this.localPoint(t.clientX, t.clientY);
        const target = this.zoom < 1.5 ? 2 : 1;
        if (this.callbacks.onZoomRequest) this.callbacks.onZoomRequest(target, focal);
        else this.setZoom(target, focal);
      } else {
        this.lastTap = { t: now, x: t.clientX, y: t.clientY };
      }
    }
    this.touchStart = null;
  };

  // ---------------------------------------------------------------- cleanup

  destroy() {
    this.destroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.detailTimer) clearTimeout(this.detailTimer);
    if (this.wheelTimer) clearTimeout(this.wheelTimer);
    this.resizeObserver?.disconnect();
    const c = this.container;
    c.removeEventListener("scroll", this.onScroll);
    c.removeEventListener("wheel", this.onWheel);
    c.removeEventListener("touchstart", this.onTouchStart);
    c.removeEventListener("touchmove", this.onTouchMove);
    c.removeEventListener("touchend", this.onTouchEnd);
    c.removeEventListener("touchcancel", this.onTouchEnd);
    for (const p of this.pages) {
      p.task?.cancel();
      p.detailTask?.cancel();
      if (p.canvas) freeCanvas(p.canvas);
      if (p.detail) freeCanvas(p.detail);
    }
    this.pages = [];
    this.content.remove();
    this.loadingTask?.destroy();
    this.doc = null;
  }
}

/** Release a canvas' backing store right away (important on iOS). */
function freeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}
