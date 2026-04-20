import {
  fetchLevelUnits,
  getUnitProgressState,
  UnitListItem,
  UnitProgressState,
} from "@/lib/learning";
import { getLevelById } from "@/src/data/curriculum";
import {
  getCanonicalLevelId,
  getUnitRoute,
  normalizeLevelId,
} from "@/src/features/learning/routes";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const UNIT_STATE_LABELS: Record<UnitProgressState, string> = {
  completed: "Completed",
  in_progress: "In progress",
  unlocked: "Unlocked",
  locked: "Locked",
};

function UnitCard({
  unit,
  styles,
  theme,
}: {
  unit: UnitListItem;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
}) {
  const progressState = getUnitProgressState(unit);
  const stateLabel = UNIT_STATE_LABELS[progressState];
  const stateColor =
    progressState === "completed"
      ? "#22C55E"
      : progressState === "locked"
        ? theme.colors.muted
        : "#60A5FA";
  const stateIcon =
    progressState === "completed"
      ? "checkmark-circle"
      : progressState === "locked"
        ? "lock-closed"
        : progressState === "in_progress"
          ? "play-circle"
          : "lock-open";

  return (
    <Pressable
      disabled={!unit.isUnlocked}
      onPress={() => router.push(getUnitRoute(unit.levelId, unit.id))}
      style={({ pressed }) => [
        styles.cardPress,
        pressed && unit.isUnlocked && { opacity: 0.94 },
        !unit.isUnlocked && styles.cardPressLocked,
      ]}
    >
      <LinearGradient colors={unit.gradient} style={styles.cardAccent} />
      <LinearGradient
        colors={
          theme.mode === "dark"
            ? ["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]
            : ["rgba(255,255,255,0.42)", "rgba(255,255,255,0)"]
        }
        style={styles.cardSheen}
      />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardStateRow}>
            <View
              style={[
                styles.cardIcon,
                {
                  borderColor: `${stateColor}2C`,
                  backgroundColor:
                    theme.mode === "dark" ? `${stateColor}16` : `${stateColor}10`,
                },
              ]}
            >
              <Ionicons name={stateIcon} size={17} color={stateColor} />
            </View>
            <View
              style={[
                styles.statePill,
                {
                  borderColor: `${stateColor}33`,
                  backgroundColor:
                    theme.mode === "dark" ? `${stateColor}14` : `${stateColor}10`,
                },
              ]}
            >
              <Text style={[styles.statePillText, { color: stateColor }]}>
                {stateLabel}
              </Text>
            </View>
          </View>

          <Ionicons
            name={unit.isUnlocked ? "arrow-forward" : "lock-closed"}
            size={18}
            color={unit.isUnlocked ? theme.colors.text : theme.colors.muted}
          />
        </View>

        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{unit.title}</Text>
          <Text style={styles.cardSubtitle}>{unit.subtitle}</Text>
          <Text style={styles.cardDescription}>{unit.description}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {unit.completedLessonsCount}/{unit.lessonsCount} lessons
          </Text>
          <Text style={styles.metaText}>
            {unit.isCompleted ? "Done" : `${unit.unlockedLessonsCount} unlocked`}
          </Text>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${unit.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{unit.progress}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function UnitsScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{ levelId?: string | string[] }>();
  const { levelId } = params;

  const safeLevelId = normalizeLevelId(levelId);
  const displayLevelId = getCanonicalLevelId(levelId);
  const levelMeta = getLevelById(displayLevelId);

  const [units, setUnits] = useState<UnitListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const nextUnits = await fetchLevelUnits(safeLevelId);
      setUnits(nextUnits);
      setError(null);
    } catch (loadError) {
      console.log("Error loading units:", loadError);
      setUnits([]);
      setError("We could not load the level structure right now.");
    } finally {
      setLoading(false);
    }
  }, [safeLevelId]);

  useFocusEffect(
    useCallback(() => {
      void loadUnits();
    }, [loadUnits]),
  );

  const totalLessons = useMemo(
    () => units.reduce((sum, unit) => sum + unit.lessonsCount, 0),
    [units],
  );
  const completedLessons = useMemo(
    () => units.reduce((sum, unit) => sum + unit.completedLessonsCount, 0),
    [units],
  );
  const overallProgress = useMemo(() => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  }, [completedLessons, totalLessons]);

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
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>{levelMeta.title}</Text>
          <Text style={styles.h2}>{levelMeta.description}</Text>
        </View>
      </View>

      <LinearGradient
        colors={["rgba(37,99,235,0.18)", "rgba(14,165,233,0.10)"]}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>Level track</Text>
            <Text style={styles.heroTitle}>{levelMeta.title}</Text>
          </View>
          <View style={styles.heroIconWrap}>
            <Ionicons name="language-outline" size={22} color={theme.colors.text} />
          </View>
        </View>

        <Text style={styles.heroText}>
          Move unit by unit. Backend progress unlocks the next step only after the
          current unit is fully completed.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{units.length}</Text>
            <Text style={styles.statLabel}>Units</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {completedLessons}/{totalLessons}
            </Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overallProgress}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <ActivityIndicator color={theme.colors.text} />
            </View>
            <Text style={styles.stateTitle}>Loading level</Text>
            <Text style={styles.stateText}>Pulling the latest unit structure from the backend.</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={units}
          keyExtractor={(unit) => unit.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: theme.s(1.5) }} />}
          renderItem={({ item }) => (
            <UnitCard unit={item} styles={styles} theme={theme} />
          )}
          ListHeaderComponent={
            error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="cloud-offline-outline" size={16} color="#FDE68A" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.stateTitle}>No units yet</Text>
              <Text style={styles.stateText}>
                This level does not have any unit data available right now.
              </Text>
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
      fontSize: 22,
      fontWeight: "900",
    },
    h2: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
    },
    hero: {
      borderRadius: 28,
      padding: theme.s(2.75),
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.14)"
          : "rgba(59,130,246,0.12)",
      marginBottom: theme.s(2.75),
      gap: theme.s(2.25),
      overflow: "hidden",
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.s(2),
    },
    heroEyebrow: {
      color: "#60A5FA",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "900",
      marginTop: 6,
      lineHeight: 34,
    },
    heroIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.48)" : "rgba(255,255,255,0.7)",
    },
    heroText: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#334155",
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "600",
    },
    statsRow: {
      flexDirection: "row",
      gap: theme.s(1.5),
    },
    statCard: {
      flex: 1,
      borderRadius: 18,
      paddingHorizontal: theme.s(1.5),
      paddingVertical: theme.s(1.75),
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.52)" : "rgba(255,255,255,0.78)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.42)"
          : "rgba(148,163,184,0.16)",
    },
    statValue: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
    },
    statLabel: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    listContent: {
      paddingBottom: theme.s(4),
    },
    cardPress: {
      overflow: "hidden",
      borderRadius: 24,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.88)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
      position: "relative",
    },
    cardPressLocked: {
      opacity: 0.62,
    },
    cardAccent: {
      height: 6,
      width: "100%",
    },
    cardSheen: {
      position: "absolute",
      top: 6,
      right: -30,
      width: 140,
      height: 120,
      borderRadius: 999,
      transform: [{ rotate: "18deg" }],
    },
    cardBody: {
      paddingHorizontal: theme.s(2),
      paddingVertical: theme.s(2.1),
      gap: theme.s(1.6),
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.s(1),
    },
    cardStateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1),
    },
    cardIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    statePill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
    },
    statePillText: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cardText: {
      gap: 7,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 24,
    },
    cardSubtitle: {
      color: "#93C5FD",
      fontSize: 13,
      fontWeight: "800",
    },
    cardDescription: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 19,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.s(1),
    },
    metaText: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1),
    },
    track: {
      height: 11,
      flex: 1,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.48)" : "rgba(226,232,240,0.9)",
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: "#60A5FA",
    },
    progressText: {
      minWidth: 38,
      textAlign: "right",
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "900",
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.s(1.5),
      paddingHorizontal: theme.s(3),
    },
    emptyState: {
      alignItems: "center",
      marginTop: theme.s(4),
      gap: theme.s(1.25),
      paddingHorizontal: theme.s(2),
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
