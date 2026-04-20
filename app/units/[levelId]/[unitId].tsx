import {
  getLevelRoute,
  getNormalizedLearningParams,
  getUnitRoute,
} from "@/src/features/learning/routes";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyUnitRoute() {
  const params = useLocalSearchParams<{
    levelId?: string;
    unitId?: string;
  }>();
  const { levelId, unitId } = getNormalizedLearningParams(params);

  if (unitId) {
    return <Redirect href={getUnitRoute(levelId, unitId)} />;
  }

  return <Redirect href={getLevelRoute(levelId)} />;
}
