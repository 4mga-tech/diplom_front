import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HUB_TYPES = ["dialogue_fill", "image_choice", "sentence_order"] as const;

const TYPE_META: Record<string, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; xpHint: string }> = {
  dialogue_fill: { title: "Dialogue Fill", subtitle: "Choose the right reply", icon: "chatbubbles-outline", xpHint: "+12 XP" },
  image_choice: { title: "Image Choice", subtitle: "Visual word matching", icon: "image-outline", xpHint: "+10 XP" },
  sentence_order: { title: "Sentence Order", subtitle: "Build clean sentences", icon: "reorder-three-outline", xpHint: "+14 XP" },
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

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#93C5FD" /><Text style={styles.centerText}>Loading...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} />}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}><Ionicons name="game-controller" size={18} color="#C4B5FD" /></View>
          <Text style={styles.title}>Practice</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>🔥 5</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>⚡ 120</Text></View>
        </View>

        <View style={styles.dailyRow}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <View key={idx} style={styles.dailyCard}>
              <Text style={styles.dailyTop}>Task {idx + 1}</Text>
              <Text style={styles.dailyMid}>{idx * 3}/10</Text>
              <Text style={styles.dailyBottom}>+{12 + idx * 3} XP • 23h</Text>
            </View>
          ))}
        </View>

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
                <LinearGradient colors={["#16233A", "#0D172B"]} style={styles.gradient}>
                  <Ionicons name={meta.icon} size={18} color="#93C5FD" />
                  <Text style={styles.gameTitle}>{meta.title}</Text>
                  <Text style={styles.gameSubtitle}>{meta.subtitle}</Text>
                  <View style={styles.cardFoot}><Text style={styles.footText}>{practice.stageCount} stages</Text><Text style={styles.footText}>{meta.xpHint}</Text></View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#071120" },
  glowOne: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(59,130,246,0.2)", top: -50, right: -40 },
  glowTwo: { position: "absolute", width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(139,92,246,0.16)", bottom: 20, left: -80 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerText: { color: "#CBD5E1" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#111D34", alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: "#E2E8F0", fontSize: 26, fontWeight: "900" },
  badge: { backgroundColor: "#13233F", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { color: "#BFDBFE", fontWeight: "800", fontSize: 11 },
  dailyRow: { flexDirection: "row", gap: 8 },
  dailyCard: { flex: 1, backgroundColor: "#0D1A2D", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "#1E2D46" },
  dailyTop: { color: "#94A3B8", fontSize: 11, fontWeight: "700" },
  dailyMid: { color: "#F8FAFC", fontSize: 18, fontWeight: "900", marginVertical: 4 },
  dailyBottom: { color: "#67E8F9", fontSize: 11, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gameCard: { width: "48%", borderRadius: 18, overflow: "hidden" },
  gradient: { borderRadius: 18, minHeight: 150, padding: 12, gap: 6, borderWidth: 1, borderColor: "#223352" },
  gameTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "900" },
  gameSubtitle: { color: "#94A3B8", fontSize: 11, fontWeight: "700" },
  cardFoot: { marginTop: "auto", flexDirection: "row", justifyContent: "space-between" },
  footText: { color: "#BAE6FD", fontSize: 10, fontWeight: "800" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
});
