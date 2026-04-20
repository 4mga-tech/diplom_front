import {
  fetchUnitDetail,
  getLessonProgressState,
  LessonProgressState,
  UnitDetail,
} from "@/lib/learning";
import { getLevelById } from "@/src/data/curriculum";
import {
  getCanonicalLevelId,
  getLessonDetailRoute,
  getNormalizedLearningParams,
  getUnitRoute,
} from "@/src/features/learning/routes";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
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

const LESSON_STATE_LABELS: Record<LessonProgressState, string> = {
  completed: "Completed",
  current: "Current",
  unlocked: "Unlocked",
  locked: "Locked",
};

export default function LessonListScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    levelId?: string | string[];
    unitId?: string;
  }>();

  const { levelId: safeLevelId, unitId: safeUnitId } =
    getNormalizedLearningParams(params);
  const displayLevelId = getCanonicalLevelId(params.levelId);
  const levelMeta = getLevelById(displayLevelId);

  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUnit = useCallback(
    async (isRefresh = false) => {
      if (!safeUnitId) {
        setUnit(null);
        setError("Unit not found.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await fetchUnitDetail(safeLevelId, safeUnitId);
        setUnit(data);
        setError(data ? null : "Unit not found.");
      } catch (loadError) {
        console.log("Error loading lesson list:", loadError);
        setError("We could not refresh this lesson list right now.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [safeLevelId, safeUnitId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadUnit();
    }, [loadUnit]),
  );

  const currentLesson = useMemo(
    () => unit?.lessons.find((lesson) => lesson.id === unit.currentLessonId) ?? null,
    [unit],
  );

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace(getUnitRoute(safeLevelId, safeUnitId));
  }, [navigation, safeLevelId, safeUnitId]);

  if (!levelMeta) {
    return (
      <View style={styles.centerState}>
        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <Ionicons name="search-outline" size={22} color={theme.colors.text} />
          </View>
          <Text style={styles.stateTitle}>Level not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>{unit?.title ?? "Lesson list"}</Text>
          <Text style={styles.h2}>
            {levelMeta.title} - {unit?.lessonsCount ?? 0} lessons
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["rgba(14,165,233,0.14)", "rgba(37,99,235,0.10)"]}
        style={styles.banner}
      >
        <View style={styles.bannerTop}>
          <Ionicons name="list-outline" size={18} color="#60A5FA" />
          <Text style={styles.bannerText}>
            Track what is current, finished, and still locked at a glance.
          </Text>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <Ionicons name="checkmark-circle" size={15} color="#22C55E" />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="play-circle" size={15} color="#60A5FA" />
            <Text style={styles.legendText}>Current</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="lock-open" size={15} color="#0EA5E9" />
            <Text style={styles.legendText}>Unlocked</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="lock-closed" size={15} color={theme.colors.muted} />
            <Text style={styles.legendText}>Locked</Text>
          </View>
        </View>
        {currentLesson ? (
          <View style={styles.currentCallout}>
            <Text style={styles.currentCalloutLabel}>Current lesson</Text>
            <Text style={styles.currentCalloutTitle}>{currentLesson.title}</Text>
          </View>
        ) : null}
      </LinearGradient>

      {loading ? (
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <ActivityIndicator color={theme.colors.text} />
            </View>
            <Text style={styles.stateTitle}>Loading lessons</Text>
            <Text style={styles.stateText}>Refreshing this unit lesson order and unlock state.</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={unit?.lessons ?? []}
          keyExtractor={(lesson) => lesson.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadUnit(true)}
              tintColor={theme.colors.text}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: theme.s(1.5) }} />}
          renderItem={({ item }) => {
            const progressState = getLessonProgressState(
              item,
              unit?.currentLessonId,
            );
            const locked = progressState === "locked";
            const isCurrent = progressState === "current";
            const stateColor =
              progressState === "completed"
                ? "#22C55E"
                : progressState === "locked"
                  ? theme.colors.muted
                  : progressState === "current"
                    ? "#60A5FA"
                    : "#0EA5E9";

            return (
              <Pressable
                disabled={locked}
                onPress={() =>
                  router.push(getLessonDetailRoute(safeLevelId, safeUnitId, item.id))
                }
                style={({ pressed }) => [
                  styles.lessonCard,
                  pressed && !locked && { opacity: 0.92 },
                  locked && { opacity: 0.66 },
                ]}
              >
                <View style={styles.lessonIconWrap}>
                  <View
                    style={[
                      styles.lessonIcon,
                      progressState === "completed"
                        ? styles.lessonIconDone
                        : locked
                          ? styles.lessonIconLocked
                          : styles.lessonIconReady,
                    ]}
                  >
                    <Ionicons
                      name={
                        progressState === "completed"
                          ? "checkmark-circle"
                          : locked
                            ? "lock-closed"
                            : isCurrent
                              ? "play-circle"
                              : "lock-open"
                      }
                      size={22}
                      color={
                        progressState === "completed"
                          ? "#22C55E"
                          : theme.colors.text
                      }
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.lessonTopRow}>
                    <View
                      style={[
                        styles.statePill,
                        {
                          borderColor: `${stateColor}33`,
                          backgroundColor:
                            theme.mode === "dark"
                              ? `${stateColor}14`
                              : `${stateColor}10`,
                        },
                      ]}
                    >
                      <Text style={[styles.statePillText, { color: stateColor }]}>
                        {LESSON_STATE_LABELS[progressState]}
                      </Text>
                    </View>
                    <Text style={styles.orderText}>Lesson {item.order}</Text>
                  </View>

                  <Text style={styles.lessonTitle}>{item.title}</Text>
                  <Text style={styles.lessonSubtitle}>{item.subtitle}</Text>
                </View>

                <View style={styles.rightColumn}>
                  {progressState === "completed" ? (
                    <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                  ) : locked ? (
                    <Ionicons name="lock-closed" size={18} color={theme.colors.muted} />
                  ) : isCurrent ? (
                    <Ionicons name="play-circle" size={22} color="#60A5FA" />
                  ) : (
                    <Text style={styles.xpText}>{item.xpReward} XP</Text>
                  )}
                </View>
              </Pressable>
            );
          }}
          ListHeaderComponent={
            error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="cloud-offline-outline" size={16} color="#FDE68A" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <View style={styles.stateCard}>
                <View style={styles.stateIconWrap}>
                  <Ionicons name="book-outline" size={22} color={theme.colors.text} />
                </View>
                <Text style={styles.stateTitle}>No lessons yet</Text>
                <Text style={styles.stateText}>
                  This unit does not have any lessons available right now.
                </Text>
              </View>
            </View>
          }
        />
      )}
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
      alignItems: "center",
      gap: theme.s(2),
      marginBottom: theme.s(2.25),
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
    },
    h1: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },
    h2: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
    },
    banner: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.14)"
          : "rgba(59,130,246,0.12)",
      padding: theme.s(2.2),
      marginBottom: theme.s(2.5),
      gap: theme.s(1.75),
    },
    bannerTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1),
    },
    bannerText: {
      flex: 1,
      color: theme.mode === "dark" ? "rgba(226,232,240,0.9)" : "#334155",
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 20,
    },
    legendRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.s(1.5),
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
    },
    currentCallout: {
      paddingHorizontal: theme.s(1.5),
      paddingVertical: theme.s(1.75),
      borderRadius: 18,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.88)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.14)"
          : "rgba(59,130,246,0.12)",
    },
    currentCalloutLabel: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    currentCalloutTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "900",
      marginTop: 4,
    },
    listContent: {
      paddingBottom: theme.s(4),
    },
    lessonCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1.5),
      borderRadius: 22,
      paddingHorizontal: theme.s(2),
      paddingVertical: theme.s(2.1),
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.86)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.52)"
          : "rgba(148,163,184,0.18)",
    },
    lessonIconWrap: {
      justifyContent: "center",
    },
    lessonIcon: {
      width: 48,
      height: 48,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    lessonIconDone: {
      backgroundColor:
        theme.mode === "dark" ? "rgba(34,197,94,0.14)" : "rgba(34,197,94,0.08)",
      borderColor: "rgba(34,197,94,0.2)",
    },
    lessonIconLocked: {
      backgroundColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.24)" : "rgba(226,232,240,0.95)",
      borderColor: "rgba(148,163,184,0.2)",
    },
    lessonIconReady: {
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.14)" : "rgba(37,99,235,0.08)",
      borderColor: "rgba(59,130,246,0.18)",
    },
    lessonTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.s(1),
      marginBottom: 10,
    },
    statePill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },
    statePillText: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    orderText: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    lessonTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 22,
    },
    lessonSubtitle: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
      lineHeight: 19,
    },
    rightColumn: {
      alignItems: "flex-end",
      justifyContent: "center",
      minWidth: 58,
    },
    xpText: {
      color: "#FACC15",
      fontSize: 11,
      fontWeight: "900",
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.s(1.5),
      paddingHorizontal: theme.s(3),
    },
    stateCard: {
      width: "100%",
      maxWidth: 360,
      padding: theme.s(3),
      borderRadius: 24,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.84)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.52)"
          : "rgba(148,163,184,0.18)",
      alignItems: "center",
      gap: theme.s(1.25),
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
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 20,
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1),
      backgroundColor: "rgba(120,53,15,0.28)",
      borderColor: "rgba(245,158,11,0.35)",
      borderWidth: 1,
      padding: theme.s(1.5),
      borderRadius: theme.r.lg,
      marginBottom: theme.s(2),
    },
    errorText: {
      color: "#FDE68A",
      fontSize: 12,
      fontWeight: "700",
      flex: 1,
    },
  });
