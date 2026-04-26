import { Ionicons } from "@expo/vector-icons";
import {
  fetchXpWalletSummary,
  spendXpForHint,
} from "@/src/features/achievements/achievements.service";
import { notifyXpUpdated } from "@/src/features/achievements/xp-events";
import { normalizeTestLevelId } from "@/src/features/test/constants/testLevels";
import { useTestSession } from "@/src/features/test/hooks/useTestSession";
import { testService } from "@/src/features/test/services/test.service";
import {
  TestOption,
  TestQuestion,
  TestType,
} from "@/src/features/test/types/test.types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type HintFeedbackTone = "info" | "warning" | "success";

type HintFeedback = {
  tone: HintFeedbackTone;
  message: string;
};

type WalletSummaryCopy = {
  title: string;
  subtitle: string;
};

export default function TestSessionScreen() {
  const router = useRouter();
  const { levelId, testType } = useLocalSearchParams<{
    levelId?: string;
    testType?: TestType;
  }>();

  const safeLevel = normalizeTestLevelId(levelId) ?? "M1";
  const safeType = (testType ?? "vocabulary") as TestType;

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [walletXp, setWalletXp] = useState(0);
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [hintXpCost, setHintXpCost] = useState<number | null>(null);
  const [hintPending, setHintPending] = useState(false);
  const [hintFeedback, setHintFeedback] = useState<HintFeedback | null>(null);
  const [hiddenOptionIdsByQuestion, setHiddenOptionIdsByQuestion] = useState<
    Record<string, string[]>
  >({});
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await testService.getQuestions(safeLevel, safeType);

        if (mounted) {
          setQuestions(data);
        }
      } catch (error) {
        console.log("Test questions load failed:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [safeLevel, safeType]);

  useEffect(() => {
    let mounted = true;

    async function loadWallet() {
      try {
        const summary = await fetchXpWalletSummary();

        if (!mounted) {
          return;
        }

        setWalletXp(summary.totalXp);
        setHintXpCost(summary.hintXpCost);
      } catch (error) {
        console.log("Wallet XP fetch failed:", error);

        if (!mounted) {
          return;
        }

        setHintXpCost(null);
      } finally {
        if (mounted) {
          setWalletLoaded(true);
        }
      }
    }

    void loadWallet();

    return () => {
      mounted = false;
    };
  }, []);

  const {
    currentQuestion,
    selectedOptionId,
    selectOption,
    clearSelectedOption,
    saveCurrentAnswer,
    goNext,
    isLastQuestion,
    buildSubmitPayload,
    progress,
    hasQuestions,
    currentIndex,
    totalQuestions,
  } = useTestSession(questions, safeLevel, safeType);

  useEffect(() => {
    setHintFeedback(null);
  }, [currentIndex]);

  const currentHiddenOptionIds = useMemo(
    () => (currentQuestion ? hiddenOptionIdsByQuestion[currentQuestion.id] ?? [] : []),
    [currentQuestion, hiddenOptionIdsByQuestion],
  );

  const visibleOptions = useMemo(() => {
    if (!currentQuestion) {
      return [];
    }

    return currentQuestion.options.filter(
      (option) => !currentHiddenOptionIds.includes(option.id),
    );
  }, [currentHiddenOptionIds, currentQuestion]);

  const isMultipleChoiceQuestion = Boolean(
    currentQuestion &&
      Array.isArray(currentQuestion.options) &&
      currentQuestion.options.length > 0,
  );
  const hintCostKnown = typeof hintXpCost === "number" && hintXpCost > 0;
  const hasEnoughOptionsForHint = (currentQuestion?.options.length ?? 0) >= 4;
  const hintAlreadyUsed = Boolean(currentQuestion && currentHiddenOptionIds.length > 0);
  const hasEnoughXpForHint = hintCostKnown && walletXp >= hintXpCost;
  const canUseHint =
    Boolean(currentQuestion) &&
    isMultipleChoiceQuestion &&
    hintCostKnown &&
    hasEnoughOptionsForHint &&
    hasEnoughXpForHint &&
    !hintAlreadyUsed &&
    !hintPending;

  function getHintDisabledReason() {
    if (!isMultipleChoiceQuestion) {
      return "Hints are only available on multiple-choice questions.";
    }

    if (!walletLoaded) {
      return "Checking your XP balance...";
    }

    if (!hintCostKnown) {
      return "Hint cost is unavailable right now.";
    }

    if (!hasEnoughOptionsForHint) {
      return "This question needs at least 4 answer choices for a hint.";
    }

    if (hintAlreadyUsed) {
      return "You already used a hint on this question.";
    }

    if (!hasEnoughXpForHint) {
      return `You need ${hintXpCost} XP to use this hint.`;
    }

    return "Hint unavailable right now.";
  }

  async function refreshWalletXp() {
    try {
      const summary = await fetchXpWalletSummary();
      setWalletXp(summary.totalXp);
      setHintXpCost(summary.hintXpCost);
      return summary;
    } catch (error) {
      console.log("Wallet XP refresh failed:", error);
    } finally {
      setWalletLoaded(true);
    }

    return null;
  }

  function buildHiddenOptionIds(
    question: TestQuestion,
    backendIds: string[],
  ): string[] {
    const validOptionIds = new Set(question.options.map((option) => option.id));
    return Array.from(
      new Set(backendIds.filter((optionId) => validOptionIds.has(optionId))),
    ).slice(0, 2);
  }

  async function handleUseHint() {
    if (!currentQuestion) {
      return;
    }

    if (!canUseHint) {
      setHintFeedback({
        tone: "warning",
        message: getHintDisabledReason(),
      });
      return;
    }

    try {
      setHintPending(true);
      setHintFeedback(null);

      const result = await spendXpForHint(currentQuestion.id);

      if (!result.spent) {
        const refreshedSummary = await refreshWalletXp();
        setHintFeedback({
          tone: "warning",
          message:
            hintXpCost !== null
              ? `You need ${hintXpCost} XP to use this hint. Current balance: ${refreshedSummary?.totalXp ?? walletXp} XP.`
              : "You do not have enough XP to use this hint.",
        });
        return;
      }

      const hiddenOptionIds = buildHiddenOptionIds(
        currentQuestion,
        result.eliminatedOptionIds,
      );

      if (hiddenOptionIds.length === 0) {
        notifyXpUpdated();
        const refreshedSummary = await refreshWalletXp();
        setHintFeedback({
          tone: "warning",
          message: `Hint used for ${result.amount ?? hintXpCost ?? 0} XP, but no answers were returned to hide. Remaining XP: ${refreshedSummary?.totalXp ?? walletXp}.`,
        });
        return;
      }

      const spentAmount = result.amount ?? hintXpCost ?? 0;
      setHiddenOptionIdsByQuestion((current) => ({
        ...current,
        [currentQuestion.id]: hiddenOptionIds,
      }));

      notifyXpUpdated();
      const refreshedSummary = await refreshWalletXp();
      const remainingXp = refreshedSummary?.totalXp ?? walletXp;

      if (selectedOptionId && hiddenOptionIds.includes(selectedOptionId)) {
        clearSelectedOption();
        setHintFeedback({
          tone: "success",
          message: `Hint used for ${spentAmount} XP. Two incorrect answers were removed, so please choose again. Remaining XP: ${remainingXp}.`,
        });
      } else {
        setHintFeedback({
          tone: "success",
          message: `Hint used for ${spentAmount} XP. Two incorrect answers were removed. Remaining XP: ${remainingXp}.`,
        });
      }
    } catch (error) {
      console.log("Hint XP spend failed:", error);
      setHintFeedback({
        tone: "warning",
        message: "We could not use a hint right now. Please try again.",
      });
    } finally {
      setHintPending(false);
    }
  }

  async function handleNext() {
    if (!selectedOptionId) {
      Alert.alert("Select answer", "Please choose one option first.");
      return;
    }

    const nextAnswersByQuestionId = saveCurrentAnswer();
    if (!nextAnswersByQuestionId) {
      return;
    }

    if (isLastQuestion) {
      try {
        setSubmittingTest(true);
        const result = await testService.submitTest(
          buildSubmitPayload(nextAnswersByQuestionId),
        );

        notifyXpUpdated();
        await refreshWalletXp();

        router.replace({
          pathname: "/test/result/[levelId]" as any,
          params: {
            levelId: safeLevel,
            testType: safeType,
            score: String(result.score),
            passed: String(result.passed),
            correctCount: String(result.correctCount),
            totalQuestions: String(result.totalQuestions),
            xpGained: String(result.xpGained),
          },
        });
      } catch (error) {
        console.log("Test submit failed:", error);
        Alert.alert(
          "Could not submit exam",
          "We could not submit your answers right now. Please try again.",
        );
      } finally {
        setSubmittingTest(false);
      }
      return;
    }

    goNext();
  }

  function handleQuit() {
    Alert.alert("Leave exam?", "Your current exam progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Leave exam", style: "destructive", onPress: () => router.back() },
    ]);
  }

  const hintButtonLabel = hintCostKnown ? `Use Hint (${hintXpCost} XP)` : "Hint unavailable";
  const hintHelperText = hintAlreadyUsed
    ? "Hint already used on this question."
    : hintCostKnown
      ? `Remove 2 wrong answers for ${hintXpCost} XP`
      : walletLoaded
        ? "Hint cost is not available right now."
        : "Checking hint cost...";
  const walletSummaryCopy: WalletSummaryCopy = walletLoaded
    ? {
        title: `${walletXp} XP available`,
        subtitle: hintCostKnown
          ? `Hints cost ${hintXpCost} XP. Tests do not cost XP to start.`
          : "Hints use XP, but tests do not cost XP to start.",
      }
    : {
        title: "Loading XP wallet",
        subtitle: "Checking your current XP balance for hints.",
      };

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.center}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#F8FAFC" />
          <Text style={styles.loadingTitle}>Loading Final Lesson Exam</Text>
          <Text style={styles.loadingText}>
            Preparing the full assessment for this skill.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasQuestions || !currentQuestion) {
    return (
      <SafeAreaView edges={["top"]} style={styles.center}>
        <Text style={styles.emptyTitle}>No exam questions yet</Text>
        <Text style={styles.emptyText}>
          This exam is not ready for {safeLevel} yet.
        </Text>

        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Back to exams</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!examStarted) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleQuit} hitSlop={6} style={styles.headerIcon}>
            <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>Final Lesson Exam</Text>
            <Text style={styles.headerTitle}>Assessment overview</Text>
          </View>
        </View>

        <View style={styles.examIntroCard}>
          <View style={styles.examIntroBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#F59E0B" />
            <Text style={styles.examIntroBadgeText}>Assessment</Text>
          </View>

          <Text style={styles.examIntroTitle}>Final lesson exam</Text>
          <Text style={styles.examIntroText}>
            This final exam is separate from the lesson practice quiz. Complete every
            question to receive your official backend-evaluated result for this skill.
          </Text>

          <View style={styles.examIntroMetaGrid}>
            <View style={styles.examIntroMetaCard}>
              <Text style={styles.examIntroMetaLabel}>Questions</Text>
              <Text style={styles.examIntroMetaValue}>{totalQuestions}</Text>
            </View>
            <View style={styles.examIntroMetaCard}>
              <Text style={styles.examIntroMetaLabel}>Scoring</Text>
              <Text style={styles.examIntroMetaValue}>Backend evaluated</Text>
            </View>
          </View>

          <View style={styles.examIntroMetaGrid}>
            <View style={styles.examIntroMetaCard}>
              <Text style={styles.examIntroMetaLabel}>Passing</Text>
              <Text style={styles.examIntroMetaValue}>Verified on submit</Text>
            </View>
            <View style={styles.examIntroMetaCard}>
              <Text style={styles.examIntroMetaLabel}>XP reward</Text>
              <Text style={styles.examIntroMetaValue}>Applied on submit</Text>
            </View>
          </View>

          <View style={styles.examIntroNotice}>
            <Ionicons name="information-circle-outline" size={16} color="#FCD34D" />
            <Text style={styles.examIntroNoticeText}>
              Hint spending is optional. Your pass requirement and XP reward are both
              confirmed by the backend when you submit.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.secondaryBtn} onPress={handleQuit}>
            <Text style={styles.secondaryBtnText}>Back to exams</Text>
          </Pressable>

          <Pressable style={styles.primaryBtn} onPress={() => setExamStarted(true)}>
            <Text style={styles.primaryBtnText}>Start Final Exam</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerMainRow}>
          <Pressable onPress={handleQuit} hitSlop={6} style={styles.headerIcon}>
            <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>Final Lesson Exam</Text>
            <Text style={styles.headerTitle}>{`${safeLevel} ${safeType}`}</Text>
          </View>

          <View style={styles.headerScorePill}>
            <Text style={styles.headerScorePillText}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
      </View>

      <Text style={styles.headerSubtitle}>
        Question {currentIndex + 1} of {totalQuestions}
      </Text>

      <View style={styles.progressWrap}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.examNotice}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#F59E0B" />
        <Text style={styles.examNoticeText}>
          This is a final assessment. Read carefully and submit your best answer.
        </Text>
      </View>

      <View style={styles.walletBanner}>
        <View style={styles.walletBannerIcon}>
          <Ionicons name="flash" size={16} color="#FCD34D" />
        </View>
        <View style={styles.walletBannerTextWrap}>
          <Text style={styles.walletBannerTitle}>{walletSummaryCopy.title}</Text>
          <Text style={styles.walletBannerText}>{walletSummaryCopy.subtitle}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.questionLabel}>Exam question</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.hintSection}>
          <View style={styles.hintMeta}>
            <View style={styles.hintMetaIcon}>
              <Ionicons name="bulb-outline" size={15} color="#FACC15" />
            </View>
            <View style={styles.hintMetaTextWrap}>
              <Text style={styles.hintMetaTitle}>Need a little help?</Text>
              <Text style={styles.hintMetaText}>{hintHelperText}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              void handleUseHint();
            }}
            disabled={!canUseHint}
            style={[styles.hintBtn, !canUseHint && styles.hintBtnDisabled]}
          >
            {hintPending ? (
              <ActivityIndicator color="#0F172A" size="small" />
            ) : (
              <>
                <Ionicons name="flash" size={14} color="#0F172A" />
                <Text style={styles.hintBtnText}>{hintButtonLabel}</Text>
              </>
            )}
          </Pressable>
        </View>

        {hintFeedback ? (
          <View
            style={[
              styles.hintFeedback,
              hintFeedback.tone === "success"
                ? styles.hintFeedbackSuccess
                : hintFeedback.tone === "info"
                  ? styles.hintFeedbackInfo
                  : styles.hintFeedbackWarning,
            ]}
          >
            <Ionicons
              name={
                hintFeedback.tone === "success"
                  ? "checkmark-circle"
                  : hintFeedback.tone === "info"
                    ? "information-circle"
                    : "alert-circle"
              }
              size={16}
              color={
                hintFeedback.tone === "success"
                  ? "#86EFAC"
                  : hintFeedback.tone === "info"
                    ? "#BFDBFE"
                    : "#FDE68A"
              }
            />
            <Text style={styles.hintFeedbackText}>{hintFeedback.message}</Text>
          </View>
        ) : null}

        <View style={styles.optionsWrap}>
          {visibleOptions.map((option: TestOption, index) => {
            const selected = selectedOptionId === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => selectOption(option.id)}
                style={[styles.optionBtn, selected && styles.optionBtnSelected]}
              >
                <View style={[styles.optionBadge, selected && styles.optionBadgeSelected]}>
                  <Text
                    style={[styles.optionBadgeText, selected && styles.optionBadgeTextSelected]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {option.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        {submittingTest ? (
          <View style={styles.evaluatingCard}>
            <ActivityIndicator size="small" color="#FCD34D" />
            <View style={styles.evaluatingTextWrap}>
              <Text style={styles.evaluatingTitle}>Evaluating answers</Text>
              <Text style={styles.evaluatingText}>
                Submitting your final exam to the backend now.
              </Text>
            </View>
          </View>
        ) : null}

        <Pressable style={styles.secondaryBtn} onPress={handleQuit}>
          <Text style={styles.secondaryBtnText}>Back to exams</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, submittingTest && styles.primaryBtnDisabled]}
          onPress={() => {
            void handleNext();
          }}
          disabled={submittingTest}
        >
          {submittingTest ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {isLastQuestion ? "Submit Final Exam" : "Next Question"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  center: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  loadingTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    gap: 10,
    marginBottom: 8,
  },
  headerMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTitleWrap: {
    flex: 1,
    gap: 1,
  },
  headerEyebrow: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },
  headerTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  },
  headerScorePill: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.18)",
  },
  headerScorePillText: {
    color: "#FCD34D",
    fontSize: 12,
    fontWeight: "800",
  },
  progressWrap: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  examIntroCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 14,
    marginTop: 8,
  },
  examIntroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.18)",
  },
  examIntroBadgeText: {
    color: "#FCD34D",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  examIntroTitle: {
    color: "white",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  examIntroText: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  examIntroMetaGrid: {
    flexDirection: "row",
    gap: 10,
  },
  examIntroMetaCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  examIntroMetaLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  examIntroMetaValue: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  examIntroNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.14)",
  },
  examIntroNoticeText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 999,
  },
  examNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.16)",
    marginBottom: 16,
  },
  examNoticeText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  walletBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(37,99,235,0.08)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.16)",
    marginBottom: 16,
  },
  walletBannerIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,204,21,0.12)",
  },
  walletBannerTextWrap: {
    flex: 1,
    gap: 2,
  },
  walletBannerTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "800",
  },
  walletBannerText: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
    gap: 14,
  },
  questionLabel: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  questionText: {
    color: "white",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
  },
  hintSection: {
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  hintMeta: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  hintMetaIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,204,21,0.12)",
  },
  hintMetaTextWrap: {
    flex: 1,
    gap: 2,
  },
  hintMetaTitle: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "800",
  },
  hintMetaText: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FACC15",
    alignSelf: "flex-start",
    minWidth: 140,
    justifyContent: "center",
  },
  hintBtnDisabled: {
    backgroundColor: "rgba(148,163,184,0.3)",
  },
  hintBtnText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "900",
  },
  hintFeedback: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  hintFeedbackInfo: {
    backgroundColor: "rgba(96,165,250,0.08)",
    borderColor: "rgba(96,165,250,0.16)",
  },
  hintFeedbackSuccess: {
    backgroundColor: "rgba(34,197,94,0.08)",
    borderColor: "rgba(34,197,94,0.16)",
  },
  hintFeedbackWarning: {
    backgroundColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.16)",
  },
  hintFeedbackText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  optionsWrap: {
    gap: 12,
  },
  optionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionBtnSelected: {
    backgroundColor: "rgba(245,158,11,0.14)",
    borderColor: "#F59E0B",
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionBadgeSelected: {
    backgroundColor: "rgba(245,158,11,0.18)",
    borderColor: "rgba(245,158,11,0.28)",
  },
  optionBadgeText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "900",
  },
  optionBadgeTextSelected: {
    color: "#FDE68A",
  },
  optionText: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  optionTextSelected: {
    color: "white",
  },
  footer: {
    marginTop: "auto",
    gap: 12,
  },
  evaluatingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.16)",
  },
  evaluatingTextWrap: {
    flex: 1,
    gap: 2,
  },
  evaluatingTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "800",
  },
  evaluatingText: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  secondaryBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
});
