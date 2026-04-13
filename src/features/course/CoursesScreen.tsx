import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";

function StatCard({ value, label }: { value: string; label: string }) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <LinearGradient colors={theme.colors.statGradient} style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
}

export default function CoursesScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
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

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("registered");
      await AsyncStorage.removeItem("onboardingDone");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      await AsyncStorage.setItem("fromLogout", "true");

      router.replace("/welcome");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          void logout();
        },
      },
    ]);
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
  }, [addNotification]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monlanguage</Text>

        <View style={styles.headerActions}>
          <Pressable onPress={confirmLogout} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={22} color="#da6868" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/notification")}
            style={styles.iconBtn}
          >
            <Ionicons name="notifications-outline" size={22} color="#8B5CF6" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard value={stats.completed} label="Completed" />
        <StatCard value={stats.streak} label="Daily Streak" />
        <StatCard value={stats.xp} label="XP" />
      </View>

      <FlatList
        data={LEVELS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.text}
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
              const hasUnits = UNITS.some((u) => u.levelId === item.id);
              if (!hasUnits) {
                alert("No units available for this level.");
                return;
              }

              router.push({
                pathname: "/units/[levelId]",
                params: { levelId: item.id },
              });
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: theme.s(2) }} />}
        ListHeaderComponent={
          <LinearGradient
            colors={[theme.colors.reviewSurface, "rgba(37,99,235,0.12)"]}
            style={styles.reviewCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewTitle}>{"Today's Review"}</Text>
              <Text style={styles.reviewDesc}>
                6 mixed questions - vocab, meaning, and routine phrases
              </Text>
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1),
    },
    iconBtn: {
      width: 50,
      height: 50,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.08)" : theme.colors.card,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.12)" : theme.colors.border,
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
      borderColor: theme.colors.border,
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
      borderColor:
        theme.mode === "dark"
          ? "rgba(124,92,255,0.25)"
          : "rgba(37,99,235,0.18)",
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
      backgroundColor: theme.colors.reviewButton,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.14)" : theme.colors.border,
    },
    reviewBtnText: {
      color: theme.colors.text,
      fontWeight: "800",
      fontSize: 12,
    },
  });
