import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeDetails, PracticeTask } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";

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
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [imageLoadState, setImageLoadState] = useState<Record<string, "loading" | "loaded" | "error">>({});
  const [questionFade] = useState(new Animated.Value(1));
  const [correctScale] = useState(new Animated.Value(1));
  const [shakeX] = useState(new Animated.Value(0));
  const [xpPop] = useState(new Animated.Value(0));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const apiBaseUrl = (api.defaults.baseURL || "").replace(/\/+$/, "");
  const stageXp = practice?.roadmap.find((x) => x.id === stageId)?.xpReward ?? 12;

  const resolveImageUrl = useCallback((imageUrl?: string) => {
    if (!imageUrl) return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (!apiBaseUrl) return imageUrl;
    return `${apiBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  }, [apiBaseUrl]);

  const animateFeedback = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      correctScale.setValue(1);
      xpPop.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(correctScale, { toValue: 1.06, duration: 160, useNativeDriver: true }),
          Animated.spring(correctScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(xpPop, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(xpPop, { toValue: 0, duration: 300, useNativeDriver: true, delay: 240 }),
        ]),
      ]).start();
      return;
    }
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  }, [correctScale, shakeX, xpPop]);

  const onPick = useCallback(async (optionId: string) => {
    if (!current || feedback) return;
    const ok = isCorrectAnswer(current, optionId);
    setSelectedOptionId(optionId);
    setFeedback(ok ? "correct" : "wrong");
    setAnswers((s) => ({ ...s, [current.id]: optionId }));
    animateFeedback(ok);
    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      setSelectedOptionId(null);
      if (idx < tasks.length - 1) {
        Animated.timing(questionFade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
          setIdx((v) => v + 1);
          Animated.timing(questionFade, { toValue: 1, duration: 190, useNativeDriver: true }).start();
        });
      }
    }, 820);
  }, [animateFeedback, current, feedback, idx, questionFade, tasks.length]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

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

    <Animated.View style={[
      styles.card,
      { opacity: questionFade, transform: [{ translateX: shakeX }, { scale: feedback === "correct" ? correctScale : 1 }] },
      feedback === "correct" && styles.correct,
      feedback === "wrong" && styles.wrong,
    ]}>
      <Text style={styles.prompt}>{current.prompt}</Text>
      {practice?.type === "image_choice" && <Text style={styles.subtitle}>Pick the image that best matches the prompt.</Text>}
      {practice?.type === "dialogue_fill" && <View style={styles.dialog}><Text style={styles.bubbleA}>A: {current.prompt}</Text><Text style={styles.bubbleB}>B: ________</Text></View>}
      {practice?.type === "sentence_order" && <View style={styles.buildArea}><Text style={styles.buildText}>{answers[current.id] ? current.options.find((o) => o.id === answers[current.id])?.text : "Tap words to build sentence"}</Text></View>}
      {practice?.type === "image_choice" && <View style={styles.imageGrid}>
        {current.options.map((o) => {
          const img = resolveImageUrl(o.imageUrl);
          const status = imageLoadState[o.id] || "loading";
          const isSelected = selectedOptionId === o.id;
          const isCorrect = feedback && isCorrectAnswer(current, o.id);
          const isWrongSelected = feedback === "wrong" && isSelected;
          return <Pressable
            key={o.id}
            style={[
              styles.imageCard,
              isSelected && styles.imageCardSelected,
              isCorrect && styles.imageCardCorrect,
              isWrongSelected && styles.imageCardWrong,
            ]}
            onPress={() => onPick(o.id)}
            disabled={Boolean(feedback)}
          >
            <View style={styles.imageFrame}>
              {img ? <Image
                source={{ uri: img }}
                resizeMode="cover"
                style={styles.imageThumb}
                onLoadStart={() => setImageLoadState((s) => ({ ...s, [o.id]: "loading" }))}
                onLoadEnd={() => setImageLoadState((s) => ({ ...s, [o.id]: "loaded" }))}
                onError={() => setImageLoadState((s) => ({ ...s, [o.id]: "error" }))}
              /> : null}
              {status === "loading" && <View style={styles.imageOverlay}><ActivityIndicator size="small" color="#93C5FD" /></View>}
              {(status === "error" || !img) && <View style={styles.imageOverlay}><Ionicons name="image-outline" size={22} color="#94A3B8" /><Text style={styles.fallbackText}>Image unavailable</Text></View>}
              {isCorrect && feedback && <View style={styles.mark}><Ionicons name="checkmark-circle" size={22} color="#86EFAC" /></View>}
            </View>
            <Text style={styles.imageLabel} numberOfLines={2}>{o.label || o.text}</Text>
          </Pressable>;
        })}
      </View>}
    </Animated.View>

    {practice?.type !== "image_choice" && <View style={styles.options}>{current.options.map((o) => <Pressable key={o.id} style={styles.opt} onPress={() => onPick(o.id)}><Text style={styles.optText}>{o.text}</Text></Pressable>)}</View>}
    {feedback === "correct" && <Animated.View style={[styles.xpPop, { opacity: xpPop, transform: [{ translateY: xpPop.interpolate({ inputRange: [0, 1], outputRange: [16, -8] }) }] }]}><Text style={styles.xpPopText}>+{stageXp} XP</Text></Animated.View>}
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
  card: { flex: 1, borderRadius: 28, backgroundColor: "#0D1A2D", borderWidth: 1, borderColor: "#2A3A64", padding: 16, gap: 12, justifyContent: "center", shadowColor: "#4338CA", shadowOpacity: 0.25, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  correct: { borderColor: "#16A34A", shadowColor: "#16A34A", shadowOpacity: 0.6, shadowRadius: 10 },
  wrong: { borderColor: "#DC2626", shadowColor: "#DC2626", shadowOpacity: 0.4, shadowRadius: 8 },
  prompt: { color: "#F8FAFC", fontSize: 22, fontWeight: "900", textAlign: "center" },
  subtitle: { color: "#93C5FD", textAlign: "center", fontWeight: "600", marginBottom: 6 },
  dialog: { gap: 8 },
  bubbleA: { backgroundColor: "#13253E", color: "#E2E8F0", padding: 10, borderRadius: 14, alignSelf: "flex-start" },
  bubbleB: { backgroundColor: "#1E3A8A", color: "#DBEAFE", padding: 10, borderRadius: 14, alignSelf: "flex-end" },
  image: { height: 180, borderRadius: 16, borderWidth: 1, borderColor: "#1E3A8A", alignItems: "center", justifyContent: "center" },
  buildArea: { minHeight: 70, borderRadius: 14, borderWidth: 1, borderColor: "#334155", alignItems: "center", justifyContent: "center", padding: 10 },
  buildText: { color: "#CBD5E1", fontWeight: "700" },
  imageGrid: { gap: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  imageCard: { width: "48%", borderRadius: 18, backgroundColor: "#121E36", borderWidth: 1, borderColor: "#2A3A64", padding: 8, gap: 7 },
  imageCardSelected: { borderColor: "#60A5FA", transform: [{ scale: 0.985 }] },
  imageCardCorrect: { borderColor: "#22C55E", shadowColor: "#22C55E", shadowOpacity: 0.45, shadowRadius: 10 },
  imageCardWrong: { borderColor: "#EF4444", shadowColor: "#EF4444", shadowOpacity: 0.35, shadowRadius: 8 },
  imageFrame: { height: 112, borderRadius: 14, overflow: "hidden", backgroundColor: "#0A1325", alignItems: "center", justifyContent: "center" },
  imageThumb: { width: "100%", height: "100%" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,19,37,0.75)", gap: 4 },
  fallbackText: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  imageLabel: { color: "#E2E8F0", textAlign: "center", fontWeight: "700", fontSize: 13, minHeight: 32 },
  mark: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(15,23,42,0.85)", borderRadius: 999, padding: 2 },
  options: { gap: 10 },
  opt: { borderRadius: 14, backgroundColor: "#12233D", borderWidth: 1, borderColor: "#2B3D5B", padding: 14 },
  optText: { color: "#E2E8F0", fontWeight: "800", textAlign: "center" },
  xpPop: { position: "absolute", alignSelf: "center", bottom: 96, backgroundColor: "#14532D", borderRadius: 999, borderWidth: 1, borderColor: "#22C55E", paddingHorizontal: 12, paddingVertical: 6 },
  xpPopText: { color: "#DCFCE7", fontWeight: "900", fontSize: 12 },
  finish: { backgroundColor: "#2563EB", borderRadius: 14, padding: 14 },
  finishText: { color: "#fff", textAlign: "center", fontWeight: "900" },
});
