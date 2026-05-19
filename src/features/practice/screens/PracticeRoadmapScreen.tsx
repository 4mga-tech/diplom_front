import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeRoadmapStage } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { practiceId: string };

export default function PracticeRoadmapScreen({ practiceId }: Props) {
  const router = useRouter();
  const [stages, setStages] = useState<PracticeRoadmapStage[]>([]);
  const [title, setTitle] = useState<string>("Practice Roadmap");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await practiceService.getPracticeById(practiceId);
      setTitle(details.title || "Practice Roadmap");
      setStages(details.roadmap ?? []);
    } catch (e) {
      console.log("Failed to load roadmap", e);
      setError("Could not load roadmap.");
      setStages([]);
    } finally {
      setLoading(false);
    }
  }, [practiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#4F46E5" /><Text style={styles.centerText}>Loading roadmap...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text><Pressable onPress={() => void load()} style={styles.retryButton}><Text style={styles.retryText}>Retry</Text></Pressable></View></SafeAreaView>;
  if (sortedStages.length === 0) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerTitle}>No roadmap yet</Text><Text style={styles.centerText}>This practice does not have stages configured.</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={16} color="#4338CA" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSub}>Follow the path and unlock each stage.</Text>
        </View>

        <View style={styles.pathWrap}>
          <View style={styles.centerLine} />
          {sortedStages.map((stage, index) => {
            const side = index % 2 === 0 ? "left" : "right";
            const isCompleted = stage.isUnlocked && index > 0 && sortedStages[index - 1]?.isUnlocked;
            const iconName: keyof typeof Ionicons.glyphMap = stage.isUnlocked ? (isCompleted ? "checkmark" : "play") : "lock-closed";

            return (
              <View key={stage.id} style={[styles.stageRow, side === "left" ? styles.stageLeft : styles.stageRight]}>
                <View style={[styles.stageCard, !stage.isUnlocked && styles.stageCardLocked]}>
                  <View style={styles.stageTopRow}>
                    <Text style={styles.stageTitle}>{stage.title}</Text>
                    <View style={styles.xpBadge}>
                      <Ionicons name="star" size={11} color="#B45309" />
                      <Text style={styles.xpText}>{stage.xpReward} XP</Text>
                    </View>
                  </View>
                  {!!stage.subtitle && <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>}
                </View>

                <Pressable
                  disabled={!stage.isUnlocked}
                  onPress={() => router.push(`/practice/${encodeURIComponent(practiceId)}/play?stageId=${encodeURIComponent(stage.id)}` as any)}
                  style={[styles.node, stage.isUnlocked ? styles.nodeUnlocked : styles.nodeLocked]}
                >
                  <Ionicons name={iconName} size={18} color={stage.isUnlocked ? "#FFFFFF" : "#9CA3AF"} />
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
  safeArea: { flex: 1, backgroundColor: "#F5F7FF" },
  content: { padding: 12, gap: 12, paddingBottom: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24 },
  centerTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  centerText: { textAlign: "center", color: "#4B5563" },
  retryButton: { borderRadius: 999, backgroundColor: "#E0E7FF", paddingHorizontal: 12, paddingVertical: 6 },
  retryText: { color: "#4338CA", fontWeight: "800" },

  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: "#E0E7FF", paddingHorizontal: 10, paddingVertical: 6 },
  backButtonText: { fontSize: 12, fontWeight: "800", color: "#4338CA" },
  hero: { borderRadius: 16, backgroundColor: "#312E81", padding: 14, gap: 4 },
  heroTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  heroSub: { color: "#C7D2FE", fontWeight: "700", fontSize: 13 },

  pathWrap: { position: "relative", paddingVertical: 8, gap: 14 },
  centerLine: { position: "absolute", top: 0, bottom: 0, left: "50%", width: 4, marginLeft: -2, borderRadius: 999, backgroundColor: "#D1D5DB" },
  stageRow: { minHeight: 92, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  stageLeft: { paddingRight: "50%" },
  stageRight: { paddingLeft: "50%", flexDirection: "row-reverse" },
  stageCard: { width: "88%", borderRadius: 14, padding: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C7D2FE" },
  stageCardLocked: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  stageTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  stageTitle: { flex: 1, fontWeight: "900", color: "#111827", fontSize: 14 },
  stageSubtitle: { marginTop: 5, color: "#6B7280", fontSize: 12, fontWeight: "600" },
  xpBadge: { borderRadius: 999, backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", gap: 3, alignItems: "center" },
  xpText: { fontSize: 11, fontWeight: "800", color: "#92400E" },
  node: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 3, position: "absolute", left: "50%", marginLeft: -21 },
  nodeUnlocked: { backgroundColor: "#4F46E5", borderColor: "#312E81" },
  nodeLocked: { backgroundColor: "#E5E7EB", borderColor: "#D1D5DB" },
});
