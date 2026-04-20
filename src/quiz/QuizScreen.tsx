import { api } from "@/lib/api";
import { completeLesson, fetchLessonDetail } from "@/lib/learning";
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
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

type Question = {
  id: string;
  type?: string;
  prompt: string;
  options?: string[];
  correctAnswer?: unknown;
};

const PASS_PERCENTAGE = 70;

function normalizeValue(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export default function QuizScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{
    lessonId?: string;
    levelId?: string;
    unitId?: string;
  }>();
  const { lessonId, levelId, unitId } = getNormalizedLearningParams(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonXpReward, setLessonXpReward] = useState(0);

  React.useEffect(() => {
    const loadQuiz = async () => {
      if (!lessonId) {
        setError("Quiz not found.");
        setLoading(false);
        return;
      }

      try {
        const [quizRes, lessonDetail] = await Promise.all([
          api.get(`/lessons/${lessonId}/quiz`),
          fetchLessonDetail(lessonId),
        ]);
        const responseData = quizRes.data as any;
        const payload = responseData?.data ?? responseData;
        const nextQuestions = Array.isArray(payload?.questions)
          ? payload.questions
          : [];

        setQuestions(nextQuestions);
        setLessonXpReward(lessonDetail?.xpReward ?? 0);
      } catch (loadError) {
        console.log("Quiz load error:", loadError);
        setError("We could not load this quiz right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadQuiz();
  }, [lessonId]);

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions
    ? Math.round(((questionIndex + 1) / totalQuestions) * 100)
    : 0;

  const isChoiceQuestion = useMemo(() => {
    if (!currentQuestion) return false;
    return (
      Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
    );
  }, [currentQuestion]);

  const canSubmitAnswer = isChoiceQuestion
    ? Boolean(selectedOption)
    : typedAnswer.trim().length > 0;

  const isAnswerCorrect = useCallback(
    (question: Question) => {
      if (Array.isArray(question.options) && question.options.length > 0) {
        return (
          normalizeValue(selectedOption) === normalizeValue(question.correctAnswer)
        );
      }

      return normalizeValue(typedAnswer) === normalizeValue(question.correctAnswer);
    },
    [selectedOption, typedAnswer],
  );

  const handleFinishQuiz = useCallback(
    async (nextCorrectCount: number) => {
      const percentage = totalQuestions
        ? Math.round((nextCorrectCount / totalQuestions) * 100)
        : 0;
      const nextPassed = percentage >= PASS_PERCENTAGE;

      setPassed(nextPassed);
      setFinished(true);

      if (!nextPassed || !lessonId) {
        return;
      }

      setSubmitting(true);
      try {
        await completeLesson(lessonId);
      } catch (submitError) {
        console.log("Quiz completion error:", submitError);
        setError("Quiz passed, but we could not update lesson progress yet.");
      } finally {
        setSubmitting(false);
      }
    },
    [lessonId, totalQuestions],
  );

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;

    const answerIsCorrect = isAnswerCorrect(currentQuestion);
    const nextCorrectCount = correctCount + (answerIsCorrect ? 1 : 0);

    if (questionIndex === totalQuestions - 1) {
      setCorrectCount(nextCorrectCount);
      await handleFinishQuiz(nextCorrectCount);
      return;
    }

    setCorrectCount(nextCorrectCount);
    setQuestionIndex((current) => current + 1);
    setSelectedOption(null);
    setTypedAnswer("");
  }, [
    correctCount,
    currentQuestion,
    handleFinishQuiz,
    isAnswerCorrect,
    questionIndex,
    totalQuestions,
  ]);

  const handleBackToLessons = useCallback(() => {
    if (unitId) {
      router.replace(getLessonListRoute(levelId, unitId));
      return;
    }

    router.back();
  }, [levelId, router, unitId]);

  const handleBackToLesson = useCallback(() => {
    if (unitId && lessonId) {
      router.replace(getLessonDetailRoute(levelId, unitId, lessonId));
      return;
    }

    handleBackToLessons();
  }, [handleBackToLessons, lessonId, levelId, router, unitId]);

  const handleRetry = useCallback(() => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setTypedAnswer("");
    setCorrectCount(0);
    setFinished(false);
    setPassed(false);
    setError(null);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <View
          style={[
            styles.stateCard,
            { backgroundColor: theme.colors.cardStrong, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.stateIconWrap}>
            <ActivityIndicator size="large" color={theme.colors.text} />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.text }]}>Loading quiz</Text>
          <Text style={[styles.stateText, { color: theme.colors.muted }]}>
            Preparing the questions for this lesson.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && questions.length === 0) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <View
          style={[
            styles.stateCard,
            { backgroundColor: theme.colors.cardStrong, borderColor: theme.colors.border },
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
            Quiz unavailable
          </Text>
          <Text style={[styles.stateText, { color: theme.colors.muted }]}>{error}</Text>
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
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              Back to lessons
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const percentage = totalQuestions
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
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
              passed
                ? ["rgba(34,197,94,0.14)", "rgba(34,197,94,0)"]
                : ["rgba(245,158,11,0.16)", "rgba(245,158,11,0)"]
            }
            style={styles.resultGlow}
          />
          <Animated.View
            entering={passed ? ZoomIn.springify().damping(14) : ZoomIn.duration(260)}
            style={[
              styles.resultIconWrap,
              passed ? styles.resultSuccess : styles.resultFailure,
            ]}
          >
            <Ionicons
              name={passed ? "checkmark-circle" : "refresh-circle"}
              size={34}
              color={passed ? "#22C55E" : "#F59E0B"}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(60).duration(260)}
            style={styles.resultTitle}
          >
            {passed ? "Lesson completed" : "Quiz not passed yet"}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(110).duration(260)}
            style={styles.resultSubtitle}
          >
            {passed
              ? "Nice work. Your lesson progress has been updated and the next lesson should now unlock."
              : `You need ${PASS_PERCENTAGE}% or higher to complete this lesson.`}
          </Animated.Text>

          {passed ? (
            <Animated.View
              entering={FadeInDown.delay(150).duration(280)}
              style={styles.completionBanner}
            >
              <View style={styles.completionBannerIcon}>
                <Ionicons name="checkmark-done-circle" size={18} color="#22C55E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.completionBannerTitle}>Progress updated</Text>
                <Text style={styles.completionBannerText}>
                  This lesson is now marked as completed.
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
                {correctCount}/{totalQuestions}
              </Text>
              <Text style={styles.resultStatLabel}>Correct</Text>
            </View>
            {passed ? (
              <Animated.View
                entering={FadeInDown.delay(200).duration(280)}
                style={[styles.resultStat, styles.xpStat]}
              >
                <Text style={styles.resultStatValue}>+{lessonXpReward}</Text>
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
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleBackToLessons}
          >
            <Text style={styles.primaryButtonText}>Back to lessons</Text>
          </Pressable>

          {!passed ? (
            <Pressable
              style={[
                styles.secondaryButton,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
              onPress={handleRetry}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Retry quiz
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <View
          style={[
            styles.stateCard,
            { backgroundColor: theme.colors.cardStrong, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.stateIconWrap}>
            <Ionicons name="help-buoy-outline" size={24} color={theme.colors.text} />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.text }]}>
            No questions yet
          </Text>
          <Text style={[styles.stateText, { color: theme.colors.muted }]}>
            This lesson does not have a quiz yet.
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
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              Back to lessons
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBackToLesson}
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
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Lesson quiz
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.muted }]}>
            Question {questionIndex + 1} of {totalQuestions}
          </Text>
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
            { width: `${progress}%`, backgroundColor: theme.colors.primaryMuted },
          ]}
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.questionCard,
            { backgroundColor: theme.colors.cardStrong, borderColor: theme.colors.border },
          ]}
        >
          <LinearGradient
            colors={
              theme.mode === "dark"
                ? ["rgba(37,99,235,0.14)", "rgba(124,58,237,0.08)"]
                : ["rgba(37,99,235,0.08)", "rgba(124,58,237,0.04)"]
            }
            style={styles.questionCardGlow}
          />
          <View
            style={[
              styles.questionBadge,
              {
                backgroundColor:
                  theme.mode === "dark"
                    ? "rgba(124,58,237,0.14)"
                    : "rgba(124,58,237,0.08)",
                borderColor:
                  theme.mode === "dark"
                    ? "rgba(167,139,250,0.18)"
                    : "rgba(124,58,237,0.14)",
              },
            ]}
          >
            <Ionicons name="help-circle-outline" size={15} color="#A78BFA" />
            <Text style={styles.questionBadgeText}>
              {isChoiceQuestion ? "Choose one answer" : "Type your answer"}
            </Text>
          </View>

          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            {currentQuestion.prompt}
          </Text>

          {isChoiceQuestion ? (
            <View style={styles.optionsWrap}>
              {currentQuestion.options?.map((option) => {
                const selected = selectedOption === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setSelectedOption(option)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                      selected ? styles.optionButtonSelected : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIndicator,
                        {
                          borderColor: selected ? "#60A5FA" : theme.colors.border,
                          backgroundColor: selected
                            ? theme.mode === "dark"
                              ? "rgba(37,99,235,0.18)"
                              : "rgba(37,99,235,0.08)"
                            : "transparent",
                        },
                      ]}
                    >
                      {selected ? (
                        <Ionicons name="checkmark" size={14} color="#60A5FA" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.mode === "dark" ? "#E2E8F0" : "#0F172A" },
                        selected ? styles.optionTextSelected : null,
                      ]}
                    >
                      {option}
                    </Text>
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

      <Pressable
        disabled={!canSubmitAnswer}
        onPress={() => {
          void handleNext();
        }}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
          !canSubmitAnswer ? styles.primaryButtonDisabled : null,
        ]}
      >
        <Text style={styles.primaryButtonText}>
          {questionIndex === totalQuestions - 1 ? "Finish quiz" : "Next question"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,41,59,0.7)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.6)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  progressPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(37,99,235,0.16)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
  },
  progressPillText: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  questionCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(15,23,42,0.88)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.65)",
    gap: 20,
    overflow: "hidden",
    position: "relative",
  },
  questionCardGlow: {
    position: "absolute",
    top: -28,
    right: -24,
    width: 160,
    height: 160,
    borderRadius: 999,
  },
  questionBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.14)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.18)",
  },
  questionBadgeText: {
    color: "#D8B4FE",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "900",
  },
  optionsWrap: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 17,
    backgroundColor: "rgba(30,41,59,0.72)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.45)",
  },
  optionButtonSelected: {
    backgroundColor: "rgba(37,99,235,0.18)",
    borderColor: "rgba(96,165,250,0.35)",
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  optionText: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    flex: 1,
  },
  optionTextSelected: {
    color: "#BFDBFE",
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    fontWeight: "600",
    borderWidth: 1,
  },
  primaryButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.3)",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
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
    backgroundColor: "rgba(30,41,59,0.72)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.45)",
    minWidth: 180,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  resultCard: {
    flex: 1,
    justifyContent: "center",
    borderRadius: 28,
    padding: 26,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.65)",
    gap: 20,
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
  resultFailure: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
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
  stateTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  stateText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "center",
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
