import {
  fetchUnitDetail,
  getLessonProgressState,
  getUnitProgressState,
  LessonProgressState,
  UnitDetail,
  UnitProgressState,
} from "@/lib/learning";
import { getLevelById } from "@/src/data/curriculum";
import {
  getCanonicalLevelId,
  getLessonDetailRoute,
  getLevelRoute,
  getNormalizedLearningParams
} from "@/src/features/learning/routes";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LESSON_STATE_LABELS: Record<LessonProgressState, string> = {
  completed: "Completed",
  current: "Current",
  unlocked: "Unlocked",
  locked: "Locked",
};

const UNIT_STATE_LABELS: Record<UnitProgressState, string> = {
  completed: "Done",
  in_progress: "In progress",
  unlocked: "Unlocked",
  locked: "Locked",
};

function StateChip({
  label,
  color,
  theme,
}: {
  label: string;
  color: string;
  theme: AppTheme;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: `${color}33`,
        backgroundColor: theme.mode === "dark" ? `${color}14` : `${color}10`,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 11,
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function UnitOverviewScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
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
  const [error, setError] = useState<string | null>(null);

  const loadUnit = useCallback(async () => {
    if (!safeUnitId) {
      setUnit(null);
      setError("Unit not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchUnitDetail(safeLevelId, safeUnitId);
      setUnit(data);
      setError(data ? null : "Unit not found.");
    } catch (loadError) {
      console.log("Error loading unit:", loadError);
      setError("We could not load this unit right now.");
    } finally {
      setLoading(false);
    }
  }, [safeLevelId, safeUnitId]);

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
    router.replace(getLevelRoute(safeLevelId));
  }, [safeLevelId]);

  if (!levelMeta) {
    return (
      <SafeAreaView edges={["top"]} style={styles.centerState}>
        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <Ionicons name="search-outline" size={22} color={theme.colors.text} />
          </View>
          <Text style={styles.stateTitle}>Level not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.centerState}>
        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <ActivityIndicator color={theme.colors.text} />
          </View>
          <Text style={styles.stateTitle}>Loading unit</Text>
          <Text style={styles.stateText}>Getting the latest lesson unlock state and unit details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!unit) {
    return (
      <SafeAreaView edges={["top"]} style={styles.centerState}>
        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <Ionicons name="cloud-offline-outline" size={22} color="#FDE68A" />
          </View>
          <Text style={styles.stateTitle}>Unit unavailable</Text>
          <Text style={styles.stateText}>{error ?? "Unit not found."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unitState = getUnitProgressState(unit);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={6}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{unit.title}</Text>
          <Text style={styles.headerSubtitle}>
            {levelMeta.title} - {unit.lessonsCount} lessons
          </Text>
        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >



        {currentLesson ? (
          <Pressable
            onPress={() =>
              router.push(
                getLessonDetailRoute(safeLevelId, unit.id, currentLesson.id),
              )
            }
            style={({ pressed }) => [styles.currentCard, pressed && { opacity: 0.92 }]}
          >
            <View style={styles.currentCardHeader}>
              <StateChip label="Current lesson" color="#60A5FA" theme={theme} />
              <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
            </View>
            <Text style={styles.currentTitle}>{currentLesson.title}</Text>
            <Text style={styles.currentSubtitle}>{currentLesson.subtitle}</Text>
          </Pressable>
        ) : unit.isCompleted ? (
          <View style={styles.completedCard}>
            <View style={styles.completedIconWrap}>
              <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.completedTitle}>Unit completed</Text>
              <Text style={styles.completedSubtitle}>
                All lessons finished.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lesson list</Text>
        </View>

        <View style={styles.lessonStack}>
          {unit.lessons.map((lesson) => {
            const lessonState = getLessonProgressState(lesson, unit.currentLessonId);
            const locked = lessonState === "locked";
            const isCurrent = lessonState === "current";
            const stateColor =
              lessonState === "completed" ? "#22C55E"
                : lessonState === "locked" ? theme.colors.muted
                  : lessonState === "current" ? "#60A5FA"
                    : "#0EA5E9";

            const stateIcon =
              lessonState === "completed" ? "checkmark-circle"
                : locked ? "lock-closed"
                  : isCurrent ? "play-circle"
                    : "ellipse-outline";

            return (
              <Pressable
                key={lesson.id}
                disabled={locked}
                onPress={() => router.replace(getLessonDetailRoute(safeLevelId, unit.id, lesson.id))}
                style={({ pressed }) => [
                  styles.lessonCard,
                  pressed && !locked && { opacity: 0.88 },
                  locked && styles.lessonCardLocked,
                ]}
              >
                {/* Accent bar */}
                <View style={[styles.lessonAccentBar, { backgroundColor: stateColor }]} />

                <View style={styles.lessonBody}>
                  {/* Top row */}
                  <View style={styles.lessonCardTop}>
                    <Ionicons name={stateIcon} size={14} color={stateColor} />
                    <Text style={[styles.cardStateText, { color: stateColor }]}>
                      {LESSON_STATE_LABELS[lessonState]}
                    </Text>
                  </View>

                  <Text style={styles.lessonTitle} numberOfLines={2}>
                    {lesson.title}
                  </Text>
                  <View style={styles.lessonFooterRow}>
                    <Text style={styles.lessonOrder}>Lesson {lesson.order}</Text>

                    <View style={styles.lessonXpBadge}>
                      <Ionicons name="flash" size={10} color="#F59E0B" />
                      <Text style={styles.lessonXpText}>
                        {lesson.xpReward} XP
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      paddingHorizontal: theme.s(3),
      paddingTop: theme.s(1.5),
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.bg,
      paddingHorizontal: theme.s(3),
      gap: theme.s(1.5),
    },
    stateTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },
    stateText: {
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1.5),
      marginBottom: theme.s(1.25),
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.95)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },
    headerSubtitle: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
    },
    scrollContent: {
      paddingBottom: theme.s(4),
      gap: theme.s(1.5),
    },
    heroCard: {
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 13,
      gap: theme.s(0.9),
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.s(1),
    },
    heroTitleWrap: {
      flex: 1,
      gap: 3,
    },
    heroEyebrow: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    heroTitle: {
      color: "#FFFFFF",
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
    },
    heroDescription: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600",
    },
    heroSummaryRow: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: theme.s(1),
      paddingHorizontal: theme.s(1),
      paddingVertical: theme.s(0.9),
      borderRadius: 14,
      backgroundColor: "rgba(15,23,42,0.14)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    heroSummaryItem: {
      flex: 1,
      gap: 4,
    },
    heroSummaryLabel: {
      color: "rgba(255,255,255,0.74)",
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    heroSummaryValue: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
    },
    heroSummaryDivider: {
      width: 1,
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    callout: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: theme.s(1.75),
      borderRadius: theme.r.lg,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.15)",
    },
    calloutText: {
      flex: 1,
      color: theme.mode === "dark" ? "rgba(226,232,240,0.9)" : "#334155",
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
    },
    currentCard: {
      paddingHorizontal: theme.s(2),
      paddingVertical: theme.s(2.1),
      borderRadius: 24,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.86)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.16)",
      gap: theme.s(1.25),
    },
    cardStateText: {
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    currentCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    currentTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "900",
      lineHeight: 24,
    },
    currentSubtitle: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 20,
    },

    completedCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1.5),
      paddingHorizontal: theme.s(2),
      paddingVertical: theme.s(2),
      borderRadius: 22,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.86)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.18)",
    },
    completedIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(34,197,94,0.14)" : "rgba(34,197,94,0.08)",
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.18)",
    },
    completedTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
    },
    completedSubtitle: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 4,
      lineHeight: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.s(0.5),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
    },
    lessonStack: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.s(1),
    },
    lessonCard: {
      width: "48%",
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.84)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.52)" : "rgba(148,163,184,0.18)",
    },
    lessonCardLocked: {
      opacity: 0.5,
    },
    lessonAccentBar: {
      height: 3,
      width: "100%",
    },
    lessonBody: {
      padding: theme.s(1.5),
      gap: theme.s(0.75),
    },
    lessonCardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    lessonIconRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    lessonOrder: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "700",
    },

    lessonTrailing: {
      width: 28,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    lessonIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
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
    lessonTitle: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "800",
      lineHeight: 17,
    },
    lessonSubtitle: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
      lineHeight: 16,
    },
    stateCard: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 24,
      padding: theme.s(3),
      alignItems: "center",
      gap: theme.s(1.25),
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.84)" : "rgba(255,255,255,0.98)",
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
    lessonFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.s(0.25),
    },

    lessonXpBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(245,158,11,0.14)"
          : "rgba(245,158,11,0.1)",
    },

    lessonXpText: {
      color: theme.mode === "dark" ? "#FCD34D" : "#B45309",
      fontSize: 10,
      fontWeight: "900",
    },
  });
