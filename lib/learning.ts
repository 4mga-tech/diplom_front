import { api } from "@/lib/api";
import { LESSONS, UNITS } from "@/src/data/curriculum";

export type LessonContentItem = {
  id: string;
  type: "video" | "text" | "quiz";
  order: number;
  title?: string;
  content: {
    text?: string;
    videoUrl?: string;
    quizId?: string;
  };
};

export type LessonListItem = {
  id: string;
  unitId: string;
  title: string;
  subtitle: string;
  order: number;
  xpReward: number;
  isCompleted: boolean;
  isUnlocked: boolean;
};

export type LessonDetail = LessonListItem & {
  contents: LessonContentItem[];
};

export type CourseProgress = {
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  totalXp: number;
  streak: number;
};

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

function mapLesson(
  raw: any,
  fallback?: (typeof LESSONS)[number],
  order = 1,
): LessonListItem {
  return {
    id: String(raw?.id ?? raw?._id ?? fallback?.id ?? ""),
    unitId: String(raw?.unitId ?? fallback?.unitId ?? ""),
    title: String(raw?.title ?? fallback?.title ?? "Lesson"),
    subtitle: String(
      raw?.subtitle ?? raw?.description ?? fallback?.subtitle ?? "",
    ),
    order: Number(raw?.order ?? order),
    xpReward: Number(raw?.xpReward ?? raw?.xp ?? fallback?.xp ?? 0),
    isCompleted: Boolean(
      raw?.isCompleted ?? raw?.completed ?? fallback?.done ?? false,
    ),
    isUnlocked: Boolean(raw?.isUnlocked ?? raw?.unlocked ?? !fallback?.locked),
  };
}

export function getFallbackCourseProgress(courseId: string): CourseProgress {
  const unitIds = UNITS.filter((unit) => unit.levelId === courseId).map(
    (unit) => unit.id,
  );
  const lessons = LESSONS.filter((lesson) => unitIds.includes(lesson.unitId));

  return {
    completedLessonIds: lessons
      .filter((lesson) => lesson.done)
      .map((lesson) => lesson.id),
    unlockedLessonIds: lessons
      .filter((lesson) => !lesson.locked)
      .map((lesson) => lesson.id),
    totalXp: lessons
      .filter((lesson) => lesson.done)
      .reduce((sum, lesson) => sum + lesson.xp, 0),
    streak: 0,
  };
}

export async function fetchCourseProgress(
  courseId: string,
): Promise<CourseProgress> {
  try {
    const res = await api.get(
      `/me/progress?courseId=${encodeURIComponent(courseId)}`,
    );
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
  } catch {
    return getFallbackCourseProgress(courseId);
  }
}

export function getFallbackUnitLessons(unitId: string): LessonListItem[] {
  return LESSONS.filter((lesson) => lesson.unitId === unitId).map(
    (lesson, index) => mapLesson(lesson, lesson, index + 1),
  );
}

export async function fetchUnitLessons(
  unitId: string,
): Promise<LessonListItem[]> {
  try {
    const res = await api.get(`/units/${unitId}/lessons`);
    const data = extractData<any[]>(res.data);

    if (!Array.isArray(data)) {
      return getFallbackUnitLessons(unitId);
    }

    return data.map((lesson, index) => {
      const fallback = LESSONS.find(
        (item) => item.id === lesson?.id || item.id === lesson?._id,
      );
      return mapLesson(lesson, fallback, index + 1);
    });
  } catch {
    return getFallbackUnitLessons(unitId);
  }
}

export async function fetchLessonDetail(
  lessonId: string,
): Promise<LessonDetail | null> {
  try {
    const res = await api.get(`/lessons/${lessonId}`);
    const data = extractData<any>(res.data);
    const fallback = LESSONS.find((lesson) => lesson.id === lessonId);

    const contents = Array.isArray(data?.contents)
      ? data.contents.map((item: any, index: number) => ({
          id: String(
            item?.id ?? item?._id ?? `${lessonId}-content-${index + 1}`,
          ),
          type: (item?.type ?? "text") as LessonContentItem["type"],
          order: Number(item?.order ?? index + 1),
          title: item?.title,
          content: {
            text: item?.content?.text ?? item?.text,
            videoUrl: item?.content?.videoUrl ?? item?.videoUrl,
            quizId: item?.content?.quizId ?? item?.quizId,
          },
        }))
      : [];

    return {
      ...mapLesson(data, fallback),
      contents,
    };
  } catch {
    const fallback = LESSONS.find((lesson) => lesson.id === lessonId);
    if (!fallback) return null;

    return {
      ...mapLesson(fallback, fallback),
      contents: [
        {
          id: `${fallback.id}-overview`,
          type: "text",
          order: 1,
          title: "Overview",
          content: {
            text:
              fallback.subtitle ||
              "Lesson content will appear here once the backend endpoint is ready.",
          },
        },
      ],
    };
  }
}

export async function completeLesson(lessonId: string) {
  const res = await api.post(`/lessons/${lessonId}/complete`);
  return extractData<any>(res.data);
}
