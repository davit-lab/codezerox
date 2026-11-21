import { useEffect } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, Flame, Trophy, Zap } from 'lucide-react';
import Avatar from './Avatar';
import { Confetti, Counter } from './Fx';
import { haptic, playSound } from '../lib/fx';
import { streakLine } from '../lib/voice';
import type { AvatarConfig } from '../lib/learner';

export type CelebrationProps = {
  avatar?: AvatarConfig;
  eyebrow: string;
  title: string;
  recap: string;
  /** XP earned right now. 0 for a repeat or a practice run. */
  gain: number;
  totalXp: number;
  streakDays: number;
  /** Set when this lesson closed a whole module. */
  moduleTitle?: string;
  recapLine: string;
  repeatLine: string;
  nextLabel: string;
  onNext: () => void;
};

export default function Celebration({
  avatar, eyebrow, title, recap, gain, totalXp, streakDays, moduleTitle, recapLine, repeatLine, nextLabel, onNext,
}: CelebrationProps) {
  const earned = gain > 0;

  useEffect(() => {
    playSound(earned ? 'complete' : 'correct');
    haptic(earned ? [40, 60, 40] : 20);
  }, [earned]);

  return (
    <div className="lesson-finished celebrate">
      <Confetti mode={moduleTitle && earned ? 'rain' : 'cannons'} count={moduleTitle && earned ? 190 : earned ? 130 : 45} />

      <div className="cel-stage">
        <span className="cel-rays" aria-hidden="true" />
        <Avatar value={avatar} className="completion-avatar cel-avatar" label="შენი პერსონაჟი — გაკვეთილი დასრულებულია" />
      </div>

      <p className="eyebrow cel-rise" style={{ '--d': '120ms' } as React.CSSProperties}>{eyebrow}</p>
      <h1 className="cel-rise" style={{ '--d': '180ms' } as React.CSSProperties}>{title}</h1>
      <p className="cel-rise" style={{ '--d': '240ms' } as React.CSSProperties}>{recap}</p>

      <div className="cel-stats">
        <div className={'cel-stat xp' + (earned ? '' : ' muted')} style={{ '--d': '320ms' } as React.CSSProperties}>
          <Zap size={22} aria-hidden="true" />
          <strong>{earned ? <>+<Counter value={gain} from={0} duration={800} /></> : '+0'}</strong>
          <span>XP</span>
        </div>
        <div className="cel-stat total" style={{ '--d': '420ms' } as React.CSSProperties}>
          <Trophy size={22} aria-hidden="true" />
          <strong><Counter value={totalXp} from={Math.max(0, totalXp - gain)} duration={1100} /></strong>
          <span>სულ XP</span>
        </div>
        <div className="cel-stat streak" style={{ '--d': '520ms' } as React.CSSProperties}>
          <Flame size={22} className="flame-live" aria-hidden="true" />
          <strong>{streakDays}</strong>
          <span>დღე ზედიზედ</span>
        </div>
      </div>

      <p className="cel-streak-line cel-rise" style={{ '--d': '640ms' } as React.CSSProperties} role="status">
        {earned ? streakLine(streakDays) : repeatLine}
      </p>

      <div className="completion-recap cel-rise" style={{ '--d': '700ms' } as React.CSSProperties}>
        <span><CheckCircle2 size={19} />{recapLine}</span>
      </div>

      {moduleTitle && (
        <div className="module-achievement cel-rise" style={{ '--d': '780ms' } as React.CSSProperties}>
          <Trophy size={25} />
          <p><strong>{moduleTitle} დასრულებულია.</strong><br />დროა, ეს ცოდნა საკუთარ საიტში გამოიყენო.</p>
        </div>
      )}

      <div className="finished-actions cel-rise" style={{ '--d': '860ms' } as React.CSSProperties}>
        <a href="#workshop" className="outline-button">სცადე შენს პროექტში <ArrowUpRight size={16} /></a>
        <button className="button" onClick={onNext}>{nextLabel}<ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
