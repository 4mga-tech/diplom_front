import { api } from "@/lib/api";
import { LEVELS as fallbackLevels } from "@/src/data/curriculum";

export type LevelWord = {
  key: string;
  word: string;
  translation: string;
  type: string;
  alphabetGroup: string;
  level: string;
};

export type LevelCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  vocabularyCount: number;
  vocabularyReady: boolean;
  words: LevelWord[];
};

const LEVEL_ENDPOINTS = [
  "/content/vocabulary-levels",
  "/levels",
  "/level",
  "/vocabulary/levels",
] as const;

function isAxios404(error: unknown): error is { response?: { status?: number } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: number } }).response === "object"
  );
}

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as
    | { data?: T; levels?: T; items?: T; result?: T }
    | undefined;

  return (maybeWrapped?.data ??
    maybeWrapped?.levels ??
    maybeWrapped?.items ??
    maybeWrapped?.result ??
    payload) as T;
}

function normalizeWord(raw: any, fallbackLevelId: string, index: number): LevelWord {
  return {
    key: String(raw?.key ?? raw?.id ?? raw?._id ?? `${fallbackLevelId}-${index}`),
    word: String(raw?.word ?? raw?.text ?? raw?.mongolian ?? ""),
    translation: String(
      raw?.translation ?? raw?.meaning ?? raw?.english ?? raw?.definition ?? "",
    ),
    type: String(raw?.type ?? raw?.partOfSpeech ?? ""),
    alphabetGroup: String(
      raw?.alphabetGroup ?? raw?.letter ?? raw?.initial ?? raw?.group ?? "",
    ),
    level: String(raw?.level ?? raw?.levelId ?? fallbackLevelId),
  };
}

function normalizeLevel(raw: any, fallback?: (typeof fallbackLevels)[number]): LevelCard {
  const id = String(
    raw?.id ?? raw?._id ?? raw?.levelId ?? raw?.code ?? fallback?.id ?? "",
  );
  const words = Array.isArray(raw?.words)
    ? raw.words.map((word: any, index: number) => normalizeWord(word, id, index))
    : [];

  return {
    id,
    title: String(
      raw?.title ?? raw?.name ?? raw?.levelName ?? raw?.label ?? fallback?.title ?? id,
    ),
    subtitle: String(
      raw?.subtitle ??
        raw?.shortDescription ??
        raw?.description ??
        fallback?.subtitle ??
        "",
    ),
    description: String(
      raw?.description ??
        raw?.details ??
        raw?.subtitle ??
        fallback?.description ??
        "",
    ),
    vocabularyCount: Number(
      raw?.vocabularyCount ?? raw?.wordCount ?? raw?.words?.length ?? fallback?.vocabularyCount ?? 0,
    ),
    vocabularyReady: Boolean(
      raw?.vocabularyReady ??
        raw?.isReady ??
        raw?.ready ??
        (Array.isArray(raw?.words) ? raw.words.length > 0 : fallback?.vocabularyReady),
    ),
    words,
  };
}

export function parseLevelsPayload(payload: unknown): LevelCard[] {
  const extracted = extractData<any>(payload);
  const rawLevels = Array.isArray(extracted)
    ? extracted
    : Array.isArray(extracted?.levels)
      ? extracted.levels
      : [];

  const normalized = rawLevels.map((level: any) => {
    const fallback = fallbackLevels.find(
      (item) =>
        item.id === level?.id ||
        item.id === level?._id ||
        item.id === level?.levelId ||
        item.id === level?.code,
    );

    return normalizeLevel(level, fallback);
  });

  if (normalized.length === 0) {
    return fallbackLevels.map((level: (typeof fallbackLevels)[number]) =>
      normalizeLevel(level, level),
    );
  }

  const seen = new Set<string>(
    normalized.map((level: LevelCard) => level.id),
  );
  const mergedFallbacks = fallbackLevels
    .filter((level: (typeof fallbackLevels)[number]) => !seen.has(level.id))
    .map((level: (typeof fallbackLevels)[number]) => normalizeLevel(level, level));

  return [...normalized, ...mergedFallbacks];
}

export function getFallbackLevels(): LevelCard[] {
  return fallbackLevels.map((level: (typeof fallbackLevels)[number]) =>
    normalizeLevel(level, level),
  );
}

export async function fetchLevels(): Promise<LevelCard[]> {
  for (const endpoint of LEVEL_ENDPOINTS) {
    try {
      const res = await api.get(endpoint);
      const levels = parseLevelsPayload(res.data);

      if (levels.length > 0) {
        return levels;
      }
    } catch (error) {
      if (!isAxios404(error) || error.response?.status !== 404) {
        console.log(`Levels fetch error at ${endpoint}:`, error);
        return getFallbackLevels();
      }
    }
  }

  console.log(
    `Levels endpoint not found. Tried: ${LEVEL_ENDPOINTS.join(", ")}. Using fallback data.`,
  );
  return getFallbackLevels();
}
