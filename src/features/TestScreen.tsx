import { theme } from "@/src/ui/theme";
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
          <Ionicons name="chevron-back" size={22} color="white" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.bg,
  },
  question: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "700",
  },
  level: {
    color: "#A78BFA",
    fontWeight: "800",
    marginBottom: 10,
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
    backgroundColor: "rgba(30,41,59,0.5)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.5)",
  },
});
