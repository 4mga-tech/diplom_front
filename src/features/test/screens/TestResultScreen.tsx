import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestResultScreen() {
  const router = useRouter();
  const { levelId, testType, total, correct, wrong, xpGained, percentage } =
    useLocalSearchParams<{
      levelId?: string;
      testType?: string;
      total?: string;
      correct?: string;
      wrong?: string;
      xpGained?: string;
      percentage?: string;
    }>();

  const safeLevel = levelId ?? "M1";
  const safeType = testType ?? "vocabulary";

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Test Complete</Text>
      <Text style={styles.subtitle}>
        {safeLevel} • {safeType}
      </Text>

      <View style={styles.card}>
        <Text style={styles.score}>{percentage ?? "0"}%</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>{total ?? "0"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Correct</Text>
          <Text style={styles.value}>{correct ?? "0"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Wrong</Text>
          <Text style={styles.value}>{wrong ?? "0"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>XP gained</Text>
          <Text style={styles.value}>+{xpGained ?? "0"}</Text>
        </View>
      </View>

      <Pressable
        style={styles.primaryBtn}
        onPress={() =>
          router.replace({
            pathname: "/test/session/[levelId]" as any,
            params: {
              levelId: safeLevel,
              testType: safeType,
            },
          })
        }
      >
        <Text style={styles.primaryBtnText}>Retry</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
        <Text style={styles.secondaryBtnText}>Back to tests</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    textTransform: "capitalize",
  },
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
  primaryBtn: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
