import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HUB_TYPES = ["dialogue_fill", "image_choice", "sentence_order"] as const;

type DailyTask = { id: string; title: string; progress: number; total: number; xp: number; reset: string; done?: boolean };

const TYPE_META: Record<string, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = {
  dialogue_fill: { title: "Dialogue Fill", subtitle: "Pick the natural reply", icon: "chatbubbles-outline" },
  image_choice: { title: "Image Choice", subtitle: "Match word to visual", icon: "image-outline" },
  sentence_order: { title: "Sentence Order", subtitle: "Arrange fluent phrases", icon: "reorder-three-outline" },
};

export default function PracticeHubScreen() {
  const router = useRouter();
  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPractices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await practiceService.getPractices();
      setPractices(data);
      setError(null);
    } catch (e) {
      console.log("Failed to load practices", e);
      setError("Could not load practice list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadPractices(); }, [loadPractices]));

  const mappedModes = useMemo(() => {
    const modeCards = HUB_TYPES.map((type) => {
      const filtered = practices.filter((item) => item.type === type);
      if (!filtered.length) return null;
      return { ...filtered[0], stageCount: filtered.length };
    }).filter(Boolean) as Array<PracticeSummary & { stageCount: number }>;

    const quickChallenge = practices[0]
      ? [{ ...practices[0], id: `${practices[0].id}#quick`, type: "quick_challenge", title: "Quick Challenge", stageCount: 10 } as PracticeSummary & { stageCount: number }]
      : [];

    return [...modeCards, ...quickChallenge];
  }, [practices]);

  const dailyTasks = useMemo<DailyTask[]>(() => [
    { id: "streak", title: "Streak saver", progress: 1, total: 1, xp: 20, reset: "Resets in 23h", done: true },
    { id: "dialogue", title: "Dialogue set", progress: 6, total: 10, xp: 30, reset: "Resets in 23h" },
    { id: "review", title: "Speed review", progress: 2, total: 5, xp: 16, reset: "Resets in 23h" },
  ], []);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#93C5FD" /><Text style={styles.centerText}>Loading practice...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbBottom} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} tintColor="#93C5FD" />}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.title}>Practice</Text>
              <Text style={styles.subtitle}>4 modes • Daily XP</Text>
            </View>
            <View style={styles.headerIcon}><Ionicons name="sparkles-outline" size={18} color="#C4B5FD" /></View>
          </View>
          <View style={styles.headerMetaRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>Beginner</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Daily</Text></View>
          </View>
        </View>

        <View style={styles.dailySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dailyRow}>
            {dailyTasks.map((task) => (
              <View key={task.id} style={styles.dailyChip}>
                <Text style={styles.dailyChipTitle}>{task.title}</Text>
                <Text style={styles.dailyChipMeta}>{task.progress}/{task.total} • +{task.xp} XP</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.listSection}>
          {mappedModes.map((practice, index) => {
            const isQuick = practice.type === "quick_challenge";
            const meta = isQuick
              ? { title: "Quick Challenge", subtitle: "Daily mixed sprint", icon: "flash-outline" as const }
              : TYPE_META[practice.type ?? ""];
            if (!meta) return null;

            const progress = practice.progress;
            const completedStages = progress?.completedStages ?? 0;
            const totalStages = progress?.totalStages ?? (practice.tasksCount || 0);
            const earnedXp = progress?.earnedXp ?? (practice.xpReward ?? 0);
            const rowProgress = Math.max(0, Math.min((progress?.progressPercent ?? 0) / 100, 1));
            return (
              <Pressable
                key={practice.id}
                style={({ pressed }) => [styles.lessonRow, pressed && styles.pressed]}
                onPress={() => router.push(`/practice/${encodeURIComponent(practice.id.split("#")[0])}/roadmap` as any)}
              >
                <Text style={styles.rowIndex}>{String(index + 1).padStart(2, "0")}</Text>
                <View style={styles.rowIconWrap}><Ionicons name={meta.icon} size={18} color="#BFD1FF" /></View>
                <View style={styles.rowContent}>
                  <View style={styles.rowTopLine}>
                    <Text style={styles.rowTitle}>{meta.title}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#7F92BA" />
                  </View>
                  <Text style={styles.rowMeta}>{`${completedStages}/${totalStages} stages`} • {`${earnedXp} XP earned`}</Text>
                  <View style={styles.rowProgressTrack}><View style={[styles.rowProgressBar, { width: `${rowProgress * 100}%` }]} /></View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050C1A" },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 42 },
  bgOrbTop: { position: "absolute", top: -110, right: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(75,85,255,0.16)" },
  bgOrbBottom: { position: "absolute", bottom: -110, left: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(168,85,247,0.12)" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  centerText: { color: "#CBD5E1", fontWeight: "600" },

  header: { marginBottom: 14, gap: 12 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#F8FAFC", fontSize: 34, fontWeight: "900", letterSpacing: -0.4 },
  subtitle: { color: "#98A7C8", fontSize: 13, fontWeight: "600", marginTop: 3 },
  headerIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(38,51,84,0.66)", borderWidth: 1, borderColor: "rgba(109,126,170,0.26)", alignItems: "center", justifyContent: "center" },
  headerMetaRow: { flexDirection: "row", gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: "rgba(30,42,66,0.82)", borderWidth: 1, borderColor: "rgba(108,125,164,0.28)" },
  badgeText: { color: "#D9E4FF", fontWeight: "700", fontSize: 11 },

  dailySection: { marginBottom: 20 },
  dailyRow: { gap: 8, paddingRight: 20 },
  dailyChip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "rgba(14,23,41,0.78)", borderWidth: 1, borderColor: "rgba(87,106,148,0.28)", minWidth: 128 },
  dailyChipTitle: { color: "#E2E8F0", fontSize: 12, fontWeight: "700" },
  dailyChipMeta: { color: "#9EB0D6", fontSize: 11, fontWeight: "600", marginTop: 2 },

  listSection: { gap: 12 },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  rowIndex: { width: 24, color: "#7284A9", fontSize: 12, fontWeight: "700", letterSpacing: 0.6 },
  rowIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(55,74,119,0.35)", borderWidth: 1, borderColor: "rgba(114,135,182,0.34)", alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: "rgba(89,106,145,0.24)", paddingBottom: 10 },
  rowTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowTitle: { color: "#F1F5F9", fontSize: 16, fontWeight: "700" },
  rowMeta: { color: "#8FA3CB", fontSize: 12, fontWeight: "600", marginTop: 3 },
  rowProgressTrack: { height: 3, borderRadius: 99, backgroundColor: "rgba(80,98,136,0.35)", marginTop: 9, overflow: "hidden" },
  rowProgressBar: { height: "100%", backgroundColor: "#7C8CFF" },

  pressed: { opacity: 0.78 },
});
