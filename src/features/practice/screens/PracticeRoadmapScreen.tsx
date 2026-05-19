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

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#22C55E" /><Text style={styles.centerText}>Loading roadmap...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text><Pressable onPress={() => void load()} style={styles.retryButton}><Text style={styles.retryText}>Retry</Text></Pressable></View></SafeAreaView>;
  if (sortedStages.length === 0) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerTitle}>No roadmap yet</Text><Text style={styles.centerText}>This practice does not have stages configured.</Text></View></SafeAreaView>;

  const currentPlayableIndex = sortedStages.findIndex((stage, index) => {
    if (!stage.isUnlocked) return false;
    return !sortedStages[index + 1]?.isUnlocked;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={16} color="#BBF7D0" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="barbell" size={30} color="#FFFFFF" />
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSub}>Level up by clearing each node.</Text>
          </View>
          <View style={styles.heroChip}>
            <Ionicons name="flash" size={12} color="#F97316" />
            <Text style={styles.heroChipText}>Daily XP</Text>
          </View>
        </View>

        <View style={styles.pathWrap}>
          <View style={styles.centerLine} />
          {sortedStages.map((stage, index) => {
            const isLeft = index % 2 === 0;
            const isCompleted = !!sortedStages[index + 1]?.isUnlocked;
            const isCurrent = index === currentPlayableIndex;
            const isLocked = !stage.isUnlocked;
            const stageColor = isCompleted ? "#16A34A" : isCurrent ? "#2563EB" : "#7C3AED";

            const iconName: keyof typeof Ionicons.glyphMap = isLocked
              ? "lock-closed"
              : isCompleted
                ? "checkmark"
                : "play";

            return (
              <View key={stage.id} style={styles.stageRow}>
                <View style={[styles.labelWrap, isLeft ? styles.labelLeft : styles.labelRight]}>
                  <Text style={styles.stageLabel}>Stage {index + 1}</Text>
                  <Text numberOfLines={1} style={[styles.stageTitle, isLocked && styles.stageTitleLocked]}>{stage.title}</Text>
                  <View style={[styles.xpBadge, isLocked && styles.xpBadgeLocked]}>
                    <Ionicons name="star" size={10} color={isLocked ? "#94A3B8" : "#FDBA74"} />
                    <Text style={[styles.xpText, isLocked && styles.xpTextLocked]}>{stage.xpReward} XP</Text>
                  </View>
                </View>

                <Pressable
                  disabled={isLocked}
                  onPress={() => router.push(`/practice/${encodeURIComponent(practiceId)}/play?stageId=${encodeURIComponent(stage.id)}` as any)}
                  style={({ pressed }) => [
                    styles.node,
                    isLeft ? styles.nodeLeft : styles.nodeRight,
                    isLocked && styles.nodeLocked,
                    !isLocked && { backgroundColor: stageColor },
                    isCurrent && styles.nodeCurrent,
                    pressed && !isLocked && styles.nodePressed,
                  ]}
                >
                  {!isLocked && !isCompleted && <Text style={styles.nodeNumber}>{index + 1}</Text>}
                  {(isLocked || isCompleted) && <Ionicons name={iconName} size={24} color="#FFFFFF" />}
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
  safeArea: { flex: 1, backgroundColor: "#0F172A" },
  content: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 36, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24 },
  centerTitle: { fontSize: 16, fontWeight: "800", color: "#E2E8F0" },
  centerText: { textAlign: "center", color: "#94A3B8" },
  retryButton: { borderRadius: 999, backgroundColor: "#1E293B", paddingHorizontal: 12, paddingVertical: 6 },
  retryText: { color: "#E2E8F0", fontWeight: "800" },

  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: "#1E293B", paddingHorizontal: 10, paddingVertical: 6 },
  backButtonText: { fontSize: 12, fontWeight: "800", color: "#DCFCE7" },

  hero: { borderRadius: 18, backgroundColor: "#1D4ED8", padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  heroIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#93C5FD" },
  heroBody: { flex: 1, gap: 2 },
  heroTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  heroSub: { color: "#DBEAFE", fontWeight: "700", fontSize: 12 },
  heroChip: { borderRadius: 999, backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 4 },
  heroChipText: { color: "#1E40AF", fontSize: 10, fontWeight: "900" },

  pathWrap: { position: "relative", paddingVertical: 6 },
  centerLine: { position: "absolute", top: 0, bottom: 0, left: "50%", width: 6, marginLeft: -3, borderRadius: 999, backgroundColor: "#334155" },
  stageRow: { minHeight: 138, justifyContent: "center", position: "relative" },

  node: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#F8FAFC",
    position: "absolute",
    top: "50%",
    marginTop: -42,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  nodeLeft: { left: "50%", marginLeft: -104 },
  nodeRight: { left: "50%", marginLeft: 20 },
  nodeLocked: { backgroundColor: "#334155", borderColor: "#475569" },
  nodeCurrent: { shadowColor: "#22C55E", shadowOpacity: 0.6, shadowRadius: 14, elevation: 10, borderColor: "#BBF7D0" },
  nodePressed: { transform: [{ scale: 0.96 }] },
  nodeNumber: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },

  labelWrap: { position: "absolute", width: 126, gap: 3 },
  labelLeft: { right: "50%", marginRight: 62, alignItems: "flex-end" },
  labelRight: { left: "50%", marginLeft: 62, alignItems: "flex-start" },
  stageLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
  stageTitle: { fontSize: 13, fontWeight: "900", color: "#E2E8F0" },
  stageTitleLocked: { color: "#64748B" },
  xpBadge: { borderRadius: 999, backgroundColor: "#1E293B", paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", gap: 4, alignItems: "center" },
  xpBadgeLocked: { backgroundColor: "#1F2937" },
  xpText: { fontSize: 10, fontWeight: "800", color: "#FED7AA" },
  xpTextLocked: { color: "#94A3B8" },
});
