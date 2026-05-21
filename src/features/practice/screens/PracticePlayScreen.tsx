import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeAttemptResult, PracticeDetails, PracticeTask } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { practiceId: string; stageId?: string };
type AnswerMap = Record<string, string>;
type PlayState = "loading" | "playing" | "submitting" | "completed" | "error" | "empty";

const PRACTICE_TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  missing_word: "create-outline",
  missing_letter: "create-outline",
  sentence_order: "swap-vertical-outline",
  dialogue_fill: "chatbubbles-outline",
  image_choice: "image-outline",
};

function isCorrectAnswer(task: PracticeTask, optionId: string): boolean {
  if (task.correctOptionId) return task.correctOptionId === optionId;
  if (task.correctAnswer) {
    const selectedOption = task.options.find((option) => option.id === optionId);
    return selectedOption?.text.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase();
  }
  return false;
}

export default function PracticePlayScreen({ practiceId, stageId }: Props) {
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
      setError("Could not load this practice.");
      setPlayState("error");
      setPractice(null);
    }
  }, [practiceId]);

  useEffect(() => { void loadPractice(); }, [loadPractice]);

  const sortedTasks = useMemo(() => {
    const tasks = [...(practice?.tasks ?? [])].sort((a, b) => a.order - b.order);
    if (!stageId || !practice) return tasks;
    const stage = practice.roadmap.find((item) => item.id === stageId);
    if (!stage) return tasks;
    const allowed = new Set(stage.questionIds);
    return tasks.filter((task) => allowed.has(task.id));
  }, [practice, stageId]);

  const totalCount = sortedTasks.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(() => sortedTasks.reduce((c, t) => (answers[t.id] && isCorrectAnswer(t, answers[t.id]) ? c + 1 : c), 0), [answers, sortedTasks]);
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;

  const onSelectOption = useCallback((task: PracticeTask, optionId: string) => {
    setAnswers((cur) => (cur[task.id] ? cur : { ...cur, [task.id]: optionId }));
  }, []);

  const onFinish = useCallback(async () => {
    if (!practice || playState === "submitting" || playState === "completed") return;
    setPlayState("submitting");
    try {
      const result = await practiceService.submitAttempt(practice.id, { score, correctCount, totalCount, stageId });
      setAttemptResult(result);
      setPlayState("completed");
    } catch {
      setError("Could not submit result. Try again.");
      setPlayState("error");
    }
  }, [practice, playState, score, correctCount, totalCount, stageId]);

  if (playState === "loading") return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#4F46E5" /><Text>Loading...</Text></View></SafeAreaView>;
  if (playState === "error") return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text>{error}</Text></View></SafeAreaView>;
  if (playState === "empty" || !practice || sortedTasks.length === 0) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text>No questions yet</Text></View></SafeAreaView>;

  const type = practice.type ?? "";
  const practiceIcon = PRACTICE_TYPE_ICON[type] ?? "game-controller-outline";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.replace(`/(tabs)/practice/${encodeURIComponent(practiceId)}/roadmap` as any)}><Ionicons name="chevron-back" size={16} color="#4338CA" /><Text style={styles.backText}>Back</Text></Pressable>
        <View style={styles.header}><Ionicons name={practiceIcon} size={20} color="#fff" /><Text style={styles.title}>{practice.title}</Text></View>

        {sortedTasks.map((task, index) => {
          const answered = Boolean(answers[task.id]);
          const renderStyle = type;
          return (
            <View key={task.id} style={styles.card}>
              <Text style={styles.q}>Q{index + 1}</Text>
              {renderStyle === "dialogue_fill" ? <View style={styles.chatBubble}><Text style={styles.prompt}>{task.prompt}</Text></View> : <Text style={styles.prompt}>{task.prompt}</Text>}
              {renderStyle === "image_choice" && (
                <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={34} color="#2563EB" /><Text style={styles.imageText}>imageKey: {task.result ?? "demo"}</Text></View>
              )}
              {renderStyle === "sentence_order" && <Text style={styles.helper}>Choose the correct sentence order.</Text>}
              <View style={styles.options}>
                {task.options.map((option) => (
                  <Pressable key={option.id} disabled={answered} style={[styles.option, answers[task.id] === option.id && styles.optionSelected]} onPress={() => onSelectOption(task, option.id)}>
                    <Text style={styles.optionText}>{option.text}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}

        <Pressable style={[styles.finish, (!allAnswered || playState === "submitting") && styles.disabled]} disabled={!allAnswered || playState === "submitting"} onPress={() => void onFinish()}>
          <Text style={styles.finishText}>{playState === "completed" ? `Done ${attemptResult?.score ?? score}%` : "Finish"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EEF4FF" },
  content: { padding: 12, gap: 10, paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  backButton: { alignSelf: "flex-start", flexDirection: "row", gap: 4, backgroundColor: "#E0E7FF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { color: "#4338CA", fontWeight: "800" },
  header: { backgroundColor: "#1E1B4B", borderRadius: 14, padding: 12, flexDirection: "row", gap: 8, alignItems: "center" },
  title: { color: "#fff", fontWeight: "900", fontSize: 16, flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 12, gap: 8 },
  q: { color: "#4F46E5", fontWeight: "800" },
  prompt: { fontSize: 15, fontWeight: "700", color: "#111827" },
  chatBubble: { backgroundColor: "#EFF6FF", borderRadius: 14, padding: 10, alignSelf: "flex-start", maxWidth: "90%" },
  helper: { fontSize: 12, color: "#475569", fontWeight: "600" },
  imagePlaceholder: { borderWidth: 1, borderColor: "#BFDBFE", backgroundColor: "#F8FAFC", borderRadius: 12, alignItems: "center", justifyContent: "center", padding: 12, gap: 4 },
  imageText: { fontSize: 11, color: "#64748B" },
  options: { gap: 8 },
  option: { borderWidth: 1, borderColor: "#DBEAFE", borderRadius: 12, padding: 10, backgroundColor: "#F8FAFC" },
  optionSelected: { borderColor: "#6366F1", backgroundColor: "#E0E7FF" },
  optionText: { fontWeight: "600", color: "#111827" },
  finish: { backgroundColor: "#4F46E5", borderRadius: 12, padding: 12, alignItems: "center" },
  finishText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.5 },
});
