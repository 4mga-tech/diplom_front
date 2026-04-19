import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchLevels, LevelItem } from "@/lib/learning";
import { useNotifications } from "@/src/store/notificationStore";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";

type DisplayLevel = LevelItem & {
  shortInfo: string;
  accent: [string, string];
};

export default function CoursesScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { notifications, addNotification } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    return {
      completed: "65",
      streak: "7",
      xp: "420",
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const fake = {
        id: Date.now().toString(),
        message: "New lesson unlocked",
        type: "lesson",
        createdAt: Date.now(),
        read: false,
      };
      addNotification(fake);
    }, 10000);

    return () => clearInterval(interval);
  }, [addNotification]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchLevels();
        setLevels(res);
      } catch (e) {
        console.log("Error loading levels", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const levelMeta = useMemo<
    Record<string, { shortInfo: string; accent: [string, string] }>
  >(
    () => ({
      B1: {
        shortInfo: "Letters & basics",
        accent: ["#5B6CFF", "#7C3AED"],
      },
      M1: {
        shortInfo: "Core vocabulary",
        accent: ["#0EA5E9", "#2563EB"],
      },
      M2: {
        shortInfo: "Daily communication",
        accent: ["#14B8A6", "#0F766E"],
      },
      M3: {
        shortInfo: "Advanced practice",
        accent: ["#F59E0B", "#EA580C"],
      },
    }),
    [],
  );

  const displayLevels = useMemo<DisplayLevel[]>(() => {
    const preferredOrder = ["B1", "M1", "M2", "M3"];

    const sorted = [...levels].sort(
      (a, b) => preferredOrder.indexOf(a.id) - preferredOrder.indexOf(b.id),
    );

    return sorted.map((item) => ({
      ...item,
      shortInfo: levelMeta[item.id]?.shortInfo ?? "Start learning",
      accent: levelMeta[item.id]?.accent ?? theme.colors.statGradient,
    }));
  }, [levels, levelMeta, theme.colors.statGradient]);

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

  const activeLevel = displayLevels[0]?.id ?? "B1";

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <View style={styles.logoBubble}>
            <Ionicons name="sparkles" size={16} color={theme.colors.text} />
          </View>

          <View>
            <Text style={styles.brandTitle}>Monlanguage</Text>
            <Text style={styles.brandSub}>Learn smarter every day</Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <Pressable
            onPress={() => router.push("/notification")}
            style={styles.iconBtn}
          >
            <Ionicons name="notifications-outline" size={19} color="#8B5CF6" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={confirmLogout} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={19} color="#E57373" />
          </Pressable>
        </View>
      </View>

      <LinearGradient
        colors={theme.colors.statGradient}
        style={styles.heroCard}
      >
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Current progress</Text>
          <Text style={styles.heroTitle}>{activeLevel} level</Text>
          <Text style={styles.heroDesc}>
            Keep your streak and continue learning today.
          </Text>
        </View>

        <View style={styles.heroRight}>
          <View style={styles.heroPill}>
            <Ionicons name="flash" size={13} color={theme.colors.text} />
            <Text style={styles.heroPillValue}>{stats.xp}</Text>
            <Text style={styles.heroPillLabel}>XP</Text>
          </View>

          <View style={styles.heroMiniRow}>
            <View style={styles.heroMiniItem}>
              <Ionicons name="flame" size={12} color={theme.colors.text} />
              <Text style={styles.heroMiniValue}>{stats.streak}</Text>
            </View>

            <View style={styles.heroMiniDivider} />

            <View style={styles.heroMiniItem}>
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={theme.colors.text}
              />
              <Text style={styles.heroMiniValue}>{stats.completed}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Levels</Text>
        <Text style={styles.sectionCaption}>
          {loading ? "Loading..." : `${displayLevels.length} available`}
        </Text>
      </View>

      <FlatList
        data={displayLevels}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Pressable
            style={[
              styles.levelCardWrap,
              index % 2 === 0 ? { marginRight: 10 } : null,
            ]}
            onPress={() => {
              router.push({
                pathname: "/units/[levelId]",
                params: { levelId: item.id },
              });
            }}
          >
            <LinearGradient colors={item.accent} style={styles.levelCard}>
              <View style={styles.levelCardTop}>
                <View style={styles.levelTag}>
                  <Text style={styles.levelTagText}>Open</Text>
                </View>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="rgba(255,255,255,0.92)"
                />
              </View>

              <View>
                <Text style={styles.levelCode}>{item.id}</Text>
                <Text style={styles.levelShortInfo} numberOfLines={1}>
                  {item.shortInfo}
                </Text>
              </View>

              <View style={styles.levelFooter}>
                <Text style={styles.levelCount}>
                  {item.vocabularyCount ?? 0} words
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
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
      paddingTop: theme.s(6.5),
    },

    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.s(2.4),
    },

    brandWrap: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingRight: 12,
    },

    logoBubble: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(99,102,241,0.10)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.10)"
          : "rgba(99,102,241,0.16)",
    },

    brandTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    brandSub: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 3,
    },

    topActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.07)" : theme.colors.card,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.09)" : theme.colors.border,
    },

    badge: {
      position: "absolute",
      top: 5,
      right: 5,
      backgroundColor: "#EF4444",
      borderRadius: 999,
      minWidth: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },

    badgeText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "800",
    },

    heroCard: {
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 16,
      marginBottom: theme.s(2.3),
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.10)" : theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 118,
    },

    heroLeft: {
      flex: 1,
      paddingRight: 14,
    },

    heroEyebrow: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: "700",
      marginBottom: 6,
    },

    heroTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: 0.2,
    },

    heroDesc: {
      color: theme.colors.muted,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
      fontWeight: "600",
    },

    heroRight: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      minHeight: 84,
    },

    heroPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,

      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)",

      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.14)" : theme.colors.border,
    },

    heroPillValue: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
    },

    heroPillLabel: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "700",
    },

    heroMiniRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,

      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",

      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.10)" : theme.colors.border,
    },

    heroMiniItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    heroMiniDivider: {
      width: 1,
      height: 14,
      backgroundColor: "rgba(255,255,255,0.20)",
      marginHorizontal: 10,
    },

    heroMiniValue: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "800",
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.s(1.4),
      paddingHorizontal: 2,
    },

    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    sectionCaption: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
    },

    list: {
      paddingBottom: theme.s(4),
    },

    gridRow: {
      justifyContent: "space-between",
      marginBottom: 10,
    },

    levelCardWrap: {
      flex: 1,
    },

    levelCard: {
      height: 120,
      borderRadius: 24,
      padding: 16,
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
    },

    levelCardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    levelTag: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.14)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
    },

    levelTagText: {
      color: "#fff",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    levelCode: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "900",
      letterSpacing: 0.3,
      marginTop: 6,
    },

    levelShortInfo: {
      color: "rgba(255,255,255,0.86)",
      fontSize: 11,
      fontWeight: "700",
      marginTop: 4,
    },

    levelFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
    },

    levelCount: {
      color: "rgba(255,255,255,0.70)",
      fontSize: 10,
      fontWeight: "600",
    },
  });
