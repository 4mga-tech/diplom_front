import {
  getLessonQuizRoute,
  getNormalizedLearningParams,
} from "@/src/features/learning/routes";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyQuizRoute() {
  const params = useLocalSearchParams<{
    lessonId?: string;
    levelId?: string;
    unitId?: string;
  }>();
  const { lessonId, levelId, unitId } = getNormalizedLearningParams(params);

  if (lessonId && unitId) {
    return <Redirect href={getLessonQuizRoute(levelId, unitId, lessonId)} />;
  }

  return <Redirect href="/" />;
}
