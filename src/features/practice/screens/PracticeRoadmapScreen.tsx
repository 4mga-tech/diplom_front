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
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const details = await practiceService.getPracticeById(practiceId);
      setStages(details.roadmap ?? []);
    } finally { setLoading(false); }
  }, [practiceId]);

  useEffect(() => { void load(); }, [load]);
  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#93C5FD" /></View></SafeAreaView>;

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}>
    <Pressable style={styles.back} onPress={() => router.replace("/(tabs)/achievements" as any)}><Ionicons name="chevron-back" size={16} color="#BFDBFE" /><Text style={styles.backT}>Back</Text></Pressable>
    <View style={styles.path}>
      {sortedStages.map((stage, index) => {
        const isCompleted = !!sortedStages[index + 1]?.isUnlocked;
        const isLocked = !stage.isUnlocked;
        const isActive = stage.isUnlocked && !isCompleted;
        return <View style={styles.row} key={stage.id}>
          {index !== sortedStages.length - 1 && <View style={[styles.link, isCompleted && styles.linkDone]} />}
          <Pressable
            disabled={isLocked}
            onPress={() => router.push(`/practice/${encodeURIComponent(practiceId)}/play?stageId=${encodeURIComponent(stage.id)}` as any)}
            style={[styles.node, isCompleted && styles.doneNode, isActive && styles.activeNode, isLocked && styles.lockNode]}
          >
            <Ionicons name={isLocked ? "lock-closed" : isCompleted ? "checkmark" : "play"} size={20} color="#fff" />
            <Text style={styles.stageNumber}>{index + 1}</Text>
          </Pressable>
        </View>;
      })}
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#071120" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40 },
  back: { alignSelf: "flex-start", flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "#0F1D34", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  backT: { color: "#BFDBFE", fontWeight: "800" },
  path: { marginTop: 16, alignItems: "center", gap: 18 },
  row: { alignItems: "center" },
  link: { width: 3, height: 34, backgroundColor: "#233758", position: "absolute", top: 84, borderRadius: 2 },
  linkDone: { backgroundColor: "#16A34A" },
  node: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#60A5FA", gap: 2 },
  activeNode: { shadowColor: "#38BDF8", shadowOpacity: 0.7, shadowRadius: 14, elevation: 8 },
  doneNode: { backgroundColor: "#16A34A", borderColor: "#86EFAC" },
  lockNode: { backgroundColor: "#334155", borderColor: "#475569" },
  stageNumber: { color: "#fff", fontWeight: "900" },
});
