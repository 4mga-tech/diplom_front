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
  completed: "Done",
  in_progress: "Active",
  unlocked: "Open",
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
  const stateColor =
    progressState === "completed" ? "#22C55E"
      : progressState === "locked" ? theme.colors.muted
        : "#60A5FA";

  const stateIcon =
    progressState === "completed" ? "checkmark-circle"
      : progressState === "locked" ? "lock-closed"
        : progressState === "in_progress" ? "play-circle"
          : "ellipse-outline";

  return (
    <Pressable
      disabled={!unit.isUnlocked}
      onPress={() => router.replace(getUnitRoute(unit.levelId, unit.id))}
      style={({ pressed }) => [
        styles.cardPress,
        pressed && unit.isUnlocked && { opacity: 0.88 },
        !unit.isUnlocked && styles.cardPressLocked,
      ]}
    >
      <View style={[styles.cardAccentBar, { backgroundColor: stateColor }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Ionicons name={stateIcon} size={14} color={stateColor} />
          <Text style={[styles.cardStateText, { color: stateColor }]}>
            {UNIT_STATE_LABELS[progressState]}
          </Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {unit.title}
        </Text>
        {!!unit.subtitle ? (
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {unit.subtitle}
          </Text>
        ) : null}

        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${unit.progress}%`, backgroundColor: stateColor },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{unit.progress}%</Text>
        </View>

        <Text style={styles.metaText}>
          {unit.completedLessonsCount}/{unit.lessonsCount} lessons
        </Text>
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
    () => units.reduce((sum, u) => sum + u.lessonsCount, 0),
    [units],
  );
  const completedLessons = useMemo(
    () => units.reduce((sum, u) => sum + u.completedLessonsCount, 0),
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>{levelMeta.title}</Text>
          {levelMeta.description ? (
            <Text style={styles.h2}>{levelMeta.description}</Text>
          ) : null}
        </View>
      </View>

      {/* Hero */}
      <LinearGradient
        colors={
          theme.mode === "dark"
            ? ["rgba(37,99,235,0.22)", "rgba(14,165,233,0.08)"]
            : ["rgba(37,99,235,0.12)", "rgba(14,165,233,0.04)"]
        }
        style={styles.hero}
      >
        <View style={styles.heroInner}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.heroEyebrow}>Level track</Text>
            <Text style={styles.heroTitle}>{levelMeta.title}</Text>
          </View>
          <View style={styles.heroIconWrap}>
            <Ionicons name="layers-outline" size={20} color="#60A5FA" />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{units.length}</Text>
            <Text style={styles.statLabel}>Units</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedLessons}/{totalLessons}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallProgress}%</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.heroTrack}>
          <View style={[styles.heroFill, { width: `${overallProgress}%` }]} />
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <ActivityIndicator color={theme.colors.text} />
            </View>
            <Text style={styles.stateTitle}>Loading…</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={units}
          keyExtractor={(u) => u.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
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

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1.5),
      marginBottom: theme.s(1.75),
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.55)" : "rgba(148,163,184,0.18)",
    },
    h1: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },
    h2: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
    },

    // Hero
    hero: {
      borderRadius: 20,
      padding: theme.s(2),
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.14)"
          : "rgba(59,130,246,0.12)",
      marginBottom: theme.s(1.75),
      gap: theme.s(1.25),
      overflow: "hidden",
    },
    heroInner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.s(1),
    },
    heroEyebrow: {
      color: "#60A5FA",
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      lineHeight: 28,
    },
    heroIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.18)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(96,165,250,0.2)" : "rgba(59,130,246,0.14)",
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.45)" : "rgba(255,255,255,0.65)",
      borderRadius: 12,
      paddingVertical: theme.s(1),
      paddingHorizontal: theme.s(1.25),
    },
    statItem: {
      flex: 1,
      alignItems: "center",
      gap: 3,
    },
    statValue: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
    },
    statLabel: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.6)" : "rgba(148,163,184,0.25)",
    },
    heroTrack: {
      height: 3,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.5)" : "rgba(226,232,240,0.9)",
      overflow: "hidden",
    },
    heroFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: "#60A5FA",
    },

    // Grid
    row: {
      gap: theme.s(1),
      marginBottom: theme.s(1),
    },
    listContent: {
      paddingBottom: theme.s(4),
    },

    // Unit card
    cardPress: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.84)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.52)" : "rgba(148,163,184,0.18)",
    },
    cardPressLocked: {
      opacity: 0.5,
    },
    cardAccentBar: {
      height: 3,
      width: "100%",
    },
    cardBody: {
      padding: theme.s(1.5),
      gap: theme.s(0.75),
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    cardStateText: {
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "800",
      lineHeight: 17,
    },
    cardSubtitle: {
      color: theme.colors.muted,
      fontSize: 11,
      lineHeight: 15,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(0.5),
    },
    track: {
      flex: 1,
      height: 3,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.48)" : "rgba(226,232,240,0.9)",
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 999,
    },
    progressText: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "800",
      minWidth: 28,
      textAlign: "right",
    },
    metaText: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "700",
    },

    // States
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
      borderRadius: 20,
      padding: theme.s(3),
      alignItems: "center",
      gap: theme.s(1.25),
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.84)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.52)" : "rgba(148,163,184,0.18)",
    },
    stateIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.16)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(96,165,250,0.2)" : "rgba(59,130,246,0.14)",
    },
    stateTitle: {
      color: theme.colors.text,
      fontSize: 18,
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
      borderRadius: 12,
      marginBottom: theme.s(1.5),
    },
    errorText: {
      color: "#FDE68A",
      fontSize: 12,
      fontWeight: "700",
      flex: 1,
    },
  });