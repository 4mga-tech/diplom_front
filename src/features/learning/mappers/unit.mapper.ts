import { NormalizedLevelId } from "@/src/features/learning/routes";
import {
  BackendUnitResponse,
  LessonListItem,
  UnitListItem,
} from "@/src/features/learning/types/learning.types";

export function getFallbackUnitGradient(order: number): [string, string] {
  const gradients: [string, string][] = [
    ["#2563EB", "#0EA5E9"],
    ["#0F766E", "#14B8A6"],
    ["#7C3AED", "#DB2777"],
    ["#EA580C", "#F59E0B"],
  ];

  return gradients[(Math.max(order, 1) - 1) % gradients.length];
}

export function mapUnit(
  levelId: NormalizedLevelId,
  raw: BackendUnitResponse,
): Omit<UnitListItem, "currentLessonId" | "firstUnlockedLessonId"> {
  const order = Math.max(1, Number(raw?.order ?? 1));
  const lessonsCount = Math.max(0, Number(raw?.lessonCount ?? 0));
  const completedLessonsCount = Math.max(0, Number(raw?.completedLessonCount ?? 0));
  const unlockedLessonsCount = Math.max(0, Number(raw?.unlockedLessonCount ?? 0));

  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    levelId,
    order,
    title: String(raw?.title ?? "Unit"),
    subtitle: String(raw?.subtitle ?? ""),
    description: String(raw?.description ?? ""),
    gradient: getFallbackUnitGradient(order),
    lessonsCount,
    completedLessonsCount,
    unlockedLessonsCount,
    progress: lessonsCount > 0 ? Math.round((completedLessonsCount / lessonsCount) * 100) : 0,
    isUnlocked: Boolean(raw?.isUnlocked),
    isCompleted: Boolean(raw?.isCompleted),
  };
}

export function attachLessonState(
  unit: Omit<UnitListItem, "currentLessonId" | "firstUnlockedLessonId">,
  lessons: LessonListItem[],
): UnitListItem {
  const currentLesson = lessons.find((lesson) => lesson.isUnlocked && !lesson.isCompleted);
  const firstUnlockedLesson = lessons.find((lesson) => lesson.isUnlocked);

  return {
    ...unit,
    currentLessonId: currentLesson?.id ?? null,
    firstUnlockedLessonId: firstUnlockedLesson?.id ?? null,
  };
}
