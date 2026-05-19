import { PracticeSummary } from "@/src/features/practice/practice.types";
import { practiceService } from "@/src/features/practice/practice.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
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

function getTypeUi(type?: string) {
  if (!type) return { icon: "sparkles-outline" as const, color: "#4F46E5", bg: "#E0E7FF", label: "Practice" };
  return PRACTICE_TYPE_UI[type] ?? { icon: "sparkles-outline" as const, color: "#4F46E5", bg: "#E0E7FF", label: type.replace(/_/g, " ") };
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

  const sortedPractices = useMemo(
    () => [...practices].sort((a, b) => (a.levelId ?? "").localeCompare(b.levelId ?? "") || a.title.localeCompare(b.title)),
    [practices],
  );

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
      <FlatList
        data={sortedPractices}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPractices(true)} />}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const typeUi = getTypeUi(item.type ?? undefined);
          return (
            <Pressable style={styles.card} onPress={() => onPressCard(item.id)}>
              <View style={styles.leadingRow}>
                <View style={[styles.iconWrap, { backgroundColor: typeUi.bg }]}> 
                  <Ionicons name={typeUi.icon} size={18} color={typeUi.color} />
                </View>
                <View style={styles.titleBlock}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  {item.subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text> : null}
                </View>
                <View style={styles.xpBadge}>
                  <Ionicons name="star" size={12} color="#C2410C" />
                  <Text style={styles.xpBadgeText}>{item.xpReward ?? 0}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.typeBadge, { color: typeUi.color, backgroundColor: typeUi.bg }]}>{typeUi.label}</Text>
                {item.levelId ? <Text style={styles.levelBadge}>Lv {item.levelId}</Text> : null}
                <Text style={styles.capText}>Cap {item.maxDailyXp ?? 0}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  listContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20, gap: 10 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  retryButton: { marginTop: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#4F46E5" },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 10,
  },
  leadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { height: 34, width: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  titleBlock: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 12, color: "#6B7280", fontWeight: "500" },
  xpBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF7ED", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  xpBadgeText: { fontSize: 12, fontWeight: "800", color: "#9A3412" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: { fontSize: 11, fontWeight: "700", borderRadius: 999, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4, textTransform: "capitalize" },
  levelBadge: { fontSize: 11, fontWeight: "700", color: "#1F2937", backgroundColor: "#EEF2FF", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  capText: { marginLeft: "auto", fontSize: 11, fontWeight: "700", color: "#6B7280" },
});
