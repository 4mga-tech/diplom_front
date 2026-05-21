export type PracticeTaskType =
  | "single_choice"
  | "multiple_choice"
  | "fill_in_blank"
  | "matching"
  | "ordering"
  | "speaking"
  | "listening"
  | "writing"
  | "missing_letter"
  | "letter_match"
  | "meaning_match"
  | "word_builder"
  | "daily_challenge"
  | "unknown";

export type PracticeSummary = {
  id: string;
  type: string | null;
  levelId: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  xpReward: number | null;
  maxDailyXp: number | null;
  dailyAttemptLimit: number | null;
  config: Record<string, unknown> | null;
  lessonId: string | null;
  difficulty: string | null;
  estimatedDurationMinutes: number | null;
  tasksCount: number;
};

export type PracticeTaskOption = {
  id: string;
  text: string;
  label?: string;
  imageUrl?: string | null;
  result?: string | null;
  meaningEn?: string | null;
};

export type PracticeTask = {
  id: string;
  type: PracticeTaskType;
  prompt: string;
  options: PracticeTaskOption[];
  order: number;
  correctOptionId: string | null;
  correctAnswer: string | null;
  result?: string | null;
  meaningEn?: string | null;
};

export type PracticeRoadmapStage = {
  id: string;
  title: string;
  subtitle: string | null;
  order: number;
  xpReward: number;
  isUnlocked: boolean;
  questionIds: string[];
};

export type PracticeDetails = PracticeSummary & {
  instructions: string | null;
  tasks: PracticeTask[];
  roadmap: PracticeRoadmapStage[];
};

export type PracticeAttemptPayload = {
  score: number;
  correctCount: number;
  totalCount: number;
  stageId?: string;
};

export type PracticeAttemptResult = {
  attemptId: string;
  score: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  passed: boolean | null;
  feedback: string | null;
  xpEarned: number | null;
  dailyXpEarned: number | null;
  dailyXpLimit: number | null;
  xpCapped: boolean | null;
};
