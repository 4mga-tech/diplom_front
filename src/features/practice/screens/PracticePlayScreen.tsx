import { api } from "@/lib/api";
import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeDetails, PracticeTask } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { practiceId: string; stageId?: string };

function isCorrectAnswer(task: PracticeTask, answerValue: string, practiceType?: string | null): boolean {
  if (task.type === "image_choice" || practiceType === "image_choice") {
    return answerValue === (task.correctAnswer || "");
  }
  if (task.type === "sentence_order") {
    return answerValue.trim().toLowerCase() === (task.correctAnswer || "").trim().toLowerCase();
  }
  if (task.correctOptionId) return task.correctOptionId === answerValue;
  const selectedOption = task.options.find((o) => o.id === answerValue);
  return (selectedOption?.text || "").trim().toLowerCase() === (task.correctAnswer || "").trim().toLowerCase();
}



const getSentenceParts = (task: PracticeTask): string[] => {
  if (task.parts?.length) return task.parts;
  const first = task.options?.[0]?.text;
  if (first?.includes("|")) return first.split("|").map((x) => x.trim()).filter(Boolean);
  return (task.correctAnswer ?? "").split(" ").filter(Boolean);
};
export default function PracticePlayScreen({ practiceId, stageId }: Props) {
  const router = useRouter();
  const [practice, setPractice] = useState<PracticeDetails | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedWordIndexes, setSelectedWordIndexes] = useState<number[]>([]);
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
  const isSentenceOrder = practice?.type === "sentence_order" || current?.type === "sentence_order";
  const supportsRetry = !isSentenceOrder;
  const sentenceOrderParts = useMemo(() => {
    if (!current || !isSentenceOrder) return [];
    return getSentenceParts(current);
  }, [current, isSentenceOrder]);
  const sentenceAnswerText = useMemo(() => selectedWordIndexes.map((wordIndex) => sentenceOrderParts[wordIndex]).filter(Boolean).join(" ").trim(), [selectedWordIndexes, sentenceOrderParts]);
  const helperSubtitle = useMemo(() => {
    if (!current) return null;
    const taskSubtitle = current.subtitle?.trim();
    if (taskSubtitle) return taskSubtitle;
    if (current.meaningEn && current.meaningEn !== current.prompt) return current.meaningEn;
    return null;
  }, [current]);
  const progress = tasks.length ? (idx + 1) / tasks.length : 0;
  const apiBaseUrl = (api.defaults.baseURL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/+$/, ""); const stageXp = practice?.roadmap.find((x) => x.id === stageId)?.xpReward ?? 12;

  const resolveImageUrl = useCallback((imageUrl?: string | null) => {
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
    const ok = isCorrectAnswer(current, optionId, practice?.type);
    setSelectedOptionId(optionId);
    setFeedback(ok ? "correct" : "wrong");
    if (ok) {
      setAnswers((s) => ({ ...s, [current.id]: optionId }));
    }
    animateFeedback(ok);
    if (!ok) return;
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

  const onSentencePartPress = useCallback((sourceIndex: number) => {
    if (!current || feedback || !isSentenceOrder) return;
    setSelectedWordIndexes((previous) => previous.includes(sourceIndex) ? previous : [...previous, sourceIndex]);
  }, [current, feedback, isSentenceOrder]);

  const onSentenceSelectedPress = useCallback((selectionIndex: number) => {
    if (feedback) return;
    setSelectedWordIndexes((previous) => previous.filter((_, index) => index !== selectionIndex));
  }, [feedback]);

  const onSentenceCheck = useCallback(() => {
    if (!current || feedback || !isSentenceOrder) return;
    const selectedAnswerText = selectedWordIndexes.map((wordIndex) => sentenceOrderParts[wordIndex]).filter(Boolean).join(" ").trim();
    const selectedAnswer = selectedAnswerText.toLowerCase();
    const correct = (current.correctAnswer ?? "").trim().toLowerCase();
    const isCorrect = selectedAnswer.length > 0 && selectedAnswer === correct;
    setSelectedOptionId(null);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setAnswers((s) => ({ ...s, [current.id]: selectedAnswerText }));
    }
    animateFeedback(isCorrect);
    if (!isCorrect) return;
    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      setSelectedWordIndexes([]);
      if (idx < tasks.length - 1) {
        Animated.timing(questionFade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
          setIdx((v) => v + 1);
          Animated.timing(questionFade, { toValue: 1, duration: 190, useNativeDriver: true }).start();
        });
      }
    }, 820);
  }, [animateFeedback, current, feedback, idx, isSentenceOrder, questionFade, selectedWordIndexes, sentenceOrderParts, tasks.length]);

  const onSentenceTryAgain = useCallback(() => {
    setFeedback(null);
    setSelectedWordIndexes([]);
    setSelectedOptionId(null);
  }, []);

  const onImageTryAgain = useCallback(() => {
    setFeedback(null);
    setSelectedOptionId(null);
  }, []);

  useEffect(() => {
    setSelectedWordIndexes([]);
  }, [idx]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const onFinish = useCallback(async () => {
    if (!practice) return;
    const correctCount = tasks.filter((t) => answers[t.id] && isCorrectAnswer(t, answers[t.id], practice?.type)).length;
    const score = tasks.length ? Math.round((correctCount / tasks.length) * 100) : 0;
    const answersPayload = tasks
      .filter((task) => typeof answers[task.id] === "string" && answers[task.id].length > 0)
      .map((task) => ({
        questionId: task.id,
        answer: answers[task.id],
      }));
    await practiceService.submitAttempt(practice.id, {
      score,
      correctCount,
      totalCount: tasks.length,
      stageId,
      answers: answersPayload,
    });
    router.replace(`/practice/${encodeURIComponent(practiceId)}/roadmap` as any);
  }, [answers, practice, practiceId, router, stageId, tasks]);

  if (loading || !current) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#93C5FD" /></View></SafeAreaView>;

  const isLast = idx === tasks.length - 1;

  return <SafeAreaView style={styles.safeArea}><View style={styles.wrap}>
    <View style={styles.top}><Pressable hitSlop={10} style={styles.backButton} onPress={() => router.replace(`/practice/${encodeURIComponent(practiceId)}/roadmap` as any)}><Ionicons name="chevron-back" size={20} color="#BFDBFE" /></Pressable><View style={styles.bar}><View style={[styles.barFill, { width: `${progress * 100}%` }]} /></View><Text style={styles.xp}>+{12}XP</Text></View>

    <Animated.View style={[
      styles.card,
      { opacity: questionFade, transform: [{ translateX: shakeX }, { scale: feedback === "correct" ? correctScale : 1 }] },
      feedback === "correct" && styles.correct,
      feedback === "wrong" && styles.wrong,
    ]}>
      {practice?.type !== "dialogue_fill" ? (
        <Text style={styles.prompt}>{current.prompt}</Text>
      ) : null}
      {helperSubtitle ? <Text style={styles.subtitle}>{helperSubtitle}</Text> : null}
      {/* {practice?.type === "image_choice" && <Text style={styles.subtitle}>Pick the image that best matches the prompt.</Text>} */}
      {practice?.type === "dialogue_fill" && <View style={styles.dialog}><Text style={styles.bubbleA}>A: {current.prompt}</Text><Text style={styles.bubbleB}>B: ________</Text></View>}
      {isSentenceOrder && <View style={styles.sentenceOrderWrap}>
        <View style={styles.buildArea}>
          <View style={styles.chipsRow}>
            {selectedWordIndexes.length === 0 ? <Text style={styles.buildText}>Tap words to build sentence</Text> : selectedWordIndexes.map((sourceIndex, selectionIndex) => {
              const selectedWord = sentenceOrderParts[sourceIndex];
              return <Pressable key={`${selectedWord}-${sourceIndex}-${selectionIndex}`} style={styles.selectedChip} onPress={() => onSentenceSelectedPress(selectionIndex)}><Text style={styles.selectedChipText}>{selectedWord}</Text></Pressable>;
            })}
          </View>
        </View>
        {sentenceOrderParts.length === 0 ? <Text style={styles.buildText}>No word parts configured.</Text> : <View style={styles.chipsRow}>
          {sentenceOrderParts.map((part, sourceIndex) => {
            const isSelected = selectedWordIndexes.includes(sourceIndex);
            return <Pressable key={`${part}-${sourceIndex}`} style={[styles.wordChip, isSelected && styles.wordChipInactive]} onPress={() => onSentencePartPress(sourceIndex)} hitSlop={8} disabled={feedback !== null || isSelected}><Text style={[styles.wordChipText, isSelected && styles.wordChipTextInactive]}>{part}</Text></Pressable>;
          })}
        </View>}
      </View>}
      {practice?.type === "image_choice" && <View style={styles.imageGrid}>
        {current.options.map((o) => {

          const img = resolveImageUrl(o.imageUrl);
          const status = imageLoadState[o.id] || "loading";
          const isSelected = selectedOptionId === o.id;
          const isCorrect =
            feedback === "correct" &&
            isCorrectAnswer(current, o.id, practice?.type);
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
              {isCorrect ? <View style={styles.mark}><Ionicons name="checkmark-circle" size={22} color="#86EFAC" /></View> : null}
            </View>
          </Pressable>;
        })}
      </View>}
    </Animated.View>


    {practice?.type === "image_choice" && feedback === "wrong" ? <View style={styles.feedbackWrap}><Text style={styles.feedbackWrongText}>Wrong</Text><Text style={styles.feedbackHint}>Try Again</Text></View> : null}
    {practice?.type === "image_choice" && feedback === "correct" ? <View style={styles.feedbackWrap}><Text style={styles.feedbackCorrectText}>Correct!</Text></View> : null}
    {isSentenceOrder ? <Pressable style={[styles.finish, (sentenceAnswerText.length === 0 || feedback !== null) && styles.finishDisabled]} onPress={onSentenceCheck} disabled={sentenceAnswerText.length === 0 || feedback !== null}><Text style={styles.finishText}>Check answer</Text></Pressable> : null}
    {isSentenceOrder && feedback === "wrong" ? <Pressable style={styles.tryAgainButton} onPress={onSentenceTryAgain}><Text style={styles.finishText}>Try Again</Text></Pressable> : null}
    {practice?.type !== "image_choice" && practice?.type !== "sentence_order" && <View style={styles.options}>{current.options.map((o) => {
      const isSelected = selectedOptionId === o.id;
      const isCorrect = feedback === "correct" && isSelected;
      const isWrong = feedback === "wrong" && isSelected;
      return <Pressable key={o.id} style={[styles.opt, isCorrect && styles.optCorrect, isWrong && styles.optWrong]} onPress={() => onPick(o.id)} disabled={feedback !== null}><Text style={styles.optText}>{o.text}</Text></Pressable>;
    })}</View>}
    {supportsRetry && feedback === "wrong" ? <Pressable style={styles.tryAgainButton} onPress={onImageTryAgain}><Text style={styles.finishText}>Try Again</Text></Pressable> : null}
    {feedback === "correct" && <Animated.View pointerEvents="none" style={[styles.xpPop, { opacity: xpPop, transform: [{ translateY: xpPop.interpolate({ inputRange: [0, 1], outputRange: [16, -8] }) }] }]}><Text style={styles.xpPopText}>+{stageXp} XP</Text></Animated.View>}
    {isLast && answers[current.id] && <Pressable style={styles.finish} onPress={() => void onFinish()}><Text style={styles.finishText}>Complete Stage</Text></Pressable>}
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#071120" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  wrap: { flex: 1, padding: 16, gap: 14 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  backButton: { minWidth: 44, minHeight: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
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
  sentenceOrderWrap: { gap: 10, zIndex: 10, elevation: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", zIndex: 10, elevation: 10 },
  wordChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#3B82F6", zIndex: 11, elevation: 11 },
  wordChipInactive: { opacity: 0.45, backgroundColor: "#334155", borderColor: "#64748B" },
  wordChipText: { color: "#DBEAFE", fontWeight: "700" },
  wordChipTextInactive: { color: "#CBD5E1" },
  selectedChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#172554", borderWidth: 1, borderColor: "#60A5FA" },
  selectedChipText: { color: "#BFDBFE", fontWeight: "700" },
  imageGrid: { gap: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  imageCard: { width: "48%", borderRadius: 18, backgroundColor: "#121E36", borderWidth: 1, borderColor: "#2A3A64", padding: 8, shadowColor: "#60A5FA", shadowOffset: { width: 0, height: 0 }, shadowRadius: 0, shadowOpacity: 0 },
  imageCardSelected: { borderColor: "#60A5FA", shadowOpacity: 0.5, shadowRadius: 12, elevation: 3 },
  imageCardCorrect: { borderColor: "#22C55E", shadowColor: "#22C55E", shadowOpacity: 0.45, shadowRadius: 10 },
  imageCardWrong: { borderColor: "#EF4444", shadowColor: "#EF4444", shadowOpacity: 0.35, shadowRadius: 8 },
  imageFrame: { height: 112, borderRadius: 14, overflow: "hidden", backgroundColor: "#0A1325", alignItems: "center", justifyContent: "center" },
  imageThumb: { width: "100%", height: "100%" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,19,37,0.75)", gap: 4 },
  fallbackText: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  mark: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(15,23,42,0.85)", borderRadius: 999, padding: 2 },
  options: { gap: 10 },
  opt: { borderRadius: 14, backgroundColor: "#12233D", borderWidth: 1, borderColor: "#2B3D5B", padding: 14 },
  optCorrect: { borderColor: "#22C55E", backgroundColor: "#14532D" },
  optWrong: { borderColor: "#EF4444", backgroundColor: "#7F1D1D" },
  optText: { color: "#E2E8F0", fontWeight: "800", textAlign: "center" },
  xpPop: { position: "absolute", alignSelf: "center", bottom: 96, backgroundColor: "#14532D", borderRadius: 999, borderWidth: 1, borderColor: "#22C55E", paddingHorizontal: 12, paddingVertical: 6 },
  xpPopText: { color: "#DCFCE7", fontWeight: "900", fontSize: 12 },
  finish: { backgroundColor: "#2563EB", borderRadius: 14, padding: 14 },
  finishDisabled: { opacity: 0.5 },
  tryAgainButton: { backgroundColor: "#334155", borderRadius: 14, padding: 14 },
  feedbackWrap: { gap: 8 },
  feedbackWrongText: { color: "#FCA5A5", textAlign: "center", fontWeight: "900", fontSize: 18 },
  feedbackCorrectText: { color: "#86EFAC", textAlign: "center", fontWeight: "900", fontSize: 18 },
  feedbackHint: { color: "#CBD5E1", textAlign: "center", fontWeight: "700" },
  finishText: { color: "#fff", textAlign: "center", fontWeight: "900" },
});
