import { api } from "@/lib/api";
import { mapLesson, mapLessonDetail } from "@/src/features/learning/mappers/lesson.mapper";
import { LessonDetail, LessonListItem } from "@/src/features/learning/types/learning.types";

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

export async function fetchUnitLessons(unitId: string): Promise<LessonListItem[]> {
  try {
    const res = await api.get(`/units/${unitId}/lessons`);
    const data = extractData<any[]>(res.data);
    if (!Array.isArray(data)) return [];
    return data.map((lesson, index) => mapLesson(lesson, index + 1));
  } catch (err: any) {
    console.error("UNIT LESSONS API FAILED UNIT ID:", unitId);
    console.error("UNIT LESSONS ERROR RESPONSE:", err?.response?.data);
    console.error("UNIT LESSONS API FAILED -> fallback", err);
    return [];
  }
}

export async function fetchLessonDetail(lessonId: string): Promise<LessonDetail | null> {
  try {
    const res = await api.get(`/lessons/${lessonId}`);
    const data = extractData<any>(res.data);
    return mapLessonDetail(data, lessonId);
  } catch (err) {
    console.error("LESSON DETAIL API FAILED", err);
    return null;
  }
}
