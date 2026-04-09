import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getLevelById, LevelId, Unit, UNITS } from "@/src/data/curriculum";
import { theme } from "@/src/ui/theme";

function UnitCard({ unit }: { unit: Unit }) {
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
        colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
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
            <Text style={styles.progressText}>{unit.lessonsCount} lesson</Text>
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
  const { levelId } = useLocalSearchParams<{ levelId?: string }>();

  const safeLevelId = (levelId ?? "B1") as LevelId;
  const levelMeta = getLevelById(safeLevelId);

  const units = useMemo(() => {
    return UNITS.filter((u) => u.levelId === safeLevelId);
  }, [safeLevelId]);

  if (!levelMeta) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Level not found</Text>
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
            Choose a package to start your lesson
          </Text>
        </View>

        {/* <Pressable
          disabled={!levelMeta.vocabularyReady}
          onPress={() =>
            router.push({
              pathname: "/vocabulary/[levelId]",
              params: { levelId: levelMeta.id },
            })
          }
          style={[
            styles.vocabBtn,
            !levelMeta.vocabularyReady && { opacity: 0.5 },
          ]}
        >
          <Ionicons name="library-outline" size={18} color="white" />
          <View style={{ flex: 1 }}>
            <Text style={styles.vocabBtnTitle}>View vocabulary</Text>
            <Text style={styles.vocabBtnSub}>
              {levelMeta.vocabularyReady
                ? `Total ${levelMeta.vocabularyCount} words`
                : "empty"}
            </Text>
          </View>
        </Pressable> */}
      </LinearGradient>

      <FlatList
        data={units}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingBottom: theme.s(4) }}
        ItemSeparatorComponent={() => <View style={{ height: theme.s(2) }} />}
        renderItem={({ item }) => <UnitCard unit={item} />}
        ListEmptyComponent={
          <View style={{ marginTop: theme.s(4), alignItems: "center" }}>
            <Text style={{ color: theme.colors.muted }}>
              No packages available for this level yet
            </Text>
          </View>
        }
      />
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
  h1: { color: "white", fontSize: 20, fontWeight: "900" },
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
    color: "rgba(226,232,240,0.9)",
    fontWeight: "700",
  },
  unitPress: { width: "100%" },
  unitCard: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
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
  unitTitle: { color: "white", fontSize: 15, fontWeight: "900" },
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
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  rightIcon: { width: 28, alignItems: "flex-end" },
  vocabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(1.5),
    padding: theme.s(2),
    borderRadius: theme.r.xl,
    backgroundColor: "rgba(124,58,237,0.18)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
  },
  vocabBtnTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  vocabBtnSub: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
});
