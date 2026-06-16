import { Link } from "react-router-dom";
import { Check, Puzzle, Code, Eye, Lock, Zap } from "lucide-react";
import type { KidsLesson } from "@/data/kidsLessons";

interface LessonCardProps {
  lesson: KidsLesson;
  completed: boolean;
  locked?: boolean;
  key?: string;
}

const typeConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  puzzle: { label: 'პაზლი', bg: 'bg-violet-500', text: 'text-violet-400', icon: Puzzle },
  editor: { label: 'რედაქტორი', bg: 'bg-emerald-500', text: 'text-emerald-400', icon: Code },
  challenge: { label: 'გამოწვევა', bg: 'bg-amber-500', text: 'text-amber-400', icon: Eye },
};

const difficultyConfig: Record<string, { label: string; bg: string; text: string }> = {
  easy: { label: 'მარტივი', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  medium: { label: 'საშუალო', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  hard: { label: 'რთული', bg: 'bg-red-500/10', text: 'text-red-400' },
};

const LessonCard = ({ lesson, completed, locked = false }: LessonCardProps) => {
  const path = lesson.type === 'puzzle'
    ? `/kids/puzzle/${lesson.id}`
    : lesson.type === 'editor'
    ? `/kids/editor/${lesson.id}`
    : `/kids/challenge/${lesson.id}`;

  const config = typeConfig[lesson.type] || typeConfig.editor;
  const difficulty = difficultyConfig[lesson.difficulty] || difficultyConfig.easy;
  const Icon = config.icon;

  if (locked) {
    return (
      <div className="block relative rounded-2xl overflow-hidden bg-stone-900/50 border border-white/5 opacity-40">
        <div className={`h-0.5 ${config.bg} opacity-30`} />
        <div className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} opacity-50`}>
                <Icon size={14} className="text-white" />
              </div>
              <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded bg-stone-800 ${config.text}`}>{config.label}</span>
              <span className={`text-[0.58rem] font-semibold px-1.5 py-0.5 rounded ${difficulty.bg} ${difficulty.text}`}>{difficulty.label}</span>
            </div>
            <Lock size={13} className="text-stone-600" />
          </div>
          <h3 className="text-[0.85rem] font-bold leading-snug mb-1.5 text-stone-500">{lesson.title}</h3>
          <p className="text-[0.73rem] leading-relaxed mb-3 text-stone-600 line-clamp-2">{lesson.description}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={path}
      className={`block relative rounded-2xl overflow-hidden bg-stone-900/80 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${
        completed ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-white/5 hover:border-[#5F13CA]/30'
      }`}
    >
      {/* Accent bar */}
      <div className={`h-0.5 ${completed ? 'bg-emerald-500' : `${config.bg}`} ${completed ? '' : 'opacity-50'}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} shadow-lg`}>
              <Icon size={14} className="text-white" />
            </div>
            <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded bg-stone-800 ${config.text}`}>{config.label}</span>
            <span className={`text-[0.58rem] font-semibold px-1.5 py-0.5 rounded ${difficulty.bg} ${difficulty.text}`}>{difficulty.label}</span>
          </div>

          {completed ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-600 shadow-emerald-500/30 shadow-lg">
              <Check size={12} className="text-white" strokeWidth={3} />
            </div>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="text-[0.85rem] font-bold leading-snug mb-1.5 text-white group-hover:text-[#5F13CA] transition-colors">
          {lesson.title}
        </h3>

        {/* Description */}
        <p className="text-[0.73rem] leading-relaxed mb-3 text-stone-400 line-clamp-2">
          {lesson.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
          <span className="text-[0.64rem] font-semibold text-stone-500">
            მოდული {lesson.moduleNumber}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10">
            <Zap size={10} className="text-amber-400" />
            <span className="text-[0.65rem] font-bold text-amber-400">+{lesson.xpReward}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LessonCard;
