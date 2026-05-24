import { api } from "@/lib/api";
import { fetchLessonDetail, LessonDetail } from "@/lib/learning";
import {
  claimLessonXp,
  LessonXpClaimResult,
} from "@/src/features/achievements/achievements.service";
import { notifyXpUpdated } from "@/src/features/achievements/xp-events";
import {
  getLessonDetailRoute,
  getLessonListRoute,
  getNormalizedLearningParams,
} from "@/src/features/learning/routes";
import { useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Question = {
  id: string;
  type?: string;
  prompt: string;
  options?: string[];
  correctOptionId?: string;
  correctAnswer?: string;
  explanation?: string;
};

type QuizSubmitResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  xpGained: number;
};

const DEFAULT_LESSON_XP_CLAIM_RESULT: LessonXpClaimResult = {
  claimed: false,
  amount: null,
  status: "already_completed",
};

function extractData<T>(payload: unknown): T {
  const maybeWrapped = payload as { data?: T };
  return (maybeWrapped?.data ?? payload) as T;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeQuizSubmitResult(raw: any): QuizSubmitResult {
  return {
    score: toNumber(raw?.score ?? raw?.percentage),
    passed: Boolean(raw?.passed ?? raw?.isPassed ?? false),
    correctCount: toNumber(raw?.correctCount ?? raw?.correct),
    totalQuestions: toNumber(raw?.totalQuestions ?? raw?.total),
    xpGained: toNumber(raw?.xpGained ?? raw?.xp),
  };
}

function normalizeQuestion(raw: any, index: number): Question {
  return {
    id: String(raw?.id ?? raw?._id ?? `question-${index + 1}`),
    type: raw?.type ? String(raw.type) : undefined,
    prompt: String(raw?.prompt ?? raw?.question ?? raw?.text ?? ""),
    options: Array.isArray(raw?.options)
      ? raw.options.map((option: any) =>
          typeof option === "string"
            ? option
            : String(option?.text ?? option?.label ?? option?.value ?? ""),
        )
      : [],
    correctOptionId:
      raw?.correctOptionId !== undefined && raw?.correctOptionId !== null
        ? String(raw.correctOptionId)
        : undefined,
    correctAnswer:
      raw?.correctAnswer !== undefined && raw?.correctAnswer !== null
        ? String(raw.correctAnswer)
        : undefined,
    explanation:
      raw?.explanation !== undefined && raw?.explanation !== null
        ? String(raw.explanation)
        : undefined,
  };
}

function getOptionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

async function submitLessonQuiz(
  quizId: string,
  answers: { questionId: string; selected: string }[],
): Promise<QuizSubmitResult> {
  const response = await api.post(
    `/quizzes/${encodeURIComponent(quizId)}/submit`,
    {
      answers,
    },
  );
  return normalizeQuizSubmitResult(extractData<any>(response.data));
}

export default function QuizScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{
    lessonId?: string;
    levelId?: string;
    unitId?: string;
    quizId?: string;
  }>();
  const {
    lessonId,
    levelId,
    unitId,
    quizId: routeQuizId,
  } = getNormalizedLearningParams(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answersByQuestionId, setAnswersByQuestionId] = useState<
    Record<string, string>
  >({});
  const [finished, setFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonCompletionConfirmed, setLessonCompletionConfirmed] =
    useState(false);
  const [lessonXpClaimResult, setLessonXpClaimResult] = useState<LessonXpClaimResult>(
    DEFAULT_LESSON_XP_CLAIM_RESULT,
  );
  const [quizId, setQuizId] = useState(routeQuizId);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);

  React.useEffect(() => {
    const loadQuiz = async () => {
      if (!lessonId) {
        setError("Quiz not found.");
        setLoading(false);
        return;
      }

      try {
        const lessonDetail = await fetchLessonDetail(lessonId);
        const resolvedQuizId = lessonDetail?.quizId || routeQuizId || "";
        const quizRes = resolvedQuizId
          ? await api.get(`/quizzes/${encodeURIComponent(resolvedQuizId)}`)
          : await api.get(`/lessons/${lessonId}/quiz`);
        const responseData = quizRes.data as any;
        const payload = responseData?.data ?? responseData;
        const nextQuestions = Array.isArray(payload?.questions)
          ? payload.questions.map((question: any, index: number) =>
              normalizeQuestion(question, index),
            )
          : [];

        setQuestions(nextQuestions);
        setLessonDetail(lessonDetail);
        setQuizId(resolvedQuizId || (typeof payload?.id === "string" ? payload.id : ""));

        if (!resolvedQuizId) {
          setError("We could not find this quiz right now.");
        }

        if (nextQuestions.length === 0) {
          console.log("Quiz questions empty", { lessonId, quizId: resolvedQuizId || payload?.id || null });
        }
      } catch (loadError) {
        console.log("Quiz load error:", loadError);
        setError("We could not load this quiz right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadQuiz();
  }, [lessonId, routeQuizId]);

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions
    ? Math.round(((questionIndex + 1) / totalQuestions) * 100)
    : 0;
  const answeredCount = Object.keys(answersByQuestionId).length;
  const isFinalExam =
    levelId === "b1" && lessonDetail?.order === 6 && Boolean(lessonDetail?.hasQuiz);
  const quizLabel = isFinalExam ? "Final Exam" : "Practice Quiz";
  const quizShortTitle = isFinalExam ? "Final lesson assessment" : "Short lesson check";
  const quizModeLabel = isFinalExam ? "Final" : "Practice";

  const isChoiceQuestion = useMemo(() => {
    if (!currentQuestion) return false;
    return (
      Array.isArray(currentQuestion.options) &&
      currentQuestion.options.length > 0
    );
  }, [currentQuestion]);

  const canSubmitAnswer = isChoiceQuestion
    ? Boolean(selectedOption)
    : typedAnswer.trim().length > 0;

  const selectedOptionIndex =
    currentQuestion?.options?.findIndex((option) => option === selectedOption) ??
    -1;
  const selectedOptionLetter =
    selectedOptionIndex >= 0
      ? getOptionLetter(selectedOptionIndex)
      : null;
  const correctOptionText = currentQuestion?.correctAnswer?.trim() || null;
  const correctOptionLetter = currentQuestion?.correctOptionId?.trim() || null;
  const canEvaluateChoiceImmediately =
    Boolean(currentQuestion && isChoiceQuestion && selectedOption) &&
    Boolean(correctOptionText || correctOptionLetter);
  const selectedChoiceIsCorrect = canEvaluateChoiceImmediately
    ? selectedOption === correctOptionText ||
      selectedOptionLetter === correctOptionLetter ||
      `${selectedOptionIndex}` === correctOptionLetter ||
      `${selectedOptionIndex + 1}` === correctOptionLetter
    : null;

  const buildCurrentAnswerValue = useCallback(() => {
    return isChoiceQuestion ? selectedOption : typedAnswer.trim();
  }, [isChoiceQuestion, selectedOption, typedAnswer]);

  const handleFinishQuiz = useCallback(
    async (nextAnswersByQuestionId: Record<string, string>) => {
      setFinished(true);
      setError(null);
      setLessonCompletionConfirmed(false);
      setLessonXpClaimResult(DEFAULT_LESSON_XP_CLAIM_RESULT);
      if (!lessonId || !quizId) {
        setError("We could not find this quiz right now.");
        return;
      }

      setSubmitting(true);
      let passedQuiz = false;

      try {
        const result = await submitLessonQuiz(
          quizId,
          questions
            .map((question) => ({
              questionId: question.id,
              selected: nextAnswersByQuestionId[question.id],
            }))
            .filter(
              (answer) =>
                typeof answer.selected === "string" &&
                answer.selected.length > 0,
            ),
        );

        passedQuiz = result.passed;
        setQuizResult(result);
        notifyXpUpdated();

        if (result.passed) {
          const claimResult = await claimLessonXp(lessonId);
          setLessonXpClaimResult(claimResult);
          setLessonCompletionConfirmed(true);

          if (claimResult.claimed) {
            notifyXpUpdated();
          }
        }
      } catch (submitError: any) {
        console.log(
          "[QuizScreen] Quiz submit or lesson completion request failed",
          {
            lessonId,
            quizId,
            endpoint: `/me/xp/lessons/${lessonId}/claim`,
            status: submitError?.response?.status ?? null,
            data: submitError?.response?.data ?? null,
            message: submitError?.message ?? "Unknown error",
          },
        );
        setError(
          passedQuiz
            ? "Quiz passed, but lesson progress could not be updated yet."
            : "We could not update lesson progress yet.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [lessonId, questions, quizId],
  );

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;

    const currentAnswer = buildCurrentAnswerValue();

    if (!currentAnswer) {
      return;
    }

    const nextAnswersByQuestionId = {
      ...answersByQuestionId,
      [currentQuestion.id]: currentAnswer,
    };
    setAnswersByQuestionId(nextAnswersByQuestionId);

    if (questionIndex === totalQuestions - 1) {
      await handleFinishQuiz(nextAnswersByQuestionId);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedOption(null);
    setTypedAnswer("");
  }, [
    answersByQuestionId,
    buildCurrentAnswerValue,
    currentQuestion,
    handleFinishQuiz,
    questionIndex,
    totalQuestions,
  ]);

  const handleBackToLessons = useCallback(() => {
    const resolvedUnitId = unitId || lessonDetail?.unitId;

    if (resolvedUnitId) {
      router.replace(getLessonListRoute(levelId, resolvedUnitId));
      return;
    }

    router.replace("/");
  }, [levelId, lessonDetail?.unitId, router, unitId]);

  const handleBackToLesson = useCallback(() => {
    const resolvedUnitId = unitId || lessonDetail?.unitId;

    if (resolvedUnitId && lessonId) {
      router.replace(getLessonDetailRoute(levelId, resolvedUnitId, lessonId));
      return;
    }

    handleBackToLessons();
  }, [handleBackToLessons, lessonDetail?.unitId, lessonId, levelId, router, unitId]);

  const handleOpenNextLesson = useCallback(() => {
    const resolvedUnitId = unitId || lessonDetail?.unitId;
    const nextLessonId = lessonDetail?.nextLessonId;

    if (resolvedUnitId && nextLessonId) {
      router.replace(getLessonDetailRoute(levelId, resolvedUnitId, nextLessonId));
      return;
    }

    handleBackToLessons();
  }, [
    handleBackToLessons,
    lessonDetail?.nextLessonId,
    lessonDetail?.unitId,
    levelId,
    router,
    unitId,
  ]);

  const handleRetry = useCallback(() => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setTypedAnswer("");
    setAnswersByQuestionId({});
    setFinished(false);
    setQuizResult(null);
    setError(null);
    setLessonCompletionConfirmed(false);
    setLessonXpClaimResult(DEFAULT_LESSON_XP_CLAIM_RESULT);
  }, []);

  React.useEffect(() => {
    if (!currentQuestion) {
      setSelectedOption(null);
      setTypedAnswer("");
      return;
    }

    const savedAnswer = answersByQuestionId[currentQuestion.id] ?? "";

    if (isChoiceQuestion) {
      setSelectedOption(savedAnswer || null);
      setTypedAnswer("");
      return;
    }

    setTypedAnswer(savedAnswer);
    setSelectedOption(null);
  }, [answersByQuestionId, currentQuestion, isChoiceQuestion]);

  const practiceFeedback = useMemo(() => {
    if (!currentQuestion) {
      return null;
    }

    if (isChoiceQuestion) {
      if (!selectedOption) {
        return {
          tone: "neutral" as const,
          icon: "radio-button-off-outline" as const,
          title: "Choose the best answer",
          text: "Select one option, then continue when you are ready.",
        };
      }

      if (canEvaluateChoiceImmediately && selectedChoiceIsCorrect !== null) {
        return selectedChoiceIsCorrect
          ? {
              tone: "correct" as const,
              icon: "checkmark-circle" as const,
              title: "Correct",
              text:
                currentQuestion.explanation ||
                "Nice work. This answer matches the lesson check.",
            }
          : {
              tone: "incorrect" as const,
              icon: "close-circle" as const,
              title: "Not quite",
              text:
                currentQuestion.explanation ||
                "You can still continue, or pause and review the lesson before moving on.",
            };
      }

      return {
        tone: "selected" as const,
        icon: "checkmark-circle-outline" as const,
        title: "Answer selected",
        text: "Your choice is saved for this question. Continue when ready.",
      };
    }

    if (!typedAnswer.trim()) {
      return {
        tone: "neutral" as const,
        icon: "create-outline" as const,
        title: "Type your answer",
        text: "Enter your response, then continue when you are ready.",
      };
    }

    return {
      tone: "selected" as const,
      icon: "checkmark-circle-outline" as const,
      title: "Answer ready",
      text: `Your typed answer will be submitted with this ${quizModeLabel.toLowerCase()}.`,
    };
  }, [
    canEvaluateChoiceImmediately,
    currentQuestion,
    isChoiceQuestion,
    quizModeLabel,
    selectedChoiceIsCorrect,
    selectedOption,
    typedAnswer,
  ]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: theme.colors.bg }]}
      >
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: theme.colors.cardStrong,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.stateIconWrap}>
            <ActivityIndicator size="large" color={theme.colors.text} />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.text }]}>
            {`Loading ${quizLabel}`}
          </Text>
          <Text style={[styles.stateText, { color: theme.colors.muted }]}>
            {isFinalExam
              ? "Preparing the final assessment for this lesson."
              : "Preparing a short knowledge check for this lesson."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && questions.length === 0) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: theme.colors.bg }]}
      >
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: theme.colors.cardStrong,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.stateIconWrap,
              {
                backgroundColor:
                  theme.mode === "dark"
                    ? "rgba(245,158,11,0.14)"
                    : "rgba(245,158,11,0.08)",
                borderColor:
                  theme.mode === "dark"
                    ? "rgba(245,158,11,0.22)"
                    : "rgba(245,158,11,0.14)",
              },
            ]}
          >
            <Ionicons name="cloud-offline-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.text }]}>
            {`${quizLabel} unavailable`}
          </Text>
          <Text style={[styles.stateText, { color: theme.colors.muted }]}>
            {error}
          </Text>
          <Pressable
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.cardStrong,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleBackToLessons}
          >
            <Text
              style={[styles.secondaryButtonText, { color: theme.colors.text }]}
            >
              Back to lessons
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const percentage = quizResult?.score ?? 0;
    const passed = Boolean(quizResult?.passed);
    const completed = passed && lessonCompletionConfirmed;
    const correctCount = quizResult?.correctCount ?? 0;
    const resolvedTotalQuestions = quizResult?.totalQuestions ?? totalQuestions;
    const earnedXpAmount = quizResult?.xpGained ?? 0;
    const showEarnedXp = passed && earnedXpAmount > 0;
    const isRepeatCompletion =
      completed &&
      !showEarnedXp &&
      lessonXpClaimResult.status !== "claimed";
    const resultTitle = completed
      ? isRepeatCompletion
        ? "Already completed"
        : "Lesson completed"
      : passed
        ? isFinalExam
          ? "Final exam passed"
          : "Practice passed"
        : isFinalExam
          ? "Final exam not passed yet"
          : "Practice not passed yet";
    const resultSubtitle = completed
      ? isRepeatCompletion
        ? "This lesson was already completed earlier. You can review or retake the exam, but no new XP is available."
        : "Your lesson progress is updated. You can return to the lesson list and continue forward."
      : passed
        ? `Your ${quizModeLabel.toLowerCase()} result was recorded, but lesson progress still needs to finish updating.`
        : isFinalExam
          ? "Review the lesson content and try the final exam again when you are ready."
          : "Review the lesson content and try the practice quiz again when you are ready.";
    const completionBannerText = isRepeatCompletion
      ? "This lesson was already marked as completed. Retakes do not award additional XP."
      : "This lesson is now marked as completed.";

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.bg }]}
      >
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: theme.colors.cardStrong,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <LinearGradient
            colors={
              completed
                ? ["rgba(34,197,94,0.14)", "rgba(34,197,94,0)"]
                : passed
                  ? ["rgba(37,99,235,0.14)", "rgba(37,99,235,0)"]
                  : ["rgba(245,158,11,0.16)", "rgba(245,158,11,0)"]
            }
            style={styles.resultGlow}
          />
          <Animated.View
            entering={
              passed ? ZoomIn.springify().damping(14) : ZoomIn.duration(260)
            }
            style={[
              styles.resultIconWrap,
              completed
                ? styles.resultSuccess
                : passed
                  ? styles.resultInfo
                  : styles.resultFailure,
            ]}
          >
            <Ionicons
              name={
                completed
                  ? "checkmark-circle"
                  : passed
                    ? "school"
                    : "refresh-circle"
              }
              size={34}
              color={completed ? "#22C55E" : passed ? "#60A5FA" : "#F59E0B"}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(60).duration(260)}
            style={styles.resultEyebrow}
          >
            {quizLabel}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(90).duration(260)}
            style={styles.resultTitle}
          >
            {resultTitle}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(120).duration(260)}
            style={styles.resultSubtitle}
          >
            {resultSubtitle}
          </Animated.Text>

          {completed ? (
            <Animated.View
              entering={FadeInDown.delay(150).duration(280)}
              style={styles.completionBanner}
            >
              <View style={styles.completionBannerIcon}>
                <Ionicons
                  name="checkmark-done-circle"
                  size={18}
                  color="#22C55E"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.completionBannerTitle}>
                  {isRepeatCompletion ? "Already completed" : "Progress updated"}
                </Text>
                <Text style={styles.completionBannerText}>
                  {completionBannerText}
                </Text>
              </View>
            </Animated.View>
          ) : null}

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{percentage}%</Text>
              <Text style={styles.resultStatLabel}>Score</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>
                {correctCount}/{resolvedTotalQuestions}
              </Text>
              <Text style={styles.resultStatLabel}>Correct</Text>
            </View>
            {showEarnedXp ? (
              <Animated.View
                entering={FadeInDown.delay(200).duration(280)}
                style={[styles.resultStat, styles.xpStat]}
              >
                <Text style={styles.resultStatValue}>
                  +{earnedXpAmount}
                </Text>
                <Text style={styles.resultStatLabel}>XP gained</Text>
              </Animated.View>
            ) : null}
          </View>

          {error ? <Text style={styles.inlineError}>{error}</Text> : null}
          {submitting ? (
            <View style={styles.submittingRow}>
              <ActivityIndicator color={theme.colors.text} />
              <Text style={[styles.stateText, { color: theme.colors.muted }]}>
                Updating lesson progress...
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleBackToLessons}
          >
            <Text style={styles.primaryButtonText}>Back to lessons</Text>
          </Pressable>

          {completed && lessonDetail?.nextLessonId ? (
            <Pressable
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={handleOpenNextLesson}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.text },
                ]}
              >
                Next Lesson
              </Text>
            </Pressable>
          ) : null}

          {!passed ? (
            <Pressable
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={handleRetry}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.text },
                ]}
              >
                {isFinalExam ? "Restart Final Exam" : "Restart Practice Quiz"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: theme.colors.bg }]}
      >
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: theme.colors.cardStrong,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.stateIconWrap}>
            <Ionicons
              name="help-buoy-outline"
              size={24}
              color={theme.colors.text}
            />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.text }]}>
            {isFinalExam ? "No final exam questions yet" : "No practice questions yet"}
          </Text>
          <Text style={[styles.stateText, { color: theme.colors.muted }]}>
            {isFinalExam
              ? "This lesson does not have a final exam yet."
              : "This lesson does not have a practice quiz yet."}
          </Text>
          <Pressable
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.cardStrong,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleBackToLessons}
          >
            <Text
              style={[styles.secondaryButtonText, { color: theme.colors.text }]}
            >
              Back to lessons
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
    >
      <View style={styles.header}>
        <View style={styles.headerMainRow}>
          <Pressable
            onPress={handleBackToLesson}
            hitSlop={6}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.colors.cardStrong,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerEyebrow, { color: theme.colors.muted }]}>
              {quizLabel}
            </Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {quizShortTitle}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.progressPill,
            {
              backgroundColor:
                theme.mode === "dark"
                  ? "rgba(37,99,235,0.16)"
                  : "rgba(37,99,235,0.10)",
              borderColor:
                theme.mode === "dark"
                  ? "rgba(59,130,246,0.2)"
                  : "rgba(59,130,246,0.16)",
            },
          ]}
        >
          <Text
            style={[
              styles.progressPillText,
              { color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8" },
            ]}
          >
            {progress}%
          </Text>
        </View>
      </View>

      <Text style={[styles.headerMetaText, { color: theme.colors.muted }]}>
        Question {questionIndex + 1} of {totalQuestions}
      </Text>

      <View
        style={[
          styles.progressTrack,
          {
            backgroundColor:
              theme.mode === "dark"
                ? "rgba(255,255,255,0.08)"
                : "rgba(148,163,184,0.2)",
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor: theme.colors.primaryMuted,
            },
          ]}
        />
      </View>

      <View style={styles.quizMetaRow}>
        <View style={styles.quizMetaCard}>
          <Text style={styles.quizMetaLabel}>Mode</Text>
          <Text style={styles.quizMetaValue}>{quizModeLabel}</Text>
        </View>
        <View style={styles.quizMetaCard}>
          <Text style={styles.quizMetaLabel}>Answered</Text>
          <Text style={styles.quizMetaValue}>
            {answeredCount + (canSubmitAnswer ? 1 : 0)}/{totalQuestions}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.questionCard,
            {
              backgroundColor: theme.colors.cardStrong,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.questionBadge}>
            <Ionicons name="sparkles-outline" size={14} color="#A78BFA" />
            <Text style={styles.questionBadgeText}>
              {isChoiceQuestion ? "Choose one answer" : "Type your answer"}
            </Text>
          </View>

          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            {currentQuestion.prompt}
          </Text>

          <Text
            style={[styles.questionHelperText, { color: theme.colors.muted }]}
          >
            {isFinalExam
              ? "This final exam checks your understanding across the full lesson."
              : "This practice quiz is meant to help you check understanding before moving on."}
          </Text>

          {practiceFeedback ? (
            <Animated.View
              entering={FadeInDown.duration(180)}
              style={[
                styles.feedbackCard,
                practiceFeedback.tone === "correct"
                  ? styles.feedbackCardCorrect
                  : practiceFeedback.tone === "incorrect"
                    ? styles.feedbackCardIncorrect
                    : practiceFeedback.tone === "selected"
                      ? styles.feedbackCardSelected
                      : styles.feedbackCardNeutral,
              ]}
            >
              <Ionicons
                name={practiceFeedback.icon}
                size={18}
                color={
                  practiceFeedback.tone === "correct"
                    ? "#22C55E"
                    : practiceFeedback.tone === "incorrect"
                      ? "#F87171"
                      : practiceFeedback.tone === "selected"
                        ? "#60A5FA"
                        : "#94A3B8"
                }
              />
              <View style={styles.feedbackTextWrap}>
                <Text style={styles.feedbackTitle}>{practiceFeedback.title}</Text>
                <Text style={styles.feedbackText}>{practiceFeedback.text}</Text>
              </View>
            </Animated.View>
          ) : null}

          {isChoiceQuestion ? (
            <View style={styles.optionsWrap}>
              {currentQuestion.options?.map((option, index) => {
                const selected = selectedOption === option;
                const optionLetter = getOptionLetter(index);
                const isCorrectOption =
                  Boolean(correctOptionText || correctOptionLetter) &&
                  (option === correctOptionText ||
                    optionLetter === correctOptionLetter ||
                    `${index}` === correctOptionLetter ||
                    `${index + 1}` === correctOptionLetter);
                const shouldRevealCorrectOption =
                  canEvaluateChoiceImmediately &&
                  selectedChoiceIsCorrect === false &&
                  isCorrectOption;
                const showIncorrectState =
                  canEvaluateChoiceImmediately &&
                  selectedChoiceIsCorrect === false &&
                  selected;
                const showCorrectState =
                  canEvaluateChoiceImmediately &&
                  (selectedChoiceIsCorrect === true ? selected : shouldRevealCorrectOption);

                return (
                  <Pressable
                    key={option}
                    onPress={() => setSelectedOption(option)}
                    style={({ pressed }) => [
                      styles.optionButton,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                      selected ? styles.optionButtonSelected : null,
                      showCorrectState ? styles.optionButtonCorrect : null,
                      showIncorrectState ? styles.optionButtonIncorrect : null,
                      pressed ? styles.optionButtonPressed : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionLetterWrap,
                        selected ? styles.optionLetterWrapSelected : null,
                        showCorrectState ? styles.optionLetterWrapCorrect : null,
                        showIncorrectState ? styles.optionLetterWrapIncorrect : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetterText,
                          selected ? styles.optionLetterTextSelected : null,
                          showCorrectState ? styles.optionLetterTextCorrect : null,
                          showIncorrectState ? styles.optionLetterTextIncorrect : null,
                        ]}
                      >
                        {optionLetter}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: theme.mode === "dark" ? "#E2E8F0" : "#0F172A",
                        },
                        selected ? styles.optionTextSelected : null,
                        showCorrectState ? styles.optionTextCorrect : null,
                        showIncorrectState ? styles.optionTextIncorrect : null,
                      ]}
                    >
                      {option}
                    </Text>
                    {showCorrectState ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22C55E"
                      />
                    ) : showIncorrectState ? (
                      <Ionicons name="close-circle" size={18} color="#F87171" />
                    ) : selected ? (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color="#60A5FA"
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <TextInput
              value={typedAnswer}
              onChangeText={setTypedAnswer}
              placeholder="Type your answer"
              placeholderTextColor="#94A3B8"
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              autoCapitalize="none"
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.cardStrong,
                borderColor: theme.colors.border,
              },
              pressed ? styles.secondaryButtonPressed : null,
            ]}
            onPress={handleBackToLesson}
          >
          <Text
            style={[styles.secondaryButtonText, { color: theme.colors.text }]}
          >
            Continue Lesson
          </Text>
        </Pressable>
        <Pressable
          disabled={!canSubmitAnswer}
          onPress={() => {
            void handleNext();
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            !canSubmitAnswer ? styles.primaryButtonDisabled : null,
            pressed && canSubmitAnswer ? styles.primaryButtonPressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {questionIndex === totalQuestions - 1
              ? isFinalExam
                ? "Finish Final Exam"
                : "Finish Practice Quiz"
              : "Next Question"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 14,
  },
  stateCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    padding: 26,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
  },
  stateIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.12)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.16)",
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "center",
  },
  header: {
    gap: 10,
    marginBottom: 12,
  },
  headerMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitleWrap: {
    flex: 1,
    gap: 1,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  headerMetaText: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  progressPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  quizMetaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  quizMetaCard: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: "rgba(37,99,235,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.14)",
  },
  quizMetaLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quizMetaValue: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  questionCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  questionBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.12)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.18)",
  },
  questionBadgeText: {
    color: "#D8B4FE",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  questionText: {
    fontSize: 21,
    lineHeight: 29,
    fontWeight: "900",
  },
  questionHelperText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  feedbackCardNeutral: {
    backgroundColor: "rgba(148,163,184,0.08)",
    borderColor: "rgba(148,163,184,0.16)",
  },
  feedbackCardSelected: {
    backgroundColor: "rgba(37,99,235,0.1)",
    borderColor: "rgba(96,165,250,0.18)",
  },
  feedbackCardCorrect: {
    backgroundColor: "rgba(34,197,94,0.1)",
    borderColor: "rgba(34,197,94,0.18)",
  },
  feedbackCardIncorrect: {
    backgroundColor: "rgba(248,113,113,0.08)",
    borderColor: "rgba(248,113,113,0.16)",
  },
  feedbackTextWrap: {
    flex: 1,
    gap: 2,
  },
  feedbackTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "800",
  },
  feedbackText: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  optionsWrap: {
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderWidth: 1,
  },
  optionButtonSelected: {
    backgroundColor: "rgba(37,99,235,0.18)",
    borderColor: "rgba(96,165,250,0.35)",
  },
  optionButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  optionButtonCorrect: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(34,197,94,0.28)",
  },
  optionButtonIncorrect: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderColor: "rgba(248,113,113,0.22)",
  },
  optionLetterWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(148,163,184,0.14)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
  },
  optionLetterWrapSelected: {
    backgroundColor: "rgba(37,99,235,0.18)",
    borderColor: "rgba(96,165,250,0.35)",
  },
  optionLetterWrapCorrect: {
    backgroundColor: "rgba(34,197,94,0.16)",
    borderColor: "rgba(34,197,94,0.28)",
  },
  optionLetterWrapIncorrect: {
    backgroundColor: "rgba(248,113,113,0.14)",
    borderColor: "rgba(248,113,113,0.24)",
  },
  optionLetterText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "900",
  },
  optionLetterTextSelected: {
    color: "#BFDBFE",
  },
  optionLetterTextCorrect: {
    color: "#BBF7D0",
  },
  optionLetterTextIncorrect: {
    color: "#FECACA",
  },
  optionText: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    flex: 1,
  },
  optionTextSelected: {
    color: "#BFDBFE",
  },
  optionTextCorrect: {
    color: "#DCFCE7",
  },
  optionTextIncorrect: {
    color: "#FECACA",
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    fontWeight: "600",
    borderWidth: 1,
  },
  footerActions: {
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.3)",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minWidth: 180,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  resultCard: {
    flex: 1,
    justifyContent: "center",
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    gap: 18,
    overflow: "hidden",
    position: "relative",
  },
  resultGlow: {
    position: "absolute",
    top: -24,
    right: -12,
    width: 180,
    height: 180,
    borderRadius: 999,
  },
  resultIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  resultSuccess: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.22)",
  },
  resultInfo: {
    backgroundColor: "rgba(37,99,235,0.12)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.22)",
  },
  resultFailure: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
  },
  resultEyebrow: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  resultSubtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
  },
  resultStats: {
    flexDirection: "row",
    gap: 12,
  },
  resultStat: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(30,41,59,0.72)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.45)",
  },
  xpStat: {
    backgroundColor: "rgba(250,204,21,0.12)",
    borderColor: "rgba(250,204,21,0.18)",
  },
  resultStatValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  resultStatLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    textTransform: "uppercase",
  },
  inlineError: {
    color: "#FCA5A5",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(34,197,94,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
  },
  completionBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  completionBannerTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "900",
  },
  completionBannerText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
