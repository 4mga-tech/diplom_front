import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeRoadmapStage } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { practiceId: string };

export default function PracticeRoadmapScreen({ practiceId }: Props) {
  const router = useRouter();
  const [stages, setStages] = useState<PracticeRoadmapStage[]>([]);
  const [loading, setLoading] = useState(true);
  const pulse = useRef(new Animated.Value(0)).current;
  const chestBob = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const details = await practiceService.getPracticeById(practiceId);
      setStages(details.roadmap ?? []);
    } finally {
      setLoading(false);
    }
  }, [practiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 950, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 950, useNativeDriver: true }),
      ])
    );

    const chestLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chestBob, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(chestBob, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );

    pulseLoop.start();
    chestLoop.start();

    return () => {
      pulseLoop.stop();
      chestLoop.stop();
    };
  }, [chestBob, pulse]);

  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
  const completedCount = useMemo(
    () => sortedStages.filter((_, index) => !!sortedStages[index + 1]?.isUnlocked).length,
    [sortedStages]
  );
  const totalXp = useMemo(
    () => sortedStages.reduce((sum, stage) => sum + (stage.xpReward ?? 0), 0),
    [sortedStages]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color="#A78BFA" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#070B1A", "#0F1230", "#171236"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbMid} />
      <View style={styles.bgOrbBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable style={styles.back} onPress={() => router.replace("/(tabs)/achievements" as any)}>
            <Ionicons name="chevron-back" size={16} color="#DDD6FE" />
            <Text style={styles.backT}>Practice hub</Text>
          </Pressable>
          <View style={styles.summaryPill}>
            <Ionicons name="sparkles" size={12} color="#FDE68A" />
            <Text style={styles.summaryText}>{completedCount}/{sortedStages.length} complete</Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Roadmap</Text>
          <Text style={styles.title}>Conversation Quest</Text>
          <Text style={styles.subtitle}>Follow the path, clear stages, and keep your momentum going.</Text>
          <View style={styles.xpBadge}>
            <Ionicons name="trophy" size={12} color="#FCD34D" />
            <Text style={styles.xpText}>{totalXp} XP total</Text>
          </View>
        </View>

        <View style={styles.path}>
          {sortedStages.map((stage, index) => {
            const isCompleted = !!sortedStages[index + 1]?.isUnlocked;
            const isLocked = !stage.isUnlocked;
            const isActive = stage.isUnlocked && !isCompleted;
            const isSpecial = (index + 1) % 4 === 0;
            const alignLeft = index % 2 === 0;

            const activeScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
            const activeGlow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.95] });
            const chestTranslate = chestBob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

            return (
              <View key={stage.id} style={styles.stageWrap}>
                {index !== 0 && (
                  <View
                    style={[
                      styles.connector,
                      alignLeft ? styles.connectorFromRight : styles.connectorFromLeft,
                      isLocked && styles.connectorLocked,
                    ]}
                  />
                )}

                <View style={[styles.stageRow, alignLeft ? styles.leftAlign : styles.rightAlign]}>
                  <Pressable
                    disabled={isLocked}
                    onPress={() =>
                      router.push(
                        `/practice/${encodeURIComponent(practiceId)}/play?stageId=${encodeURIComponent(stage.id)}` as any
                      )
                    }
                    style={({ pressed }) => [styles.nodeShell, pressed && !isLocked && styles.pressed]}
                  >
                    <Animated.View
                      style={[
                        styles.nodeGlow,
                        isCompleted && styles.glowCompleted,
                        isLocked && styles.glowLocked,
                        isActive && { opacity: activeGlow, transform: [{ scale: activeScale }] },
                      ]}
                    />
                    <LinearGradient
                      colors={
                        isLocked
                          ? ["#293145", "#1A2031"]
                          : isCompleted
                            ? ["#10B981", "#6D28D9"]
                            : ["#6366F1", "#7C3AED"]
                      }
                      style={[styles.node, isActive && styles.activeNode, isLocked && styles.lockedNode]}
                    >
                      {isSpecial ? (
                        <Animated.View style={isActive ? { transform: [{ translateY: chestTranslate }] } : undefined}>
                          <Ionicons
                            name={isLocked ? "lock-closed" : "gift"}
                            size={26}
                            color={isLocked ? "#94A3B8" : "#FDE68A"}
                          />
                        </Animated.View>
                      ) : (
                        <Ionicons
                          name={isLocked ? "lock-closed" : isCompleted ? "checkmark" : "play"}
                          size={26}
                          color="#F8FAFC"
                        />
                      )}
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.metaBlock}>
                    <Text style={[styles.stageTitle, isLocked && styles.lockedText]}>
                      {stage.title || `Stage ${index + 1}`}
                    </Text>
                    {stage.subtitle ? (
  <Text style={[styles.stageTranslation, isLocked && styles.lockedText]}>
    {stage.subtitle}
  </Text>
) : null}
                    <View style={styles.rewardRow}>
                      <Ionicons name="flash" size={12} color={isLocked ? "#64748B" : "#FDE68A"} />
                      <Text style={[styles.rewardText, isLocked && styles.lockedText]}>
                        {stage.xpReward ?? 0} XP reward
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050816" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 },
  bgOrbTop: {
    position: "absolute",
    top: -70,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(168,85,247,0.20)",
  },
  bgOrbMid: {
    position: "absolute",
    top: "36%",
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(99,102,241,0.18)",
  },
  bgOrbBottom: {
    position: "absolute",
    bottom: -120,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(45,212,191,0.12)",
  },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(18,24,45,0.9)",
    borderWidth: 1,
    borderColor: "rgba(192,132,252,0.35)",
  },
  backT: { color: "#DDD6FE", fontWeight: "700", fontSize: 12 },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(36,24,56,0.9)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.35)",
  },
  summaryText: { color: "#F5EBDD", fontWeight: "700", fontSize: 11 },
  header: { marginTop: 14, marginBottom: 18, gap: 6 },
  eyebrow: { color: "#C4B5FD", fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", fontSize: 11 },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "900" },
  subtitle: { color: "#C7D2FE", fontSize: 12, fontWeight: "600", maxWidth: "90%" },
  xpBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(30,41,59,0.85)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.45)",
  },
  xpText: { color: "#FEF3C7", fontWeight: "800", fontSize: 11 },
  path: { paddingTop: 8, paddingBottom: 16 },
  stageWrap: { minHeight: 138, justifyContent: "center" },
  connector: {
    position: "absolute",
    top: -20,
    width: 110,
    height: 56,
    borderBottomWidth: 3,
    borderColor: "rgba(125,211,252,0.55)",
    borderRadius: 100,
  },
  stageTranslation: {
  color: "#94A3B8",
  fontSize: 11,
  fontWeight: "600",
  marginTop: -2,
},
  connectorFromLeft: { left: 78, transform: [{ rotate: "14deg" }] },
  connectorFromRight: { right: 78, transform: [{ rotate: "-14deg" }] },
  connectorLocked: { borderColor: "rgba(100,116,139,0.45)" },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  leftAlign: { alignSelf: "flex-start" },
  rightAlign: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  nodeShell: { width: 90, height: 90, alignItems: "center", justifyContent: "center" },
  nodeGlow: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(129,140,248,0.35)",
  },
  glowCompleted: { backgroundColor: "rgba(52,211,153,0.35)" },
  glowLocked: { backgroundColor: "rgba(71,85,105,0.20)" },
  node: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(224,231,255,0.85)",
    shadowColor: "#818CF8",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  activeNode: { borderColor: "#F5F3FF", shadowOpacity: 0.8, shadowRadius: 24, elevation: 12 },
  lockedNode: { borderColor: "rgba(148,163,184,0.45)", shadowOpacity: 0.12 },
  metaBlock: { maxWidth: 176, gap: 4 },
  stageTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  stageSubtitle: { color: "#C4B5FD", fontSize: 12, fontWeight: "600" },
  rewardRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rewardText: { color: "#FDE68A", fontSize: 11, fontWeight: "700" },
  lockedText: { color: "#7C8AA2" },
  pressed: { transform: [{ scale: 0.96 }] },
});
