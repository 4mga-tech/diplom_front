import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TestQuestion } from "../types/test.types";
import OptionButton from "./OptionButton";

type Props = {
  question: TestQuestion;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
};

export default function QuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.optionsWrap}>
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            text={option.text}
            selected={selectedOptionId === option.id}
            onPress={() => onSelectOption(option.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
