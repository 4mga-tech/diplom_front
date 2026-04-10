import levelsData from "@/src/data/vocabulary/levels_manifest.json";
import { theme } from "@/src/ui/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VocabularyIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Level</Text>

      {levelsData.map((lvl) => {
        const disabled = !lvl.vocabularyReady;

        return (
          <Pressable
            key={lvl.id}
            style={[styles.card, disabled && styles.disabledCard]}
            onPress={() => {
              if (!disabled) router.push(`/vocabulary/${lvl.id}`);
            }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.levelTitle}>{lvl.title}</Text>

              <View
                style={[
                  styles.badge,
                  { backgroundColor: disabled ? "#666" : "#22c55e" },
                ]}
              >
                <Text style={styles.badgeText}>
                  {disabled ? "Coming soon" : "Ready"}
                </Text>
              </View>
            </View>

            <Text style={styles.subtitle}>{lvl.subtitle}</Text>
            <Text style={styles.description}>{lvl.description}</Text>

            <Text style={styles.count}>{lvl.vocabularyCount} words</Text>
          </Pressable>
        );
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.bg,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  disabledCard: {
    opacity: 0.5,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  levelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },

  subtitle: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 14,
  },

  description: {
    color: "#ccc",
    marginTop: 8,
    fontSize: 13,
  },

  count: {
    marginTop: 10,
    color: "#22c55e",
    fontWeight: "600",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
