import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LEVELS, UNITS } from "@/src/data/curriculum";
import { useNotifications } from "@/src/store/notificationStore";
import CourseCard from "@/src/ui/CourseCard";
import { theme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <LinearGradient
      colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
      style={styles.statCard}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
}

export default function CoursesScreen() {
  const router = useRouter();
  const { notifications, addNotification } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    return {
      completed: "65",
      streak: "7",
      xp: "420",
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const fake = {
        id: Date.now().toString(),
        message: "New lesson unlocked ",
        type: "lesson",
        createdAt: Date.now(),
        read: false,
      };
      addNotification(fake);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Monlanguage</Text>

        <Pressable
          onPress={() => router.push("/notification")}
          style={styles.notifBtn}
        >
          <Ionicons name="notifications-outline" size={22} color="white" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* STATS ROW */}
      <View style={styles.statsRow}>
        <StatCard value={stats.completed} label="Completed" />
        <StatCard value={stats.streak} label="Daily Streak" />
        <StatCard value={stats.xp} label="XP" />
      </View>

      {/* COURSE LIST */}
      <FlatList
        data={LEVELS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
        renderItem={({ item }) => (
          <CourseCard
            title={item.title}
            description={item.description}
            progress={0}
            totalLessons={item.vocabularyCount}
            completedLessons={0}
            gradient={item.gradient}
            onPress={() => {
              const firstUnit = UNITS.find((u) => u.levelId === item.id);
              if (!firstUnit) {
                alert("No units available for this level.");
                return;
              }

              router.push({
                pathname: "/units/[levelId]/[unitId]",
                params: { levelId: item.id, unitId: firstUnit.id },
              });
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: theme.s(2) }} />}
        ListHeaderComponent={
          <LinearGradient
            colors={["rgba(124,92,255,0.22)", "rgba(37,99,235,0.12)"]}
            style={styles.reviewCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewTitle}>Today's Review</Text>
              <Text style={styles.reviewDesc}>5 words · 3 minutes</Text>
            </View>
            <Pressable
              onPress={() => router.push("/review")}
              style={styles.reviewBtn}
            >
              <Text style={styles.reviewBtnText}>Start</Text>
            </Pressable>
          </LinearGradient>
        }
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
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.s(3),
  },
  notifBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
  },

  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },

  statsRow: {
    flexDirection: "row",
    gap: theme.s(1.5),
    marginBottom: theme.s(2.5),
  },
  statCard: {
    flex: 1,
    borderRadius: theme.r.xl,
    paddingVertical: theme.s(2),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },

  list: {
    paddingBottom: theme.s(5),
  },

  reviewCard: {
    borderRadius: theme.r.xl,
    padding: theme.s(2.5),
    marginBottom: theme.s(2),
    borderWidth: 1,
    borderColor: "rgba(124,92,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(2),
  },
  reviewTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  reviewDesc: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  reviewBtn: {
    paddingHorizontal: theme.s(2),
    paddingVertical: theme.s(1.25),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  reviewBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 12,
  },
});
