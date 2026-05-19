import { practiceService } from "@/src/features/practice/practice.service";
import { PracticeSummary } from "@/src/features/practice/practice.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPE_UI: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  missing_letter: { label: "Missing Letter", icon: "create-outline", color: "#7C3AED", bg: "#F3E8FF" },
  letter_match: { label: "Letter Match", icon: "grid-outline", color: "#2563EB", bg: "#DBEAFE" },
  word_builder: { label: "Word Builder", icon: "cube-outline", color: "#0891B2", bg: "#CFFAFE" },
  meaning_match: { label: "Meaning Match", icon: "layers-outline", color: "#16A34A", bg: "#DCFCE7" },
  daily_challenge: { label: "Daily Challenge", icon: "flash-outline", color: "#EA580C", bg: "#FFEDD5" },
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
        <Pressable style={styles.backButton} onPress={() => router.push('/practice')}>
          <Ionicons name="chevron-back" size={16} color="#4338CA" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{normalizedLevel}</Text>
          <Text style={styles.heroTitle}>Select a practice type</Text>
        </View>

        {sorted.map((item) => {
          const ui = TYPE_UI[item.type ?? ""] ?? { label: item.title, icon: "game-controller-outline" as const, color: "#4F46E5", bg: "#E0E7FF" };
          return (
            <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/practice/${encodeURIComponent(item.id)}/play` as any)}>
              <View style={[styles.iconWrap, { backgroundColor: ui.bg }]}><Ionicons name={ui.icon} size={20} color={ui.color} /></View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{ui.label}</Text>
                <Text style={styles.cardSub}>{item.subtitle ?? "Start practice"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  content: { padding: 12, gap: 10, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  centerText: { color: '#4B5563' },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, backgroundColor: '#E0E7FF', paddingHorizontal: 10, paddingVertical: 6 },
  backButtonText: { fontSize: 12, fontWeight: '800', color: '#4338CA' },
  hero: { borderRadius: 16, backgroundColor: '#312E81', padding: 12, gap: 6 },
  heroBadge: { alignSelf: 'flex-start', fontSize: 12, color: '#FFFFFF', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  cardSub: { marginTop: 2, fontSize: 12, color: '#6B7280' },
});
