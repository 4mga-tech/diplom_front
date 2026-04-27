import { LevelId } from "@/src/data/curriculum";
import type { Href } from "expo-router";

type RouteParamValue = string | string[] | undefined;
export type NormalizedLevelId = "b1" | "m1" | "m2" | "m3" | "m4";

type RouteIdParams = {
  levelId?: RouteParamValue;
  unitId?: RouteParamValue;
  lessonId?: RouteParamValue;
  quizId?: RouteParamValue;
};

const NORMALIZED_LEVEL_IDS: NormalizedLevelId[] = ["b1", "m1", "m2", "m3", "m4"];

function encodeRouteSegment(value: string) {
  return encodeURIComponent(value);
}

function getSingleRouteParamValue(value?: RouteParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeLevelId(levelId?: RouteParamValue): NormalizedLevelId {
  const rawLevelId = getSingleRouteParamValue(levelId);
  const trimmedLevelId = rawLevelId?.trim();
  const lowerLevelId = trimmedLevelId?.toLowerCase();
  const normalizedLevelId = NORMALIZED_LEVEL_IDS.includes(
    lowerLevelId as NormalizedLevelId,
  )
    ? (lowerLevelId as NormalizedLevelId)
    : "b1";

  return normalizedLevelId;
}

export function getCanonicalLevelId(levelId?: RouteParamValue): LevelId {
  const normalizedLevelId = normalizeLevelId(levelId);
  return normalizedLevelId.toUpperCase() as LevelId;
}

export function getNormalizedLearningParams(params: RouteIdParams) {
  return {
    levelId: normalizeLevelId(params.levelId),
    unitId: getSingleRouteParamValue(params.unitId) ?? "",
    lessonId: getSingleRouteParamValue(params.lessonId) ?? "",
    quizId: getSingleRouteParamValue(params.quizId) ?? "",
  };
}

export function getLevelRoute(levelId: string): Href {
  return `/levels/${encodeRouteSegment(levelId)}` as Href;
}

export function getUnitRoute(levelId: string, unitId: string): Href {
  return `/levels/${encodeRouteSegment(levelId)}/units/${encodeRouteSegment(unitId)}` as Href;
}

export function getLessonDetailRoute(
  levelId: string,
  unitId: string,
  lessonId: string,
): Href {
  return `/levels/${encodeURIComponent(levelId)}/units/${encodeURIComponent(
    unitId,
  )}/lessons/${encodeURIComponent(lessonId)}` as Href;
}

export function getLessonListRoute(levelId: string, unitId: string): Href {
  return `/levels/${encodeURIComponent(levelId)}/units/${encodeURIComponent(
    unitId,
  )}/lessons` as Href;
}

export function getLessonQuizRoute(
  levelId: string,
  unitId: string,
  lessonId: string,
  quizId?: string | null,
): Href {
  const baseRoute = `/levels/${encodeURIComponent(levelId)}/units/${encodeURIComponent(
    unitId,
  )}/lessons/${encodeURIComponent(lessonId)}/quiz`;

  if (quizId && quizId.trim().length > 0) {
    return `${baseRoute}?quizId=${encodeURIComponent(quizId)}` as Href;
  }

  return baseRoute as Href;
}
