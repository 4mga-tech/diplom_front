import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeDetails, PracticeTask } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { practiceId: string; stageId?: string };

function isCorrectAnswer(task: PracticeTask, optionId: string): boolean {
  if (task.correctOptionId) return task.correctOptionId === optionId;
  const selectedOption = task.options.find((o) => o.id === optionId);
  return (selectedOption?.text || "").trim().toLowerCase() === (task.correctAnswer || "").trim().toLowerCase();
}

export default function PracticePlayScreen({ practiceId, stageId }: Props) {
  const router = useRouter();
  const [practice, setPractice] = useState<PracticeDetails | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    (async () => {
      const details = await practiceService.getPracticeById(practiceId);
      setPractice(details);
      setLoading(false);
    })();
  }, [practiceId]);

  const tasks = useMemo(() => {
    const all = [...(practice?.tasks || [])].sort((a, b) => a.order - b.order);
    if (!practice || !stageId) return all;
    const stage = practice.roadmap.find((x) => x.id === stageId);
    if (!stage) return all;
    const allowed = new Set(stage.questionIds);
    return all.filter((t) => allowed.has(t.id));
  }, [practice, stageId]);

  const current = tasks[idx];
  const progress = tasks.length ? (idx + 1) / tasks.length : 0;

  const onPick = useCallback(async (optionId: string) => {
    if (!current) return;
    const ok = isCorrectAnswer(current, optionId);
    setFeedback(ok ? "correct" : "wrong");
    setAnswers((s) => ({ ...s, [current.id]: optionId }));
    setTimeout(() => {
      setFeedback(null);
      if (idx < tasks.length - 1) setIdx((v) => v + 1);
    }, 400);
  }, [current, idx, tasks.length]);

  const onFinish = useCallback(async () => {
    if (!practice) return;
    const correctCount = tasks.filter((t) => answers[t.id] && isCorrectAnswer(t, answers[t.id])).length;
    const score = tasks.length ? Math.round((correctCount / tasks.length) * 100) : 0;
    await practiceService.submitAttempt(practice.id, { score, correctCount, totalCount: tasks.length, stageId });
    router.replace(`/practice/${encodeURIComponent(practiceId)}/roadmap` as any);
  }, [answers, practice, practiceId, router, stageId, tasks]);

  if (loading || !current) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#93C5FD" /></View></SafeAreaView>;

  const isLast = idx === tasks.length - 1;

  return <SafeAreaView style={styles.safeArea}><View style={styles.wrap}>
    <View style={styles.top}><Pressable onPress={() => router.replace(`/practice/${encodeURIComponent(practiceId)}/roadmap` as any)}><Ionicons name="chevron-back" size={20} color="#BFDBFE" /></Pressable><View style={styles.bar}><View style={[styles.barFill, { width: `${progress * 100}%` }]} /></View><Text style={styles.xp}>+{12}XP</Text></View>

    <View style={[styles.card, feedback === "correct" && styles.correct, feedback === "wrong" && styles.wrong]}>
      <Text style={styles.prompt}>{current.prompt}</Text>
      {practice?.type === "dialogue_fill" && <View style={styles.dialog}><Text style={styles.bubbleA}>A: {current.prompt}</Text><Text style={styles.bubbleB}>B: ________</Text></View>}
      {practice?.type === "image_choice" && <View style={styles.image}><Ionicons name="image-outline" size={48} color="#7DD3FC" /></View>}
      {practice?.type === "sentence_order" && <View style={styles.buildArea}><Text style={styles.buildText}>{answers[current.id] ? current.options.find((o) => o.id === answers[current.id])?.text : "Tap words to build sentence"}</Text></View>}
    </View>

    <View style={styles.options}>{current.options.map((o) => <Pressable key={o.id} style={styles.opt} onPress={() => onPick(o.id)}><Text style={styles.optText}>{o.text}</Text></Pressable>)}</View>
    {isLast && answers[current.id] && <Pressable style={styles.finish} onPress={() => void onFinish()}><Text style={styles.finishText}>Complete Stage</Text></Pressable>}
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#071120" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  wrap: { flex: 1, padding: 16, gap: 14 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  bar: { flex: 1, height: 10, borderRadius: 999, backgroundColor: "#1E293B", overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: "#22C55E" },
  xp: { color: "#FDE68A", fontWeight: "900", fontSize: 12 },
  card: { flex: 1, borderRadius: 22, backgroundColor: "#0D1A2D", borderWidth: 1, borderColor: "#1F3351", padding: 16, gap: 12, justifyContent: "center" },
  correct: { borderColor: "#16A34A", shadowColor: "#16A34A", shadowOpacity: 0.6, shadowRadius: 10 },
  wrong: { borderColor: "#DC2626" },
  prompt: { color: "#F8FAFC", fontSize: 22, fontWeight: "900", textAlign: "center" },
  dialog: { gap: 8 },
  bubbleA: { backgroundColor: "#13253E", color: "#E2E8F0", padding: 10, borderRadius: 14, alignSelf: "flex-start" },
  bubbleB: { backgroundColor: "#1E3A8A", color: "#DBEAFE", padding: 10, borderRadius: 14, alignSelf: "flex-end" },
  image: { height: 180, borderRadius: 16, borderWidth: 1, borderColor: "#1E3A8A", alignItems: "center", justifyContent: "center" },
  buildArea: { minHeight: 70, borderRadius: 14, borderWidth: 1, borderColor: "#334155", alignItems: "center", justifyContent: "center", padding: 10 },
  buildText: { color: "#CBD5E1", fontWeight: "700" },
  options: { gap: 10 },
  opt: { borderRadius: 14, backgroundColor: "#12233D", borderWidth: 1, borderColor: "#2B3D5B", padding: 14 },
  optText: { color: "#E2E8F0", fontWeight: "800", textAlign: "center" },
  finish: { backgroundColor: "#2563EB", borderRadius: 14, padding: 14 },
  finishText: { color: "#fff", textAlign: "center", fontWeight: "900" },
});
