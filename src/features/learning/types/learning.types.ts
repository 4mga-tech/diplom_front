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

export type LessonGlossaryItem = {
  word: string;
  translation: string;
  noteMn?: string;
  noteEn?: string;
};

export type LessonContentPayload = {
  glossary?: LessonGlossaryItem[];
  text?: string;
  textMn?: string;
  textEn?: string;
  videoUrl?: string;
  quizId?: string;
  url?: string;
  steps?: string[];
  stats?: { label: string; value: number }[];
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

export type LessonProgressState = "locked" | "unlocked" | "current" | "completed";
export type UnitProgressState = "locked" | "unlocked" | "in_progress" | "completed";

export type CourseProgress = {
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  totalXp: number;
  streak: number;
};

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

export type BackendUnitResponse = {
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

export type BackendCourseUnitsPayload = {
  courseId?: string;
  units?: BackendUnitResponse[];
};
