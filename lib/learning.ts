import { api } from "@/lib/api";
import { NormalizedLevelId } from "@/src/features/learning/routes";

export type LessonContentType =
  | "video"
  | "text"
  | "quiz"
  | "audio"
  | "pronunciation"
  | "image"
  | "syllable_builder"
  | "word_builder"
  | "hero_intro"
  | "next_steps"
  | "alphabet_preview"
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
  glossary?: LessonGlossaryItem[];
  text?: string;
  textMn?: string;
  textEn?: string;
  videoUrl?: string;
  quizId?: string;
  quiz_link?: string;
  quizLink?: string;
  quiz_id?: string;
  url?: string;
  steps?: string[];
  stats?: {
    label: string;
    value: number;
  }[];
  patterns?: any[];
  words?: any[];
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

export type LessonGlossaryItem = {
  word: string;
  translation: string;
  noteMn?: string;
  noteEn?: string;
};

export type LessonContentItem = {
  id: string;
  type: LessonContentType;
  order: number;
  title?: string;
  titleEn?: string;
  content: LessonContentPayload;
};

export type LessonListItem = {
  id: string;
  unitId: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  order: number;
  xpReward: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent?: boolean;
};

export type LessonEmbeddedUnit = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  lessonCount: number;
  completedLessonCount: number;
  progress: number;
};

export type LessonDetail = LessonListItem & {
  hasQuiz?: boolean;
  quizId?: string | null;
  quizPassingScore?: number | null;
  contents: LessonContentItem[];
  previousLessonId: string | null;
  nextLessonId: string | null;
  unit: LessonEmbeddedUnit | null;
};

export type UnitListItem = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  gradient: [string, string];
  levelId: string;
  lessonsCount: number;
  completedLessonsCount: number;
  unlockedLessonsCount: number;
  progress: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  currentLessonId: string | null;
  firstUnlockedLessonId: string | null;
};

export type UnitDetail = UnitListItem & {
  lessons: LessonListItem[];
};

export type LessonProgressState =
  | "locked"
  | "unlocked"
  | "current"
  | "completed";

export type UnitProgressState =
  | "locked"
  | "unlocked"
  | "in_progress"
  | "completed";

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

function normalizeCourseId(courseId: string) {
  return courseId.trim().toLowerCase();
}

function mapLesson(raw: any, order = 1): LessonListItem {
  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    unitId: String(raw?.unitId ?? ""),
    title: String(raw?.title ?? "Lesson"),
    titleEn: raw?.titleEn ? String(raw.titleEn) : undefined,
    subtitle: String(raw?.subtitle ?? raw?.description ?? ""),
    subtitleEn: raw?.subtitleEn ? String(raw.subtitleEn) : undefined,
    order: Number(raw?.order ?? order),
    xpReward: Number(raw?.xpReward ?? raw?.xp ?? 0),
    isCompleted: Boolean(raw?.isCompleted ?? raw?.completed ?? false),
    isUnlocked: Boolean(raw?.isUnlocked ?? raw?.unlocked ?? false),
    isCurrent: Boolean(raw?.isCurrent ?? raw?.current ?? false),
  };
}

function mapEmbeddedUnit(raw: any): LessonEmbeddedUnit | null {
  if (!raw) {
    return null;
  }

  const lessonCount = Math.max(0, Number(raw?.lessonCount ?? 0));
  const completedLessonCount = Math.max(
    0,
    Number(raw?.completedLessonCount ?? 0),
  );

  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    title: String(raw?.title ?? "Unit"),
    subtitle: String(raw?.subtitle ?? ""),
    description: String(raw?.description ?? ""),
    order: Math.max(1, Number(raw?.order ?? 1)),
    lessonCount,
    completedLessonCount,
    progress:
      lessonCount > 0
        ? Math.round((completedLessonCount / lessonCount) * 100)
        : 0,
  };
}

type BackendUnitResponse = {
  id?: string;
  _id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  order?: number;
  lessonCount?: number;
  completedLessonCount?: number;
  unlockedLessonCount?: number;
  isUnlocked?: boolean;
  isCompleted?: boolean;
};

type BackendCourseUnitsPayload = {
  courseId?: string;
  units?: BackendUnitResponse[];
};

const inFlightCourseUnitsRequests = new Map<
  NormalizedLevelId,
  Promise<UnitListItem[]>
>();

export function getLessonProgressState(
  lesson: Pick<
    LessonListItem,
    "isCompleted" | "isUnlocked" | "id" | "isCurrent"
  >,
  currentLessonId?: string | null,
): LessonProgressState {
  if (lesson.isCompleted) {
    return "completed";
  }

  if (lesson.isCurrent) {
    return "current";
  }

  if (currentLessonId && lesson.id === currentLessonId) {
    return "current";
  }

  if (lesson.isUnlocked) {
    return "unlocked";
  }

  return "locked";
}

export function getUnitProgressState(
  unit: Pick<
    UnitListItem,
    "isCompleted" | "isUnlocked" | "currentLessonId" | "completedLessonsCount"
  >,
): UnitProgressState {
  if (unit.isCompleted) {
    return "completed";
  }

  if (unit.currentLessonId || unit.completedLessonsCount > 0) {
    return "in_progress";
  }

  if (unit.isUnlocked) {
    return "unlocked";
  }

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

export async function fetchCourseProgress(
  courseId: string,
): Promise<CourseProgress> {
  const normalizedCourseId = normalizeCourseId(courseId);

  try {
    const res = await api.get(
      `/me/progress?courseId=${encodeURIComponent(normalizedCourseId)}`,
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
    console.error("COURSE PROGRESS API FAILED", err);
    return getFallbackCourseProgress(normalizedCourseId);
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
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
};

function isValidGradient(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    value[0].trim().length > 0 &&
    typeof value[1] === "string" &&
    value[1].trim().length > 0
  );
}

const LEVEL_UNLOCK_PREREQUISITES: Partial<
  Record<Uppercase<NormalizedLevelId>, Uppercase<NormalizedLevelId> | null>
> = {
  B1: null,
  M1: "B1",
  M2: "M1",
  M3: "M2",
  M4: "M3",
};

function getLevelCompletion(units: UnitListItem[]): boolean {
  const existingUnits = units.filter((unit) => unit.id);
  return (
    existingUnits.length > 0 &&
    existingUnits.every((unit) => unit.isCompleted === true)
  );
}

export async function fetchLevels(): Promise<LevelItem[]> {
  try {
    const res = await api.get("/content/levels");
    const data = extractData<any[]>(res.data);

    if (!Array.isArray(data)) {
      return [];
    }

    const baseLevels = data.map((item) => ({
      id: String(item?.id ?? "").trim().toUpperCase(),
      title: String(item?.title ?? ""),
      subtitle: String(item?.subtitle ?? ""),
      description: String(item?.description ?? ""),
      vocabularyReady: Boolean(item?.vocabularyReady),
      vocabularyCount: Number(item?.vocabularyCount ?? 0),
      gradient: (
        isValidGradient(item?.gradient)
          ? [item.gradient[0].trim(), item.gradient[1].trim()]
          : ["#334155", "#1E293B"]
      ) as [string, string],
      fallbackIsUnlocked: Boolean(item?.isUnlocked ?? item?.unlocked),
      fallbackIsCompleted: Boolean(item?.isCompleted ?? item?.completed),
    }));

    const levelsWithCompletion = await Promise.all(
      baseLevels.map(async (level) => {
        const normalizedLevelId = normalizeCourseId(level.id) as NormalizedLevelId;

        try {
          const units = await fetchCourseUnits(normalizedLevelId);
          const completedUnits = units.filter((unit) => unit.isCompleted).length;
          const totalUnits = units.length;
          const progress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

          return {
            ...level,
            isCompleted: getLevelCompletion(units),
            progress,
          };
        } catch {
          return {
            ...level,
            isCompleted: level.fallbackIsCompleted,
            progress: level.fallbackIsCompleted ? 100 : 0,
          };
        }
      }),
    );

    const completionByLevelId = new Map(
      levelsWithCompletion.map((level) => [level.id, level.isCompleted]),
    );

    return levelsWithCompletion.map(
      ({ fallbackIsUnlocked, fallbackIsCompleted: _unusedCompleted, ...level }) => {
        const prerequisiteLevelId = LEVEL_UNLOCK_PREREQUISITES[
          level.id as Uppercase<NormalizedLevelId>
        ];

        const isUnlocked =
          prerequisiteLevelId === null
            ? true
            : prerequisiteLevelId
              ? Boolean(completionByLevelId.get(prerequisiteLevelId))
              : fallbackIsUnlocked;

        return {
          ...level,
          isUnlocked,
        };
      },
    );
  } catch (err) {
    console.error("LEVELS API FAILED", err);
    return [];
  }
}

function getFallbackUnitGradient(order: number): [string, string] {
  const gradients: [string, string][] = [
    ["#2563EB", "#0EA5E9"],
    ["#0F766E", "#14B8A6"],
    ["#7C3AED", "#DB2777"],
    ["#EA580C", "#F59E0B"],
  ];

  return gradients[(Math.max(order, 1) - 1) % gradients.length];
}

function mapUnit(
  levelId: NormalizedLevelId,
  raw: BackendUnitResponse,
): Omit<UnitListItem, "currentLessonId" | "firstUnlockedLessonId"> {
  const order = Math.max(1, Number(raw?.order ?? 1));
  const lessonsCount = Math.max(0, Number(raw?.lessonCount ?? 0));
  const completedLessonsCount = Math.max(
    0,
    Number(raw?.completedLessonCount ?? 0),
  );
  const unlockedLessonsCount = Math.max(
    0,
    Number(raw?.unlockedLessonCount ?? 0),
  );

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
    progress:
      lessonsCount > 0
        ? Math.round((completedLessonsCount / lessonsCount) * 100)
        : 0,
    isUnlocked: Boolean(raw?.isUnlocked),
    isCompleted: Boolean(raw?.isCompleted),
  };
}

function attachLessonState(
  unit: Omit<UnitListItem, "currentLessonId" | "firstUnlockedLessonId">,
  lessons: LessonListItem[],
): UnitListItem {
  const currentLesson = lessons.find(
    (lesson) => lesson.isUnlocked && !lesson.isCompleted,
  );
  const firstUnlockedLesson = lessons.find((lesson) => lesson.isUnlocked);

  return {
    ...unit,
    currentLessonId: currentLesson?.id ?? null,
    firstUnlockedLessonId: firstUnlockedLesson?.id ?? null,
  };
}

async function fetchCourseUnits(
  levelId: NormalizedLevelId,
): Promise<UnitListItem[]> {
  const normalizedCourseId = normalizeCourseId(levelId) as NormalizedLevelId;
  const existingRequest = inFlightCourseUnitsRequests.get(normalizedCourseId);

  if (existingRequest) {
    return existingRequest;
  }

  const requestPath = `/courses/${encodeURIComponent(normalizedCourseId)}/units`;
  const request = (async () => {
    try {
      const res = await api.get(requestPath);
      const data = extractData<BackendCourseUnitsPayload>(res.data);
      const units = Array.isArray(data?.units) ? data.units : [];

      return units
        .map((unit) => mapUnit(normalizedCourseId, unit))
        .filter((unit) => unit.id)
        .map((unit) => ({
          ...unit,
          currentLessonId: null,
          firstUnlockedLessonId: null,
        }))
        .sort((a, b) => a.order - b.order);
    } catch (err: any) {
      console.error("[learning][api] request failed", {
        path: requestPath,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    } finally {
      inFlightCourseUnitsRequests.delete(normalizedCourseId);
    }
  })();

  inFlightCourseUnitsRequests.set(normalizedCourseId, request);
  return request;
}

export async function fetchLevelUnits(
  levelId: NormalizedLevelId,
): Promise<UnitListItem[]> {
  return fetchCourseUnits(levelId);
}

export async function fetchUnitDetail(
  levelId: NormalizedLevelId,
  unitId: string,
): Promise<UnitDetail | null> {
  const units = await fetchCourseUnits(levelId);
  const unit = units.find((item) => item.id === unitId);

  if (!unit) {
    return null;
  }

  const lessons = await fetchUnitLessons(unitId);

  return {
    ...attachLessonState(unit, lessons),
    lessons,
  };
}

export async function fetchUnitLessons(
  unitId: string,
): Promise<LessonListItem[]> {
  try {
    const res = await api.get(`/units/${unitId}/lessons`);

    const data = extractData<any[]>(res.data);

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((lesson, index) => mapLesson(lesson, index + 1));
  } catch (err: any) {
    console.error("UNIT LESSONS API FAILED UNIT ID:", unitId);
    console.error("UNIT LESSONS ERROR RESPONSE:", err?.response?.data);
    console.error("UNIT LESSONS API FAILED -> fallback", err);
    return [];
  }
}

export async function fetchLessonDetail(
  lessonId: string,
): Promise<LessonDetail | null> {
  try {
    const res = await api.get(`/lessons/${lessonId}`);

    const data = extractData<any>(res.data);

    const contents = Array.isArray(data?.contents)
      ? data.contents.map((item: any, index: number) => ({
        id: String(
          item?.id ?? item?._id ?? `${lessonId}-content-${index + 1}`,
        ),
        type: (item?.type ?? "text") as LessonContentType,
        order: Number(item?.order ?? index + 1),
        title: item?.title,
        titleEn: item?.titleEn,
        content: {
          glossary: Array.isArray(item?.content?.glossary)
            ? item.content.glossary.map((glossaryItem: any) => ({
              word: String(glossaryItem?.word ?? ""),
              translation: String(glossaryItem?.translation ?? ""),
              noteMn: glossaryItem?.noteMn
                ? String(glossaryItem.noteMn)
                : undefined,
              noteEn: glossaryItem?.noteEn
                ? String(glossaryItem.noteEn)
                : undefined,
            }))
            : undefined,
          text: item?.content?.text,
          textMn: item?.content?.textMn,
          textEn: item?.content?.textEn,
          videoUrl: item?.content?.videoUrl,
          quizId: item?.content?.quizId,
          quiz_link: item?.content?.quiz_link,
          quizLink: item?.content?.quizLink,
          quiz_id: item?.content?.quiz_id,
          url: item?.content?.url,
          steps: item?.content?.steps,
          stats: item?.content?.stats,
          patterns: item?.content?.patterns,
          words: item?.content?.words,
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
    const hasQuiz =
      data?.hasQuiz === true ||
      data?.hasQuiz === "true" ||
      (data?.quizId !== undefined &&
        data?.quizId !== null &&
        String(data.quizId).length > 0);

    return {
      ...mapLesson(data),
      hasQuiz,
      quizId: data?.quizId ? String(data.quizId) : null,
      quizPassingScore:
        data?.quizPassingScore !== undefined && data?.quizPassingScore !== null
          ? Number(data.quizPassingScore)
          : null,
      contents,
      previousLessonId: data?.previousLessonId
        ? String(data.previousLessonId)
        : null,
      nextLessonId: data?.nextLessonId ? String(data.nextLessonId) : null,
      unit: mapEmbeddedUnit(data?.unit),
    };
  } catch (err) {
    console.error("LESSON DETAIL API FAILED", err);
    return null;
  }
}

export async function completeLesson(lessonId: string) {
  const res = await api.post(`/lessons/${lessonId}/complete`);
  return extractData<any>(res.data);
}
