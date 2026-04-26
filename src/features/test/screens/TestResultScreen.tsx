import { normalizeTestLevelId } from "@/src/features/test/constants/testLevels";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestResultScreen() {
  const router = useRouter();
  const {
    levelId,
    testType,
    totalQuestions,
    correctCount,
    xpGained,
    score,
    passed,
  } = useLocalSearchParams<{
    levelId?: string;
    testType?: string;
    totalQuestions?: string;
    correctCount?: string;
    xpGained?: string;
    score?: string;
    passed?: string;
  }>();

  const safeLevel = normalizeTestLevelId(levelId) ?? "M1";
  const safeType = testType ?? "vocabulary";
  const total = Number(totalQuestions ?? 0);
  const correct = Number(correctCount ?? 0);
  const wrong = Math.max(0, total - correct);
  const safeScore = score ?? "0";
  const didPass = passed === "true";
  const statusTitle = didPass ? "Passed" : "Not Passed";
  const statusText = didPass
    ? "You passed the final exam. Your evaluated result has been recorded."
    : "You did not pass this final exam yet. Review the lesson and retake it when you are ready.";

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Final Lesson Exam</Text>
        <Text style={styles.title}>Exam result</Text>
        <Text style={styles.subtitle}>{`${safeLevel} - ${safeType}`}</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.statusBadge, didPass ? styles.statusBadgePass : styles.statusBadgeFail]}>
          <Text style={[styles.statusBadgeText, didPass ? styles.statusBadgeTextPass : styles.statusBadgeTextFail]}>
            {statusTitle}
          </Text>
        </View>

        <Text style={styles.score}>{safeScore}%</Text>
        <Text style={styles.status}>{statusTitle}</Text>
        <Text style={styles.helper}>{statusText}</Text>
        <Text style={styles.xpSummary}>
          XP gained: <Text style={styles.xpSummaryValue}>+{xpGained ?? "0"}</Text>
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{wrong}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>+{xpGained ?? "0"}</Text>
            <Text style={styles.statLabel}>XP gained</Text>
          </View>
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
        <Text style={styles.primaryBtnText}>Restart Final Exam</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
        <Text style={styles.secondaryBtnText}>Back to exams</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.55,
    marginBottom: 8,
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
    borderColor: "rgba(245,158,11,0.12)",
    marginBottom: 20,
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusBadgePass: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(34,197,94,0.2)",
  },
  statusBadgeFail: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderColor: "rgba(245,158,11,0.2)",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadgeTextPass: {
    color: "#86EFAC",
  },
  statusBadgeTextFail: {
    color: "#FDE68A",
  },
  score: {
    color: "#FCD34D",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  status: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  helper: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  xpSummary: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 18,
  },
  xpSummaryValue: {
    color: "#FCD34D",
    fontWeight: "900",
  },
  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15,23,42,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: "#F59E0B",
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
