import { useTestSession } from "@/src/features/test/hooks/useTestSession";
import { testService } from "@/src/features/test/services/test.service";
import { TestType } from "@/src/features/test/types/test.types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TestSessionScreen() {
  const router = useRouter();
  const { levelId, testType } = useLocalSearchParams<{
    levelId?: string;
    testType?: TestType;
  }>();

  const safeLevel = levelId ?? "M1";
  const safeType = (testType ?? "vocabulary") as TestType;

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await testService.getQuestions(safeLevel, safeType);
        if (mounted) setQuestions(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [safeLevel, safeType]);

  const {
    currentQuestion,
    selectedOptionId,
    selectOption,
    submitAnswer,
    goNext,
    isLastQuestion,
    buildResult,
    progress,
    hasQuestions,
    currentIndex,
    totalQuestions,
  } = useTestSession(questions, safeLevel, safeType);

  function handleNext() {
    if (!selectedOptionId) {
      Alert.alert("Select answer", "Please choose one option first.");
      return;
    }

    const ok = submitAnswer();
    if (!ok) return;

    if (isLastQuestion) {
      const result = buildResult();

      router.replace({
        pathname: "/test/result/[levelId]" as any,
        params: {
          levelId: safeLevel,
          testType: safeType,
          total: String(result.total),
          correct: String(result.correct),
          wrong: String(result.wrong),
          xpGained: String(result.xpGained),
          percentage: String(result.percentage),
        },
      });
      return;
    }

    goNext();
  }

  function handleQuit() {
    Alert.alert("Quit test?", "Your current progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Quit", style: "destructive", onPress: () => router.back() },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!hasQuestions || !currentQuestion) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>No questions yet</Text>
        <Text style={styles.emptyText}>
          This test type is not ready for {safeLevel}.
        </Text>

        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleQuit}>
          <Text style={styles.quitText}>Quit</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          {safeLevel} • {safeType}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.counter}>
        Question {currentIndex + 1} / {totalQuestions}
      </Text>

      <View style={styles.card}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsWrap}>
          {currentQuestion.options.map((option: any) => {
            const selected = selectedOptionId === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => selectOption(option.id)}
                style={[styles.optionBtn, selected && styles.optionBtnSelected]}
              >
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

      <Pressable style={styles.primaryBtn} onPress={handleNext}>
        <Text style={styles.primaryBtnText}>
          {isLastQuestion ? "Finish Test" : "Next"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 20 },
  center: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  quitText: {
    color: "#FCA5A5",
    fontSize: 15,
    fontWeight: "700",
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  progressWrap: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 999,
  },
  counter: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 18,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  questionText: {
    color: "white",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    marginBottom: 18,
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
  },
  optionBtnSelected: {
    backgroundColor: "rgba(139,92,246,0.18)",
    borderColor: "#8B5CF6",
  },
  optionText: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "white",
  },
  primaryBtn: {
    marginTop: "auto",
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
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
