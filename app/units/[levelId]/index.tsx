import {
  getLevelRoute,
  getNormalizedLearningParams,
} from "@/src/features/learning/routes";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyUnitsRoute() {
  const params = useLocalSearchParams<{ levelId?: string }>();
  const { levelId } = getNormalizedLearningParams(params);

  return <Redirect href={getLevelRoute(levelId)} />;
}
