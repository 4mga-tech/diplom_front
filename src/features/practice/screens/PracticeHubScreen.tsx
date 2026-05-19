import { PracticeSummary } from "@/src/features/practice/practice.types";
import { practiceService } from "@/src/features/practice/practice.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LEVEL_ORDER = ["B1", "M1", "M2"];

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
          <View style={styles.heroIconWrap}><Ionicons name="flash-outline" size={28} color="#FFFFFF" /></View>
          <Text style={styles.heroTitle}>Practice</Text>
          <Text style={styles.heroSubtitle}>Play quick activities and earn XP</Text>
        </View>

        {groupedLevels.map((group, index) => (
          <Pressable key={group.levelId} style={[styles.levelCard, index % 2 === 1 ? styles.levelCardAlt : null]} onPress={() => onPressLevel(group.levelId)}>
            <View style={styles.levelTop}>
              <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>{group.levelId}</Text></View>
              <Ionicons name={index % 2 === 0 ? "sparkles-outline" : "flash-outline"} size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.levelTitle}>Level {group.levelId} Arena</Text>
            <Text style={styles.levelSubtitle}>Choose a challenge type and stack your streak.</Text>
            <View style={styles.levelMetaRow}>
              <View style={styles.metaPill}><Text style={styles.metaText}>{group.items.length} activities</Text></View>
              <View style={styles.metaPill}><Text style={styles.metaText}>{group.totalDailyXp} daily XP</Text></View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EEF2FF" },
  scrollContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24, gap: 12 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  retryButton: { marginTop: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#4F46E5" },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700" },

  heroCard: { borderRadius: 24, padding: 18, backgroundColor: "#4F46E5" },
  heroIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroTitle: { marginTop: 12, fontSize: 28, fontWeight: "900", color: "#FFFFFF" },
  heroSubtitle: { marginTop: 4, fontSize: 14, color: "#E0E7FF", fontWeight: "700" },

  levelCard: { borderRadius: 18, padding: 14, backgroundColor: "#6366F1", gap: 8 },
  levelCardAlt: { backgroundColor: "#7C3AED" },
  levelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  levelBadgeText: { fontSize: 12, fontWeight: "900", color: "#FFFFFF" },
  levelTitle: { fontSize: 18, fontWeight: "900", color: "#FFFFFF" },
  levelSubtitle: { fontSize: 13, color: "#EDE9FE", fontWeight: "600" },
  levelMetaRow: { marginTop: 4, flexDirection: "row", gap: 8 },
  metaPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(255,255,255,0.2)" },
  metaText: { fontSize: 12, color: "#FFFFFF", fontWeight: "700" },
});
