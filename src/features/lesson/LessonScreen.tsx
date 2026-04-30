import { fetchLessonDetail, LessonDetail } from "@/lib/learning";
import { claimLessonXp } from "@/src/features/achievements/achievements.service";
import { notifyXpUpdated } from "@/src/features/achievements/xp-events";
import {
  getLessonDetailRoute,
  getLessonListRoute,
  getLessonQuizRoute,
  getNormalizedLearningParams,
} from "@/src/features/learning/routes";
import LessonScreenView from "@/src/features/lesson/components/LessonScreenView";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";

export default function LessonScreen() {
  const params = useLocalSearchParams<{
    lessonId?: string;
    levelId?: string;
    unitId?: string;
    quizId?: string;
  }>();
  const { levelId, unitId, lessonId } = getNormalizedLearningParams(params);

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null,
  );

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
      console.error("Error loading lesson:", loadError);
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
    if (unitId) {
      router.replace(getLessonListRoute(levelId, unitId));
      return;
    }

    router.replace("/");
  }, [levelId, unitId]);

  const handleOpenQuiz = useCallback(() => {
    if (!lesson?.id || !lesson.isUnlocked || !lesson.hasQuiz) return;

    const resolvedUnitId = unitId || lesson.unitId;
    if (!resolvedUnitId) {
      return;
    }

    router.replace(
      getLessonQuizRoute(levelId, resolvedUnitId, lesson.id, lesson.quizId),
    );
  }, [
    lesson?.id,
    lesson?.hasQuiz,
    lesson?.isUnlocked,
    lesson?.quizId,
    lesson?.unitId,
    levelId,
    unitId,
  ]);

  const resolvedUnitId = lesson?.unit?.id || unitId || lesson?.unitId || "";

  const handleOpenPreviousLesson = useCallback(() => {
    if (!lesson?.previousLessonId || !resolvedUnitId) {
      return;
    }

    router.replace(
      getLessonDetailRoute(levelId, resolvedUnitId, lesson.previousLessonId),
    );
  }, [lesson?.previousLessonId, levelId, resolvedUnitId]);

  const handleOpenNextLesson = useCallback(() => {
    if (!lesson?.nextLessonId || !resolvedUnitId) {
      return;
    }

    router.replace(
      getLessonDetailRoute(levelId, resolvedUnitId, lesson.nextLessonId),
    );
  }, [lesson?.nextLessonId, levelId, resolvedUnitId]);

  const handleAdvanceAfterCompletion = useCallback(() => {
    if (resolvedUnitId && lesson?.nextLessonId) {
      router.replace(
        getLessonDetailRoute(levelId, resolvedUnitId, lesson.nextLessonId),
      );
      return;
    }

    if (resolvedUnitId && lesson?.id && lesson?.hasQuiz) {
      router.replace(
        getLessonQuizRoute(levelId, resolvedUnitId, lesson.id, lesson.quizId),
      );
      return;
    }

    if (resolvedUnitId) {
      router.replace(getLessonListRoute(levelId, resolvedUnitId));
      return;
    }

    router.replace("/");
  }, [
    lesson?.hasQuiz,
    lesson?.id,
    lesson?.nextLessonId,
    lesson?.quizId,
    levelId,
    resolvedUnitId,
  ]);

  const handleCompleteLesson = useCallback(async () => {
    if (
      !lesson?.id ||
      lesson.hasQuiz ||
      lesson.isCompleted ||
      completingLesson
    ) {
      return;
    }
    try {
      setCompletingLesson(true);
      setCompletionMessage(null);

      const claimResult = await claimLessonXp(lesson.id);

      if (claimResult.claimed) {
        notifyXpUpdated();
        handleAdvanceAfterCompletion();
      } else {
        handleAdvanceAfterCompletion();
      }
    } catch (completionError) {
      console.error("Error completing lesson:", completionError);
      setCompletionMessage("We could not complete this lesson right now.");
    } finally {
      setCompletingLesson(false);
    }
  }, [
    completingLesson,
    handleAdvanceAfterCompletion,
    lesson?.hasQuiz,
    lesson?.id,
    lesson?.isCompleted,
  ]);

  return (
    <LessonScreenView
      lesson={lesson}
      levelId={levelId}
      loading={loading}
      error={error}
      completingLesson={completingLesson}
      completionMessage={completionMessage}
      onBack={handleBack}
      onOpenQuiz={handleOpenQuiz}
      onCompleteLesson={handleCompleteLesson}
      onOpenPreviousLesson={handleOpenPreviousLesson}
      onOpenNextLesson={handleOpenNextLesson}
    />
  );
}
