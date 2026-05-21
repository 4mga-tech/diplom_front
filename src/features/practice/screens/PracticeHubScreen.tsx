import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HUB_TYPES = ["missing_word", "sentence_order", "dialogue_fill", "image_choice"] as const;

const TYPE_META: Record<string, { title: string; icon: keyof typeof Ionicons.glyphMap; colors: [string, string] }> = {
  missing_word: { title: "Үг нөхөх", icon: "create-outline", colors: ["#8B5CF6", "#6D28D9"] },
  sentence_order: { title: "Зөв дараалалд оруулах", icon: "swap-vertical-outline", colors: ["#06B6D4", "#2563EB"] },
  dialogue_fill: { title: "Харилцан яриа нөхөх", icon: "chatbubbles-outline", colors: ["#F97316", "#EA580C"] },
  image_choice: { title: "Зураг хараад сонгох", icon: "image-outline", colors: ["#22C55E", "#16A34A"] },
};

const MOCK_DAILY_TASKS = [
  { id: "d1", title: "2 stage", done: true },
  { id: "d2", title: "+120 XP", done: false },
  { id: "d3", title: "1 шинэ төрөл", done: false },
];

export default function PracticeHubScreen() {
  const router = useRouter();
  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPractices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
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

  const typeCards = useMemo(() => {
    const mapped = HUB_TYPES.map((typeKey) => {
      const list = practices
        .filter((item) => item.type === typeKey)
        .sort((a, b) => a.title.localeCompare(b.title));
      return list[0] ?? null;
    }).filter(Boolean) as PracticeSummary[];

    return mapped;
  }, [practices]);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#4F46E5" /><Text style={styles.centerText}>Loading...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text><Pressable style={styles.retry} onPress={() => void loadPractices()}><Text style={styles.retryText}>Retry</Text></Pressable></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgTop} />
      <View style={styles.bgMid} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} />}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Practice Hub</Text>
          <Text style={styles.heroSubtitle}>4 game modes • Pick and play</Text>
        </View>

        <View style={styles.dailyWrap}>
          <Text style={styles.dailyTitle}>Өдрийн даалгавар</Text>
          <View style={styles.dailyRow}>
            {MOCK_DAILY_TASKS.map((task) => (
              <View key={task.id} style={styles.dailyItem}>
                <Ionicons name={task.done ? "checkmark-circle" : "ellipse-outline"} size={14} color={task.done ? "#16A34A" : "#64748B"} />
                <Text style={styles.dailyItemText}>{task.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardsWrap}>
          {typeCards.map((practice) => {
            const meta = TYPE_META[practice.type ?? ""];
            if (!meta) return null;
            return (
              <Pressable
                key={practice.id}
                style={({ pressed }) => [styles.card, { backgroundColor: meta.colors[0], borderColor: meta.colors[1] }, pressed && styles.cardPressed]}
                onPress={() => router.push(`/practice/${encodeURIComponent(practice.id)}/roadmap` as any)}
              >
                <View style={styles.cardIcon}><Ionicons name={meta.icon} size={28} color="#fff" /></View>
                <Text style={styles.cardTitle}>{meta.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EEF4FF" },
  bgTop: { position: "absolute", top: -100, right: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: "#C7D2FE" },
  bgMid: { position: "absolute", bottom: 180, left: -100, width: 260, height: 260, borderRadius: 130, backgroundColor: "#BFDBFE" },
  content: { padding: 14, paddingBottom: 26, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  centerText: { color: "#334155" },
  retry: { backgroundColor: "#312E81", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  retryText: { color: "#fff", fontWeight: "800" },

  hero: { borderRadius: 18, backgroundColor: "#1E1B4B", padding: 14 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  heroSubtitle: { marginTop: 2, color: "#C7D2FE", fontSize: 12, fontWeight: "700" },

  dailyWrap: { borderRadius: 14, backgroundColor: "rgba(255,255,255,0.85)", padding: 10, borderWidth: 1, borderColor: "#DBEAFE", gap: 8 },
  dailyTitle: { fontSize: 13, fontWeight: "800", color: "#1E293B" },
  dailyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dailyItem: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F8FAFC", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  dailyItemText: { fontSize: 11, fontWeight: "700", color: "#334155" },

  cardsWrap: { gap: 10 },
  card: { borderRadius: 18, borderWidth: 2, padding: 14, minHeight: 94, flexDirection: "row", alignItems: "center", gap: 12 },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  cardIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cardTitle: { flex: 1, color: "#fff", fontSize: 19, fontWeight: "900" },
});
