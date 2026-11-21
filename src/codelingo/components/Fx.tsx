import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { launchConfetti, motionAllowed, playSound, setSoundEnabled, soundEnabled } from '../lib/fx';

/** A number that counts up to its new value and gives a small bump when it lands. */
export function Counter({ value, from, duration = 900 }: { value: number; from?: number; duration?: number }) {
  const [shown, setShown] = useState(from ?? value);
  const [bumps, setBumps] = useState(0);
  const shownRef = useRef(from ?? value);

  useEffect(() => {
    const start = shownRef.current;
    if (start === value) return;
    const animate = motionAllowed() && value > start;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = animate ? Math.min(1, (now - t0) / duration) : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      const next = Math.round(start + (value - start) * eased);
      shownRef.current = next;
      setShown(next);
      if (k < 1) raf = requestAnimationFrame(tick);
      else if (value > start) setBumps(b => b + 1);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  // Remounting on each landing replays the CSS bump without extra state juggling.
  return <span key={bumps} className={'fx-counter' + (bumps ? ' bump' : '')}>{shown}</span>;
}

/** Full-screen confetti. Draws nothing when the learner asked for reduced motion. */
export function Confetti({ run = true, mode = 'cannons', count }: { run?: boolean; mode?: 'cannons' | 'rain'; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!run || !canvas || !motionAllowed()) return;
    return launchConfetti(canvas, { mode, count });
  }, [run, mode, count]);
  return <canvas ref={ref} className="fx-confetti" aria-hidden="true" />;
}

/** Topbar switch for lesson sounds. Off state is remembered in this browser. */
export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => { queueMicrotask(() => setOn(soundEnabled())); }, []);
  return (
    <button
      type="button"
      className="icon-button sound-toggle"
      aria-pressed={on}
      aria-label={on ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}
      title={on ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}
      onClick={() => {
        const next = !on;
        setSoundEnabled(next);
        setOn(next);
        if (next) playSound('tap');
      }}
    >
      {on ? <Volume2 size={19} /> : <VolumeX size={19} />}
    </button>
  );
}

/**
 * Smoothly slides list children to their new place after a reorder.
 * Give each child a stable data-flip="id" and attach the returned ref to the parent.
 * Positions are measured relative to the parent, so scrolling or content shifting
 * above the list never triggers a false animation.
 */
export function useFlip<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const tops = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const parent = ref.current;
    if (!parent) { tops.current = new Map(); return; }
    const base = parent.getBoundingClientRect().top;
    const next = new Map<string, number>();
    for (const el of Array.from(parent.children) as HTMLElement[]) {
      const id = el.dataset.flip;
      if (!id) continue;
      const top = el.getBoundingClientRect().top - base;
      next.set(id, top);
      const prev = tops.current.get(id);
      if (prev !== undefined && Math.abs(prev - top) > 1 && motionAllowed() && typeof el.animate === 'function') {
        el.animate(
          [{ transform: `translateY(${prev - top}px)` }, { transform: 'translateY(0)' }],
          { duration: 280, easing: 'cubic-bezier(.2,.9,.25,1)' },
        );
      }
    }
    tops.current = next;
  });
  return ref;
}
