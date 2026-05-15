import {
  claimDailyLoginXpAction,
  fetchXpHistoryResult,
  fetchXpOverview,
  XpHistoryEntry,
  XpHistoryResult,
  XpOverview,
} from "@/src/features/achievements/achievements.service";
import LeaderboardModal from "@/src/features/achievements/components/LeaderboardModal";
import XpHistoryBottomSheet from "@/src/features/achievements/components/XpHistoryBottomSheet";
import XpHistoryRow from "@/src/features/achievements/components/XpHistoryRow";
import {
  fetchLeaderboardSummary,
  LeaderboardSummary,
} from "@/src/features/achievements/leaderboard.service";
import {
  notifyXpUpdated,
  subscribeToXpUpdates,
} from "@/src/features/achievements/xp-events";
import { useAuthState } from "@/src/store/authStore";
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
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardSummary | null>(null);

  const { user } = useAuthState();
  const userId = user?.id ?? user?._id ?? null;
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
  const handleShowRanking = useCallback(async () => {
    setLeaderboardVisible(true);
    setLeaderboardLoading(true);
    setLeaderboardError(null);

    if (!userId) {
      setLeaderboardError("We could not identify your account for ranking.");
      setLeaderboardLoading(false);
      return;
    }

    try {
      const result = await fetchLeaderboardSummary(userId);
      setLeaderboardData(result);
    } catch (rankError) {
      console.log("Error loading leaderboard:", rankError);
      setLeaderboardError("Could not load leaderboard right now.");
    } finally {
      setLeaderboardLoading(false);
    }
  }, [userId]);
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
                <View style={styles.totalHeaderRow}>
                  <View style={styles.totalLeft}>
                    <Text style={styles.totalLabel}>Available XP balance</Text>
                    <Text style={styles.totalValue}>{summary.totalXp}</Text>
                  </View>

                  <Pressable
                    onPress={() => void handleShowRanking()}
                    style={styles.rankingButton}
                  >
                    <Text style={styles.rankingButtonText}>Show Ranking</Text>
                  </Pressable>
                </View>
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
      <LeaderboardModal
        visible={leaderboardVisible}
        loading={leaderboardLoading}
        error={leaderboardError}
        data={leaderboardData}
        currentUserName={user?.name}
        onClose={() => setLeaderboardVisible(false)}
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
      paddingHorizontal: theme.s(2.5),
      paddingVertical: theme.s(2.2),
      marginBottom: theme.s(3),
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.7)"
          : "rgba(255,255,255,0.99)",
      borderWidth: 1.5,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.15)"
          : "rgba(96,165,250,0.2)",
      gap: theme.s(1.8),
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === "dark" ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    heroHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.s(1),
    },
    rankingButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: "rgba(96,165,250,0.3)",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
    },
    rankingButtonText: {
      color: "#EFF6FF",
      fontSize: 13,
      fontWeight: "800",
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
      paddingHorizontal: theme.s(1.8),
      paddingVertical: theme.s(1.6),
      borderRadius: 20,
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.1)" : "rgba(37,99,235,0.06)",
      borderWidth: 1.2,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.15)",
      gap: theme.s(1.2),
    },
    totalLabel: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    totalValue: {
      color: theme.colors.text,
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -0.5,
      marginTop: 6,
    },
    totalHelper: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
      lineHeight: 16,
    },
    claimButton: {
      marginTop: theme.s(1.2),
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#FACC15",
      borderWidth: 1.5,
      borderColor: "rgba(250,204,21,0.4)",
      shadowColor: "#FACC15",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    claimButtonDisabled: {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.18)"
          : "rgba(148,163,184,0.12)",
      borderColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.15)"
          : "rgba(148,163,184,0.18)",
      shadowOpacity: 0,
      elevation: 0,
    },
    claimButtonText: {
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "900",
      letterSpacing: 0.1,
    },
    claimStatusText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: theme.s(0.8),
    },
    claimMessageText: {
      color: "#93C5FD",
      fontSize: 12,
      fontWeight: "700",
      marginTop: 8,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: theme.s(1.4),
      marginTop: theme.s(0.5),
    },
    summaryCard: {
      flex: 1,
      borderRadius: 20,
      paddingVertical: theme.s(1.6),
      paddingHorizontal: theme.s(1.3),
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
      shadowColor: "rgba(255,255,255,0.05)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    summaryIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.16)",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    summaryValue: {
      color: "#F8FAFC",
      fontSize: 19,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    summaryLabel: {
      color: "rgba(248,250,252,0.8)",
      fontSize: 11,
      fontWeight: "700",
      marginTop: 6,
      letterSpacing: 0.2,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: theme.s(2),
      gap: theme.s(1.5),
      marginTop: theme.s(1),
    },
    sectionHeaderContent: {
      flex: 1,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    sectionSubtitle: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 6,
      lineHeight: 20,
    },
    showFullHistoryButton: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)",
      borderWidth: 1.2,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.15)",
    },
    totalHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    totalLeft: {
      flex: 1,
    },
    showFullHistoryButtonDisabled: {
      opacity: 0.5,
    },
    showFullHistoryText: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
      fontSize: 12,
      fontWeight: "800",
      textAlign: "center",
    },
    showFullHistoryTextDisabled: {
      color: theme.colors.muted,
    },
    emptyCard: {
      alignItems: "center",
      padding: theme.s(3.5),
      borderRadius: 26,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.7)"
          : "rgba(255,255,255,0.99)",
      borderWidth: 1.5,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.12)"
          : "rgba(96,165,250,0.15)",
      gap: theme.s(1.2),
    },
    emptyIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.s(1),
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)",
      borderWidth: 1.5,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.15)",
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 19,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: -0.2,
    },
    emptyText: {
      color: theme.colors.muted,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 4,
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
      maxWidth: 380,
      padding: theme.s(3.5),
      borderRadius: 28,
      alignItems: "center",
      gap: theme.s(1.5),
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.7)"
          : "rgba(255,255,255,0.99)",
      borderWidth: 1.5,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.12)"
          : "rgba(96,165,250,0.15)",
    },
    stateIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)",
      borderWidth: 1.5,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.15)",
    },
    stateTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: -0.2,
    },
    stateText: {
      color: theme.colors.muted,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      textAlign: "center",
    },
    retryButton: {
      marginTop: theme.s(1.5),
      paddingHorizontal: 22,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },
    inlineError: {
      color: "#FBBF24",
      fontSize: 12,
      fontWeight: "700",
      marginBottom: theme.s(1.5),
    },
  });
