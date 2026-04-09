import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../ui/theme";

type Achievement = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: [string, string];
  unlocked: boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    icon: "trophy",
    title: "First Step",
    description: "Completed your first lesson",
    gradient: ["#CA8A04", "#EA580C"],
    unlocked: true,
  },
  {
    id: "streak-7",
    icon: "star",
    title: "7-Day Streak",
    description: "Studied for 7 consecutive days",
    gradient: ["#7C3AED", "#EC4899"],
    unlocked: true,
  },
  {
    id: "word-50",
    icon: "flash",
    title: "Word Collector",
    description: "Learned 50 words",
    gradient: ["#2563EB", "#06B6D4"],
    unlocked: true,
  },
  {
    id: "goal-5",
    icon: "locate",
    title: "Goal Achiever",
    description: "Completed your daily goal 5 times",
    gradient: ["#16A34A", "#14B8A6"],
    unlocked: false,
  },
  {
    id: "master",
    icon: "medal",
    title: "Master",
    description: "Completed all courses",
    gradient: ["#4F46E5", "#7C3AED"],
    unlocked: false,
  },
  {
    id: "perfect",
    icon: "ribbon",
    title: "Perfect Student",
    description: "Scored 100% in 20 lessons",
    gradient: ["#DC2626", "#EC4899"],
    unlocked: false,
  },
];

function StatCard({ unlocked, total }: { unlocked: number; total: number }) {
  return (
    <LinearGradient
      colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
      style={styles.statCard}
    >
      <View style={styles.statIconWrap}>
        <LinearGradient colors={["#CA8A04", "#EA580C"]} style={styles.statIcon}>
          <Ionicons name="trophy" size={26} color="white" />
        </LinearGradient>
      </View>
      <Text style={styles.statValue}>
        {unlocked}/{total}
      </Text>
      <Text style={styles.statLabel}>Achievements Unlocked</Text>
    </LinearGradient>
  );
}

function AchievementTile({ item }: { item: Achievement }) {
  return (
    <View style={[styles.tileWrap, !item.unlocked && { opacity: 0.5 }]}>
      <LinearGradient
        colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
        style={[
          styles.tile,
          {
            borderColor: item.unlocked
              ? "rgba(100,116,139,0.75)"
              : "rgba(51,65,85,0.55)",
          },
        ]}
      >
        <View style={styles.tileIconRow}>
          <LinearGradient colors={item.gradient} style={styles.tileIcon}>
            <Ionicons name={item.icon} size={20} color="white" />
          </LinearGradient>
        </View>

        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={styles.tileDesc}>{item.description}</Text>

        {!item.unlocked && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockBubble}>
              <Ionicons
                name="lock-closed"
                size={16}
                color={theme.colors.muted}
              />
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

export default function AchievementsScreen() {
  const router = useRouter();
  const unlockedCount = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.unlocked).length,
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 44, height: 44 }} />
      </View>

      <StatCard unlocked={unlockedCount} total={ACHIEVEMENTS.length} />

      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={(i) => i.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.colWrap}
        renderItem={({ item }) => <AchievementTile item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.s(3),
    paddingTop: theme.s(6),
    paddingBottom: theme.s(2),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.s(3),
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,41,59,0.35)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "800" },

  statCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(3),
    alignItems: "center",
    marginBottom: theme.s(3),
  },
  statIconWrap: { marginBottom: theme.s(1.5) },
  statIcon: {
    padding: theme.s(2),
    borderRadius: theme.r.xl,
  },
  statValue: { color: "white", fontSize: 28, fontWeight: "900", marginTop: 2 },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },

  grid: { paddingBottom: theme.s(4) },
  colWrap: { gap: theme.s(2) },

  tileWrap: { flex: 1 },
  tile: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
    padding: theme.s(2.5),
    alignItems: "center",
    minHeight: 170,
    justifyContent: "center",
    position: "relative",
  },
  tileIconRow: { marginBottom: theme.s(1.5) },
  tileIcon: {
    padding: theme.s(1.5),
    borderRadius: theme.r.xl,
  },
  tileTitle: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  tileDesc: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },

  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBubble: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(51,65,85,0.75)",
    borderWidth: 1,
    borderColor: "rgba(71,85,105,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
});
