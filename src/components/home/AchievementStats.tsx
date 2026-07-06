import { useEffect, useRef, useState } from "react";

const useCountUp = (target: number, duration = 1400) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min((t - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return { value, ref };
};

interface StatProps {
  target: number;
  suffix?: string;
  label: string;
  hint: string;
}

const Stat = ({ target, suffix = "", label, hint }: StatProps) => {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="stat-cell">
      <div className="stat-value">
        {value.toLocaleString("ka-GE")}
        <span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  );
};

interface AchievementStatsProps {
  books: number;
  categories: number;
}

const AchievementStats = ({ books, categories }: AchievementStatsProps) => {
  return (
    <section className="stats-band">
      <div className="container">
        <div className="stats-band-inner">
          <div className="stats-band-meta">
            <span className="stats-band-eyebrow">
              <span className="material-symbols-rounded text-[14px]">bar_chart</span>
              // impact
            </span>
            <h2 className="stats-band-title">
              რიცხვები, რომლებიც <span className="text-gold">მუშაობს</span>
            </h2>
          </div>
          <div className="stats-band-grid">
            <Stat target={4200} suffix="+" label="სტუდენტი" hint="აქტიური მოსწავლე" />
            <Stat target={books} label="წიგნი" hint="ბიბლიოთეკაში" />
            <Stat target={categories} label="კატეგორია" hint="სასწავლო მიმართულება" />
            <Stat target={98} suffix="%" label="კმაყოფილება" hint="მოსწავლეთა შეფასება" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementStats;
