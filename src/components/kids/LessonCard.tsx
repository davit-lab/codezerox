import { Link } from "react-router-dom";
import { Check, Puzzle, Code, Eye, Lock, Zap } from "lucide-react";
import type { KidsLesson } from "@/data/kidsLessons";

interface LessonCardProps {
  lesson: KidsLesson;
  completed: boolean;
  index?: number;
  locked?: boolean;
}

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  puzzle: { label: 'პაზლი', color: '#a78bfa', icon: Puzzle },
  editor: { label: 'რედაქტორი', color: '#34d399', icon: Code },
  challenge: { label: 'გამოწვევა', color: '#f59e0b', icon: Eye },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'მარტივი', color: '#34d399' },
  medium: { label: 'საშუალო', color: '#f59e0b' },
  hard: { label: 'რთული', color: '#ef4444' },
};

const LessonCard = ({ lesson, completed, index = 0, locked = false }: LessonCardProps) => {
  const path = lesson.type === 'puzzle'
    ? `/kids/puzzle/${lesson.id}`
    : lesson.type === 'editor'
    ? `/kids/editor/${lesson.id}`
    : `/kids/challenge/${lesson.id}`;

  const config = typeConfig[lesson.type] || typeConfig.editor;
  const difficulty = difficultyConfig[lesson.difficulty] || difficultyConfig.easy;
  const Icon = config.icon;

  return (
    <Link
      to={locked ? '#' : path}
      className="block relative rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${completed ? 'rgba(34,197,94,0.2)' : 'var(--border-light)'}`,
        textDecoration: 'none',
        opacity: locked ? 0.4 : 1,
        pointerEvents: locked ? 'none' : 'auto',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Accent bar */}
      <div className="h-[2px]" style={{
        background: completed ? '#22c55e' : config.color,
        opacity: completed ? 1 : 0.5,
      }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: config.color }}>
              <Icon size={14} color="#fff" />
            </div>
            <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded" style={{
              background: `${config.color}12`,
              color: config.color,
              fontFamily: 'var(--font-georgian)',
            }}>
              {config.label}
            </span>
            <span className="text-[0.58rem] font-semibold px-1.5 py-0.5 rounded" style={{
              background: `${difficulty.color}10`,
              color: difficulty.color,
            }}>
              {difficulty.label}
            </span>
          </div>

          {completed ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#059669' }}>
              <Check size={12} color="#fff" strokeWidth={3} />
            </div>
          ) : locked ? (
            <Lock size={13} style={{ color: 'var(--text-dim)' }} />
          ) : null}
        </div>

        {/* Title */}
        <h3 className="text-[0.85rem] font-bold leading-snug mb-1.5" style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-georgian)',
        }}>
          {lesson.title}
        </h3>

        {/* Description */}
        <p className="text-[0.73rem] leading-relaxed mb-3" style={{
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-georgian)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {lesson.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '1px solid var(--border-light)' }}>
          <span className="text-[0.64rem] font-semibold" style={{
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-georgian)',
          }}>
            მოდული {lesson.moduleNumber}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{
            background: 'rgba(255,215,0,0.06)',
          }}>
            <Zap size={10} style={{ color: 'var(--gold)' }} />
            <span className="text-[0.65rem] font-bold" style={{ color: 'var(--gold)' }}>
              +{lesson.xpReward}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LessonCard;
