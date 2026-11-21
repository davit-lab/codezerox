// Small, dependency-free effects layer: motion preference, synthesized sound,
// haptics and confetti. Nothing here ships an audio file or an image, and every
// effect is a no-op on the server or when the learner asked for less motion.

export function motionAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.dataset.motion === 'reduce') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------------------------------------------------------------- sound */

// A UI preference rather than learning data, so it lives outside the progress
// backup (and outside its strict schema validation).
export const SOUND_KEY = 'codezero:sound';

export function soundEnabled(): boolean {
  try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; }
}

export function setSoundEnabled(on: boolean): void {
  try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch { /* storage unavailable */ }
}

export type SoundKind = 'tap' | 'correct' | 'wrong' | 'complete';

// [frequency Hz, start offset s, duration s, waveform, peak gain]
type Note = readonly [number, number, number, OscillatorType, number];

export const SCORES: Record<SoundKind, readonly Note[]> = {
  tap: [[660, 0, 0.06, 'triangle', 0.05]],
  // C5 -> G5: a bright two-note "ding"
  correct: [[523.25, 0, 0.14, 'triangle', 0.09], [783.99, 0.09, 0.28, 'triangle', 0.09]],
  // low and soft on purpose: it should nudge, not punish
  wrong: [[196, 0, 0.16, 'sawtooth', 0.035], [155.56, 0.12, 0.3, 'sawtooth', 0.035]],
  // rising C major arpeggio that lands on a held chord
  complete: [
    [523.25, 0, 0.16, 'triangle', 0.08], [659.25, 0.1, 0.16, 'triangle', 0.08],
    [783.99, 0.2, 0.16, 'triangle', 0.08], [1046.5, 0.3, 0.55, 'triangle', 0.09],
    [523.25, 0.3, 0.55, 'sine', 0.05], [659.25, 0.3, 0.55, 'sine', 0.04],
  ],
};

let audioCtx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioCtx = audioCtx ?? new Ctor();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch { return null; }
}

function schedule(c: AudioContext, [freq, at, dur, type, peak]: Note, t0: number): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0 + at);
  gain.gain.setValueAtTime(0.0001, t0 + at);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0 + at);
  osc.stop(t0 + at + dur + 0.03);
}

export function playSound(kind: SoundKind): void {
  if (!soundEnabled()) return;
  const c = context();
  if (!c) return;
  const t0 = c.currentTime + 0.01;
  for (const note of SCORES[kind]) schedule(c, note, t0);
}

/* -------------------------------------------------------------- haptics */

export function haptic(pattern: number | number[]): void {
  try {
    if (motionAllowed() && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch { /* unsupported */ }
}

/* ------------------------------------------------------------- confetti */

export const CONFETTI_COLORS = ['#8458dc', '#b49aec', '#f0b44c', '#49a078', '#5aa0d6', '#ef7a8a'] as const;

export type ConfettiOptions = {
  count?: number;
  duration?: number;
  // cannons: two bursts from the bottom corners. rain: a slow fall from the top.
  mode?: 'cannons' | 'rain';
};

type Piece = {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; flip: number; vf: number;
  w: number; h: number; color: string; round: boolean;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function launchConfetti(canvas: HTMLCanvasElement, options: ConfettiOptions = {}): () => void {
  const { count = 120, duration = 3400, mode = 'cannons' } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const draw = ctx;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  const fit = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    draw.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  window.addEventListener('resize', fit);

  const pieces: Piece[] = [];
  for (let i = 0; i < count; i++) {
    const base = {
      rot: rand(0, Math.PI * 2), vr: rand(-0.25, 0.25), flip: rand(0, Math.PI * 2), vf: rand(0.1, 0.32),
      w: rand(6, 11), h: rand(9, 17), color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], round: Math.random() < 0.25,
    };
    if (mode === 'rain') {
      pieces.push({ ...base, x: rand(0, w), y: rand(-h * 0.5, -20), vx: rand(-1, 1), vy: rand(2, 5) });
    } else {
      const left = i % 2 === 0;
      const angle = (left ? rand(-82, -52) : rand(-128, -98)) * (Math.PI / 180);
      const speed = rand(17, 30);
      pieces.push({ ...base, x: left ? 0 : w, y: h * 0.92, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
    }
  }

  let raf = 0;
  let last = performance.now();
  const start = last;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', fit);
    draw.clearRect(0, 0, w, h);
  };

  const frame = (now: number) => {
    if (stopped) return;
    const elapsed = now - start;
    if (elapsed > duration) { stop(); return; }
    const step = Math.min(2.5, (now - last) / 16.667);
    last = now;
    draw.clearRect(0, 0, w, h);
    const fade = elapsed > duration - 700 ? Math.max(0, (duration - elapsed) / 700) : 1;
    for (const p of pieces) {
      p.vy += 0.42 * step;
      p.vx *= Math.pow(0.992, step);
      p.vy *= Math.pow(0.994, step);
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.rot += p.vr * step;
      p.flip += p.vf * step;
      if (p.y > h + 30) continue;
      draw.save();
      draw.translate(p.x, p.y);
      draw.rotate(p.rot);
      draw.scale(1, Math.cos(p.flip));
      draw.globalAlpha = fade;
      draw.fillStyle = p.color;
      if (p.round) { draw.beginPath(); draw.arc(0, 0, p.w / 2, 0, Math.PI * 2); draw.fill(); }
      else draw.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      draw.restore();
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return stop;
}
