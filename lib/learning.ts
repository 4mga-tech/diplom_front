import { api } from "@/lib/api";
import { fetchLevels } from "@/src/features/learning/services/levels.service";
import {
  fetchLevelUnits,
  fetchUnitDetail,
} from "@/src/features/learning/services/units.service";
import {
  fetchLessonDetail,
  fetchUnitLessons,
} from "@/src/features/learning/services/lessons.service";
import {
  CourseProgress,
  LessonListItem,
  LessonProgressState,
  UnitListItem,
  UnitProgressState,
} from "@/src/features/learning/types/learning.types";

export * from "@/src/features/learning/types/learning.types";

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

function normalizeCourseId(courseId: string) {
  return courseId.trim().toLowerCase();
}

export {
  fetchLevels,
  fetchLevelUnits,
  fetchUnitDetail,
  fetchUnitLessons,
  fetchLessonDetail,
};

export function getLessonProgressState(
  lesson: Pick<LessonListItem, "isCompleted" | "isUnlocked" | "id" | "isCurrent">,
  currentLessonId?: string | null,
): LessonProgressState {
  if (lesson.isCompleted) return "completed";
  if (lesson.isCurrent) return "current";
  if (currentLessonId && lesson.id === currentLessonId) return "current";
  if (lesson.isUnlocked) return "unlocked";
  return "locked";
}

export function getUnitProgressState(
  unit: Pick<UnitListItem, "isCompleted" | "isUnlocked" | "currentLessonId" | "completedLessonsCount">,
): UnitProgressState {
  if (unit.isCompleted) return "completed";
  if (unit.currentLessonId || unit.completedLessonsCount > 0) return "in_progress";
  if (unit.isUnlocked) return "unlocked";
  return "locked";
}

export function getFallbackCourseProgress(_courseId: string): CourseProgress {
  return {
    completedLessonIds: [],
    unlockedLessonIds: [],
    totalXp: 0,
    streak: 0,
  };
}

export async function fetchCourseProgress(courseId: string): Promise<CourseProgress> {
  const normalizedCourseId = normalizeCourseId(courseId);

  try {
    const res = await api.get(`/me/progress?courseId=${encodeURIComponent(normalizedCourseId)}`);
    const data = extractData<any>(res.data);

    return {
      completedLessonIds: Array.isArray(data?.completedLessonIds)
        ? data.completedLessonIds.map(String)
        : [],
      unlockedLessonIds: Array.isArray(data?.unlockedLessonIds)
        ? data.unlockedLessonIds.map(String)
        : [],
      totalXp: Number(data?.totalXp ?? 0),
      streak: Number(data?.streak ?? 0),
    };
  } catch (err) {
    console.error("COURSE PROGRESS API FAILED", err);
    return getFallbackCourseProgress(normalizedCourseId);
  }
}

export async function completeLesson(lessonId: string) {
  const res = await api.post(`/lessons/${lessonId}/complete`);
  return extractData<any>(res.data);
}
