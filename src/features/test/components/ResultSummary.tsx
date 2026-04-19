import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  percentage: string | number;
  total: string | number;
  correct: string | number;
  wrong: string | number;
  xpGained: string | number;
};

export default function ResultSummary({
  percentage,
  total,
  correct,
  wrong,
  xpGained,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.score}>{percentage}%</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>{total}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Correct</Text>
        <Text style={styles.value}>{correct}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Wrong</Text>
        <Text style={styles.value}>{wrong}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>XP gained</Text>
        <Text style={styles.value}>+{xpGained}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  score: {
    color: "#A78BFA",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  value: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
  },
});
