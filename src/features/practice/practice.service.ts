import { api } from "@/lib/api";

import {
  PracticeAttemptPayload,
  PracticeAttemptResult,
  PracticeDetails,
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
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTaskType(value: unknown): PracticeTaskType {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (
    normalized === "single_choice" ||
    normalized === "multiple_choice" ||
    normalized === "fill_in_blank" ||
    normalized === "matching" ||
    normalized === "ordering" ||
    normalized === "speaking" ||
    normalized === "listening" ||
    normalized === "writing"
  ) {
    return normalized;
  }

  return "unknown";
}

function normalizeOption(raw: any, index: number): PracticeTaskOption {
  if (typeof raw === "string") {
    return {
      id: `${index + 1}`,
      text: raw,
    };
  }

  return {
    id: String(raw?.id ?? raw?._id ?? raw?.value ?? index + 1),
    text: String(raw?.text ?? raw?.label ?? raw?.value ?? ""),
  };
}

function normalizeTask(raw: any, index: number): PracticeTask {
  const optionsSource = Array.isArray(raw?.options)
    ? raw.options
    : Array.isArray(raw?.choices)
      ? raw.choices
      : [];

  return {
    id: String(raw?.id ?? raw?._id ?? `task-${index + 1}`),
    type: normalizeTaskType(raw?.type ?? raw?.taskType ?? raw?.kind),
    prompt: String(raw?.prompt ?? raw?.question ?? raw?.text ?? ""),
    options: optionsSource.map((option: unknown, optionIndex: number) =>
      normalizeOption(option, optionIndex),
    ),
    order: toNumberOrNull(raw?.order ?? raw?.position ?? index + 1) ?? index + 1,
  };
}

function normalizePracticeSummary(raw: any): PracticeSummary {
  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    title: String(raw?.title ?? raw?.name ?? ""),
    subtitle: toStringOrNull(raw?.subtitle ?? raw?.tagline),
    description: toStringOrNull(raw?.description),
    lessonId: toStringOrNull(raw?.lessonId ?? raw?.lesson?._id ?? raw?.lesson?.id),
    difficulty: toStringOrNull(raw?.difficulty ?? raw?.level),
    type: toStringOrNull(raw?.type ?? raw?.practiceType ?? raw?.category),
    estimatedDurationMinutes: toNumberOrNull(
      raw?.estimatedDurationMinutes ?? raw?.durationMinutes ?? raw?.duration,
    ),
    tasksCount: toNumberOrNull(raw?.tasksCount ?? raw?.questionsCount ?? raw?.tasks?.length) ?? 0,
    xpReward: toNumberOrNull(raw?.xpReward ?? raw?.xp ?? raw?.rewardXp),
    maxDailyXp: toNumberOrNull(raw?.maxDailyXp ?? raw?.dailyXpCap),
  };
}

function normalizePracticeDetails(raw: any): PracticeDetails {
  const summary = normalizePracticeSummary(raw);
  const tasksSource = Array.isArray(raw?.tasks)
    ? raw.tasks
    : Array.isArray(raw?.questions)
      ? raw.questions
      : [];

  return {
    ...summary,
    instructions: toStringOrNull(raw?.instructions),
    tasks: tasksSource.map((task: any, index: number) => normalizeTask(task, index)),
  };
}

function normalizeAttemptResult(raw: any): PracticeAttemptResult {
  return {
    attemptId: String(raw?.attemptId ?? raw?.id ?? raw?._id ?? ""),
    score: toNumberOrNull(raw?.score ?? raw?.percentage),
    correctAnswers: toNumberOrNull(raw?.correctAnswers ?? raw?.correctCount),
    totalQuestions: toNumberOrNull(raw?.totalQuestions ?? raw?.questionsCount),
    passed: typeof raw?.passed === "boolean" ? raw.passed : null,
    feedback: toStringOrNull(raw?.feedback ?? raw?.message),
  };
}

export const practiceService = {
  async getPractices(): Promise<PracticeSummary[]> {
    const response = await api.get("/practice");
    const payload = extractData<any>(response.data);

    return Array.isArray(payload)
      ? payload.map((item: any) => normalizePracticeSummary(item))
      : [];
  },

  async getPracticeById(practiceId: string): Promise<PracticeDetails> {
    const normalizedPracticeId = practiceId.trim();
    const response = await api.get(
      `/practice/${encodeURIComponent(normalizedPracticeId)}`,
    );

    return normalizePracticeDetails(extractData<any>(response.data));
  },

  async submitAttempt(
    practiceId: string,
    payload: PracticeAttemptPayload,
  ): Promise<PracticeAttemptResult> {
    const normalizedPracticeId = practiceId.trim();
    const response = await api.post(
      `/practice/${encodeURIComponent(normalizedPracticeId)}/attempt`,
      payload,
    );

    return normalizeAttemptResult(extractData<any>(response.data));
  },
};
