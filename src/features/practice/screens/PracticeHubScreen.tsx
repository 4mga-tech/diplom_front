import { practiceService } from "@/src/features/practice/practice.service";
import { DailyTask, PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HUB_TYPES = ["missing_word", "sentence_order", "dialogue_fill", "image_choice"] as const;
const TYPE_META: Record<string, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; accent: string }> = {
  missing_word: { title: "Үг нөхөх", subtitle: "Focus blanks", icon: "create-outline", accent: "#8B5CF6" },
  sentence_order: { title: "Дараалал", subtitle: "Build sentence", icon: "swap-vertical-outline", accent: "#0EA5E9" },
  dialogue_fill: { title: "Яриа", subtitle: "Chat style", icon: "chatbubbles-outline", accent: "#F97316" },
  image_choice: { title: "Зураг", subtitle: "Visual pick", icon: "image-outline", accent: "#22C55E" },
};

export default function PracticeHubScreen() {
  const router = useRouter();
  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [resetAt, setResetAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPractices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [practiceData, daily] = await Promise.all([practiceService.getPractices(), practiceService.getDailyTasks()]);
      setPractices(practiceData);
      setDailyTasks(daily.tasks.slice(0, 10));
      setResetAt(daily.resetAt);
      setError(null);
    } catch (e) {
      console.log("Failed to load practices", e);
      setError("Could not load practice list.");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void loadPractices(); }, [loadPractices]));

  const typeCards = useMemo(() => HUB_TYPES.map((typeKey) => practices.filter((item) => item.type === typeKey).sort((a, b) => a.title.localeCompare(b.title))[0] ?? null).filter(Boolean) as PracticeSummary[], [practices]);
  const resetLabel = useMemo(() => {
    const ms = new Date(resetAt).getTime() - Date.now();
    const h = Math.max(0, Math.floor(ms / 3600000));
    return `Resets in ${h}h`;
  }, [resetAt]);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#4F46E5" /></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text></View></SafeAreaView>;

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} />}>
    <View style={styles.hero}><View><Text style={styles.heroTitle}>Practice</Text><Text style={styles.heroSubtitle}>Daily challenges & game modes</Text></View><View style={styles.heroRight}><View style={styles.chip}><Ionicons name="flame" size={14} color="#F97316" /><Text style={styles.chipText}>+XP</Text></View></View></View>
    <View><View style={styles.dailyHeader}><Text style={styles.sectionTitle}>Daily Tasks</Text><Text style={styles.reset}>{resetLabel}</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dailyRow}>{dailyTasks.map((task) => <View key={task.id} style={[styles.dailyCard, task.completed && styles.dailyDone]}><Text style={styles.dailyText}>{task.title}</Text><Text style={styles.dailySub}>{task.progress}/{task.target} • +{task.xpReward} XP</Text></View>)}</ScrollView></View>
    <View style={styles.grid}>{typeCards.map((practice) => { const meta = TYPE_META[practice.type ?? ""]; if (!meta) return null; return <Pressable key={practice.id} style={styles.gameCard} onPress={() => router.push(`/practice/${encodeURIComponent(practice.id)}/roadmap` as any)}><View style={[styles.iconWrap, { backgroundColor: `${meta.accent}22` }]}><Ionicons name={meta.icon} size={20} color={meta.accent} /></View><Text style={styles.cardTitle}>{meta.title}</Text><Text style={styles.cardSub}>{meta.subtitle}</Text><Text style={styles.cardMeta}>{practice.tasksCount} stages • {practice.xpReward ?? 0} XP</Text></Pressable>; })}</View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: "#0F172A" }, content: { padding: 14, gap: 14, paddingBottom: 30 }, center: { flex: 1, justifyContent: "center", alignItems: "center" }, centerText: { color: "#E2E8F0" }, hero: { borderRadius: 20, padding: 14, backgroundColor: "#1E293B", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, heroTitle: { color: "#fff", fontSize: 26, fontWeight: "900" }, heroSubtitle: { color: "#BFDBFE", fontWeight: "700" }, heroRight: { alignItems: "flex-end" }, chip: { flexDirection: "row", gap: 4, backgroundColor: "#FFF7ED", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, chipText: { fontWeight: "900", color: "#C2410C" }, sectionTitle: { color: "#E2E8F0", fontWeight: "900", fontSize: 15 }, dailyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, reset: { color: "#94A3B8", fontWeight: "700", fontSize: 12 }, dailyRow: { gap: 8 }, dailyCard: { backgroundColor: "#1E293B", borderRadius: 12, padding: 10, minWidth: 170, borderWidth: 1, borderColor: "#334155" }, dailyDone: { borderColor: "#22C55E" }, dailyText: { color: "#F8FAFC", fontWeight: "700", fontSize: 12 }, dailySub: { color: "#94A3B8", fontSize: 11, marginTop: 3 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, gameCard: { width: "48%", backgroundColor: "#F8FAFC", borderRadius: 16, padding: 12, gap: 5 }, iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" }, cardTitle: { color: "#0F172A", fontWeight: "900" }, cardSub: { color: "#475569", fontSize: 12 }, cardMeta: { color: "#334155", fontSize: 11, fontWeight: "700", marginTop: 4 } });
