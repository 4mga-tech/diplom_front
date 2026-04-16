import { api } from "@/lib/api";

export type LessonContentType =
  | "video"
  | "text"
  | "quiz"
  | "audio"
  | "pronunciation"
  | "image"
  | "alphabet_table"
  | "classification"
  | "grammar_note"
  | "vocab_list"
  | "exercise_repeat"
  | "exercise_write"
  | "exercise_fill"
  | "exercise_word_build"
  | "quiz_link";

export type LessonContentPayload = {
  text?: string;
  textMn?: string;
  textEn?: string;
  videoUrl?: string;
  quizId?: string;
  url?: string;

  letter?: string;
  transliteration?: string;
  pronunciationTip?: string;
  exampleWord?: string;
  exampleMeaning?: string;
  audioUrl?: string;

  imageUrl?: string;
  caption?: string;

  letters?: any[];
  groups?: any[];
  notes?: string[];
  items?: any[];
  rows?: any[];
  questions?: any[];
  example?: any;
  instructionMn?: string;
  instructionEn?: string;
  summary?: string;
  columns?: string[];
  patternLetters?: string[];
  lines?: string[];
};

export type LessonContentItem = {
  id: string;
  type: LessonContentType;
  order: number;
  title?: string;
  content: LessonContentPayload;
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

function mapLesson(raw: any, order = 1): LessonListItem {
  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    unitId: String(raw?.unitId ?? ""),
    title: String(raw?.title ?? "Lesson"),
    subtitle: String(raw?.subtitle ?? raw?.description ?? ""),
    order: Number(raw?.order ?? order),
    xpReward: Number(raw?.xpReward ?? raw?.xp ?? 0),
    isCompleted: Boolean(raw?.isCompleted ?? raw?.completed ?? false),
    isUnlocked: Boolean(raw?.isUnlocked ?? raw?.unlocked ?? false),
  };
}

export function getFallbackCourseProgress(_courseId: string): CourseProgress {
  return {
    completedLessonIds: [],
    unlockedLessonIds: [],
    totalXp: 0,
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
  } catch (err) {
    console.log("COURSE PROGRESS API FAILED", err);
    return getFallbackCourseProgress(courseId);
  }
}
export type LevelItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  vocabularyReady: boolean;
  vocabularyCount: number;
  gradient: [string, string];
};

export async function fetchLevels(): Promise<LevelItem[]> {
  try {
    const res = await api.get("/content/levels");
    // console.log("LEVELS API RAW:", JSON.stringify(res.data, null, 2));
    const data = extractData<any[]>(res.data);

    return Array.isArray(data)
      ? data.map((item) => ({
          id: String(item?.id ?? ""),
          title: String(item?.title ?? ""),
          subtitle: String(item?.subtitle ?? ""),
          description: String(item?.description ?? ""),
          vocabularyReady: Boolean(item?.vocabularyReady),
          vocabularyCount: Number(item?.vocabularyCount ?? 0),

          gradient: Array.isArray(item?.gradient)
            ? [String(item.gradient[0]), String(item.gradient[1])]
            : ["#2563EB", "#06B6D4"],
        }))
      : [];
  } catch (err) {
    console.log("LEVELS API FAILED", err);
    return [];
  }
}
export function getFallbackUnitLessons(_unitId: string): LessonListItem[] {
  return [];
}

export async function fetchUnitLessons(
  unitId: string,
): Promise<LessonListItem[]> {
  try {
    // console.log("REQUEST UNIT ID:", unitId);
    const res = await api.get(`/units/${unitId}/lessons`);
    // console.log("UNIT LESSONS API RAW:", JSON.stringify(res.data, null, 2));

    const data = extractData<any[]>(res.data);

    if (!Array.isArray(data)) {
      // console.log("UNIT LESSONS -> fallback because data is not array");
      return [];
    }

    return data.map((lesson, index) => mapLesson(lesson, index + 1));
  } catch (err: any) {
    console.log("UNIT LESSONS API FAILED UNIT ID:", unitId);
    console.log("UNIT LESSONS ERROR RESPONSE:", err?.response?.data);
    console.log("UNIT LESSONS API FAILED -> fallback", err);
    return getFallbackUnitLessons(unitId);
  }
}

export async function fetchLessonDetail(
  lessonId: string,
): Promise<LessonDetail | null> {
  try {
    const res = await api.get(`/lessons/${lessonId}`);
    // console.log("LESSON DETAIL API RAW:", JSON.stringify(res.data, null, 2));

    const data = extractData<any>(res.data);

    const contents = Array.isArray(data?.contents)
      ? data.contents.map((item: any, index: number) => ({
          id: String(
            item?.id ?? item?._id ?? `${lessonId}-content-${index + 1}`,
          ),
          type: (item?.type ?? "text") as LessonContentType,
          order: Number(item?.order ?? index + 1),
          title: item?.title,
          content: {
            text: item?.content?.text,
            textMn: item?.content?.textMn,
            textEn: item?.content?.textEn,
            videoUrl: item?.content?.videoUrl,
            quizId: item?.content?.quizId,
            url: item?.content?.url,

            letter: item?.content?.letter,
            transliteration: item?.content?.transliteration,
            pronunciationTip: item?.content?.pronunciationTip,
            exampleWord: item?.content?.exampleWord,
            exampleMeaning: item?.content?.exampleMeaning,
            audioUrl: item?.content?.audioUrl,

            imageUrl: item?.content?.imageUrl,
            caption: item?.content?.caption,

            letters: item?.content?.letters,
            groups: item?.content?.groups,
            notes: item?.content?.notes,
            items: item?.content?.items,
            rows: item?.content?.rows,
            questions: item?.content?.questions,
            example: item?.content?.example,
            instructionMn: item?.content?.instructionMn,
            instructionEn: item?.content?.instructionEn,
            summary: item?.content?.summary,
            columns: item?.content?.columns,
            patternLetters: item?.content?.patternLetters,
            lines: item?.content?.lines,
          },
        }))
      : [];

    return {
      ...mapLesson(data),
      contents,
    };
  } catch (err) {
    console.log("LESSON DETAIL API FAILED", err);
    return null;
  }
}

export async function completeLesson(lessonId: string) {
  const res = await api.post(`/lessons/${lessonId}/complete`);
  return extractData<any>(res.data);
}
