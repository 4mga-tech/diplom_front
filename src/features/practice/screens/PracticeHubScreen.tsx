import { PracticeSummary } from "@/src/features/practice/practice.types";
import { practiceService } from "@/src/features/practice/practice.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LEVEL_ORDER = ["B1", "M1", "M2"];

const TYPE_UI: Record<string, { label: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; border: string; iconBg: string }> = {
  missing_letter: { label: "Missing Letter", subtitle: "Fill the gap", icon: "create-outline", border: "#8B5CF6", iconBg: "#F3E8FF" },
  letter_match: { label: "Letter Match", subtitle: "Find pairs", icon: "git-compare-outline", border: "#F43F5E", iconBg: "#FFE4E6" },
  word_builder: { label: "Word Builder", subtitle: "Build words", icon: "cube-outline", border: "#F59E0B", iconBg: "#FEF3C7" },
  meaning_match: { label: "Meaning Match", subtitle: "Match meaning", icon: "layers-outline", border: "#22C55E", iconBg: "#DCFCE7" },
  daily_challenge: { label: "Daily Challenge", subtitle: "Daily boost", icon: "flash-outline", border: "#3B82F6", iconBg: "#DBEAFE" },
};

type LevelGroup = {
  levelId: string;
  items: PracticeSummary[];
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
      .map(([levelId, items]) => ({ levelId, items }));
  }, [practices]);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><ActivityIndicator size="small" color="#4F46E5" /><Text style={styles.centerText}>Loading practice...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.centerContainer}><Ionicons name="alert-circle-outline" size={26} color="#DC2626" /><Text style={styles.centerTitle}>Something went wrong</Text><Text style={styles.centerText}>{error}</Text><Pressable style={styles.retryButton} onPress={() => void loadPractices()}><Text style={styles.retryButtonText}>Retry</Text></Pressable></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} />}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.screenTitle}>Practice</Text>
          <Text style={styles.screenSubtitle}>Choose by level and start from roadmap.</Text>
        </View>

        {groupedLevels.map((group) => (
          <View key={group.levelId} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{group.levelId}</Text>
              <View style={styles.countChip}><Text style={styles.countChipText}>{group.items.length}</Text></View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
              {group.items.map((item) => {
                const ui = TYPE_UI[item.type ?? ""] ?? { label: item.title, subtitle: "Practice", icon: "game-controller-outline" as const, border: "#6366F1", iconBg: "#E0E7FF" };
                return (
                  <Pressable key={item.id} style={styles.cardWrap} onPress={() => router.push(`/practice/${encodeURIComponent(item.id)}/roadmap` as any)}>
                    <View style={[styles.squareCard, { borderColor: ui.border }]}>
                      <View style={[styles.iconBubble, { backgroundColor: ui.iconBg }]}>
                        <Ionicons name={ui.icon} size={26} color={ui.border} />
                      </View>
                    </View>
                    <Text numberOfLines={1} style={styles.cardTitle}>{ui.label}</Text>
                    <Text numberOfLines={1} style={styles.cardSubtitle}>{ui.subtitle}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, gap: 16 },
  headerWrap: { gap: 4 },
  screenTitle: { fontSize: 27, fontWeight: "800", color: "#0F172A" },
  screenSubtitle: { fontSize: 13, color: "#64748B" },
  section: { gap: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  countChip: { minWidth: 30, borderRadius: 999, backgroundColor: "#E2E8F0", paddingHorizontal: 10, paddingVertical: 4, alignItems: "center" },
  countChipText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  rowContent: { gap: 12, paddingRight: 8 },
  cardWrap: { width: 112 },
  squareCard: { width: 112, height: 112, borderRadius: 16, borderWidth: 2, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  iconBubble: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardTitle: { marginTop: 8, fontSize: 13, fontWeight: "700", color: "#1E293B" },
  cardSubtitle: { marginTop: 2, fontSize: 11, color: "#64748B" },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  retryButton: { marginTop: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#4F46E5" },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700" },
});
