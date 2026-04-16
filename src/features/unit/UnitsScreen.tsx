import { fetchUnitLessons } from "@/lib/learning";
import { getLevelById, LevelId } from "@/src/data/curriculum";
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

type UnitCardItem = {
  id: string;
  levelId: string;
  title: string;
  subtitle: string;
  lessonsCount: number;
  progress: number;
  gradient: [string, string];
  locked?: boolean;
};

type UnitSeedMeta = {
  id: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
};

const LEVEL_UNIT_CATALOG: Record<string, UnitSeedMeta[]> = {
  B1: [
    {
      id: "b1-u1",
      title: "Unit 1: Cyrillic Basics",
      subtitle: "Learn the first Cyrillic letters",
      gradient: ["#2563EB", "#06B6D4"],
    },
    {
      id: "b1-u2",
      title: "Unit 2: Vowels",
      subtitle: "Learn vowel groups and pronunciation",
      gradient: ["#2563EB", "#06B6D4"],
    },
    // {
    //   id: "b1-u3",
    //   title: "Unit 3: Coming Soon",
    //   subtitle: "This unit will be added next",
    //   gradient: ["#2563EB", "#06B6D4"],
    // },
  ],
  M1: [],
  M2: [],
  M3: [],
};

function UnitCard({
  unit,
  styles,
  theme,
}: {
  unit: UnitCardItem;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
}) {
  const locked = !!unit.locked;

  return (
    <Pressable
      disabled={locked}
      onPress={() =>
        router.push({
          pathname: "/units/[levelId]/[unitId]",
          params: { levelId: unit.levelId, unitId: unit.id },
        })
      }
      style={({ pressed }) => [
        styles.unitPress,
        pressed && !locked && { opacity: 0.92 },
        locked && { opacity: 0.5 },
      ]}
    >
      <LinearGradient
        colors={
          theme.mode === "dark"
            ? ["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]
            : ["#FFFFFF", "#F8FAFC"]
        }
        style={styles.unitCard}
      >
        <LinearGradient colors={unit.gradient} style={styles.unitIcon}>
          <Ionicons name="school" size={18} color="white" />
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={styles.unitTitle}>{unit.title}</Text>
          <Text style={styles.unitSub}>{unit.subtitle}</Text>

          <View style={{ height: theme.s(1.25) }} />

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{unit.progress}%</Text>
            <Text style={styles.progressText}>{unit.lessonsCount} lessons</Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.max(0, Math.min(100, unit.progress))}%` },
              ]}
            />
          </View>
        </View>

        {locked ? (
          <View style={styles.rightIcon}>
            <Ionicons name="lock-closed" size={18} color={theme.colors.muted} />
          </View>
        ) : (
          <View style={styles.rightIcon}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.muted}
            />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export default function UnitsScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { levelId } = useLocalSearchParams<{ levelId?: string }>();

  const safeLevelId = (levelId ?? "B1") as LevelId;
  const levelMeta = getLevelById(safeLevelId);

  const [units, setUnits] = useState<UnitCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const buildUnitsForLevel = useCallback(async (): Promise<UnitCardItem[]> => {
    const catalog = LEVEL_UNIT_CATALOG[safeLevelId] ?? [];
    if (!catalog.length) return [];

    const lessonResults = await Promise.all(
      catalog.map(async (unitMeta, index) => {
        try {
          const lessons = await fetchUnitLessons(unitMeta.id);

          const completedCount = lessons.filter(
            (lesson) => lesson.isCompleted,
          ).length;

          const unlocked =
            index === 0
              ? true
              : lessons.length === 0
                ? false
                : lessons.some((lesson) => lesson.isUnlocked);

          return {
            id: unitMeta.id,
            levelId: safeLevelId,
            title: unitMeta.title,
            subtitle: unitMeta.subtitle,
            lessonsCount: lessons.length,
            progress:
              lessons.length > 0
                ? Math.round((completedCount / lessons.length) * 100)
                : 0,
            gradient: unitMeta.gradient,
            locked: !unlocked,
          } satisfies UnitCardItem;
        } catch (error) {
          console.log(`Error loading unit ${unitMeta.id}:`, error);

          return {
            id: unitMeta.id,
            levelId: safeLevelId,
            title: unitMeta.title,
            subtitle: unitMeta.subtitle,
            lessonsCount: 0,
            progress: 0,
            gradient: unitMeta.gradient,
            locked: index !== 0,
          } satisfies UnitCardItem;
        }
      }),
    );

    return lessonResults;
  }, [safeLevelId]);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const nextUnits = await buildUnitsForLevel();
      setUnits(nextUnits);
    } catch (error) {
      console.log("Error loading units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [buildUnitsForLevel]);

  useFocusEffect(
    useCallback(() => {
      void loadUnits();
    }, [loadUnits]),
  );

  const totalProgress = useMemo(() => {
    if (!units.length) return 0;
    return Math.round(
      units.reduce((sum, unit) => sum + unit.progress, 0) / units.length,
    );
  }, [units]);

  if (!levelMeta) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>Level not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.muted} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>{levelMeta.title}</Text>
          <Text style={styles.h2}>{levelMeta.subtitle}</Text>
        </View>

        <View style={{ width: 44, height: 44 }} />
      </View>

      <LinearGradient
        colors={["rgba(37,99,235,0.18)", "rgba(124,58,237,0.12)"]}
        style={styles.banner}
      >
        <View style={styles.bannerTop}>
          <Ionicons name="sparkles" size={18} color="#A78BFA" />
          <Text style={styles.bannerText}>
            Choose a package and continue with the lessons you have unlocked.
          </Text>
        </View>
        <Text style={styles.bannerSub}>{totalProgress}% overall complete</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={theme.colors.text} />
          <Text style={styles.loadingText}>Loading units...</Text>
        </View>
      ) : (
        <FlatList
          data={units}
          keyExtractor={(unit) => unit.id}
          contentContainerStyle={{ paddingBottom: theme.s(4) }}
          ItemSeparatorComponent={() => <View style={{ height: theme.s(2) }} />}
          renderItem={({ item }) => (
            <UnitCard unit={item} styles={styles} theme={theme} />
          )}
          ListEmptyComponent={
            <View style={{ marginTop: theme.s(4), alignItems: "center" }}>
              <Text style={{ color: theme.colors.muted }}>
                No packages available for this level yet
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
      marginBottom: theme.s(2),
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(30,41,59,0.35)" : "#FFFFFF",
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
      borderRadius: theme.r.xl,
      borderWidth: 1,
      borderColor: "rgba(51,65,85,0.55)",
      padding: theme.s(2),
      marginBottom: theme.s(2.5),
    },
    bannerTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1),
      marginBottom: theme.s(1.5),
    },
    bannerText: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.9)" : "#334155",
      fontWeight: "700",
      flex: 1,
    },
    bannerSub: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
    },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.s(1.5),
    },
    loadingText: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "700",
    },
    unitPress: { width: "100%" },
    unitCard: {
      borderRadius: theme.r.xl,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
      padding: theme.s(2),
      flexDirection: "row",
      gap: theme.s(1.5),
      alignItems: "center",
    },
    unitIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    unitTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "900" },
    unitSub: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
    },
    progressRow: { flexDirection: "row", justifyContent: "space-between" },
    progressText: {
      color: "rgba(148,163,184,0.85)",
      fontSize: 11,
      fontWeight: "800",
    },
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: "rgba(148,163,184,0.15)",
      overflow: "hidden",
      marginTop: 8,
    },
    fill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.8)" : "#4F46E5",
    },
    rightIcon: { width: 28, alignItems: "flex-end" },
  });
