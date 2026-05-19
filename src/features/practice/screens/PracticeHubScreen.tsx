import { PracticeSummary } from "@/src/features/practice/practice.types";
import { practiceService } from "@/src/features/practice/practice.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRACTICE_TYPE_UI: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  missing_letter: { icon: "create-outline", color: "#7C3AED", bg: "#F3E8FF", label: "Missing letter" },
  letter_match: { icon: "grid-outline", color: "#2563EB", bg: "#DBEAFE", label: "Letter match" },
  word_builder: { icon: "cube-outline", color: "#0891B2", bg: "#CFFAFE", label: "Word builder" },
  meaning_match: { icon: "layers-outline", color: "#16A34A", bg: "#DCFCE7", label: "Meaning match" },
  daily_challenge: { icon: "flash-outline", color: "#EA580C", bg: "#FFEDD5", label: "Daily challenge" },
};

const LEVEL_ORDER = ["B1", "M1", "M2"];

function getTypeUi(type?: string) {
  if (!type) return { icon: "game-controller-outline" as const, color: "#4F46E5", bg: "#E0E7FF", label: "Practice" };
  return PRACTICE_TYPE_UI[type] ?? { icon: "game-controller-outline" as const, color: "#4F46E5", bg: "#E0E7FF", label: type.replace(/_/g, " ") };
}

export default function PracticeHubScreen() {
  const router = useRouter();
  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPractices = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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

  useFocusEffect(
    useCallback(() => {
      void loadPractices();
    }, [loadPractices]),
  );

  const groupedPractices = useMemo(() => {
    const groups = new Map<string, PracticeSummary[]>();
    for (const levelId of LEVEL_ORDER) groups.set(levelId, []);

    for (const practice of practices) {
      const normalizedLevel = (practice.levelId ?? "").toUpperCase();
      const key = groups.has(normalizedLevel) ? normalizedLevel : "Other";
      const current = groups.get(key) ?? [];
      current.push(practice);
      groups.set(key, current);
    }

    const sortedGroupEntries = Array.from(groups.entries())
      .map(([levelId, items]) => [levelId, [...items].sort((a, b) => a.title.localeCompare(b.title))] as const)
      .filter(([, items]) => items.length > 0)
      .sort(([a], [b]) => {
        const idxA = LEVEL_ORDER.indexOf(a);
        const idxB = LEVEL_ORDER.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });

    return sortedGroupEntries;
  }, [practices]);

  const onPressCard = useCallback(
    (practiceId: string) => {
      router.push(`/practice/${encodeURIComponent(practiceId)}` as any);
    },
    [router],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.centerText}>Loading practices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={26} color="#DC2626" />
          <Text style={styles.centerTitle}>Something went wrong</Text>
          <Text style={styles.centerText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadPractices()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (practices.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="file-tray-outline" size={26} color="#6B7280" />
          <Text style={styles.centerTitle}>No practices yet</Text>
          <Text style={styles.centerText}>Practice content will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} />}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="game-controller-outline" size={20} color="#4338CA" />
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>Practice</Text>
            <Text style={styles.heroSubtitle}>Quick games to review and earn XP</Text>
          </View>
        </View>

        {groupedPractices.map(([levelId, items]) => (
          <View key={levelId} style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionBadge}>{levelId}</Text>
              <Text style={styles.sectionCount}>{items.length}</Text>
            </View>

            <View style={styles.cardsWrap}>
              {items.map((item) => {
                const typeUi = getTypeUi(item.type ?? undefined);
                return (
                  <Pressable key={item.id} style={styles.card} onPress={() => onPressCard(item.id)}>
                    <View style={[styles.iconWrap, { backgroundColor: typeUi.bg }]}>
                      <Ionicons name={typeUi.icon} size={18} color={typeUi.color} />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.xpBadge}>
                          <Ionicons name="star" size={11} color="#C2410C" />
                          <Text style={styles.xpBadgeText}>{item.xpReward ?? 0}</Text>
                        </View>
                      </View>
                      <View style={styles.metaRow}>
                        <Text style={[styles.typeBadge, { color: typeUi.color, backgroundColor: typeUi.bg }]} numberOfLines={1}>{typeUi.label}</Text>
                        <Text style={styles.capText}>Daily cap {item.maxDailyXp ?? 0}</Text>
                      </View>
                      <Text style={styles.cardHint} numberOfLines={1}>{item.subtitle ?? item.description ?? "Tap to start"}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24, gap: 12 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  retryButton: { marginTop: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#4F46E5" },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700" },

  heroCard: { borderRadius: 16, backgroundColor: "#EEF2FF", padding: 12, flexDirection: "row", gap: 10, alignItems: "center" },
  heroIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#E0E7FF", alignItems: "center", justifyContent: "center" },
  heroBody: { flex: 1 },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  heroSubtitle: { marginTop: 2, fontSize: 13, color: "#4B5563", fontWeight: "600" },

  sectionWrap: { gap: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionBadge: { fontSize: 12, fontWeight: "800", color: "#1E1B4B", backgroundColor: "#E0E7FF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  sectionCount: { fontSize: 12, fontWeight: "700", color: "#4B5563" },
  cardsWrap: { gap: 8 },

  card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10, flexDirection: "row", gap: 10, alignItems: "flex-start", shadowColor: "#111827", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  iconWrap: { height: 34, width: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, gap: 6 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: "800", color: "#111827" },
  xpBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF7ED", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  xpBadgeText: { fontSize: 11, fontWeight: "800", color: "#9A3412" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: { fontSize: 10, fontWeight: "700", borderRadius: 999, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 3, textTransform: "capitalize" },
  capText: { marginLeft: "auto", fontSize: 10, fontWeight: "700", color: "#6B7280" },
  cardHint: { fontSize: 11, color: "#6B7280", fontWeight: "500" },
});
