import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPE_UI: Record<string, { label: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; border: string; iconBg: string }> = {
  missing_letter: { label: "Missing Letter", subtitle: "Fill the gap", icon: "create-outline", border: "#8B5CF6", iconBg: "#F3E8FF" },
  letter_match: { label: "Letter Match", subtitle: "Find pairs", icon: "git-compare-outline", border: "#F43F5E", iconBg: "#FFE4E6" },
  word_builder: { label: "Word Builder", subtitle: "Build words", icon: "cube-outline", border: "#F59E0B", iconBg: "#FEF3C7" },
  meaning_match: { label: "Meaning Match", subtitle: "Match meaning", icon: "layers-outline", border: "#22C55E", iconBg: "#DCFCE7" },
  daily_challenge: { label: "Daily Challenge", subtitle: "Daily boost", icon: "flash-outline", border: "#3B82F6", iconBg: "#DBEAFE" },
};

export default function PracticeLevelScreen({ levelId }: { levelId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<PracticeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedLevel = levelId.toUpperCase();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const practices = await practiceService.getPractices();
      setItems(practices.filter((item) => (item.levelId ?? "").toUpperCase() === normalizedLevel));
    } catch (e) {
      console.log("Failed to load level practices", e);
      setError("Could not load level activities.");
    } finally {
      setLoading(false);
    }
  }, [normalizedLevel]);

  useEffect(() => { void load(); }, [load]);

  const sorted = useMemo(() => [...items].sort((a, b) => (a.type ?? "").localeCompare(b.type ?? "")), [items]);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#4F46E5" /><Text style={styles.centerText}>Loading practices...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text><Pressable onPress={() => void load()} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></Pressable></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/achievements')}>
          <Ionicons name="chevron-back" size={16} color="#334155" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Level {normalizedLevel}</Text>
          <Text style={styles.heroTitle}>Practice Categories</Text>
          <Text style={styles.heroSub}>Tap a card to open the roadmap.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{normalizedLevel}</Text>
          <View style={styles.countChip}><Text style={styles.countChipText}>{sorted.length}</Text></View>
        </View>

        <View style={styles.grid}>
          {sorted.map((item) => {
            const ui = TYPE_UI[item.type ?? ""] ?? { label: item.title, subtitle: "Practice", icon: "game-controller-outline" as const, border: "#6366F1", iconBg: "#E0E7FF" };
            return (
              <Pressable key={item.id} style={styles.cardWrap} onPress={() => router.push(`/practice/${encodeURIComponent(item.id)}/roadmap` as any)}>
                <View style={[styles.squareCard, { borderColor: ui.border }]}>
                  <View style={[styles.iconBubble, { backgroundColor: ui.iconBg }]}><Ionicons name={ui.icon} size={28} color={ui.border} /></View>
                </View>
                <Text numberOfLines={1} style={styles.cardTitle}>{ui.label}</Text>
                <Text numberOfLines={1} style={styles.cardSubtitle}>{ui.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  centerText: { color: '#4B5563' },
  retryButton: { marginTop: 8, borderRadius: 12, backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 6 },
  backButtonText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  hero: { borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', padding: 12, gap: 4 },
  heroEyebrow: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  heroSub: { fontSize: 12, color: '#64748B' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  countChip: { minWidth: 30, borderRadius: 999, backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  countChipText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cardWrap: { width: '30.5%' },
  squareCard: { aspectRatio: 1, borderRadius: 14, borderWidth: 2, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  iconBubble: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { marginTop: 7, fontSize: 12, fontWeight: '700', color: '#1E293B' },
  cardSubtitle: { marginTop: 2, fontSize: 10, color: '#64748B' },
});
