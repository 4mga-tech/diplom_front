import { LevelCard, fetchLevels } from "@/lib/levels";
import { AppTheme, useThemedStyles } from "@/src/ui/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VocabularyIndex() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  const [levels, setLevels] = useState<LevelCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        setLoading(true);

        setLevels(await fetchLevels());
      } catch (err) {
        console.log("Levels fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLevels();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Vocabulary</Text>
      <Text style={styles.para}>Select Level</Text>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : levels.length === 0 ? (
        <Text style={styles.empty}>No levels available right now.</Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {levels.map((lvl) => {
            const disabled = !lvl.vocabularyReady;

            return (
              <Pressable
                key={lvl.id}
                style={[styles.card, disabled && styles.disabledCard]}
                onPress={() => {
                  if (!disabled) {
                    router.push(`/vocabulary/${lvl.id}`);
                  }
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.bg,
    },

    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 20,
      letterSpacing: 0.5,
    },
    para: {
      fontSize: 16,
      color: theme.colors.muted,
      fontWeight: "400",
      marginBottom: 12,
      lineHeight: 19,
    },
    card: {
      backgroundColor: theme.mode === "dark" ? "#1f1f1f" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.12)"
          : "rgba(148,163,184,0.18)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
    },
    list: {
      paddingBottom: 24,
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
      color: theme.colors.text,
    },

    subtitle: {
      color: theme.colors.muted,
      marginTop: 4,
      fontSize: 14,
    },

    description: {
      color: theme.mode === "dark" ? "#CBD5E1" : "#475569",
      marginTop: 8,
      fontSize: 13,
    },

    count: {
      marginTop: 10,
      color: "#22c55e",
      fontWeight: "600",
    },
    loading: {
      color: theme.colors.text,
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
    empty: {
      color: "rgba(148,163,184,0.85)",
      fontSize: 15,
      marginTop: 8,
    },
  });
