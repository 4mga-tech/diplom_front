import {
  fetchVocabularyLevels,
  SUPPORTED_VOCABULARY_LEVEL_IDS,
  VocabularyLevel,
} from "@/lib/vocabulary";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DisplayLevel = VocabularyLevel & {
  shortHint: string;
  accent: string;
};

export default function VocabularyIndex() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  const [levels, setLevels] = useState<VocabularyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLevels(await fetchVocabularyLevels());
    } catch (err) {
      console.log("Vocabulary levels fetch error:", err);
      setLevels([]);
      setError("Couldn't load vocabulary levels right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLevels();
  }, [loadLevels]);

  const levelMeta = useMemo<
    Record<string, { shortHint: string; accent: string }>
  >(
    () => ({
      M1: {
        shortHint: "Core vocabulary",
        accent: "#2563EB",
      },
      M2: {
        shortHint: "Daily usage",
        accent: "#0F766E",
      },
      M3: {
        shortHint: "Advanced practice",
        accent: "#EA580C",
      },
      M4: {
        shortHint: "Extended vocabulary",
        accent: "#B45309",
      },
    }),
    [],
  );

  const displayLevels = useMemo<DisplayLevel[]>(() => {
    return [...levels]
      .filter((lvl) => SUPPORTED_VOCABULARY_LEVEL_IDS.includes(lvl.id))
      .sort(
        (a, b) =>
          SUPPORTED_VOCABULARY_LEVEL_IDS.indexOf(a.id) -
          SUPPORTED_VOCABULARY_LEVEL_IDS.indexOf(b.id),
      )
      .map((lvl) => ({
        ...lvl,
        shortHint: levelMeta[lvl.id]?.shortHint ?? lvl.subtitle ?? "Start here",
        accent: levelMeta[lvl.id]?.accent ?? "#64748B",
      }));
  }, [levels, levelMeta]);

  const readyCount = displayLevels.filter((lvl) => lvl.vocabularyReady).length;
  const totalWords = displayLevels.reduce(
    (sum, lvl) => sum + (lvl.vocabularyCount || 0),
    0,
  );

  const renderLevelCard = ({ item }: { item: DisplayLevel }) => {
    const disabled = !item.vocabularyReady;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.cardWrap,
          pressed && !disabled ? styles.cardPressed : null,
        ]}
        onPress={() => {
          if (!disabled) {
            router.push(`/vocabulary/${item.id}`);
          }
        }}
        disabled={disabled}
      >
        <View
          style={[
            styles.card,
            disabled && styles.disabledCard,
            {
              borderColor:
                theme.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(148,163,184,0.16)",
            },
          ]}
        >
          <View
            style={[
              styles.cardAccent,
              { backgroundColor: disabled ? theme.colors.border : item.accent },
            ]}
          />

          <View style={styles.cardHeader}>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor:
                    theme.mode === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(148,163,184,0.10)",
                  borderColor:
                    theme.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(148,163,184,0.14)",
                },
              ]}
            >
              <Text style={styles.levelBadgeText}>{item.id}</Text>
            </View>

            <View
              style={[
                styles.statePill,
                {
                  backgroundColor: disabled
                    ? theme.mode === "dark"
                      ? "rgba(148,163,184,0.10)"
                      : "rgba(148,163,184,0.10)"
                    : theme.mode === "dark"
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(34,197,94,0.10)",
                  borderColor: disabled
                    ? theme.mode === "dark"
                      ? "rgba(148,163,184,0.12)"
                      : "rgba(148,163,184,0.14)"
                    : theme.mode === "dark"
                      ? "rgba(34,197,94,0.18)"
                      : "rgba(34,197,94,0.18)",
                },
              ]}
            >
              <Text
                style={[
                  styles.statePillText,
                  {
                    color: disabled
                      ? theme.colors.muted
                      : theme.mode === "dark"
                        ? "#86EFAC"
                        : "#15803D",
                  },
                ]}
              >
                {disabled ? "Locked" : "Ready"}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.levelTitle}>{item.title}</Text>
            <Text style={styles.shortHint}>{item.shortHint}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <Ionicons
                name="library-outline"
                size={13}
                color={theme.colors.muted}
              />
              <Text style={styles.metaText}>{item.vocabularyCount} words</Text>
            </View>

            <Ionicons
              name={disabled ? "lock-closed-outline" : "arrow-forward"}
              size={16}
              color={theme.colors.muted}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="book-outline" size={18} color={theme.colors.text} />
          </View>

          <View
            style={[
              styles.headerMiniPill,
              {
                backgroundColor:
                  theme.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(99,102,241,0.08)",
                borderColor:
                  theme.mode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(99,102,241,0.14)",
              },
            ]}
          >
            <Text style={styles.headerMiniPillText}>Vocabulary hub</Text>
          </View>
        </View>

        <Text style={styles.title}>Build your word bank</Text>
        <Text style={styles.para}>
          Explore vocabulary by level, grow gradually, and unlock stronger daily
          communication.
        </Text>

        <View style={styles.headerStatsRow}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{displayLevels.length}</Text>
            <Text style={styles.headerStatLabel}>Levels</Text>
          </View>

          <View style={styles.headerDivider} />

          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{readyCount}</Text>
            <Text style={styles.headerStatLabel}>Ready</Text>
          </View>

          <View style={styles.headerDivider} />

          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{totalWords}</Text>
            <Text style={styles.headerStatLabel}>Words</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Choose level</Text>
        <Text style={styles.sectionCaption}>
          {loading ? "Loading..." : "Collection"}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={theme.colors.text} />
          <Text style={styles.loading}>Loading levels...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="cloud-offline-outline"
            size={22}
            color={theme.colors.muted}
          />
          <Text style={styles.empty}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => void loadLevels()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : displayLevels.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="albums-outline"
            size={22}
            color={theme.colors.muted}
          />
          <Text style={styles.empty}>
            No vocabulary levels are available yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayLevels}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={renderLevelCard}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.bg,
    },

    headerCard: {
      marginTop: 8,
      marginBottom: 18,
      padding: 18,
      borderRadius: 24,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.14)",
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.18 : 0.07,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },

    headerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },

    headerIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(99,102,241,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(99,102,241,0.14)",
    },

    headerMiniPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },

    headerMiniPillText: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: "700",
    },

    title: {
      fontSize: 29,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },

    para: {
      fontSize: 14,
      color: theme.colors.muted,
      fontWeight: "500",
      marginTop: 8,
      lineHeight: 20,
    },

    headerStatsRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(148,163,184,0.12)",
    },

    headerStat: {
      flex: 1,
      alignItems: "center",
    },

    headerStatValue: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
    },

    headerStatLabel: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "600",
      marginTop: 4,
    },

    headerDivider: {
      width: 1,
      height: 28,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.16)",
    },

    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingHorizontal: 2,
    },

    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "700",
    },

    sectionCaption: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },

    list: {
      paddingBottom: 28,
    },

    row: {
      justifyContent: "space-between",
      marginBottom: 12,
    },

    cardWrap: {
      width: "48.3%",
    },

    cardPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.985 }],
    },

    card: {
      minHeight: 188,
      borderRadius: 22,
      padding: 14,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.035)" : "#FFFFFF",
      borderWidth: 1,
      justifyContent: "space-between",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.14 : 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },

    disabledCard: {
      opacity: 0.64,
    },

    cardAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },

    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 4,
    },

    levelBadge: {
      minWidth: 48,
      height: 32,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      paddingHorizontal: 10,
    },

    levelBadgeText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 0.3,
    },

    statePill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },

    statePillText: {
      fontSize: 10,
      fontWeight: "700",
    },

    cardBody: {
      marginTop: 16,
      flex: 1,
    },

    levelTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },

    shortHint: {
      color: theme.colors.muted,
      marginTop: 4,
      fontSize: 12,
      fontWeight: "600",
    },

    description: {
      color: theme.mode === "dark" ? "#CBD5E1" : "#475569",
      marginTop: 10,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "500",
    },

    cardFooter: {
      marginTop: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    metaText: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "600",
    },

    loading: {
      color: theme.colors.muted,
      marginTop: 10,
      fontSize: 14,
      fontWeight: "500",
    },

    centerState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
    },

    emptyWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
      gap: 8,
    },

    empty: {
      color: theme.colors.muted,
      fontSize: 15,
      fontWeight: "500",
    },

    retryBtn: {
      marginTop: 10,
      minHeight: 42,
      minWidth: 120,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.16)",
    },

    retryText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
  });
