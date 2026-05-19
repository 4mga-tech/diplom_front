import { PracticeSummary } from "@/src/features/practice/practice.types";
import { practiceService } from "@/src/features/practice/practice.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LEVEL_ORDER = ["B1", "M1", "M2"];

const LEVEL_THEME: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string; accent: string; chip: string }> = {
  B1: { icon: "planet-outline", bg: "#4F46E5", accent: "#C7D2FE", chip: "rgba(255,255,255,0.22)" },
  M1: { icon: "rocket-outline", bg: "#0F766E", accent: "#99F6E4", chip: "rgba(255,255,255,0.18)" },
  M2: { icon: "trophy-outline", bg: "#9A3412", accent: "#FED7AA", chip: "rgba(255,255,255,0.2)" },
};

type LevelGroup = {
  levelId: string;
  items: PracticeSummary[];
  totalDailyXp: number;
};

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
    } catch (loadError) {
      console.log("Failed to load practices", loadError);
      setError("Could not load practice list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadPractices(); }, [loadPractices]));

  const groupedLevels = useMemo<LevelGroup[]>(() => {
    const groups = new Map<string, PracticeSummary[]>();
    for (const level of LEVEL_ORDER) groups.set(level, []);

    for (const item of practices) {
      const key = (item.levelId ?? "").toUpperCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(item);
    }

    return Array.from(groups.entries())
      .filter(([, items]) => items.length > 0)
      .sort(([a], [b]) => {
        const idxA = LEVEL_ORDER.indexOf(a);
        const idxB = LEVEL_ORDER.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      })
      .map(([levelId, items]) => ({
        levelId,
        items,
        totalDailyXp: items.reduce((sum, current) => sum + (current.maxDailyXp ?? 0), 0),
      }));
  }, [practices]);

  const onPressLevel = useCallback((levelId: string) => {
    router.push(`/practice/${encodeURIComponent(levelId.toLowerCase())}` as any);
  }, [router]);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><ActivityIndicator size="small" color="#4F46E5" /><Text style={styles.centerText}>Loading practice...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><Ionicons name="alert-circle-outline" size={26} color="#DC2626" /><Text style={styles.centerTitle}>Something went wrong</Text><Text style={styles.centerText}>{error}</Text><Pressable style={styles.retryButton} onPress={() => void loadPractices()}><Text style={styles.retryButtonText}>Retry</Text></Pressable></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} />}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroOrbOne} />
          <View style={styles.heroOrbTwo} />
          <View style={styles.heroIconWrap}><Ionicons name="game-controller" size={32} color="#FFFFFF" /></View>
          <Text style={styles.heroTitle}>Practice Zone</Text>
          <Text style={styles.heroSubtitle}>Pick a world, clear quick challenges, and farm daily XP.</Text>
        </View>

        <View style={styles.grid}>
          {groupedLevels.map((group) => {
            const theme = LEVEL_THEME[group.levelId] ?? { icon: "sparkles-outline" as const, bg: "#4338CA", accent: "#C7D2FE", chip: "rgba(255,255,255,0.2)" };
            return (
              <Pressable key={group.levelId} style={[styles.levelCard, { backgroundColor: theme.bg }]} onPress={() => onPressLevel(group.levelId)}>
                <View style={styles.levelTop}>
                  <Text style={styles.levelName}>{group.levelId}</Text>
                  <View style={[styles.levelIconWrap, { backgroundColor: theme.chip }]}><Ionicons name={theme.icon} size={19} color="#FFFFFF" /></View>
                </View>
                <Text style={styles.levelWorld}>World {group.levelId}</Text>
                <View style={styles.metaChipRow}>
                  <View style={[styles.metaChip, { backgroundColor: theme.chip }]}><Text style={styles.metaText}>{group.items.length} acts</Text></View>
                  <View style={[styles.metaChip, { backgroundColor: theme.chip }]}><Ionicons name="flash" size={12} color={theme.accent} /><Text style={styles.metaText}>{group.totalDailyXp}</Text></View>
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
  safeArea: { flex: 1, backgroundColor: "#EEF2FF" },
  scrollContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 24, gap: 14 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  retryButton: { marginTop: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#4F46E5" },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  heroCard: { position: "relative", overflow: "hidden", borderRadius: 28, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, padding: 18, backgroundColor: "#312E81", minHeight: 170 },
  heroOrbOne: { position: "absolute", width: 160, height: 160, borderRadius: 999, backgroundColor: "rgba(129,140,248,0.35)", right: -30, top: -40 },
  heroOrbTwo: { position: "absolute", width: 120, height: 120, borderRadius: 999, backgroundColor: "rgba(34,211,238,0.22)", left: -20, bottom: -45 },
  heroIconWrap: { width: 58, height: 58, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroTitle: { marginTop: 12, fontSize: 31, fontWeight: "900", color: "#FFFFFF" },
  heroSubtitle: { marginTop: 6, maxWidth: "86%", fontSize: 14, color: "#E0E7FF", fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  levelCard: { width: "48.5%", borderRadius: 18, padding: 12, gap: 8, shadowColor: "#0F172A", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  levelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelName: { fontSize: 14, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.6 },
  levelIconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  levelWorld: { fontSize: 18, color: "#FFFFFF", fontWeight: "900" },
  metaChipRow: { marginTop: 6, gap: 6 },
  metaChip: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  metaText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
});
