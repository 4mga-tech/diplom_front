import { api } from "@/lib/api";

export type LeaderboardTopEntry = {
  rank: number;
  name: string;
  totalXP: number;
};

export type LeaderboardMe = {
  rank: number;
  totalXP: number;
};

export type LeaderboardSummary = {
  top5: LeaderboardTopEntry[];
  me: LeaderboardMe;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractData<T>(payload: unknown): T {
  const wrapped = payload as { data?: T };
  return (wrapped?.data ?? payload) as T;
}

export async function fetchLeaderboardSummary(userId: string) {
  const response = await api.get(
    `/leaderboard/summary/${encodeURIComponent(userId)}`,
  );
  const payload = extractData<any>(response.data);

  const top5 = Array.isArray(payload?.top5)
    ? payload.top5.map((item: any, index: number) => ({
        rank: toNumber(item?.rank, index + 1),
        name: String(item?.name ?? "Unknown"),
        totalXP: toNumber(item?.totalXP ?? item?.totalXp ?? item?.xp, 0),
      }))
    : [];

  return {
    top5,
    me: {
      rank: toNumber(payload?.me?.rank, 0),
      totalXP: toNumber(
        payload?.me?.totalXP ?? payload?.me?.totalXp ?? payload?.me?.xp,
        0,
      ),
    },
  } as LeaderboardSummary;
}
