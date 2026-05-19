import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPE_UI: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; dark: string }> = {
  missing_letter: { label: "Missing Letter", icon: "create-outline", color: "#7C3AED", bg: "#F3E8FF", dark: "#4C1D95" },
  letter_match: { label: "Letter Match", icon: "grid-outline", color: "#2563EB", bg: "#DBEAFE", dark: "#1E3A8A" },
  word_builder: { label: "Word Builder", icon: "cube-outline", color: "#0891B2", bg: "#CFFAFE", dark: "#164E63" },
  meaning_match: { label: "Meaning Match", icon: "layers-outline", color: "#16A34A", bg: "#DCFCE7", dark: "#14532D" },
  daily_challenge: { label: "Daily Challenge", icon: "flash-outline", color: "#EA580C", bg: "#FFEDD5", dark: "#7C2D12" },
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
  if (error) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.centerText}>{error}</Text><Pressable onPress={() => void load()} style={styles.backButton}><Text style={styles.backButtonText}>Retry</Text></Pressable></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.push('/(tabs)/achievements')}>
          <Ionicons name="chevron-back" size={16} color="#4338CA" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{normalizedLevel}</Text></View>
          <Text style={styles.heroTitle}>Choose your mode</Text>
          <Text style={styles.heroSub}>Fast missions with daily XP rewards.</Text>
        </View>

        <View style={styles.grid}>
          {sorted.map((item) => {
            const ui = TYPE_UI[item.type ?? ""] ?? { label: item.title, icon: "game-controller-outline" as const, color: "#4F46E5", bg: "#E0E7FF", dark: "#312E81" };
            return (
              <Pressable key={item.id} style={[styles.card, { backgroundColor: ui.bg }]} onPress={() => router.push(`/practice/${encodeURIComponent(item.id)}/play` as any)}>
                <View style={[styles.iconWrap, { backgroundColor: "rgba(255,255,255,0.7)" }]}><Ionicons name={ui.icon} size={21} color={ui.color} /></View>
                <Text style={[styles.typeLabel, { color: ui.dark }]}>{ui.label}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.pill}><Text style={[styles.pillText, { color: ui.dark }]}>{item.maxDailyXp ?? 0} XP</Text></View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  centerText: { color: '#4B5563' },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, backgroundColor: '#E0E7FF', paddingHorizontal: 10, paddingVertical: 6 },
  backButtonText: { fontSize: 12, fontWeight: '800', color: '#4338CA' },
  hero: { borderRadius: 20, backgroundColor: '#312E81', padding: 14, gap: 6, overflow: 'hidden' },
  heroBadge: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 8, paddingVertical: 4 },
  heroBadgeText: { fontSize: 11, color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.5 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  heroSub: { color: '#C7D2FE', fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48.5%', borderRadius: 16, padding: 12, minHeight: 122, justifyContent: 'space-between', shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { marginTop: 8, fontSize: 14, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-start' },
  pill: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800' },
});
