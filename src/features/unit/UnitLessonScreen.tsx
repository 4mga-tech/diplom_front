import { fetchUnitLessons, LessonListItem } from "@/lib/learning";
import { getLevelById, LevelId, Unit, UNITS } from "@/src/data/curriculum";
import { theme } from "@/src/ui/theme";
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

function LessonRow({
  lesson,
  levelId,
}: {
  lesson: LessonListItem;
  levelId: string;
}) {
  const locked = !lesson.isUnlocked;

  return (
    <Pressable
      disabled={locked}
      onPress={() => {
        router.push({
          pathname: "/lesson",
          params: {
            lessonId: lesson.id,
            unitId: lesson.unitId,
            levelId,
          },
        });
      }}
      style={({ pressed }) => [
        styles.lessonPress,
        pressed && !locked && { opacity: 0.92 },
        locked && { opacity: 0.5 },
      ]}
    >
      <LinearGradient
        colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
        style={styles.lessonCard}
      >
        <View style={styles.leftIcon}>
          {lesson.isCompleted ? (
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          ) : locked ? (
            <Ionicons name="lock-closed" size={18} color={theme.colors.muted} />
          ) : (
            <Ionicons name="play" size={18} color="white" />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonSub}>{lesson.subtitle}</Text>
        </View>

        <View style={styles.xpPill}>
          <Ionicons name="flash" size={14} color="#FACC15" />
          <Text style={styles.xpText}>{lesson.xpReward} XP</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function UnitLessonsScreen() {
  const { levelId, unitId } = useLocalSearchParams<{
    levelId?: string;
    unitId?: string;
  }>();
  const navigation = useNavigation();
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  if (!unitId || !levelId) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Invalid route</Text>
      </View>
    );
  }

  const safeUnitId = unitId as string;
  const safeLevelId = levelId as LevelId;

  const levelMeta = getLevelById(safeLevelId);
  if (!levelMeta) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Level not found</Text>
      </View>
    );
  }

  const unitMeta = useMemo<Unit | undefined>(
    () => UNITS.find((u) => u.id === safeUnitId),
    [safeUnitId],
  );

  const loadLessons = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const nextLessons = await fetchUnitLessons(safeUnitId);
        setLessons(nextLessons);
        setLoadError(null);
      } catch (error) {
        console.log("Error loading unit lessons:", error);
        setLoadError("We could not refresh lessons right now.");
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [safeUnitId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadLessons();
    }, [loadLessons]),
  );

  const progress = useMemo(() => {
    if (!lessons.length) return 0;
    const completed = lessons.filter((lesson) => lesson.isCompleted).length;
    return Math.round((completed / lessons.length) * 100);
  }, [lessons]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace({
      pathname: "/units/[levelId]",
      params: { levelId: safeLevelId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.muted} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>{unitMeta?.title ?? "Course Package"}</Text>
          <Text style={styles.h2}>
            {levelMeta.title} · {progress}% complete
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/review")}
          style={({ pressed }) => [
            styles.reviewBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="refresh" size={18} color="white" />
        </Pressable>
      </View>

      <LinearGradient
        colors={["rgba(124,58,237,0.14)", "rgba(37,99,235,0.12)"]}
        style={styles.banner}
      >
        <Ionicons name="sparkles" size={18} color="#A78BFA" />
        <Text style={styles.bannerText}>
          Start with the first unlocked lesson and the backend will unlock the next one for you.
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator color="white" />
          <Text style={styles.stateText}>Loading lessons...</Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(lesson) => lesson.id}
          contentContainerStyle={{ paddingBottom: theme.s(4) }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadLessons(true)}
              tintColor="white"
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: theme.s(1.5) }} />}
          renderItem={({ item }) => (
            <LessonRow lesson={item} levelId={safeLevelId} />
          )}
          ListHeaderComponent={
            loadError ? (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={16}
                  color="#FDE68A"
                />
                <Text style={styles.errorText}>{loadError}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ marginTop: theme.s(4), alignItems: "center" }}>
              <Text style={{ color: theme.colors.muted }}>
                No lessons available in this package yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(30,41,59,0.35)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
  },
  reviewBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.25)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  h1: { color: "white", fontSize: 18, fontWeight: "900" },
  h2: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(1),
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(2),
    marginBottom: theme.s(2.5),
  },
  bannerText: { color: "rgba(226,232,240,0.9)", fontWeight: "700", flex: 1 },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(1.5),
  },
  stateText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
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
  lessonPress: { width: "100%" },
  lessonCard: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(2),
    flexDirection: "row",
    gap: theme.s(1.5),
    alignItems: "center",
  },
  leftIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(51,65,85,0.25)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  lessonTitle: { color: "white", fontSize: 14, fontWeight: "900" },
  lessonSub: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(250,204,21,0.10)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.18)",
  },
  xpText: { color: "rgba(250,204,21,0.95)", fontWeight: "900", fontSize: 11 },
});
