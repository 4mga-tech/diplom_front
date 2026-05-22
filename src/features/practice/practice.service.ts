import { api } from "@/lib/api";

import {
  PracticeAttemptPayload,
  PracticeAttemptResult,
  PracticeDetails,
  PracticeRoadmapStage,
  PracticeSummary,
  PracticeTask,
  PracticeTaskOption,
  PracticeTaskType,
} from "./practice.types";

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

function toNumberOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toRecordOrNull(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeTaskType(value: unknown): PracticeTaskType {
  const normalized = String(value ?? "").trim().toLowerCase() as PracticeTaskType;
  const allowed: PracticeTaskType[] = [
    "single_choice", "multiple_choice", "fill_in_blank", "matching", "ordering", "speaking", "listening", "writing",
    "missing_letter", "letter_match", "meaning_match", "word_builder", "daily_challenge", "sentence_order",
  ];
  return allowed.includes(normalized) ? normalized : "unknown";
}

function normalizeOption(raw: unknown, index: number): PracticeTaskOption {
  if (typeof raw === "string") return { id: `${index + 1}`, text: raw };
  const option = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(option.id ?? option._id ?? option.value ?? index + 1),
    text: String(option.text ?? option.label ?? option.value ?? ""),
    label: toStringOrNull(option.label) ?? String(option.text ?? option.value ?? ""),
    imageUrl: toStringOrNull(option.imageUrl ?? option.image_url) ?? undefined,
    result: toStringOrNull(option.result),
    meaningEn: toStringOrNull(option.meaningEn ?? option.meaning_en),
  };
}

function normalizeTask(raw: unknown, index: number): PracticeTask {
  const task = (raw ?? {}) as Record<string, unknown>;
  const optionsSource = Array.isArray(task.options)
    ? task.options
    : Array.isArray(task.choices)
      ? task.choices
      : [];

  return {
    id: String(task.id ?? task._id ?? `task-${index + 1}`),
    type: normalizeTaskType(task.type ?? task.taskType ?? task.kind),
    prompt: String(task.prompt ?? task.question ?? task.text ?? ""),
    options: optionsSource.map((option: unknown, optionIndex: number) => normalizeOption(option, optionIndex)),
    order: toNumberOrNull(task.order ?? task.position ?? index + 1) ?? index + 1,
    correctOptionId: toStringOrNull(task.correctOptionId ?? task.correctOption ?? task.correctChoiceId),
    correctAnswer: toStringOrNull(task.correctAnswer ?? task.answer),
    result: toStringOrNull(task.result),
    meaningEn: toStringOrNull(task.meaningEn ?? task.meaning_en),
    subtitle: toStringOrNull(task.subtitle),
    parts: Array.isArray(task.parts) ? task.parts.map((part) => String(part)).filter((part) => part.trim().length > 0) : undefined,
  };
}


function normalizeProgress(raw: unknown) {
  const progress = (raw ?? {}) as Record<string, unknown>;
  return {
    completedStages: toNumberOrNull(progress.completedStages) ?? 0,
    totalStages: toNumberOrNull(progress.totalStages) ?? 0,
    progressPercent: toNumberOrNull(progress.progressPercent) ?? 0,
    earnedXp: toNumberOrNull(progress.earnedXp) ?? 0,
    nextStageId: toStringOrNull(progress.nextStageId),
  };
}

function normalizePracticeSummary(raw: unknown): PracticeSummary {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(item.id ?? item._id ?? ""),
    type: toStringOrNull(item.type ?? item.practiceType ?? item.category),
    levelId: toStringOrNull(item.levelId ?? item.level?.toString?.()),
    title: String(item.title ?? item.name ?? ""),
    subtitle: toStringOrNull(item.subtitle ?? item.tagline),
    description: toStringOrNull(item.description),
    xpReward: toNumberOrNull(item.xpReward ?? item.xp ?? item.rewardXp),
    maxDailyXp: toNumberOrNull(item.maxDailyXp ?? item.dailyXpCap),
    dailyAttemptLimit: toNumberOrNull(item.dailyAttemptLimit),
    config: toRecordOrNull(item.config),
    lessonId: toStringOrNull(item.lessonId ?? (item.lesson as Record<string, unknown> | undefined)?._id ?? (item.lesson as Record<string, unknown> | undefined)?.id),
    difficulty: toStringOrNull(item.difficulty ?? item.level),
    estimatedDurationMinutes: toNumberOrNull(item.estimatedDurationMinutes ?? item.durationMinutes ?? item.duration),
    tasksCount: toNumberOrNull(item.tasksCount ?? item.questionsCount ?? ((item.tasks as unknown[] | undefined)?.length)) ?? 0,
    progress: item.progress ? normalizeProgress(item.progress) : null,
  };
}


function normalizeRoadmapStage(raw: unknown, index: number): PracticeRoadmapStage {
  const stage = (raw ?? {}) as Record<string, unknown>;
  const questionIds = Array.isArray(stage.questionIds) ? stage.questionIds.map((id) => String(id)) : [];
  return {
    id: String(stage.id ?? stage._id ?? `stage-${index + 1}`),
    title: String(stage.title ?? `Stage ${index + 1}`),
    subtitle: toStringOrNull(stage.subtitle),
    order: toNumberOrNull(stage.order ?? index + 1) ?? index + 1,
    xpReward: toNumberOrNull(stage.xpReward ?? stage.xp ?? 0) ?? 0,
    isUnlocked: Boolean(stage.isUnlocked),
    isCompleted: typeof stage.isCompleted === "boolean" ? stage.isCompleted : undefined,
    questionIds,
  };
}

function normalizePracticeDetails(raw: unknown): PracticeDetails {
  const details = (raw ?? {}) as Record<string, unknown>;
  const tasksSource = Array.isArray(details.tasks) ? details.tasks : Array.isArray(details.questions) ? details.questions : [];
  const roadmapSource = (details.config as Record<string, unknown> | undefined)?.roadmap;
  const roadmap = Array.isArray(roadmapSource)
    ? roadmapSource.map((stage: unknown, index: number) => normalizeRoadmapStage(stage, index))
    : [];

  return {
    ...normalizePracticeSummary(details),
    instructions: toStringOrNull(details.instructions),
    tasks: tasksSource.map((task: unknown, index: number) => normalizeTask(task, index)),
    roadmap,
  };
}

function normalizeAttemptResult(raw: unknown): PracticeAttemptResult {
  const result = (raw ?? {}) as Record<string, unknown>;
  return {
    attemptId: String(result.attemptId ?? result.id ?? result._id ?? ""),
    score: toNumberOrNull(result.score ?? result.percentage),
    correctAnswers: toNumberOrNull(result.correctAnswers ?? result.correctCount),
    totalQuestions: toNumberOrNull(result.totalQuestions ?? result.questionsCount),
    passed: typeof result.passed === "boolean" ? result.passed : null,
    feedback: toStringOrNull(result.feedback ?? result.message),
    xpEarned: toNumberOrNull(result.xpEarned ?? result.xp ?? result.awardedXp),
    dailyXpEarned: toNumberOrNull(result.dailyXpEarned),
    dailyXpLimit: toNumberOrNull(result.dailyXpLimit ?? result.maxDailyXp),
    xpCapped: typeof result.xpCapped === "boolean" ? result.xpCapped : null,
  };
}

export const practiceService = {
  async getPractices(): Promise<PracticeSummary[]> {
    const response = await api.get("/practice");
    const payload = extractData<unknown>(response.data);
    return Array.isArray(payload) ? payload.map((item) => normalizePracticeSummary(item)) : [];
  },
  async getPracticeById(practiceId: string): Promise<PracticeDetails> {
    const response = await api.get(`/practice/${encodeURIComponent(practiceId.trim())}`);
    return normalizePracticeDetails(extractData<unknown>(response.data));
  },
  async submitAttempt(practiceId: string, payload: PracticeAttemptPayload): Promise<PracticeAttemptResult> {
    const response = await api.post(`/practice/${encodeURIComponent(practiceId.trim())}/attempt`, payload);
    return normalizeAttemptResult(extractData<unknown>(response.data));
  },
};
