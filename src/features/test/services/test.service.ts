import { api } from "@/lib/api";

import {
  TestOption,
  TestQuestion,
  TestSubmitPayload,
  TestSubmitResult,
  TestType,
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

function normalizeQuestion(raw: any, levelId: string, testType: TestType): TestQuestion {
  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    levelId: String(raw?.levelId ?? levelId),
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

async function tryRequest<T>(requests: (() => Promise<T>)[]): Promise<T> {
  let lastError: unknown;

  for (const request of requests) {
    try {
      return await request();
    } catch (error: any) {
      lastError = error;

      if (error?.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export const testService = {
  async getQuestions(
    levelId: string,
    testType: TestType,
  ): Promise<TestQuestion[]> {
    const response = await tryRequest([
      () =>
        api.get("/tests/questions", {
          params: { levelId, testType },
        }),
      () =>
        api.get(
          `/tests/${encodeURIComponent(levelId)}/${encodeURIComponent(testType)}/questions`,
        ),
      () =>
        api.get("/tests", {
          params: { levelId, testType },
        }),
    ]);

    const payload = extractData<any>(response.data);
    const questions = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.questions)
        ? payload.questions
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

    return questions.map((question) => normalizeQuestion(question, levelId, testType));
  },

  async submitTest(payload: TestSubmitPayload): Promise<TestSubmitResult> {
    const response = await tryRequest([
      () => api.post("/tests/submit", payload),
      () =>
        api.post(
          `/tests/${encodeURIComponent(payload.levelId)}/${encodeURIComponent(payload.testType)}/submit`,
          { answers: payload.answers },
        ),
    ]);

    return normalizeSubmitResult(extractData<any>(response.data), payload);
  },
};
