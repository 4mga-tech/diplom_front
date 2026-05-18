import { api } from "@/lib/api";
import { mapUnit, attachLessonState } from "@/src/features/learning/mappers/unit.mapper";
import { normalizeCourseId } from "@/src/features/learning/mappers/level.mapper";
import { NormalizedLevelId } from "@/src/features/learning/routes";
import { BackendCourseUnitsPayload, UnitDetail, UnitListItem } from "@/src/features/learning/types/learning.types";
import { fetchUnitLessons } from "@/src/features/learning/services/lessons.service";

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

const inFlightCourseUnitsRequests = new Map<NormalizedLevelId, Promise<UnitListItem[]>>();

export async function fetchCourseUnits(levelId: NormalizedLevelId): Promise<UnitListItem[]> {
  const normalizedCourseId = normalizeCourseId(levelId) as NormalizedLevelId;
  const existingRequest = inFlightCourseUnitsRequests.get(normalizedCourseId);
  if (existingRequest) return existingRequest;

  const requestPath = `/courses/${encodeURIComponent(normalizedCourseId)}/units`;
  const request = (async () => {
    try {
      const res = await api.get(requestPath);
      const data = extractData<BackendCourseUnitsPayload>(res.data);
      const units = Array.isArray(data?.units) ? data.units : [];

      return units
        .map((unit) => mapUnit(normalizedCourseId, unit))
        .filter((unit) => unit.id)
        .map((unit) => ({ ...unit, currentLessonId: null, firstUnlockedLessonId: null }))
        .sort((a, b) => a.order - b.order);
    } catch (err: any) {
      console.error("[learning][api] request failed", {
        path: requestPath,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    } finally {
      inFlightCourseUnitsRequests.delete(normalizedCourseId);
    }
  })();

  inFlightCourseUnitsRequests.set(normalizedCourseId, request);
  return request;
}

export async function fetchLevelUnits(levelId: NormalizedLevelId): Promise<UnitListItem[]> {
  return fetchCourseUnits(levelId);
}

export async function fetchUnitDetail(
  levelId: NormalizedLevelId,
  unitId: string,
): Promise<UnitDetail | null> {
  const units = await fetchCourseUnits(levelId);
  const unit = units.find((item) => item.id === unitId);
  if (!unit) return null;

  const lessons = await fetchUnitLessons(unitId);
  return { ...attachLessonState(unit, lessons), lessons };
}
