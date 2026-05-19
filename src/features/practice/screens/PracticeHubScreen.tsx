import { PracticeSummary } from "@/src/features/practice/practice.types";
import { practiceService } from "@/src/features/practice/practice.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PracticeHubScreen() {
  const router = useRouter();
  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPractices = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await practiceService.getPractices();
      setPractices(data);
      setError(null);
    } catch (loadError) {
      console.log("Failed to load practices", loadError);
      setError("Could not load practice list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPractices();
    }, [loadPractices]),
  );

  const onPressCard = useCallback(
    (practiceId: string) => {
      router.push(`/practice/${encodeURIComponent(practiceId)}` as any);
    },
    [router],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.centerText}>Loading practices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={26} color="#DC2626" />
          <Text style={styles.centerTitle}>Something went wrong</Text>
          <Text style={styles.centerText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadPractices()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (practices.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="file-tray-outline" size={26} color="#6B7280" />
          <Text style={styles.centerTitle}>No practices yet</Text>
          <Text style={styles.centerText}>Practice content will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={[...practices].sort((a, b) => (a.levelId ?? "").localeCompare(b.levelId ?? "") || a.title.localeCompare(b.title))}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadPractices(true)}
          />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onPressCard(item.id)}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.type ? <Text style={styles.badge}>{item.type.replace(/_/g, " ")}</Text> : null}
            </View>

            {item.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            ) : null}

            <Text style={styles.description} numberOfLines={2}>
              {item.description ?? "No description available."}
            </Text>

            <View style={styles.metaRow}>
              {item.levelId ? <Text style={styles.metaText}>Level: {item.levelId}</Text> : null}
              <Text style={styles.metaText}>XP: {item.xpReward ?? 0}</Text>
              <Text style={styles.metaText}>Daily cap: {item.maxDailyXp ?? 0}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContainer: {
    padding: 12,
    gap: 10,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  centerText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#4F46E5",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  badge: {
    fontSize: 11,
    color: "#4338CA",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "600",
  },
});
