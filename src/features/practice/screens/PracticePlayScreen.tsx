import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeAttemptResult, PracticeDetails, PracticeTask } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { practiceId: string };
type AnswerMap = Record<string, string>;
type PlayState = "loading" | "playing" | "submitting" | "completed" | "error" | "empty";

const PRACTICE_TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  missing_letter: "create-outline",
  letter_match: "grid-outline",
  word_builder: "cube-outline",
  meaning_match: "layers-outline",
  daily_challenge: "flash-outline",
};

function isSupportedPracticeType(practice: PracticeDetails): boolean {
  return ["missing_letter", "letter_match", "meaning_match"].includes(practice.type ?? "");
}

function isCorrectAnswer(task: PracticeTask, optionId: string): boolean {
  if (task.correctOptionId) return task.correctOptionId === optionId;
  if (task.correctAnswer) {
    const selectedOption = task.options.find((option) => option.id === optionId);
    return selectedOption?.text.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase();
  }
  return false;
}

export default function PracticePlayScreen({ practiceId }: Props) {
  const router = useRouter();
  const [practice, setPractice] = useState<PracticeDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playState, setPlayState] = useState<PlayState>("loading");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [attemptResult, setAttemptResult] = useState<PracticeAttemptResult | null>(null);

  const loadPractice = useCallback(async () => {
    setPlayState("loading");
    setError(null);
    setAttemptResult(null);
    setAnswers({});
    try {
      const details = await practiceService.getPracticeById(practiceId);
      setPractice(details);
      setPlayState(details.tasks.length > 0 ? "playing" : "empty");
    } catch (e) {
      console.log("Failed to load practice detail", e);
      setError("Could not load this practice.");
      setPlayState("error");
      setPractice(null);
    }
  }, [practiceId]);

  useEffect(() => {
    void loadPractice();
  }, [loadPractice]);

  const sortedTasks = useMemo(() => [...(practice?.tasks ?? [])].sort((a, b) => a.order - b.order), [practice]);
  const totalCount = sortedTasks.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () =>
      sortedTasks.reduce((count, task) => {
        const selected = answers[task.id];
        return selected && isCorrectAnswer(task, selected) ? count + 1 : count;
      }, 0),
    [answers, sortedTasks],
  );
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;

  const onSelectOption = useCallback((task: PracticeTask, optionId: string) => {
    setAnswers((current) => (current[task.id] ? current : { ...current, [task.id]: optionId }));
  }, []);

  const onFinish = useCallback(async () => {
    if (!practice || playState === "submitting" || playState === "completed") return;
    setPlayState("submitting");
    try {
      const result = await practiceService.submitAttempt(practice.id, { score, correctCount, totalCount });
      setAttemptResult(result);
      setPlayState("completed");
    } catch (e) {
      console.log("Failed to submit practice attempt", e);
      setError("Could not submit result. Try again.");
      setPlayState("error");
    }
  }, [practice, playState, score, correctCount, totalCount]);

  if (playState === "loading") return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><ActivityIndicator size="small" color="#4F46E5" /><Text style={styles.centerText}>Loading practice...</Text></View></SafeAreaView>;
  if (playState === "error") return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><Ionicons name="alert-circle-outline" size={24} color="#DC2626" /><Text style={styles.centerTitle}>Something went wrong</Text><Text style={styles.centerText}>{error}</Text><Pressable style={styles.primaryButton} onPress={() => void loadPractice()}><Text style={styles.primaryButtonText}>Retry</Text></Pressable></View></SafeAreaView>;
  if (playState === "empty" || !practice || sortedTasks.length === 0) return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><Ionicons name="file-tray-outline" size={24} color="#6B7280" /><Text style={styles.centerTitle}>No questions yet</Text><Text style={styles.centerText}>This practice has no tasks available.</Text></View></SafeAreaView>;

  if (!isSupportedPracticeType(practice)) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><Ionicons name="construct-outline" size={24} color="#6B7280" /><Text style={styles.centerTitle}>Coming soon</Text><Text style={styles.centerText}>This practice type is not supported in the app yet.</Text></View></SafeAreaView>;
  }

  const practiceIcon = PRACTICE_TYPE_ICON[practice.type ?? ""] ?? "game-controller-outline";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Pressable style={styles.backButton} onPress={() => router.push(practice?.levelId ? `/practice/${encodeURIComponent(practice.levelId.toLowerCase())}` as any : "/(tabs)/achievements")}>
          <Ionicons name="chevron-back" size={16} color="#4338CA" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Ionicons name={practiceIcon} size={18} color="#4338CA" />
              </View>
              <Text style={styles.title} numberOfLines={1}>{practice.title}</Text>
            </View>
            <View style={styles.xpChip}>
              <Ionicons name="star" size={12} color="#C2410C" />
              <Text style={styles.xpChipText}>{practice.xpReward ?? 0} XP</Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressMetaRow}>
            <Text style={styles.progressMeta}>{answeredCount}/{totalCount}</Text>
            <Text style={styles.progressMeta}>{progress}%</Text>
          </View>
        </View>

        {sortedTasks.map((task, index) => {
          const selectedOptionId = answers[task.id];
          const answered = Boolean(selectedOptionId);
          const correct = answered ? isCorrectAnswer(task, selectedOptionId) : false;

          return (
            <View key={task.id} style={styles.questionCard}>
              <View style={styles.questionHeaderRow}>
                <Text style={styles.questionNumber}>Q{index + 1}</Text>
                {answered ? (
                  <View style={[styles.feedbackBadge, correct ? styles.feedbackBadgeCorrect : styles.feedbackBadgeWrong]}>
                    <Ionicons name={correct ? "checkmark-circle" : "close-circle"} size={12} color={correct ? "#15803D" : "#B91C1C"} />
                    <Text style={[styles.feedbackText, correct ? styles.correctText : styles.wrongText]}>{correct ? "Correct" : "Wrong"}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.prompt}>{task.prompt}</Text>

              <View style={styles.optionsWrap}>
                {task.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      disabled={answered}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionSelected,
                        answered && isSelected && correct && styles.optionCorrect,
                        answered && isSelected && !correct && styles.optionWrong,
                      ]}
                      onPress={() => onSelectOption(task, option.id)}
                    >
                      <Text style={styles.optionText}>{option.text}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {playState === "completed" ? (
          <View style={styles.resultCard}>
            <View style={styles.resultTop}>
              <Ionicons name="trophy" size={20} color="#D97706" />
              <Text style={styles.resultTitle}>Nice work!</Text>
            </View>
            <View style={styles.resultStatsRow}>
              <View style={styles.statPill}><Text style={styles.statLabel}>Score</Text><Text style={styles.statValue}>{attemptResult?.score ?? score}%</Text></View>
              <View style={styles.statPill}><Text style={styles.statLabel}>XP</Text><Text style={styles.statValue}>+{attemptResult?.xpEarned ?? 0}</Text></View>
            </View>
            <Text style={styles.resultMeta}>Correct {attemptResult?.correctAnswers ?? correctCount}/{attemptResult?.totalQuestions ?? totalCount}</Text>
            <Text style={styles.resultMeta}>Daily {attemptResult?.dailyXpEarned ?? 0}/{attemptResult?.dailyXpLimit ?? practice.maxDailyXp ?? 0}{attemptResult?.xpCapped ? " • capped" : ""}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void loadPractice()}><Text style={styles.primaryButtonText}>Practice again</Text></Pressable>
          </View>
        ) : (
          <Pressable style={[styles.primaryButton, (!allAnswered || playState === "submitting") && styles.disabledButton]} disabled={!allAnswered || playState === "submitting"} onPress={() => void onFinish()}>
            <Text style={styles.primaryButtonText}>{playState === "submitting" ? "Finishing..." : "Finish"}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  contentContainer: { padding: 12, gap: 10, paddingBottom: 24 },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: "#E0E7FF", paddingHorizontal: 10, paddingVertical: 6 },
  backButtonText: { fontSize: 12, fontWeight: "800", color: "#4338CA" },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },

  headerCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, gap: 8, shadowColor: "#0F172A", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 },
  headerIconWrap: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#E0E7FF", alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 15, fontWeight: "800", color: "#111827" },
  xpChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF7ED", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  xpChipText: { fontSize: 11, fontWeight: "800", color: "#9A3412" },
  progressBarTrack: { height: 7, borderRadius: 999, backgroundColor: "#E5E7EB", overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 999, backgroundColor: "#4F46E5" },
  progressMetaRow: { flexDirection: "row", justifyContent: "space-between" },
  progressMeta: { fontSize: 11, fontWeight: "700", color: "#4B5563" },

  questionCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, gap: 10, shadowColor: "#0F172A", shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  questionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  questionNumber: { fontSize: 11, fontWeight: "800", color: "#4F46E5", backgroundColor: "#EEF2FF", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  prompt: { fontSize: 15, lineHeight: 21, fontWeight: "700", color: "#111827" },
  optionsWrap: { gap: 8 },
  optionButton: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#FFFFFF" },
  optionSelected: { borderColor: "#6366F1", backgroundColor: "#EEF2FF" },
  optionCorrect: { borderColor: "#16A34A", backgroundColor: "#DCFCE7" },
  optionWrong: { borderColor: "#DC2626", backgroundColor: "#FEE2E2" },
  optionText: { fontSize: 14, fontWeight: "600", color: "#111827" },

  feedbackBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  feedbackBadgeCorrect: { backgroundColor: "#F0FDF4" },
  feedbackBadgeWrong: { backgroundColor: "#FEF2F2" },
  feedbackText: { fontSize: 11, fontWeight: "800" },
  correctText: { color: "#15803D" },
  wrongText: { color: "#B91C1C" },

  primaryButton: { marginTop: 4, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: "#4F46E5", alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  disabledButton: { opacity: 0.45 },

  resultCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, gap: 8, shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  resultTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  resultTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  resultStatsRow: { flexDirection: "row", gap: 8 },
  statPill: { flex: 1, backgroundColor: "#EEF2FF", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  statLabel: { fontSize: 11, color: "#4B5563", fontWeight: "700" },
  statValue: { marginTop: 2, fontSize: 16, fontWeight: "900", color: "#312E81" },
  resultMeta: { fontSize: 12, color: "#374151", fontWeight: "600" },
});
