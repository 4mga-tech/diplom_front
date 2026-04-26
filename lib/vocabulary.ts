import { api } from "@/lib/api";

export const SUPPORTED_VOCABULARY_LEVEL_IDS = ["M1", "M2", "M3", "M4"] as const;

export type VocabularyLevelId = (typeof SUPPORTED_VOCABULARY_LEVEL_IDS)[number];

export type VocabularyWord = {
  key: string;
  word: string;
  translation: string;
  type: string;
  alphabetGroup: string;
  level: VocabularyLevelId;
};

export type VocabularyLevel = {
  id: VocabularyLevelId;
  title: string;
  subtitle: string;
  description: string;
  vocabularyCount: number;
  vocabularyReady: boolean;
};

type DataEnvelope<T> = {
  data?: T;
  items?: T;
  result?: T;
  levels?: T;
  words?: T;
};

function extractData<T>(payload: unknown): T {
  const wrapped = payload as DataEnvelope<T> | undefined;

  return (wrapped?.data ??
    wrapped?.items ??
    wrapped?.result ??
    wrapped?.levels ??
    wrapped?.words ??
    payload) as T;
}

function toVocabularyLevelId(value: unknown): VocabularyLevelId | null {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (
    SUPPORTED_VOCABULARY_LEVEL_IDS.includes(
      normalized as VocabularyLevelId,
    )
  ) {
    return normalized as VocabularyLevelId;
  }

  return null;
}

function normalizeVocabularyWord(
  raw: any,
  fallbackLevelId: VocabularyLevelId,
  index: number,
): VocabularyWord {
  const level =
    toVocabularyLevelId(raw?.level ?? raw?.levelId ?? fallbackLevelId) ??
    fallbackLevelId;

  return {
    key: String(raw?.key ?? raw?.id ?? raw?._id ?? `${level}-${index}`),
    word: String(raw?.word ?? raw?.text ?? raw?.mongolian ?? ""),
    translation: String(
      raw?.translation ?? raw?.meaning ?? raw?.english ?? raw?.definition ?? "",
    ),
    type: String(raw?.type ?? raw?.partOfSpeech ?? ""),
    alphabetGroup: String(
      raw?.alphabetGroup ?? raw?.letter ?? raw?.initial ?? raw?.group ?? "",
    ),
    level,
  };
}

function normalizeVocabularyLevel(raw: any): VocabularyLevel | null {
  const id = toVocabularyLevelId(
    raw?.id ?? raw?._id ?? raw?.levelId ?? raw?.code ?? raw?.name,
  );

  if (!id) {
    return null;
  }

  return {
    id,
    title: String(raw?.title ?? raw?.name ?? id),
    subtitle: String(raw?.subtitle ?? raw?.shortDescription ?? ""),
    description: String(raw?.description ?? raw?.details ?? ""),
    vocabularyCount: Math.max(
      0,
      Number(raw?.vocabularyCount ?? raw?.wordCount ?? 0),
    ),
    vocabularyReady: Boolean(raw?.vocabularyReady ?? raw?.isReady ?? raw?.ready),
  };
}

export function isSupportedVocabularyLevelId(
  value: unknown,
): value is VocabularyLevelId {
  return toVocabularyLevelId(value) !== null;
}

export function normalizeVocabularyLevelId(
  value: unknown,
): VocabularyLevelId | null {
  return toVocabularyLevelId(value);
}

export async function fetchVocabularyLevels(): Promise<VocabularyLevel[]> {
  const res = await api.get("/content/vocabulary-levels");
  const extracted = extractData<any>(res.data);
  const rawLevels = Array.isArray(extracted)
    ? extracted
    : Array.isArray(extracted?.levels)
      ? extracted.levels
      : [];

  return rawLevels
    .map(normalizeVocabularyLevel)
    .filter((level: VocabularyLevel | null): level is VocabularyLevel =>
      Boolean(level),
    )
    .sort(
      (a: VocabularyLevel, b: VocabularyLevel) =>
        SUPPORTED_VOCABULARY_LEVEL_IDS.indexOf(a.id) -
        SUPPORTED_VOCABULARY_LEVEL_IDS.indexOf(b.id),
    );
}

export async function fetchVocabularyWords(
  levelId: VocabularyLevelId,
): Promise<VocabularyWord[]> {
  const res = await api.get(`/content/vocabulary/${levelId.toLowerCase()}`);
  const extracted = extractData<any>(res.data);
  const rawWords = Array.isArray(extracted)
    ? extracted
    : Array.isArray(extracted?.words)
      ? extracted.words
      : [];

  return rawWords.map((word: any, index: number) =>
    normalizeVocabularyWord(word, levelId, index),
  );
}
