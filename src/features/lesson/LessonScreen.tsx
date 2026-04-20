import { fetchLessonDetail, LessonDetail } from "@/lib/learning";
import {
  getLessonDetailRoute,
  getNormalizedLearningParams,
  getLessonListRoute,
  getLessonQuizRoute,
} from "@/src/features/learning/routes";
import LessonScreenView from "@/src/features/lesson/components/LessonScreenView";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";

export default function LessonScreen() {
  const params = useLocalSearchParams<{
    lessonId?: string;
    levelId?: string;
    unitId?: string;
  }>();
  const { levelId, unitId, lessonId } = getNormalizedLearningParams(params);
  const navigation = useNavigation();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLesson = useCallback(async () => {
    if (!lessonId) {
      setLoading(false);
      setError("Lesson not found.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchLessonDetail(lessonId);
      setLesson(data);
      setError(data ? null : "Lesson not found.");
    } catch (loadError) {
      console.log("Error loading lesson:", loadError);
      setError("We could not load this lesson right now.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useFocusEffect(
    useCallback(() => {
      void loadLesson();
    }, [loadLesson]),
  );

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    if (unitId) {
      router.replace(getLessonListRoute(levelId, unitId));
      return;
    }

    router.replace("/");
  }, [levelId, navigation, unitId]);

  const handleOpenQuiz = useCallback(() => {
    if (!lesson?.id || !lesson.isUnlocked) return;

    const resolvedUnitId = unitId || lesson.unitId;
    if (!resolvedUnitId) {
      return;
    }

    router.push(getLessonQuizRoute(levelId, resolvedUnitId, lesson.id));
  }, [lesson?.id, lesson?.isUnlocked, lesson?.unitId, levelId, unitId]);

  const resolvedUnitId = lesson?.unit?.id || unitId || lesson?.unitId || "";

  const handleOpenPreviousLesson = useCallback(() => {
    if (!lesson?.previousLessonId || !resolvedUnitId) {
      return;
    }

    router.push(
      getLessonDetailRoute(levelId, resolvedUnitId, lesson.previousLessonId),
    );
  }, [lesson?.previousLessonId, levelId, resolvedUnitId]);

  const handleOpenNextLesson = useCallback(() => {
    if (!lesson?.nextLessonId || !resolvedUnitId) {
      return;
    }

    router.push(getLessonDetailRoute(levelId, resolvedUnitId, lesson.nextLessonId));
  }, [lesson?.nextLessonId, levelId, resolvedUnitId]);

  return (
    <LessonScreenView
      lesson={lesson}
      loading={loading}
      error={error}
      onBack={handleBack}
      onOpenQuiz={handleOpenQuiz}
      onOpenPreviousLesson={handleOpenPreviousLesson}
      onOpenNextLesson={handleOpenNextLesson}
    />
  );
}
