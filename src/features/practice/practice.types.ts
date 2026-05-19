export type PracticeTaskType =
  | "single_choice"
  | "multiple_choice"
  | "fill_in_blank"
  | "matching"
  | "ordering"
  | "speaking"
  | "listening"
  | "writing"
  | "unknown";

export type PracticeSummary = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  type: string | null;
  lessonId: string | null;
  difficulty: string | null;
  estimatedDurationMinutes: number | null;
  tasksCount: number;
  xpReward: number | null;
  maxDailyXp: number | null;
};

export type PracticeTaskOption = {
  id: string;
  text: string;
};

export type PracticeTask = {
  id: string;
  type: PracticeTaskType;
  prompt: string;
  options: PracticeTaskOption[];
  order: number;
};

export type PracticeDetails = PracticeSummary & {
  instructions: string | null;
  tasks: PracticeTask[];
};

export type PracticeAttemptPayload = {
  answers: Array<{
    taskId: string;
    answer: string | string[];
  }>;
};

export type PracticeAttemptResult = {
  attemptId: string;
  score: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  passed: boolean | null;
  feedback: string | null;
};
