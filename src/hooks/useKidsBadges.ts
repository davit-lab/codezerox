import { useMemo } from 'react';
import { kidsLessons } from '@/data/kidsLessons';
import type { LessonType } from '@/data/kidsLessons';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  condition: (progress: { completedIds: string[]; totalXP: number; streak: number }) => boolean;
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'first-lesson',
    name: 'პირველი ნაბიჯი',
    description: 'დაასრულე პირველი გაკვეთილი',
    emoji: '🌟',
    color: '#fbbf24',
    condition: ({ completedIds }) => completedIds.length >= 1,
  },
  {
    id: 'five-lessons',
    name: 'კოდერი',
    description: 'დაასრულე 5 გაკვეთილი',
    emoji: '🚀',
    color: '#7c3aed',
    condition: ({ completedIds }) => completedIds.length >= 5,
  },
  {
    id: 'twenty-lessons',
    name: 'ექსპერტი',
    description: 'დაასრულე 20 გაკვეთილი',
    emoji: '🏆',
    color: '#22c55e',
    condition: ({ completedIds }) => completedIds.length >= 20,
  },
  {
    id: 'fifty-lessons',
    name: 'ლეგენდა',
    description: 'დაასრულე 50 გაკვეთილი',
    emoji: '👑',
    color: '#f59e0b',
    condition: ({ completedIds }) => completedIds.length >= 50,
  },
  {
    id: 'quiz-master',
    name: 'ქვიზ-მასტერი',
    description: 'დაასრულე 5 ქვიზი 100%-ით',
    emoji: '🧠',
    color: '#38bdf8',
    condition: ({ completedIds }) => {
      const quizCompleted = completedIds.filter(id => {
        const lesson = kidsLessons.find(l => l.id === id);
        return lesson?.type === 'quiz';
      });
      return quizCompleted.length >= 5;
    },
  },
  {
    id: 'puzzle-master',
    name: 'პაზლ-მასტერი',
    description: 'დაასრულე 10 პაზლი',
    emoji: '🧩',
    color: '#a78bfa',
    condition: ({ completedIds }) => {
      const puzzleCompleted = completedIds.filter(id => {
        const lesson = kidsLessons.find(l => l.id === id);
        return lesson?.type === 'puzzle';
      });
      return puzzleCompleted.length >= 10;
    },
  },
  {
    id: 'editor-master',
    name: 'რედაქტორი',
    description: 'დაასრულე 10 რედაქტორის გაკვეთილი',
    emoji: '💻',
    color: '#34d399',
    condition: ({ completedIds }) => {
      const editorCompleted = completedIds.filter(id => {
        const lesson = kidsLessons.find(l => l.id === id);
        return lesson?.type === 'editor';
      });
      return editorCompleted.length >= 10;
    },
  },
  {
    id: 'challenge-master',
    name: 'გამოწვევის ჩემპიონი',
    description: 'დაასრულე 10 გამოწვევა',
    emoji: '⚔️',
    color: '#f59e0b',
    condition: ({ completedIds }) => {
      const challengeCompleted = completedIds.filter(id => {
        const lesson = kidsLessons.find(l => l.id === id);
        return lesson?.type === 'challenge';
      });
      return challengeCompleted.length >= 10;
    },
  },
  {
    id: 'xp-100',
    name: '100 XP',
    description: 'მიაღწიე 100 XP-ს',
    emoji: '💯',
    color: '#ef4444',
    condition: ({ totalXP }) => totalXP >= 100,
  },
  {
    id: 'xp-500',
    name: '500 XP',
    description: 'მიაღწიე 500 XP-ს',
    emoji: '🔥',
    color: '#f97316',
    condition: ({ totalXP }) => totalXP >= 500,
  },
  {
    id: 'xp-1000',
    name: '1000 XP',
    description: 'მიაღწიე 1000 XP-ს',
    emoji: '🌟',
    color: '#eab308',
    condition: ({ totalXP }) => totalXP >= 1000,
  },
  {
    id: 'streak-3',
    name: 'სერია 3',
    description: '3 სწორი პასუხი ზედიზედ ქვიზში',
    emoji: '🔥',
    color: '#f43f5e',
    condition: ({ streak }) => streak >= 3,
  },
  {
    id: 'streak-7',
    name: 'სერია 7',
    description: '7 სწორი პასუხი ზედიზედ ქვიზში',
    emoji: '⚡',
    color: '#e11d48',
    condition: ({ streak }) => streak >= 7,
  },
  {
    id: 'module-master',
    name: 'მოდულ-მასტერი',
    description: 'დაასრულე ერთი მთლიანი მოდული',
    emoji: '📚',
    color: '#6366f1',
    condition: ({ completedIds }) => {
      const moduleCounts = new Map<number, number>();
      const moduleTotals = new Map<number, number>();
      completedIds.forEach(id => {
        const lesson = kidsLessons.find(l => l.id === id);
        if (lesson) {
          moduleCounts.set(lesson.moduleNumber, (moduleCounts.get(lesson.moduleNumber) || 0) + 1);
        }
      });
      kidsLessons.forEach(l => {
        moduleTotals.set(l.moduleNumber, (moduleTotals.get(l.moduleNumber) || 0) + 1);
      });
      for (const [moduleNum, count] of moduleCounts.entries()) {
        if (count >= (moduleTotals.get(moduleNum) || 0)) return true;
      }
      return false;
    },
  },
  {
    id: 'all-types',
    name: 'მრავალფეროვანი',
    description: 'სცადე ყველა ტიპის გაკვეთილი',
    emoji: '🌈',
    color: '#8b5cf6',
    condition: ({ completedIds }) => {
      const types = new Set<LessonType>();
      completedIds.forEach(id => {
        const lesson = kidsLessons.find(l => l.id === id);
        if (lesson?.type) types.add(lesson.type);
      });
      return types.size >= 5;
    },
  },
];

export interface BadgeProgress {
  earned: Badge[];
  locked: Badge[];
  total: number;
  earnedCount: number;
}

export function calculateBadges(completedIds: string[], totalXP: number, streak: number = 0): BadgeProgress {
  const progress = { completedIds, totalXP, streak };
  const earned: Badge[] = [];
  const locked: Badge[] = [];

  for (const badge of ALL_BADGES) {
    if (badge.condition(progress)) {
      earned.push(badge);
    } else {
      locked.push(badge);
    }
  }

  return {
    earned,
    locked,
    total: ALL_BADGES.length,
    earnedCount: earned.length,
  };
}

export function useKidsBadges(completedIds: string[], totalXP: number, streak: number = 0): BadgeProgress {
  return useMemo(() => calculateBadges(completedIds, totalXP, streak), [completedIds, totalXP, streak]);
}
