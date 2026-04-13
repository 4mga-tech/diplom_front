import { LevelCard, fetchLevels } from "@/lib/levels";
import { AppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestLevelSelect() {
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
      <Text style={styles.title}>Choose Test Level</Text>

      {loading ? (
        <Text style={{ color: "white" }}>Loading...</Text>
      ) : (
        levels.map((lvl, index) => {
          const disabled = !lvl.vocabularyReady;

          return (
            <Pressable
              key={lvl.id}
              disabled={disabled}
              onPress={() =>
                router.push({
                  pathname: "/test/[levelId]",
                  params: { levelId: lvl.id },
                })
              }
              style={({ pressed }) => [
                styles.wrapper,
                pressed && !disabled && { opacity: 0.9 },
              ]}
            >
              <LinearGradient
                colors={
                  disabled ? ["#1e293b", "#0f172a"] : ["#2563eb", "#7c3aed"]
                }
                style={[styles.card, disabled && { opacity: 0.6 }]}
              >
                {/* HEADER */}
                <View style={styles.header}>
                  <Text style={styles.level}>{lvl.title}</Text>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {disabled ? "Locked" : "Available"}
                    </Text>
                  </View>
                </View>

                {/* SUBTITLE */}
                <Text style={styles.subtitle}>{lvl.subtitle}</Text>

                {/* PROGRESS */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: disabled
                          ? "0%"
                          : `${Math.min(80, (index + 1) * 25)}%`,
                      },
                    ]}
                  />
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                  <View style={styles.meta}>
                    <Ionicons name="flash" size={14} color="#FACC15" />
                    <Text style={styles.metaText}>
                      {lvl.vocabularyCount} words
                    </Text>
                  </View>

                  {!disabled ? (
                    <Ionicons name="arrow-forward" size={18} color="white" />
                  ) : (
                    <Ionicons name="lock-closed" size={16} color="#aaa" />
                  )}
                </View>
              </LinearGradient>
            </Pressable>
          );
        })
      )}
    </SafeAreaView>
  );
}
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: 20,
    },

    title: {
      fontSize: 26,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: 20,
    },

    wrapper: {
      marginBottom: 14,
    },

    card: {
      borderRadius: 20,
      padding: 18,
      gap: 10,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    level: {
      fontSize: 22,
      fontWeight: "900",
      color: "white",
    },

    subtitle: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 13,
    },

    badge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },

    badgeText: {
      color: "white",
      fontSize: 11,
      fontWeight: "800",
    },

    progressTrack: {
      height: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.2)",
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      backgroundColor: "#fff",
    },

    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    meta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    metaText: {
      color: "white",
      fontWeight: "700",
      fontSize: 12,
    },
  });
