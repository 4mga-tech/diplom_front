import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeAttemptResult, PracticeDetails, PracticeTask } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  practiceId: string;
};

type AnswerMap = Record<string, string>;

type PlayState = "loading" | "playing" | "submitting" | "completed" | "error" | "empty";

function isMissingLetterPractice(practice: PracticeDetails): boolean {
  return practice.type === "missing_letter";
}

function isCorrectAnswer(task: PracticeTask, optionId: string): boolean {
  if (task.correctOptionId) {
    return task.correctOptionId === optionId;
  }

  if (task.correctAnswer) {
    const selectedOption = task.options.find((option) => option.id === optionId);
    return selectedOption?.text.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase();
  }

  return false;
}

export default function PracticePlayScreen({ practiceId }: Props) {
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
    } catch (loadError) {
      console.log("Failed to load practice detail", loadError);
      setError("Could not load this practice.");
      setPractice(null);
      setPlayState("error");
    }
  }, [practiceId]);

  useEffect(() => {
    void loadPractice();
  }, [loadPractice]);

  const sortedTasks = useMemo(() => {
    return [...(practice?.tasks ?? [])].sort((a, b) => a.order - b.order);
  }, [practice]);

  const totalCount = sortedTasks.length;
  const correctCount = useMemo(() => {
    return sortedTasks.reduce((count, task) => {
      const selected = answers[task.id];
      if (!selected) {
        return count;
      }

      return isCorrectAnswer(task, selected) ? count + 1 : count;
    }, 0);
  }, [answers, sortedTasks]);
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const allAnswered = totalCount > 0 && Object.keys(answers).length === totalCount;

  const onSelectOption = useCallback((task: PracticeTask, optionId: string) => {
    setAnswers((current) => {
      if (current[task.id]) {
        return current;
      }

      return {
        ...current,
        [task.id]: optionId,
      };
    });
  }, []);

  const onFinish = useCallback(async () => {
    if (!practice || playState === "submitting") {
      return;
    }

    setPlayState("submitting");
    try {
      const result = await practiceService.submitAttempt(practice.id, {
        score,
        correctCount,
        totalCount,
      });
      setAttemptResult(result);
      setPlayState("completed");
    } catch (submitError) {
      console.log("Failed to submit practice attempt", submitError);
      setError("Could not submit result. Try again.");
      setPlayState("error");
    }
  }, [practice, playState, score, correctCount, totalCount]);

  if (playState === "loading") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.centerText}>Loading practice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (playState === "error") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
          <Text style={styles.centerTitle}>Something went wrong</Text>
          <Text style={styles.centerText}>{error}</Text>
          <Pressable style={styles.primaryButton} onPress={() => void loadPractice()}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (playState === "empty" || !practice || sortedTasks.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="file-tray-outline" size={24} color="#6B7280" />
          <Text style={styles.centerTitle}>No questions yet</Text>
          <Text style={styles.centerText}>This practice has no tasks available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isMissingLetterPractice(practice)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="construct-outline" size={24} color="#6B7280" />
          <Text style={styles.centerTitle}>Practice type not supported yet</Text>
          <Text style={styles.centerText}>Only missing_letter is available in this MVP.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>{practice.title}</Text>
          <Text style={styles.metaText}>{correctCount}/{totalCount} correct • {score}%</Text>
        </View>

        {sortedTasks.map((task, index) => {
          const selectedOptionId = answers[task.id];
          const answered = Boolean(selectedOptionId);
          const isCorrect = answered ? isCorrectAnswer(task, selectedOptionId) : false;

          return (
            <View key={task.id} style={styles.questionCard}>
              <Text style={styles.questionNumber}>Q{index + 1}</Text>
              <Text style={styles.prompt}>{task.prompt}</Text>

              <View style={styles.optionsWrap}>
                {task.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const showCorrect = answered && isSelected && isCorrect;
                  const showWrong = answered && isSelected && !isCorrect;

                  return (
                    <Pressable
                      key={option.id}
                      disabled={answered}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionSelected,
                        showCorrect && styles.optionCorrect,
                        showWrong && styles.optionWrong,
                      ]}
                      onPress={() => onSelectOption(task, option.id)}
                    >
                      <Text style={styles.optionText}>{option.text}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {answered ? (
                <Text style={[styles.feedbackText, isCorrect ? styles.correctText : styles.wrongText]}>
                  {isCorrect ? "Correct" : "Wrong"}
                </Text>
              ) : null}
            </View>
          );
        })}

        {playState === "completed" ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Practice complete</Text>
            <Text style={styles.resultText}>Score: {attemptResult?.score ?? score}%</Text>
            <Text style={styles.resultText}>XP earned: {attemptResult?.xpEarned ?? 0}</Text>
            <Text style={styles.resultText}>XP capped: {attemptResult?.xpCapped ? "Yes" : "No"}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void loadPractice()}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.primaryButton, (!allAnswered || playState === "submitting") && styles.disabledButton]}
            disabled={!allAnswered || playState === "submitting"}
            onPress={() => void onFinish()}
          >
            <Text style={styles.primaryButtonText}>{playState === "submitting" ? "Finishing..." : "Finish"}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  contentContainer: { padding: 12, gap: 10, paddingBottom: 20 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  headerCard: { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 10, padding: 10 },
  title: { fontSize: 16, fontWeight: "800", color: "#111827" },
  metaText: { marginTop: 4, fontSize: 12, color: "#374151" },
  questionCard: { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 10, padding: 10, gap: 8 },
  questionNumber: { fontSize: 11, fontWeight: "700", color: "#6366F1" },
  prompt: { fontSize: 14, fontWeight: "600", color: "#111827" },
  optionsWrap: { gap: 6 },
  optionButton: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#FFFFFF" },
  optionSelected: { borderColor: "#6366F1", backgroundColor: "#EEF2FF" },
  optionCorrect: { borderColor: "#16A34A", backgroundColor: "#DCFCE7" },
  optionWrong: { borderColor: "#DC2626", backgroundColor: "#FEE2E2" },
  optionText: { fontSize: 13, color: "#111827" },
  feedbackText: { fontSize: 12, fontWeight: "700" },
  correctText: { color: "#15803D" },
  wrongText: { color: "#B91C1C" },
  primaryButton: { marginTop: 4, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#4F46E5", alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  disabledButton: { opacity: 0.45 },
  resultCard: { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
  resultTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },
  resultText: { fontSize: 13, color: "#1F2937" },
});
