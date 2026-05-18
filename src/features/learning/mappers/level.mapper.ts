import { NormalizedLevelId } from "@/src/features/learning/routes";
import { LevelItem, UnitListItem } from "@/src/features/learning/types/learning.types";

export function normalizeCourseId(courseId: string) {
  return courseId.trim().toLowerCase();
}

export function isValidGradient(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    value[0].trim().length > 0 &&
    typeof value[1] === "string" &&
    value[1].trim().length > 0
  );
}

export const LEVEL_UNLOCK_PREREQUISITES: Partial<
  Record<Uppercase<NormalizedLevelId>, Uppercase<NormalizedLevelId> | null>
> = {
  B1: null,
  M1: "B1",
  M2: "M1",
  M3: "M2",
  M4: "M3",
};

export function getLevelCompletion(units: UnitListItem[]): boolean {
  const existingUnits = units.filter((unit) => unit.id);
  return existingUnits.length > 0 && existingUnits.every((unit) => unit.isCompleted === true);
}

export function mapLevelBase(item: any) {
  return {
    id: String(item?.id ?? "").trim().toUpperCase(),
    title: String(item?.title ?? ""),
    subtitle: String(item?.subtitle ?? ""),
    description: String(item?.description ?? ""),
    vocabularyReady: Boolean(item?.vocabularyReady),
    vocabularyCount: Number(item?.vocabularyCount ?? 0),
    gradient: (
      isValidGradient(item?.gradient)
        ? [item.gradient[0].trim(), item.gradient[1].trim()]
        : ["#334155", "#1E293B"]
    ) as [string, string],
    fallbackIsUnlocked: Boolean(item?.isUnlocked ?? item?.unlocked),
    fallbackIsCompleted: Boolean(item?.isCompleted ?? item?.completed),
  };
}

export function toLevelItem(
  level: Omit<LevelItem, "isUnlocked"> & { fallbackIsUnlocked: boolean },
  completionByLevelId: Map<string, boolean>,
): LevelItem {
  const prerequisiteLevelId =
    LEVEL_UNLOCK_PREREQUISITES[level.id as Uppercase<NormalizedLevelId>];

  const isUnlocked =
    prerequisiteLevelId === null
      ? true
      : prerequisiteLevelId
        ? Boolean(completionByLevelId.get(prerequisiteLevelId))
        : level.fallbackIsUnlocked;

  const { fallbackIsUnlocked, ...rest } = level;
  return { ...rest, isUnlocked };
}
