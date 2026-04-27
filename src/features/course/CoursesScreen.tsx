import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchLevels, LevelItem } from "@/lib/learning";
import {
  claimDailyLoginXpAction,
  fetchXpOverview,
  XpOverview,
} from "@/src/features/achievements/achievements.service";
import {
  notifyXpUpdated,
  subscribeToXpUpdates,
} from "@/src/features/achievements/xp-events";
import { getLevelRoute } from "@/src/features/learning/routes";
import { useNotifications } from "@/src/store/notificationStore";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";

type DisplayLevel = LevelItem & {
  shortInfo: string;
};

type ClaimStateCopy = {
  buttonLabel: string;
  detailLabel: string;
  disabled: boolean;
};

function isValidGradient(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    value[0].trim().length > 0 &&
    typeof value[1] === "string" &&
    value[1].trim().length > 0
  );
}

function getLevelGradient(gradient?: [string, string] | null): [string, string] {
  return isValidGradient(gradient)
    ? [gradient[0].trim(), gradient[1].trim()]
    : ["#334155", "#1E293B"];
}

const EMPTY_XP_OVERVIEW: XpOverview = {
  totalXp: 0,
  canClaimDailyXp: false,
  nextDailyClaimAt: null,
  dailyClaimXpAmount: null,
  hintXpCost: null,
  streak: 0,
  completedLessons: 0,
};

function formatNextClaimTime(timestamp: string | null) {
  if (!timestamp) {
    return "Already claimed today";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Already claimed today";
  }

  return `Next claim ${date.toLocaleString()}`;
}

function getClaimStateCopy(
  summary: XpOverview,
  claiming: boolean,
): ClaimStateCopy {
  if (claiming) {
    return {
      buttonLabel: "Claiming XP...",
      detailLabel: "Updating your wallet now.",
      disabled: true,
    };
  }

  if (summary.canClaimDailyXp) {
    return {
      buttonLabel: summary.dailyClaimXpAmount
        ? `Claim daily XP (${summary.dailyClaimXpAmount} XP)`
        : "Claim daily XP",
      detailLabel: "Available now",
      disabled: false,
    };
  }

  return {
    buttonLabel: "Claimed today",
    detailLabel: formatNextClaimTime(summary.nextDailyClaimAt),
    disabled: true,
  };
}

export default function CoursesScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { notifications, addNotification } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpOverview, setXpOverview] = useState<XpOverview>(EMPTY_XP_OVERVIEW);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

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

    void load();
  }, []);

  const loadXpOverview = useCallback(async (clearMessage = false) => {
    try {
      const summary = await fetchXpOverview();
      setXpOverview(summary);

      if (clearMessage) {
        setClaimMessage(null);
      }
    } catch (error) {
      console.log("Error loading XP summary:", error);
    }
  }, []);

  const handleClaimXp = useCallback(async () => {
    try {
      setClaiming(true);
      setClaimMessage(null);
      const result = await claimDailyLoginXpAction();

      if (result.claimed) {
        notifyXpUpdated();
        setClaimMessage("Daily XP claimed successfully.");
        await loadXpOverview();
        return;
      }

      setXpOverview((current) => ({
        ...current,
        canClaimDailyXp: result.canClaimDailyXp,
        nextDailyClaimAt: result.nextDailyClaimAt,
        dailyClaimXpAmount: result.amount ?? current.dailyClaimXpAmount,
      }));
      setClaimMessage("Daily XP was already claimed today.");
    } catch (error) {
      console.log("Error claiming daily XP:", error);
    } finally {
      setClaiming(false);
    }
  }, [loadXpOverview]);

  useFocusEffect(
    useCallback(() => {
      void loadXpOverview(true);
    }, [loadXpOverview]),
  );

  useEffect(() => {
    return subscribeToXpUpdates(() => {
      void loadXpOverview();
    });
  }, [loadXpOverview]);

  const levelMeta = useMemo<Record<string, { shortInfo: string }>>(
    () => ({
      B1: {
        shortInfo: "Letters & basics",
      },
      M1: {
        shortInfo: "Core vocabulary",
      },
      M2: {
        shortInfo: "Daily communication",
      },
      M3: {
        shortInfo: "Advanced practice",
      },
      M4: {
        shortInfo: "Fluent grammar",
      },
    }),
    [],
  );

  const displayLevels = useMemo<DisplayLevel[]>(() => {
    const preferredOrder = ["B1", "M1", "M2", "M3", "M4"];

    const sorted = [...levels].sort(
      (a, b) => {
        const aIndex = preferredOrder.indexOf(a.id);
        const bIndex = preferredOrder.indexOf(b.id);
        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      },
    );

    return sorted.map((item) => ({
      ...item,
      shortInfo: levelMeta[item.id]?.shortInfo ?? "Start learning",
      gradient: getLevelGradient(item.gradient),
    }));
  }, [levels, levelMeta]);

  const claimState = useMemo(
    () => getClaimStateCopy(xpOverview, claiming),
    [claiming, xpOverview],
  );

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
        <View style={styles.heroMainRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroEyebrow}>Current progress</Text>
            <Text style={styles.heroTitle}>{activeLevel} level</Text>
            <Text style={styles.heroDesc}>
              Keep your streak and continue learning today.
            </Text>
          </View>

          <View style={styles.heroRight}>
            <Pressable
              onPress={() => router.push("/(tabs)/achievements")}
              style={({ pressed }) => [
                styles.heroPill,
                pressed && { opacity: 0.88 },
              ]}
            >
              <Ionicons name="flash" size={13} color={theme.colors.text} />
              <Text style={styles.heroPillValue}>{xpOverview.totalXp}</Text>
              <Text style={styles.heroPillLabel}>Available XP</Text>
            </Pressable>

            <Pressable
              disabled={claimState.disabled}
              onPress={() => {
                void handleClaimXp();
              }}
              style={[
                styles.claimButton,
                claimState.disabled && styles.claimButtonDisabled,
              ]}
            >
              {claiming ? (
                <ActivityIndicator color="#0F172A" size="small" />
              ) : (
                <>
                  <Ionicons name="gift-outline" size={14} color="#0F172A" />
                  <Text style={styles.claimButtonText}>
                    {claimState.buttonLabel}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.heroFooterRow}>
          <View style={styles.heroMiniRow}>
            <View style={styles.heroMiniItem}>
              <Ionicons name="flame" size={12} color={theme.colors.text} />
              <Text style={styles.heroMiniValue}>{xpOverview.streak}</Text>
            </View>

            <View style={styles.heroMiniDivider} />

            <View style={styles.heroMiniItem}>
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={theme.colors.text}
              />
              <Text style={styles.heroMiniValue}>
                {xpOverview.completedLessons}
              </Text>
            </View>
          </View>

          <View style={styles.heroStatusWrap}>
            <Text style={styles.claimStatusText}>{claimState.detailLabel}</Text>
            {claimMessage ? (
              <Text style={styles.claimMessageText}>{claimMessage}</Text>
            ) : null}
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
              // console.log("[learning][courses] level tapped", {
              //   itemId: item.id,
              //   route: getLevelRoute(item.id),
              //   title: item.title,
              // });
              router.push(getLevelRoute(item.id));
            }}
          >
            <LinearGradient
              key={`${item.id}-${item.gradient.join("-")}`}
              colors={[...item.gradient]}
              style={styles.levelCard}
            >
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
      minHeight: 118,
    },

    heroMainRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },

    heroLeft: {
      flex: 1,
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
      gap: 10,
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

    claimButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: "#FACC15",
      borderWidth: 1,
      borderColor: "rgba(250,204,21,0.28)",
      maxWidth: 210,
    },

    claimButtonDisabled: {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.22)"
          : "rgba(255,255,255,0.20)",
      borderColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.18)"
          : "rgba(255,255,255,0.22)",
    },

    claimButtonText: {
      color: "#0F172A",
      fontSize: 11,
      fontWeight: "900",
      flexShrink: 1,
    },

    heroFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
      gap: 12,
    },

    heroStatusWrap: {
      flex: 1,
      alignItems: "flex-end",
    },

    claimStatusText: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: "800",
      textAlign: "right",
    },

    claimMessageText: {
      color: "rgba(255,255,255,0.86)",
      fontSize: 11,
      fontWeight: "700",
      marginTop: 6,
      textAlign: "right",
      maxWidth: 210,
    },

    heroMiniRow: {
      flexDirection: "row",
      alignItems: "center",
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
