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
    quizId?: string;
  }>();
  const { lessonId, levelId, unitId, quizId } = getNormalizedLearningParams(params);

  if (lessonId && unitId) {
    return <Redirect href={getLessonQuizRoute(levelId, unitId, lessonId, quizId)} />;
  }

  return <Redirect href="/" />;
}
