import { useCallback, useMemo } from 'react';
import { kidsLessons, type LessonType } from '@/data/kidsLessons';

const STORAGE_KEY = 'kids_partial_progress';

export interface PartialProgress {
  lessonId: string;
  stepsCompleted: number;
  totalSteps: number;
  lastAccessed: string;
}

function readStorage(): PartialProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(data: PartialProgress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function usePartialProgress() {
  const getProgress = useCallback((lessonId: string): PartialProgress | undefined => {
    return readStorage().find(p => p.lessonId === lessonId);
  }, []);

  const updateProgress = useCallback((lessonId: string, stepsCompleted: number, totalSteps: number) => {
    const data = readStorage().filter(p => p.lessonId !== lessonId);
    data.push({
      lessonId,
      stepsCompleted: Math.min(stepsCompleted, totalSteps),
      totalSteps,
      lastAccessed: new Date().toISOString(),
    });
    writeStorage(data);
  }, []);

  const clearProgress = useCallback((lessonId: string) => {
    writeStorage(readStorage().filter(p => p.lessonId !== lessonId));
  }, []);

  const allPartial = useMemo(() => readStorage(), []);

  const getLessonTotalSteps = useCallback((lessonId: string): number => {
    const lesson = kidsLessons.find(l => l.id === lessonId);
    if (!lesson) return 1;
    switch (lesson.type) {
      case 'quiz': return lesson.quizQuestions?.length || 1;
      case 'fillblanks': return lesson.fillBlanks?.length || 1;
      case 'memory': return lesson.puzzlePieces?.length || 1;
      case 'editor': return lesson.steps?.length || 1;
      case 'puzzle': return 1;
      case 'challenge': return 1;
      default: return 1;
    }
  }, []);

  return { getProgress, updateProgress, clearProgress, allPartial, getLessonTotalSteps };
}

export function calculateOverallProgress(
  completedIds: string[],
  partialProgress: PartialProgress[],
  totalLessons: number
): { completed: number; inProgress: number; overallPct: number } {
  const completed = completedIds.length;

  // Count partial progress only for lessons NOT fully completed
  const inProgressIds = new Set(
    partialProgress
      .filter(p => !completedIds.includes(p.lessonId))
      .map(p => p.lessonId)
  );
  const inProgress = inProgressIds.size;

  // Calculate weighted progress
  let totalProgressUnits = 0;
  let totalUnits = 0;

  // For all lessons
  for (const lesson of kidsLessons) {
    const totalSteps = (() => {
      switch (lesson.type) {
        case 'quiz': return lesson.quizQuestions?.length || 1;
        case 'fillblanks': return lesson.fillBlanks?.length || 1;
        case 'memory': return lesson.puzzlePieces?.length || 1;
        case 'editor': return lesson.steps?.length || 1;
        default: return 1;
      }
    })();

    totalUnits += totalSteps;

    if (completedIds.includes(lesson.id)) {
      totalProgressUnits += totalSteps;
    } else {
      const partial = partialProgress.find(p => p.lessonId === lesson.id);
      if (partial) {
        totalProgressUnits += partial.stepsCompleted;
      }
    }
  }

  const overallPct = totalUnits > 0 ? (totalProgressUnits / totalUnits) * 100 : 0;

  return { completed, inProgress, overallPct };
}
