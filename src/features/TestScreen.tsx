import { AppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_QUESTIONS = [
  {
    id: "1",
    question: "Hello гэдэг нь юу вэ?",
    options: ["Сайн байна", "Баяртай", "Уучлаарай"],
    correct: 0,
  },
  {
    id: "2",
    question: "Bye гэдэг нь?",
    options: ["Сайн байна", "Баяртай", "Баярлалаа"],
    correct: 1,
  },
];

type Props = {
  levelId: string;
};

export default function TestScreen({ levelId }: Props) {
  const styles = useThemedStyles(createStyles);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const current = MOCK_QUESTIONS[index];

  const handleAnswer = (i: number) => {
    const isCorrect = i === current.correct;

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    const nextScore = score + (isCorrect ? 1 : 0);

    if (index + 1 < MOCK_QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      alert(`Finished! Score: ${nextScore}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name="chevron-back"
            size={22}
            color={styles.backIcon.color}
          />
        </Pressable>
      </View>

      <Text style={styles.level}>Level: {levelId}</Text>
      <Text style={styles.question}>{current.question}</Text>

      {current.options.map((opt, i) => (
        <Pressable key={i} onPress={() => handleAnswer(i)} style={styles.btn}>
          <Text style={styles.btnText}>{opt}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.bg,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.5)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.5)" : "rgba(148,163,184,0.18)",
    },

    backIcon: {
      color: theme.colors.text,
    },

    level: {
      color: theme.mode === "dark" ? "#A78BFA" : "#7C3AED",
      fontWeight: "800",
      marginBottom: 10,
    },

    question: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
      marginBottom: 20,
    },

    btn: {
      backgroundColor: theme.mode === "dark" ? "#1e293b" : "#FFFFFF",
      padding: 14,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.5)" : "rgba(148,163,184,0.18)",
    },

    btnText: {
      color: theme.colors.text,
      fontWeight: "700",
    },
  });
