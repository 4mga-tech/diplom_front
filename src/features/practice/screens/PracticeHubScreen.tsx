import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HUB_TYPES = ["dialogue_fill", "image_choice", "sentence_order"] as const;

type DailyTask = { id: string; title: string; progress: number; total: number; xp: number; reset: string; done?: boolean };

const TYPE_META: Record<string, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; xpHint: string }> = {
  dialogue_fill: { title: "Dialogue Fill", subtitle: "Pick the natural reply", icon: "chatbubbles-outline", xpHint: "+12 XP" },
  image_choice: { title: "Image Choice", subtitle: "Match word to visual", icon: "image-outline", xpHint: "+10 XP" },
  sentence_order: { title: "Sentence Order", subtitle: "Arrange fluent phrases", icon: "reorder-three-outline", xpHint: "+14 XP" },
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
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}><Ionicons name="sparkles" size={16} color="#C4B5FD" /></View>
            <View>
              <Text style={styles.overline}>Practice Hub</Text>
              <Text style={styles.title}>Let&apos;s train</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>🔥 5</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>⚡ 120 XP</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>🎯 3 tasks</Text></View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Daily tasks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dailyRow}>
            {dailyTasks.map((task) => {
              const pct = Math.min(task.progress / task.total, 1);
              return <View key={task.id} style={styles.dailyCard}>
                <View style={styles.dailyTopRow}><Text style={styles.dailyTitle}>{task.title}</Text><Text style={styles.dailyXp}>+{task.xp} XP</Text></View>
                <Text style={styles.dailyProgress}>{task.progress}/{task.total}</Text>
                <View style={styles.progressTrack}><View style={[styles.progressBar, { width: `${pct * 100}%` }]} /></View>
                <Text style={styles.dailyReset}>{task.done ? "Completed" : task.reset}</Text>
              </View>;
            })}
          </ScrollView>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Game modes</Text>
          <View style={styles.grid}>
            {mappedModes.map((practice) => {
              const isQuick = practice.type === "quick_challenge";
              const meta = isQuick ? { title: "Quick Challenge", subtitle: "Daily mixed sprint", icon: "flash-outline" as const, xpHint: "+20 XP" } : TYPE_META[practice.type ?? ""];
              if (!meta) return null;
              return (
                <Pressable
                  key={practice.id}
                  style={({ pressed }) => [styles.gameCard, pressed && styles.pressed]}
                  onPress={() => router.push(`/practice/${encodeURIComponent(practice.id.split("#")[0])}/roadmap` as any)}
                >
                  <LinearGradient colors={["rgba(31,44,73,0.95)", "rgba(12,20,39,0.9)"]} style={styles.gradient}>
                    <View style={styles.iconWrap}><Ionicons name={meta.icon} size={18} color="#B6C8FF" /></View>
                    <Text style={styles.gameTitle}>{meta.title}</Text>
                    <Text style={styles.gameSubtitle}>{meta.subtitle}</Text>
                    <View style={styles.cardFoot}><Text style={styles.footText}>{practice.stageCount} stages</Text><Text style={styles.footText}>{meta.xpHint}</Text></View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050C1A" },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 42, gap: 20 },
  bgOrbTop: { position: "absolute", top: -90, right: -70, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(75,85,255,0.18)" },
  bgOrbBottom: { position: "absolute", bottom: -110, left: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(168,85,247,0.15)" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  centerText: { color: "#CBD5E1", fontWeight: "600" },
  headerCard: { borderWidth: 1, borderColor: "rgba(112,128,163,0.28)", backgroundColor: "rgba(10,18,35,0.88)", borderRadius: 18, padding: 14, gap: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(43,54,84,0.7)", alignItems: "center", justifyContent: "center" },
  overline: { color: "#9CAFD4", fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  title: { color: "#F8FAFC", fontSize: 22, fontWeight: "900" },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { backgroundColor: "rgba(31,45,72,0.85)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(119,143,193,0.3)" },
  badgeText: { color: "#D4E4FF", fontWeight: "700", fontSize: 11 },
  sectionTitle: { color: "#E2E8F0", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  dailyRow: { gap: 10, paddingRight: 16 },
  dailyCard: { width: 188, borderRadius: 16, borderWidth: 1, borderColor: "rgba(94,115,154,0.3)", backgroundColor: "rgba(13,22,40,0.9)", padding: 12, gap: 8 },
  dailyTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  dailyTitle: { color: "#E2E8F0", fontWeight: "700", fontSize: 12 },
  dailyXp: { color: "#67E8F9", fontSize: 11, fontWeight: "700" },
  dailyProgress: { color: "#F8FAFC", fontWeight: "900", fontSize: 18 },
  progressTrack: { height: 5, borderRadius: 999, backgroundColor: "rgba(64,82,115,0.6)", overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: "#60A5FA" },
  dailyReset: { color: "#9FB4DA", fontSize: 11, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gameCard: { width: "48.5%", borderRadius: 18, overflow: "hidden" },
  gradient: { minHeight: 142, borderRadius: 18, borderWidth: 1, borderColor: "rgba(105,126,164,0.32)", padding: 12, gap: 6 },
  iconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(59,130,246,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  gameTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  gameSubtitle: { color: "#A1B1CF", fontSize: 11, fontWeight: "600" },
  cardFoot: { marginTop: "auto", flexDirection: "row", justifyContent: "space-between" },
  footText: { color: "#C7DCF8", fontSize: 10, fontWeight: "700" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});
