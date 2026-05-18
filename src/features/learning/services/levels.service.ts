import { api } from "@/lib/api";
import {
  getLevelCompletion,
  mapLevelBase,
  normalizeCourseId,
  toLevelItem,
} from "@/src/features/learning/mappers/level.mapper";
import { fetchCourseUnits } from "@/src/features/learning/services/units.service";
import { NormalizedLevelId } from "@/src/features/learning/routes";
import { LevelItem } from "@/src/features/learning/types/learning.types";

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

export async function fetchLevels(): Promise<LevelItem[]> {
  try {
    const res = await api.get("/content/levels");
    const data = extractData<any[]>(res.data);

    if (!Array.isArray(data)) {
      return [];
    }

    const baseLevels = data.map((item) => mapLevelBase(item));

    const levelsWithCompletion = await Promise.all(
      baseLevels.map(async (level) => {
        const normalizedLevelId = normalizeCourseId(level.id) as NormalizedLevelId;

        try {
          const units = await fetchCourseUnits(normalizedLevelId);
          const completedUnits = units.filter((unit) => unit.isCompleted).length;
          const totalUnits = units.length;
          const progress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

          return {
            ...level,
            isCompleted: getLevelCompletion(units),
            progress,
          };
        } catch {
          return {
            ...level,
            isCompleted: level.fallbackIsCompleted,
            progress: level.fallbackIsCompleted ? 100 : 0,
          };
        }
      }),
    );

    const completionByLevelId = new Map(
      levelsWithCompletion.map((level) => [level.id, level.isCompleted]),
    );

    return levelsWithCompletion.map((level) =>
      toLevelItem(
        {
          ...level,
          fallbackIsUnlocked: level.fallbackIsUnlocked,
        },
        completionByLevelId,
      ),
    );
  } catch (err) {
    console.error("LEVELS API FAILED", err);
    return [];
  }
}
