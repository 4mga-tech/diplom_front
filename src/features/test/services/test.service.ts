import { api } from "@/lib/api";

import {
  TestLevelSummary,
  TestOption,
  TestQuestion,
  TestQuestionSet,
  TestSubmitPayload,
  TestSubmitResult,
  TestType,
  TestTypeAvailabilityResponse,
} from "../types/test.types";

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeOption(raw: any, index: number): TestOption {
  if (typeof raw === "string") {
    return {
      id: `${index + 1}`,
      text: raw,
    };
  }

  return {
    id: String(raw?.id ?? raw?.value ?? raw?.key ?? index + 1),
    text: String(raw?.text ?? raw?.label ?? raw?.value ?? ""),
  };
}

function normalizeQuestion(
  raw: any,
  levelId: string,
  testType: TestType,
): TestQuestion {
  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    levelId: String(raw?.levelId ?? levelId).toLowerCase(),
    testType: (raw?.testType ?? testType) as TestType,
    question: String(raw?.question ?? raw?.prompt ?? raw?.text ?? ""),
    options: Array.isArray(raw?.options)
      ? raw.options.map((option: unknown, index: number) =>
          normalizeOption(option, index),
        )
      : [],
    explanation: raw?.explanation ? String(raw.explanation) : undefined,
  };
}

function normalizeSubmitResult(
  raw: any,
  payload: TestSubmitPayload,
): TestSubmitResult {
  return {
    levelId: payload.levelId,
    testType: payload.testType,
    score: toNumber(raw?.score ?? raw?.percentage),
    passed: Boolean(raw?.passed ?? raw?.isPassed ?? false),
    correctCount: toNumber(raw?.correctCount ?? raw?.correct),
    totalQuestions: toNumber(raw?.totalQuestions ?? raw?.total),
    xpGained: toNumber(raw?.xpGained ?? raw?.xp),
  };
}

function normalizeLevelSummary(raw: any): TestLevelSummary {
  return {
    levelId: String(raw?.levelId ?? "").toLowerCase(),
    title: String(raw?.title ?? raw?.levelId ?? "").toUpperCase(),
    activeTypes: Array.isArray(raw?.activeTypes)
      ? raw.activeTypes.filter(
          (type: unknown): type is "vocabulary" | "grammar" =>
            type === "vocabulary" || type === "grammar",
        )
      : [],
    questionCounts: {
      vocabulary: toNumber(raw?.questionCounts?.vocabulary),
      grammar: toNumber(raw?.questionCounts?.grammar),
    },
  };
}

function normalizeTypeAvailability(raw: any): TestTypeAvailabilityResponse {
  const levelId = String(raw?.levelId ?? "").toLowerCase();

  return {
    levelId,
    types: Array.isArray(raw?.types)
      ? raw.types
          .map((item: Record<string, unknown>) => ({
            testType: String(item?.testType ?? "").toLowerCase() as TestType,
            title: String(item?.title ?? item?.testType ?? ""),
            active: Boolean(item?.active),
            status: item?.status === "available" ? "available" : "coming_soon",
            questionCount: toNumber(item?.questionCount),
          }))
          .filter(
            (item: { testType: TestType }) =>
              item.testType === "vocabulary" ||
              item.testType === "grammar" ||
              item.testType === "listening" ||
              item.testType === "speaking",
          )
      : [],
  };
}

function normalizeQuestionSet(
  raw: any,
  levelId: string,
  testType: TestType,
): TestQuestionSet {
  const normalizedLevelId = String(raw?.levelId ?? levelId).toLowerCase();
  const normalizedType = (raw?.testType ?? testType) as TestType;
  const questions = Array.isArray(raw?.questions)
    ? raw.questions.map((question: any) =>
        normalizeQuestion(question, normalizedLevelId, normalizedType),
      )
    : [];

  return {
    levelId: normalizedLevelId,
    testType: normalizedType,
    title: String(
      raw?.title ?? `${normalizedLevelId.toUpperCase()} ${normalizedType}`,
    ),
    passingScore: toNumber(raw?.passingScore, 75),
    totalQuestions: toNumber(raw?.totalQuestions, questions.length),
    questions,
  };
}

export const testService = {
  async getLevels(): Promise<TestLevelSummary[]> {
    const response = await api.get("/tests/levels");
    const payload = extractData<any>(response.data);

    return Array.isArray(payload)
      ? payload.map((level) => normalizeLevelSummary(level))
      : [];
  },

  async getTypes(levelId: string): Promise<TestTypeAvailabilityResponse> {
    const normalizedLevelId = levelId.trim().toLowerCase();
    const response = await api.get(
      `/tests/${encodeURIComponent(normalizedLevelId)}/types`,
    );
    const payload = extractData<any>(response.data);
    return normalizeTypeAvailability(payload);
  },

  async getQuestionSet(
    levelId: string,
    testType: TestType,
  ): Promise<TestQuestionSet> {
    const normalizedLevelId = levelId.trim().toLowerCase();
    const response = await api.get(
      `/tests/${encodeURIComponent(normalizedLevelId)}/${encodeURIComponent(testType)}/questions`,
    );
    return normalizeQuestionSet(
      extractData<any>(response.data),
      normalizedLevelId,
      testType,
    );
  },

  async submitTest(payload: TestSubmitPayload): Promise<TestSubmitResult> {
    const normalizedLevelId = payload.levelId.trim().toLowerCase();
    const response = await api.post(
      `/tests/${encodeURIComponent(normalizedLevelId)}/${encodeURIComponent(payload.testType)}/submit`,
      { answers: payload.answers },
    );

    return normalizeSubmitResult(extractData<any>(response.data), payload);
  },
};
