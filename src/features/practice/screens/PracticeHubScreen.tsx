import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
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

const LEVEL_ORDER = ["B1", "M1", "M2"];

const LEVEL_THEME: Record<string, { badge: string; badgeText: string }> = {
  B1: { badge: "#EEEDFE", badgeText: "#534AB7" },
  M1: { badge: "#E1F5EE", badgeText: "#0F6E56" },
  M2: { badge: "#FAEEDA", badgeText: "#854F0B" },
};

const TYPE_UI: Record<
  string,
  {
    label: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    border: string;
    iconBg: string;
  }
> = {
  missing_letter: {
    label: "Missing Letter",
    subtitle: "Fill the gap",
    icon: "create-outline",
    border: "#8B5CF6",
    iconBg: "#F3E8FF",
  },
  letter_match: {
    label: "Letter Match",
    subtitle: "Find pairs",
    icon: "git-compare-outline",
    border: "#F43F5E",
    iconBg: "#FFE4E6",
  },
  word_builder: {
    label: "Word Builder",
    subtitle: "Build words",
    icon: "cube-outline",
    border: "#F59E0B",
    iconBg: "#FEF3C7",
  },
  meaning_match: {
    label: "Meaning Match",
    subtitle: "Match meaning",
    icon: "layers-outline",
    border: "#22C55E",
    iconBg: "#DCFCE7",
  },
  daily_challenge: {
    label: "Daily Challenge",
    subtitle: "Daily boost",
    icon: "flash-outline",
    border: "#3B82F6",
    iconBg: "#DBEAFE",
  },
};

// Mock daily tasks — replace with real API data when backend is ready
const MOCK_DAILY_TASKS = [
  {
    id: "dt-1",
    title: "5 үг давтах",
    subtitle: "Missing Letter",
    icon: "create-outline" as keyof typeof Ionicons.glyphMap,
    accent: "#8B5CF6",
    iconBg: "#F3E8FF",
    done: true,
  },
  {
    id: "dt-2",
    title: "10 хос олох",
    subtitle: "Letter Match",
    icon: "git-compare-outline" as keyof typeof Ionicons.glyphMap,
    accent: "#F43F5E",
    iconBg: "#FFE4E6",
    done: false,
  },
  {
    id: "dt-3",
    title: "3 үг бүтээх",
    subtitle: "Word Builder",
    icon: "cube-outline" as keyof typeof Ionicons.glyphMap,
    accent: "#F59E0B",
    iconBg: "#FEF3C7",
    done: false,
  },
];

type LevelGroup = {
  levelId: string;
  items: PracticeSummary[];
};

function DailyTasksSection() {
  const completedCount = MOCK_DAILY_TASKS.filter((t) => t.done).length;
  const total = MOCK_DAILY_TASKS.length;
  const progress = completedCount / total;

  return (
    <View style={daily.container}>
      <View style={daily.header}>
        <View style={daily.headerLeft}>
          <Text style={daily.title}>Өдрийн даалгавар</Text>
          <Text style={daily.subtitle}>
            {completedCount}/{total} дууссан
          </Text>
        </View>
        <View style={daily.progressCircleWrap}>
          <Text style={daily.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>

      <View style={daily.progressBarTrack}>
        <View style={[daily.progressBarFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <View style={daily.taskList}>
        {MOCK_DAILY_TASKS.map((task) => (
          <View key={task.id} style={daily.taskRow}>
            <View style={[daily.taskIconBubble, { backgroundColor: task.iconBg }]}>
              <Ionicons name={task.icon} size={18} color={task.accent} />
            </View>
            <View style={daily.taskMeta}>
              <Text style={daily.taskTitle}>{task.title}</Text>
              <Text style={daily.taskSubtitle}>{task.subtitle}</Text>
            </View>
            <View
              style={[
                daily.checkCircle,
                task.done && { backgroundColor: "#22C55E", borderColor: "#22C55E" },
              ]}
            >
              {task.done && (
                <Ionicons name="checkmark" size={13} color="#fff" />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

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

  useFocusEffect(
    useCallback(() => {
      void loadPractices();
    }, [loadPractices])
  );

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

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#534AB7" />
          <Text style={styles.centerText}>Loading practice...</Text>
        </View>
      </SafeAreaView>
    );

  if (error)
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadPractices(true)}
          />
        }
      >
        {/* Screen header */}
        <View style={styles.headerWrap}>
          <Text style={styles.screenTitle}>Practice</Text>
          <Text style={styles.screenSubtitle}>
            Choose by level and start from roadmap.
          </Text>
        </View>

        {/* Daily tasks mock card */}
        <DailyTasksSection />

        {/* Level groups */}
        {groupedLevels.map((group) => {
          const theme = LEVEL_THEME[group.levelId] ?? {
            badge: "#E2E8F0",
            badgeText: "#334155",
          };
          return (
            <View key={group.levelId} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{group.levelId}</Text>
                <View
                  style={[styles.countChip, { backgroundColor: theme.badge }]}
                >
                  <Text style={[styles.countChipText, { color: theme.badgeText }]}>
                    {group.items.length}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rowContent}
              >
                {group.items.map((item) => {
                  const ui = TYPE_UI[item.type ?? ""] ?? {
                    label: item.title,
                    subtitle: "Practice",
                    icon: "game-controller-outline" as const,
                    border: "#6366F1",
                    iconBg: "#E0E7FF",
                  };
                  return (
                    <Pressable
                      key={item.id}
                      style={styles.cardWrap}
                      onPress={() =>
                        router.push(
                          `/practice/${encodeURIComponent(item.id)}/roadmap` as any
                        )
                      }
                    >
                      <View
                        style={[styles.squareCard, { borderColor: ui.border }]}
                      >
                        <View
                          style={[
                            styles.iconBubble,
                            { backgroundColor: ui.iconBg },
                          ]}
                        >
                          <Ionicons
                            name={ui.icon}
                            size={28}
                            color={ui.border}
                          />
                        </View>
                      </View>
                      <Text numberOfLines={2} style={styles.cardTitle}>
                        {ui.label}
                      </Text>
                      <Text numberOfLines={1} style={styles.cardSubtitle}>
                        {ui.subtitle}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Daily Tasks styles ───────────────────────────────────────────────────────
const daily = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { gap: 2 },
  title: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  subtitle: { fontSize: 12, color: "#64748B" },
  progressCircleWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEEDFE",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: { fontSize: 12, fontWeight: "700", color: "#534AB7" },
  progressBarTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#534AB7",
  },
  taskList: { gap: 10 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taskIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  taskMeta: { flex: 1, gap: 1 },
  taskTitle: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  taskSubtitle: { fontSize: 11, color: "#94A3B8" },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  headerWrap: { gap: 4 },
  screenTitle: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  screenSubtitle: { fontSize: 13, color: "#64748B" },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  countChip: {
    minWidth: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
  },
  countChipText: { fontSize: 12, fontWeight: "700" },

  rowContent: { gap: 12, paddingRight: 8 },
  cardWrap: { width: 116 },
  squareCard: {
    width: 116,
    height: 116,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 16,
  },
  cardSubtitle: { marginTop: 2, fontSize: 11, color: "#64748B" },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  centerText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  retryButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#534AB7",
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700" },
});