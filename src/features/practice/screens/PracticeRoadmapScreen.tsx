import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeRoadmapStage } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { practiceId: string };

export default function PracticeRoadmapScreen({ practiceId }: Props) {
  const router = useRouter();
  const [stages, setStages] = useState<PracticeRoadmapStage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const details = await practiceService.getPracticeById(practiceId);
      setStages(details.roadmap ?? []);
    } finally {
      setLoading(false);
    }
  }, [practiceId]);

  useEffect(() => { void load(); }, [load]);

  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

  if (loading) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#93C5FD" /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbBottom} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.back} onPress={() => router.replace("/(tabs)/achievements" as any)}>
          <Ionicons name="chevron-back" size={16} color="#BFDBFE" />
          <Text style={styles.backT}>Practice hub</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Roadmap</Text>
          <Text style={styles.title}>Conversation path</Text>
          <Text style={styles.subtitle}>Complete each node to unlock the next lesson stage.</Text>
        </View>

        <View style={styles.path}>
          {sortedStages.map((stage, index) => {
            const isCompleted = !!sortedStages[index + 1]?.isUnlocked;
            const isLocked = !stage.isUnlocked;
            const isActive = stage.isUnlocked && !isCompleted;

            return (
              <View key={stage.id} style={styles.row}>
                {index !== sortedStages.length - 1 && (
                  <View style={[styles.link, isCompleted && styles.linkDone, isLocked && styles.linkLocked]} />
                )}
                <Pressable
                  disabled={isLocked}
                  onPress={() => router.push(`/practice/${encodeURIComponent(practiceId)}/play?stageId=${encodeURIComponent(stage.id)}` as any)}
                  style={({ pressed }) => [styles.nodeShell, pressed && !isLocked && styles.pressed]}
                >
                  <LinearGradient
                    colors={
                      isLocked
                        ? ["#283548", "#1B2638"]
                        : isCompleted
                          ? ["#0F766E", "#125D56"]
                          : ["#1D4ED8", "#243B88"]
                    }
                    style={[styles.node, isActive && styles.activeNode]}
                  >
                    <Ionicons name={isLocked ? "lock-closed" : isCompleted ? "checkmark" : "play"} size={18} color="#F8FAFC" />
                    <Text style={styles.stageNumber}>Stage {index + 1}</Text>
                    <Text style={styles.stageStatus}>{isLocked ? "Locked" : isCompleted ? "Complete" : "Start"}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050C1A" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 44 },
  bgOrbTop: { position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(56,189,248,0.16)" },
  bgOrbBottom: { position: "absolute", bottom: -120, left: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(168,85,247,0.12)" },
  back: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(16,28,49,0.88)", borderWidth: 1, borderColor: "rgba(104,130,172,0.34)" },
  backT: { color: "#BFDBFE", fontWeight: "700", fontSize: 12 },
  header: { marginTop: 14, marginBottom: 18, gap: 5 },
  eyebrow: { color: "#9FB4DA", fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", fontSize: 11 },
  title: { color: "#F8FAFC", fontSize: 24, fontWeight: "900" },
  subtitle: { color: "#9DB1D6", fontSize: 12, fontWeight: "500" },
  path: { alignItems: "center", gap: 12, paddingBottom: 10 },
  row: { alignItems: "center", minHeight: 130 },
  link: { position: "absolute", top: 100, width: 2, height: 48, borderRadius: 2, backgroundColor: "rgba(88,113,151,0.5)" },
  linkDone: { backgroundColor: "rgba(45,212,191,0.9)" },
  linkLocked: { backgroundColor: "rgba(88,113,151,0.3)" },
  nodeShell: { borderRadius: 22, overflow: "hidden", shadowColor: "#0EA5E9", shadowOpacity: 0.3, shadowRadius: 12, elevation: 7 },
  node: { width: 170, borderRadius: 22, borderWidth: 1, borderColor: "rgba(153,185,245,0.32)", paddingVertical: 14, paddingHorizontal: 16, alignItems: "center", gap: 4 },
  activeNode: { borderColor: "rgba(125,211,252,0.75)", shadowColor: "#7DD3FC", shadowOpacity: 0.45, shadowRadius: 16 },
  stageNumber: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  stageStatus: { color: "#DCEBFF", fontSize: 11, fontWeight: "600" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});
