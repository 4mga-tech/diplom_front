import { theme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type ReviewQuestion = {
  id: string;
  type: "multiple_choice" | "true_false" | "translation";
  prompt: string;
  helper: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  xpReward: number;
};

const REVIEW_SET: ReviewQuestion[] = [
  {
    id: "review-1",
    type: "multiple_choice",
    prompt: 'What is the best English meaning of "?????????"?',
    helper: "Choose the closest translation.",
    options: ["Goodbye", "Thank you", "Please", "Tomorrow"],
    correctAnswer: "Thank you",
    explanation: '"?????????" is the standard way to say "Thank you."',
    xpReward: 8,
  },
  {
    id: "review-2",
    type: "true_false",
    prompt: '"????" means "Yes".',
    helper: "Decide whether the statement is true.",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: '"????" is used to say "Yes."',
    xpReward: 6,
  },
  {
    id: "review-3",
    type: "translation",
    prompt: 'Choose the Mongolian phrase for "No".',
    helper: "Focus on the exact phrase.",
    options: ["????", "???? ????? ??", "?????????", "????"],
    correctAnswer: "????",
    explanation: '"????" means "No."',
    xpReward: 8,
  },
  {
    id: "review-4",
    type: "multiple_choice",
    prompt: 'You arrive at a station. Which word best matches "ticket"?',
    helper: "Pick the travel vocabulary answer.",
    options: ["????????", "??????", "???", "???"],
    correctAnswer: "????????",
    explanation: '"????????" is the word for a ticket.',
    xpReward: 10,
  },
  {
    id: "review-5",
    type: "multiple_choice",
    prompt: "Which phrase best fits a daily-routine sentence?",
    helper: "Look for the activity phrase.",
    options: [
      "?? ????? ??? ?????.",
      "????????? ???? ??.",
      "??? ????? ????????.",
      "????, ?? ???????.",
    ],
    correctAnswer: "?? ????? ??? ?????.",
    explanation:
      'The sentence means "I drink tea in the morning," which matches a routine.',
    xpReward: 10,
  },
  {
    id: "review-6",
    type: "true_false",
    prompt: 'The phrase "???? ????? ??" is used as a greeting.',
    helper: "Think about common conversation starters.",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: '"???? ????? ??" is a greeting similar to "Hello/How are you?"',
    xpReward: 8,
  },
];

function OptionButton({
  label,
  onPress,
  selected,
  disabled,
  isCorrect,
  isWrong,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
  disabled: boolean;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionBtn,
        selected && styles.optionBtnSelected,
        isCorrect && styles.optionBtnCorrect,
        isWrong && styles.optionBtnWrong,
        pressed && !disabled && { opacity: 0.92 },
      ]}
    >
      <Text style={styles.optionText}>{label}</Text>
      {isCorrect ? (
        <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
      ) : isWrong ? (
        <Ionicons name="close-circle" size={18} color="#F87171" />
      ) : null}
    </Pressable>
  );
}

export default function ReviewScreen() {
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; selected: string; correct: boolean; xpEarned: number }[]
  >([]);

  const current = REVIEW_SET[index];
  const answered = selectedAnswer !== null;
  const isLast = index === REVIEW_SET.length - 1;
  const isCorrect = selectedAnswer === current.correctAnswer;
  const progress = ((index + 1) / REVIEW_SET.length) * 100;

  const score = useMemo(
    () => answers.filter((answer) => answer.correct).length,
    [answers],
  );
  const totalXp = useMemo(
    () => answers.reduce((sum, answer) => sum + answer.xpEarned, 0),
    [answers],
  );

  const submitAnswer = (option: string) => {
    if (answered) return;
    setSelectedAnswer(option);
  };

  const nextQuestion = () => {
    if (!selectedAnswer) return;

    const wasCorrect = selectedAnswer === current.correctAnswer;
    const nextAnswers = [
      ...answers,
      {
        questionId: current.id,
        selected: selectedAnswer,
        correct: wasCorrect,
        xpEarned: wasCorrect ? current.xpReward : 0,
      },
    ];

    setAnswers(nextAnswers);

    if (isLast) {
      setShowResult(true);
      return;
    }

    setIndex((value) => value + 1);
    setSelectedAnswer(null);
  };

  const restart = () => {
    setIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
  };

  if (showResult) {
    const percentage = Math.round((score / REVIEW_SET.length) * 100);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("/")}>
            <Ionicons name="close" size={22} color={theme.colors.muted} />
          </Pressable>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.resultWrap}>
          <LinearGradient
            colors={["rgba(37,99,235,0.22)", "rgba(124,58,237,0.18)"]}
            style={styles.resultCard}
          >
            <Text style={styles.resultEyebrow}>Today's Review Complete</Text>
            <Text style={styles.resultScore}>{percentage}%</Text>
            <Text style={styles.resultSummary}>
              You got {score} out of {REVIEW_SET.length} correct and earned {totalXp} XP.
            </Text>

            <View style={styles.resultStats}>
              <View style={styles.resultPill}>
                <Ionicons name="checkmark" size={16} color="#4ADE80" />
                <Text style={styles.resultPillText}>{score} correct</Text>
              </View>
              <View style={styles.resultPill}>
                <Ionicons name="flash" size={16} color="#FACC15" />
                <Text style={styles.resultPillText}>{totalXp} XP</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ gap: theme.s(1.5), paddingBottom: theme.s(2) }}
            showsVerticalScrollIndicator={false}
          >
            {REVIEW_SET.map((question, questionIndex) => {
              const result = answers[questionIndex];
              return (
                <View key={question.id} style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>
                    {questionIndex + 1}. {question.prompt}
                  </Text>
                  <Text style={styles.summaryLine}>
                    Your answer: {result?.selected ?? "-"}
                  </Text>
                  <Text style={styles.summaryLine}>
                    Correct answer: {question.correctAnswer}
                  </Text>
                  <Text
                    style={[
                      styles.summaryBadge,
                      result?.correct ? styles.summaryCorrect : styles.summaryWrong,
                    ]}
                  >
                    {result?.correct ? "Correct" : "Needs review"}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.resultActions}>
            <Pressable style={styles.secondaryBtn} onPress={restart}>
              <Text style={styles.secondaryText}>Try Again</Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={() => router.push("/")}>
              <Text style={styles.primaryText}>Finish</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")}>
          <Ionicons name="close" size={22} color={theme.colors.muted} />
        </Pressable>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>
            {index + 1}/{REVIEW_SET.length}
          </Text>
        </View>
      </View>

      <View style={styles.center}>
        <LinearGradient
          colors={["rgba(37,99,235,0.18)", "rgba(124,58,237,0.16)"]}
          style={styles.quizCard}
        >
          <View style={styles.quizHeader}>
            <Text style={styles.quizType}>
              {current.type === "multiple_choice"
                ? "Multiple Choice"
                : current.type === "true_false"
                  ? "True or False"
                  : "Translation"}
            </Text>
            <View style={styles.xpPill}>
              <Ionicons name="flash" size={14} color="#FACC15" />
              <Text style={styles.xpText}>{current.xpReward} XP</Text>
            </View>
          </View>

          <Text style={styles.prompt}>{current.prompt}</Text>
          <Text style={styles.helper}>{current.helper}</Text>

          <View style={styles.optionsList}>
            {current.options.map((option, optionIndex) => {
              const isOptionCorrect = answered && option === current.correctAnswer;
              const isOptionWrong =
                answered && option === selectedAnswer && option !== current.correctAnswer;

              return (
                <OptionButton
                  key={`${current.id}-${optionIndex}-${option}`}
                  label={option}
                  onPress={() => submitAnswer(option)}
                  selected={selectedAnswer === option}
                  disabled={answered}
                  isCorrect={isOptionCorrect}
                  isWrong={isOptionWrong}
                />
              );
            })}
          </View>

          {answered ? (
            <View
              style={[
                styles.feedbackCard,
                isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
              ]}
            >
              <Text style={styles.feedbackTitle}>
                {isCorrect ? "Correct answer" : "Not quite"}
              </Text>
              <Text style={styles.feedbackBody}>{current.explanation}</Text>
            </View>
          ) : null}
        </LinearGradient>
      </View>

      <View style={styles.actions}>
        <View style={styles.liveStats}>
          <Text style={styles.liveText}>Score: {score}</Text>
          <Text style={styles.liveText}>XP: {totalXp}</Text>
        </View>

        <Pressable
          style={[styles.primaryBtn, !answered && { opacity: 0.5 }]}
          disabled={!answered}
          onPress={nextQuestion}
        >
          <Text style={styles.primaryText}>
            {isLast ? "See Results" : "Next Question"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: theme.s(6),
    paddingHorizontal: theme.s(3),
    paddingBottom: theme.s(4),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(2),
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(30,41,59,0.75)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  progressMeta: {
    minWidth: 42,
    alignItems: "flex-end",
  },
  progressText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },

  center: { flex: 1, justifyContent: "center" },
  quizCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(3),
    gap: theme.s(2),
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(2),
  },
  quizType: {
    color: "rgba(191,219,254,0.95)",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(250,204,21,0.10)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.18)",
  },
  xpText: { color: "rgba(250,204,21,0.95)", fontWeight: "900", fontSize: 11 },
  prompt: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 32,
  },
  helper: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  optionsList: {
    gap: theme.s(1.25),
  },
  optionBtn: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    backgroundColor: "rgba(15,23,42,0.72)",
    paddingHorizontal: theme.s(2),
    paddingVertical: theme.s(1.75),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(1.5),
  },
  optionBtnSelected: {
    borderColor: "rgba(96,165,250,0.75)",
    backgroundColor: "rgba(37,99,235,0.18)",
  },
  optionBtnCorrect: {
    borderColor: "rgba(74,222,128,0.55)",
    backgroundColor: "rgba(20,83,45,0.28)",
  },
  optionBtnWrong: {
    borderColor: "rgba(248,113,113,0.45)",
    backgroundColor: "rgba(127,29,29,0.25)",
  },
  optionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  feedbackCard: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    padding: theme.s(2),
    gap: 6,
  },
  feedbackCorrect: {
    backgroundColor: "rgba(20,83,45,0.25)",
    borderColor: "rgba(34,197,94,0.35)",
  },
  feedbackWrong: {
    backgroundColor: "rgba(127,29,29,0.2)",
    borderColor: "rgba(248,113,113,0.28)",
  },
  feedbackTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  feedbackBody: {
    color: "rgba(226,232,240,0.9)",
    fontSize: 13,
    lineHeight: 20,
  },

  actions: {
    gap: theme.s(1.5),
  },
  liveStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  primaryBtn: {
    paddingVertical: theme.s(2),
    borderRadius: theme.r.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },
  primaryText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryBtn: {
    paddingVertical: theme.s(2),
    borderRadius: theme.r.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.6)",
    backgroundColor: "rgba(30,41,59,0.45)",
    flex: 1,
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 15,
  },

  resultWrap: {
    flex: 1,
    paddingTop: theme.s(3),
    gap: theme.s(2),
  },
  resultCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(3),
    gap: theme.s(1.5),
  },
  resultEyebrow: {
    color: "rgba(191,219,254,0.95)",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  resultScore: {
    color: "white",
    fontSize: 42,
    fontWeight: "900",
  },
  resultSummary: {
    color: "rgba(226,232,240,0.9)",
    fontSize: 15,
    lineHeight: 22,
  },
  resultStats: {
    flexDirection: "row",
    gap: theme.s(1),
    flexWrap: "wrap",
  },
  resultPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
  },
  resultPillText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },
  summaryCard: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    backgroundColor: "rgba(15,23,42,0.65)",
    padding: theme.s(2),
    gap: 6,
  },
  summaryTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  summaryLine: {
    color: "rgba(226,232,240,0.9)",
    fontSize: 13,
    lineHeight: 19,
  },
  summaryBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "900",
  },
  summaryCorrect: {
    color: "#DCFCE7",
    backgroundColor: "rgba(20,83,45,0.35)",
  },
  summaryWrong: {
    color: "#FECACA",
    backgroundColor: "rgba(127,29,29,0.3)",
  },
  resultActions: {
    flexDirection: "row",
    gap: theme.s(1.5),
  },
});
