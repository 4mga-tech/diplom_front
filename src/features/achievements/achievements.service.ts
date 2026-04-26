import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "@/lib/api";

export type XpWalletSummary = {
  totalXp: number;
  canClaimDailyXp: boolean;
  nextDailyClaimAt: string | null;
  dailyClaimXpAmount: number | null;
  hintXpCost: number | null;
};

export type ProgressSummary = {
  streak: number;
  completedLessons: number;
};

export type XpOverview = XpWalletSummary & ProgressSummary;

export type XpHistoryEntry = {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
};

export type XpHistoryResult = {
  entries: XpHistoryEntry[];
  state: "ok" | "empty" | "mapping_problem" | "error";
};

export type DailyXpClaimResult = {
  claimed: boolean;
  canClaimDailyXp: boolean;
  nextDailyClaimAt: string | null;
  amount: number | null;
};

export type HintSpendResult = {
  spent: boolean;
  eliminatedOptionIds: string[];
  amount: number | null;
};

const XP_SUMMARY_ENDPOINT = "/me/xp/summary";
const XP_HISTORY_ENDPOINT = "/me/xp/history";
const DAILY_LOGIN_CLAIM_ENDPOINT = "/me/xp/daily-login/claim";
const HINT_XP_SPEND_ENDPOINT = (questionId: string) =>
  `/me/xp/hints/${encodeURIComponent(questionId)}/spend`;
const LESSON_XP_CLAIM_ENDPOINT = (lessonId: string) =>
  `/me/xp/lessons/${encodeURIComponent(lessonId)}/claim`;
const PROGRESS_SUMMARY_ENDPOINT = "/me/progress/summary";

const DAILY_LOGIN_ATTEMPT_KEY = "xpDailyLoginAttemptAt";
const DAILY_LOGIN_DEDUPE_WINDOW_MS = 5_000;

let inFlightDailyLoginClaim: Promise<boolean> | null = null;

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

function toFiniteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toPositiveNumber(value: unknown): number | null {
  const parsed = toFiniteNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function extractClaimedFlag(raw: any) {
  if (typeof raw?.claimed === "boolean") {
    return raw.claimed;
  }

  if (typeof raw?.success === "boolean") {
    return raw.success;
  }

  return true;
}

function normalizeXpWalletSummary(raw: any): XpWalletSummary {
  return {
    totalXp:
      toFiniteNumber(raw?.totalXp ?? raw?.xp ?? raw?.currentXp ?? raw?.balance) ?? 0,
    canClaimDailyXp: Boolean(
      raw?.canClaimDailyXp ??
        raw?.canClaimDailyLoginXp ??
        raw?.dailyLoginEligible ??
        raw?.isDailyLoginClaimAvailable ??
        raw?.claimAvailable ??
        false,
    ),
    nextDailyClaimAt: raw?.nextDailyClaimAt
      ? String(raw.nextDailyClaimAt)
      : raw?.nextDailyLoginClaimAt
        ? String(raw.nextDailyLoginClaimAt)
        : raw?.dailyClaimAvailableAt
          ? String(raw.dailyClaimAvailableAt)
          : null,
    dailyClaimXpAmount:
      toPositiveNumber(raw?.dailyClaimXpAmount) ??
      toPositiveNumber(raw?.dailyLoginXpAmount) ??
      toPositiveNumber(raw?.dailyXpReward),
    hintXpCost:
      toPositiveNumber(raw?.hintXpCost) ??
      toPositiveNumber(raw?.testHintXpCost) ??
      toPositiveNumber(raw?.hintCost),
  };
}

function normalizeProgressSummary(raw: any): ProgressSummary {
  return {
    streak: toFiniteNumber(raw?.streak) ?? 0,
    completedLessons:
      toFiniteNumber(raw?.completedLessons ?? raw?.lessonsCompleted) ?? 0,
  };
}

function normalizeHistoryEntry(raw: any, index: number): XpHistoryEntry {
  const amount = toFiniteNumber(raw?.amount ?? raw?.xp ?? raw?.delta ?? raw?.value) ?? 0;
  const timestampSource =
    raw?.timestamp ??
    raw?.createdAt ??
    raw?.date ??
    raw?.occurredAt ??
    new Date().toISOString();

  const normalizedReason = normalizeHistoryReason(raw, amount);

  return {
    id: String(raw?.id ?? raw?._id ?? `${timestampSource}-${index}`),
    amount,
    reason: normalizedReason,
    timestamp: String(timestampSource),
  };
}

function extractHistoryItems(payload: any): {
  items: any[];
  state: "ok" | "empty" | "mapping_problem";
} {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      state: payload.length === 0 ? "empty" : "ok",
    };
  }

  const candidateArrays = [
    payload?.items,
    payload?.history,
    payload?.entries,
    payload?.transactions,
    payload?.results,
    payload?.rows,
  ];

  const matchedArray = candidateArrays.find((value) => Array.isArray(value));

  if (Array.isArray(matchedArray)) {
    return {
      items: matchedArray,
      state: matchedArray.length === 0 ? "empty" : "ok",
    };
  }

  if (payload == null) {
    return {
      items: [],
      state: "empty",
    };
  }

  if (typeof payload === "object" && Object.keys(payload).length === 0) {
    return {
      items: [],
      state: "empty",
    };
  }

  return {
    items: [],
    state: "mapping_problem",
  };
}

function normalizeHistoryReason(raw: any, amount: number) {
  const rawReason = String(
    raw?.reason ?? raw?.source ?? raw?.description ?? raw?.type ?? "",
  ).trim();
  const normalized = rawReason.toLowerCase().replace(/[_-]+/g, " ");

  if (
    normalized.includes("daily") ||
    normalized.includes("login") ||
    normalized.includes("check in")
  ) {
    return "Daily claim";
  }

  if (
    normalized.includes("lesson") &&
    (normalized.includes("complete") || normalized.includes("claim"))
  ) {
    return "Lesson completed";
  }

  if (
    normalized.includes("quiz") ||
    normalized.includes("practice reward") ||
    normalized.includes("exam reward") ||
    normalized.includes("test reward")
  ) {
    return amount < 0 ? "Quiz spend" : "Quiz reward";
  }

  if (normalized.includes("hint")) {
    return "Hint used";
  }

  if (normalized.includes("spend") || normalized.includes("spent")) {
    return "XP spent";
  }

  if (normalized.includes("reward") || normalized.includes("earned")) {
    return "XP earned";
  }

  if (rawReason.length > 0) {
    return rawReason
      .split(/[\s_/-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return amount < 0 ? "XP spent" : "XP earned";
}

export async function fetchXpWalletSummary(): Promise<XpWalletSummary> {
  const response = await api.get(XP_SUMMARY_ENDPOINT);
  return normalizeXpWalletSummary(extractData<any>(response.data));
}

export async function fetchProgressSummary(): Promise<ProgressSummary> {
  const response = await api.get(PROGRESS_SUMMARY_ENDPOINT);
  return normalizeProgressSummary(extractData<any>(response.data));
}

export async function fetchXpOverview(): Promise<XpOverview> {
  const [xpWallet, progress] = await Promise.all([
    fetchXpWalletSummary(),
    fetchProgressSummary(),
  ]);

  return {
    totalXp: xpWallet.totalXp,
    canClaimDailyXp: xpWallet.canClaimDailyXp,
    nextDailyClaimAt: xpWallet.nextDailyClaimAt,
    dailyClaimXpAmount: xpWallet.dailyClaimXpAmount,
    hintXpCost: xpWallet.hintXpCost,
    streak: progress.streak,
    completedLessons: progress.completedLessons,
  };
}

export async function fetchXpHistoryResult(): Promise<XpHistoryResult> {
  try {
    const response = await api.get(XP_HISTORY_ENDPOINT);
    const data = extractData<any>(response.data);
    const extracted = extractHistoryItems(data);
    const entries = extracted.items
      .map((item, index) => normalizeHistoryEntry(item, index))
      .sort(
        (left, right) =>
          new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
      );

    return {
      entries,
      state:
        extracted.state === "mapping_problem"
          ? "mapping_problem"
          : entries.length === 0
            ? "empty"
            : "ok",
    };
  } catch {
    return {
      entries: [],
      state: "error",
    };
  }
}

export async function fetchXpHistory(): Promise<XpHistoryEntry[]> {
  const result = await fetchXpHistoryResult();
  return result.entries;
}

export async function claimDailyLoginXp(): Promise<boolean> {
  const response = await api.post(DAILY_LOGIN_CLAIM_ENDPOINT);
  return extractClaimedFlag(extractData<any>(response.data));
}

function normalizeDailyXpClaimResult(raw: any): DailyXpClaimResult {
  return {
    claimed: extractClaimedFlag(raw),
    canClaimDailyXp: Boolean(
      raw?.canClaimDailyXp ??
        raw?.canClaimDailyLoginXp ??
        raw?.dailyLoginEligible ??
        raw?.isDailyLoginClaimAvailable ??
        false,
    ),
    nextDailyClaimAt: raw?.nextDailyClaimAt
      ? String(raw.nextDailyClaimAt)
      : raw?.nextDailyLoginClaimAt
        ? String(raw.nextDailyLoginClaimAt)
        : raw?.dailyClaimAvailableAt
          ? String(raw.dailyClaimAvailableAt)
          : null,
    amount:
      toPositiveNumber(raw?.amount) ??
      toPositiveNumber(raw?.xp) ??
      toPositiveNumber(raw?.dailyClaimXpAmount) ??
      toPositiveNumber(raw?.dailyLoginXpAmount),
  };
}

function normalizeHintSpendResult(raw: any): HintSpendResult {
  const eliminatedOptionIds = Array.isArray(
    raw?.eliminatedOptionIds ??
      raw?.hiddenOptionIds ??
      raw?.removedOptionIds ??
      raw?.eliminatedAnswers,
  )
    ? (
        raw?.eliminatedOptionIds ??
        raw?.hiddenOptionIds ??
        raw?.removedOptionIds ??
        raw?.eliminatedAnswers
      ).map(String)
    : [];

  return {
    spent: extractClaimedFlag(raw),
    eliminatedOptionIds,
    amount:
      toPositiveNumber(raw?.amount) ??
      toPositiveNumber(raw?.xp) ??
      toPositiveNumber(raw?.hintXpCost) ??
      toPositiveNumber(raw?.hintCost),
  };
}

export async function claimDailyLoginXpAction(): Promise<DailyXpClaimResult> {
  const response = await api.post(DAILY_LOGIN_CLAIM_ENDPOINT);
  return normalizeDailyXpClaimResult(extractData<any>(response.data));
}

export async function claimLessonXp(lessonId: string): Promise<boolean> {
  try {
    const response = await api.post(LESSON_XP_CLAIM_ENDPOINT(lessonId));
    return extractClaimedFlag(extractData<any>(response.data));
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 400 || status === 409) {
      return false;
    }

    throw error;
  }
}

export async function spendXpForHint(questionId: string): Promise<HintSpendResult> {
  try {
    const response = await api.post(HINT_XP_SPEND_ENDPOINT(questionId));
    return normalizeHintSpendResult(extractData<any>(response.data));
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 400 || status === 402 || status === 409) {
      return {
        spent: false,
        eliminatedOptionIds: [],
        amount: null,
      };
    }

    throw error;
  }
}

export async function claimDailyLoginXpIfNeeded(): Promise<boolean> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return false;
  }

  const now = Date.now();
  const lastAttemptRaw = await AsyncStorage.getItem(DAILY_LOGIN_ATTEMPT_KEY);
  const lastAttemptAt = Number(lastAttemptRaw ?? 0);

  if (inFlightDailyLoginClaim) {
    return inFlightDailyLoginClaim;
  }

  if (lastAttemptAt && now - lastAttemptAt < DAILY_LOGIN_DEDUPE_WINDOW_MS) {
    return false;
  }

  inFlightDailyLoginClaim = (async () => {
    try {
      const result = await claimDailyLoginXpAction();
      await AsyncStorage.setItem(DAILY_LOGIN_ATTEMPT_KEY, String(now));
      return result.claimed;
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 400 || status === 409) {
        await AsyncStorage.setItem(DAILY_LOGIN_ATTEMPT_KEY, String(now));
        return false;
      }

      throw error;
    } finally {
      inFlightDailyLoginClaim = null;
    }
  })();

  return inFlightDailyLoginClaim;
}
