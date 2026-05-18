import {
  LessonContentItem,
  LessonContentType,
  LessonDetail,
  LessonEmbeddedUnit,
  LessonListItem,
} from "@/src/features/learning/types/learning.types";

export function mapLesson(raw: any, order = 1): LessonListItem {
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

export function mapEmbeddedUnit(raw: any): LessonEmbeddedUnit | null {
  if (!raw) return null;

  const lessonCount = Math.max(0, Number(raw?.lessonCount ?? 0));
  const completedLessonCount = Math.max(0, Number(raw?.completedLessonCount ?? 0));

  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    title: String(raw?.title ?? "Unit"),
    subtitle: String(raw?.subtitle ?? ""),
    description: String(raw?.description ?? ""),
    order: Math.max(1, Number(raw?.order ?? 1)),
    lessonCount,
    completedLessonCount,
    progress: lessonCount > 0 ? Math.round((completedLessonCount / lessonCount) * 100) : 0,
  };
}

export function mapLessonContents(data: any, lessonId: string): LessonContentItem[] {
  return Array.isArray(data?.contents)
    ? data.contents.map((item: any, index: number) => ({
      id: String(item?.id ?? item?._id ?? `${lessonId}-content-${index + 1}`),
      type: (item?.type ?? "text") as LessonContentType,
      order: Number(item?.order ?? index + 1),
      title: item?.title,
      titleEn: item?.titleEn,
      content: {
        glossary: Array.isArray(item?.content?.glossary)
          ? item.content.glossary.map((glossaryItem: any) => ({
            word: String(glossaryItem?.word ?? ""),
            translation: String(glossaryItem?.translation ?? ""),
            noteMn: glossaryItem?.noteMn ? String(glossaryItem.noteMn) : undefined,
            noteEn: glossaryItem?.noteEn ? String(glossaryItem.noteEn) : undefined,
          }))
          : undefined,
        text: item?.content?.text,
        textMn: item?.content?.textMn,
        textEn: item?.content?.textEn,
        videoUrl: item?.content?.videoUrl,
        quizId: item?.content?.quizId,
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
}

export function mapLessonDetail(data: any, lessonId: string): LessonDetail {
  const hasQuiz =
    data?.hasQuiz === true ||
    data?.hasQuiz === "true" ||
    (data?.quizId !== undefined && data?.quizId !== null && String(data.quizId).length > 0);

  return {
    ...mapLesson(data),
    hasQuiz,
    quizId: data?.quizId ? String(data.quizId) : null,
    quizPassingScore:
      data?.quizPassingScore !== undefined && data?.quizPassingScore !== null
        ? Number(data.quizPassingScore)
        : null,
    contents: mapLessonContents(data, lessonId),
    previousLessonId: data?.previousLessonId ? String(data.previousLessonId) : null,
    nextLessonId: data?.nextLessonId ? String(data.nextLessonId) : null,
    unit: mapEmbeddedUnit(data?.unit),
  };
}
