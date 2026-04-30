import {
  claimDailyLoginXpAction,
  fetchXpHistoryResult,
  fetchXpOverview,
  XpHistoryEntry,
  XpHistoryResult,
  XpOverview,
} from "@/src/features/achievements/achievements.service";
import XpHistoryBottomSheet from "@/src/features/achievements/components/XpHistoryBottomSheet";
import XpHistoryRow from "@/src/features/achievements/components/XpHistoryRow";
import {
  notifyXpUpdated,
  subscribeToXpUpdates,
} from "@/src/features/achievements/xp-events";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
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

const EMPTY_SUMMARY: XpOverview = {
  totalXp: 0,
  streak: 0,
  completedLessons: 0,
  canClaimDailyXp: false,
  nextDailyClaimAt: null,
  dailyClaimXpAmount: null,
  hintXpCost: null,
};

type ClaimStateCopy = {
  buttonLabel: string;
  detailLabel: string;
  disabled: boolean;
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

function SummaryCard({
  icon,
  value,
  label,
  colors,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  colors: [string, string];
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <LinearGradient colors={colors} style={styles.summaryCard}>
      <View style={styles.summaryIconWrap}>
        <Ionicons name={icon} size={18} color="#F8FAFC" />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </LinearGradient>
  );
}

export default function AchievementsScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const [summary, setSummary] = useState<XpOverview>(EMPTY_SUMMARY);
  const [history, setHistory] = useState<XpHistoryEntry[]>([]);
  const [historyState, setHistoryState] =
    useState<XpHistoryResult["state"]>("ok");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [historySheetVisible, setHistorySheetVisible] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setClaimMessage(null);
    }

    try {
      const [summaryResult, historyResult] = await Promise.allSettled([
        fetchXpOverview(),
        fetchXpHistoryResult(),
      ]);

      let nextError: string | null = null;

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value);
      } else {
        console.log("Error loading XP summary:", summaryResult.reason);
        nextError = "We could not load your XP right now.";
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value.entries);
        setHistoryState(historyResult.value.state);
        if (historyResult.value.state === "mapping_problem") {
          nextError =
            "We loaded your XP wallet, but some history details are not fully labeled yet.";
        } else if (historyResult.value.state === "error") {
          nextError = "We could not load your XP history right now.";
        }
      } else {
        console.log("Error loading XP history:", historyResult.reason);
        setHistoryState("error");
        nextError = "We could not load your full XP history right now.";
      }

      setError(nextError);
    } catch (loadError) {
      console.log("Error loading achievements:", loadError);
      setError("We could not load your XP right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  React.useEffect(() => {
    return subscribeToXpUpdates(() => {
      void loadData(true);
    });
  }, [loadData]);

  const previewHistory = useMemo(() => history.slice(0, 3), [history]);
  const claimState = useMemo(
    () => getClaimStateCopy(summary, claiming),
    [claiming, summary],
  );

  const handleClaimXp = useCallback(async () => {
    try {
      setClaiming(true);
      setClaimMessage(null);
      const result = await claimDailyLoginXpAction();

      if (result.claimed) {
        notifyXpUpdated();
        setClaimMessage("Daily XP claimed successfully.");
        await loadData(true);
        return;
      }

      setSummary((current) => ({
        ...current,
        canClaimDailyXp: result.canClaimDailyXp,
        nextDailyClaimAt: result.nextDailyClaimAt,
        dailyClaimXpAmount: result.amount ?? current.dailyClaimXpAmount,
      }));
      setClaimMessage("Daily XP was already claimed today.");
    } catch (claimError) {
      console.log("Daily claim failed:", claimError);
      setError("We could not claim daily XP right now.");
    } finally {
      setClaiming(false);
    }
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <ActivityIndicator color={theme.colors.text} />
          </View>
          <Text style={styles.stateTitle}>Loading achievements</Text>
          <Text style={styles.stateText}>
            Fetching your current XP total and recent activity.
          </Text>
        </View>
      </View>
    );
  }

  if (
    error &&
    history.length === 0 &&
    summary.totalXp === 0 &&
    historyState !== "mapping_problem"
  ) {
    return (
      <View style={styles.centerState}>
        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <Ionicons name="cloud-offline-outline" size={22} color="#F59E0B" />
          </View>
          <Text style={styles.stateTitle}>XP unavailable</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable onPress={() => void loadData()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={previewHistory}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadData(true)}
            tintColor={theme.colors.text}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                {/* <View>
                  <Text style={styles.heroEyebrow}>Achievements</Text>
                  <Text style={styles.heroTitle}>Your XP wallet</Text>
                  <Text style={styles.heroSubtitle}>
                    XP is earned from claims, lessons, and quiz rewards. XP is
                    spent only on hints.
                  </Text>
                </View> */}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Available XP balance</Text>
                <Text style={styles.totalValue}>{summary.totalXp}</Text>
                <Text style={styles.totalHelper}>
                  This is the XP you can use right now for hints.
                </Text>
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
                      <Ionicons name="gift-outline" size={16} color="#0F172A" />
                      <Text style={styles.claimButtonText}>
                        {claimState.buttonLabel}
                      </Text>
                    </>
                  )}
                </Pressable>
                <Text style={styles.claimStatusText}>
                  {claimState.detailLabel}
                </Text>
                {claimMessage ? (
                  <Text style={styles.claimMessageText}>{claimMessage}</Text>
                ) : null}
              </View>

              <View style={styles.summaryGrid}>
                <SummaryCard
                  icon="flash"
                  value={String(summary.totalXp)}
                  label="Available XP"
                  colors={["#2563EB", "#1D4ED8"]}
                  styles={styles}
                />
                <SummaryCard
                  icon="flame"
                  value={String(summary.streak)}
                  label="Streak"
                  colors={["#F59E0B", "#EA580C"]}
                  styles={styles}
                />
                <SummaryCard
                  icon="checkmark-circle"
                  value={String(summary.completedLessons)}
                  label="Lessons"
                  colors={["#14B8A6", "#0F766E"]}
                  styles={styles}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>History</Text>
                <Text style={styles.sectionSubtitle}>
                  Every XP gain and spend appears here, including hint use.
                </Text>
              </View>
              <Pressable
                disabled={history.length === 0}
                onPress={() => setHistorySheetVisible(true)}
                style={({ pressed }) => [
                  styles.showFullHistoryButton,
                  pressed && history.length > 0 ? { opacity: 0.72 } : null,
                  history.length === 0
                    ? styles.showFullHistoryButtonDisabled
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.showFullHistoryText,
                    history.length === 0
                      ? styles.showFullHistoryTextDisabled
                      : null,
                  ]}
                >
                  Show full history
                </Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.inlineError}>{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => <XpHistoryRow item={item} />}
        ItemSeparatorComponent={() => (
          <View style={{ height: theme.s(1.25) }} />
        )}
        ListEmptyComponent={
          historyState === "error" ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={styles.emptyTitle}>Could not load XP history</Text>
              <Text style={styles.emptyText}>
                Pull to refresh or try again after your next XP update.
              </Text>
            </View>
          ) : historyState === "mapping_problem" ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="construct-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={styles.emptyTitle}>XP history needs a refresh</Text>
              <Text style={styles.emptyText}>
                Your XP wallet loaded, but some history fields were not
                recognized clearly yet.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={styles.emptyTitle}>No XP history yet</Text>
              <Text style={styles.emptyText}>
                Daily claims, lesson completions, quiz rewards, and hint spends
                will show here once you start earning or spending XP.
              </Text>
            </View>
          )
        }
      />

      <XpHistoryBottomSheet
        visible={historySheetVisible}
        history={history}
        historyState={historyState}
        onClose={() => setHistorySheetVisible(false)}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      paddingHorizontal: theme.s(3),
      paddingTop: theme.s(6),
      paddingBottom: theme.s(4),
    },
    heroCard: {
      borderRadius: 28,
      paddingHorizontal: theme.s(2),
      paddingVertical: theme.s(1.8),
      marginBottom: theme.s(2.5),
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.84)"
          : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.52)"
          : "rgba(148,163,184,0.18)",
      gap: theme.s(1.4),
    },
    heroHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.s(1),
    },
    heroEyebrow: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 21,
      fontWeight: "900",
      marginTop: 4,
    },
    heroSubtitle: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 16,
      marginTop: 6,
      maxWidth: 220,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(250,204,21,0.12)"
          : "rgba(250,204,21,0.14)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(250,204,21,0.18)"
          : "rgba(250,204,21,0.22)",
    },
    heroBadgeText: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: "800",
    },
    totalRow: {
      paddingHorizontal: theme.s(1.5),
      paddingVertical: theme.s(1.35),
      borderRadius: 18,
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.14)",
    },
    totalLabel: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
    },
    totalValue: {
      color: theme.colors.text,
      fontSize: 30,
      fontWeight: "900",
      marginTop: 4,
    },
    totalHelper: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 4,
      lineHeight: 16,
    },
    claimButton: {
      marginTop: theme.s(1),
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 999,
      backgroundColor: "#FACC15",
      borderWidth: 1,
      borderColor: "rgba(250,204,21,0.3)",
    },
    claimButtonDisabled: {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.22)"
          : "rgba(148,163,184,0.18)",
      borderColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.16)"
          : "rgba(148,163,184,0.22)",
    },
    claimButtonText: {
      color: "#0F172A",
      fontSize: 12,
      fontWeight: "900",
    },
    claimStatusText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: theme.s(1),
    },
    claimMessageText: {
      color: "#93C5FD",
      fontSize: 12,
      fontWeight: "700",
      marginTop: 6,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: theme.s(1.25),
    },
    summaryCard: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: theme.s(1.35),
      paddingHorizontal: theme.s(1.2),
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    summaryIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.14)",
      marginBottom: 10,
    },
    summaryValue: {
      color: "#F8FAFC",
      fontSize: 17,
      fontWeight: "900",
    },
    summaryLabel: {
      color: "rgba(248,250,252,0.84)",
      fontSize: 10,
      fontWeight: "700",
      marginTop: 4,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: theme.s(1.5),
      gap: theme.s(1),
    },
    sectionHeaderContent: {
      flex: 1,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },
    sectionSubtitle: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
      lineHeight: 19,
    },
    showFullHistoryButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.14)",
    },
    showFullHistoryButtonDisabled: {
      opacity: 0.55,
    },
    showFullHistoryText: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
      fontSize: 11,
      fontWeight: "800",
      textAlign: "center",
    },
    showFullHistoryTextDisabled: {
      color: theme.colors.muted,
    },
    emptyCard: {
      alignItems: "center",
      padding: theme.s(3),
      borderRadius: 24,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.84)"
          : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.52)"
          : "rgba(148,163,184,0.18)",
    },
    emptyIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.s(1.5),
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.16)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.14)",
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    emptyText: {
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 8,
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.s(3),
      backgroundColor: theme.colors.bg,
    },
    stateCard: {
      width: "100%",
      maxWidth: 360,
      padding: theme.s(3),
      borderRadius: 24,
      alignItems: "center",
      gap: theme.s(1.25),
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.84)"
          : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.52)"
          : "rgba(148,163,184,0.18)",
    },
    stateIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.16)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.14)",
    },
    stateTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
      textAlign: "center",
    },
    stateText: {
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    retryButton: {
      marginTop: theme.s(1),
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },
    inlineError: {
      color: "#FBBF24",
      fontSize: 12,
      fontWeight: "700",
      marginBottom: theme.s(1.5),
    },
  });
