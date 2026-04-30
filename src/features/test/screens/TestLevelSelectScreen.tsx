import {
  TEST_LEVELS,
  type TestLevelCard as TestLevelVisual,
} from "@/src/features/test/constants/testLevels";
import { testService } from "@/src/features/test/services/test.service";
import { TestLevelSummary } from "@/src/features/test/types/test.types";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEST_TYPES = ["Vocabulary", "Grammar", "Listening", "Speaking"];

export default function TestLevelSelect() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const [levels, setLevels] = useState<TestLevelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadLevels() {
      try {
        setLoading(true);
        setError(null);
        const data = await testService.getLevels();

        if (!mounted) {
          return;
        }

        setLevels(data);
      } catch (loadError) {
        console.log("Test levels load failed:", loadError);

        if (!mounted) {
          return;
        }

        setError("We could not load the available exam levels right now.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadLevels();

    return () => {
      mounted = false;
    };
  }, []);

  const visualMetaById = useMemo(
    () =>
      new Map<string, TestLevelVisual>(
        TEST_LEVELS.map((item) => [item.id.toLowerCase(), item]),
      ),
    [],
  );

  const renderHeader = () => (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={12}
                color={theme.colors.text}
              />
              <Text style={styles.heroBadgeText}>Level assessment</Text>
            </View>

            <Text style={styles.title}>Assessment hub</Text>
            <Text style={styles.subtitle}>
              The test tab is reserved for full level assessments. Vocabulary
              and grammar exams are available across M1 to M4.
            </Text>
          </View>

          <View style={styles.heroStatsCompact}>
            <Text style={styles.heroStatBig}>{levels.length}</Text>
            <Text style={styles.heroStatSmall}>live now</Text>
          </View>
        </View>

        <View style={styles.testTypesRow}>
          {TEST_TYPES.map((item) => (
            <View key={item} style={styles.typeChip}>
              <Text style={styles.typeChipText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.headerStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{levels.length}</Text>
            <Text style={styles.statLabel}>Active levels</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Live test types</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>{TEST_TYPES.length}</Text>
            <Text style={styles.statLabel}>Visible modes</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Choose a level</Text>
        <Text style={styles.sectionCaption}>
          {loading ? "Loading..." : `${levels.length} available`}
        </Text>
      </View>
    </>
  );

  const renderItem: ListRenderItem<TestLevelSummary> = ({ item, index }) => {
    const visualMeta = visualMetaById.get(item.levelId) ?? null;
    const levelLabel = item.title.toUpperCase();
    const levelAccent = visualMeta?.accent ?? "#2563EB";
    const levelSubtitle = visualMeta?.subtitle ?? "Level exam";
    const levelDescription =
      visualMeta?.description ??
      "Backend-backed vocabulary and grammar exams with more skills coming later.";

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/test/test-types/[levelId]" as any,
            params: { levelId: levelLabel },
          })
        }
        style={({ pressed }) => [
          styles.gridItemWrap,
          index % 2 === 0 ? { marginRight: 10 } : null,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "#FFFFFF",
              borderColor:
                theme.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(148,163,184,0.16)",
            },
          ]}
        >
          <View style={[styles.cardAccent, { backgroundColor: levelAccent }]} />

          <View style={styles.cardTop}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{levelLabel}</Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Available now</Text>
            </View>
          </View>

          <View style={styles.cardMiddle}>
            <Text style={styles.level}>{levelLabel}</Text>
            <Text style={styles.cardDesc}>{levelSubtitle}</Text>
            <Text style={styles.subtitleText} numberOfLines={3}>
              {levelDescription}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.meta}>
              <Ionicons
                name="albums-outline"
                size={13}
                color={theme.colors.muted}
              />
              <Text style={styles.metaText}>
                {item.activeTypes.length} live exams
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={15} color={theme.colors.muted} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={theme.colors.text} />
          <Text style={styles.loadingCopy}>Loading exam levels</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#FCA5A5" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        key="test-level-grid-2"
        data={levels}
        keyExtractor={(item) => item.levelId}
        numColumns={2}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.gridRow}
        ListFooterComponent={<View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
    },
    loadingWrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingTop: 12,
    },
    loadingCopy: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 20,
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor:
        theme.mode === "dark" ? "rgba(127,29,29,0.28)" : "rgba(254,226,226,1)",
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.24)",
    },
    errorText: {
      flex: 1,
      color: theme.mode === "dark" ? "#FECACA" : "#991B1B",
      fontSize: 12,
      fontWeight: "600",
    },

    heroCard: {
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 18,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.16)",
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.12 : 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 },
      elevation: 3,
    },

    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
    },

    heroLeft: {
      flex: 1,
      paddingRight: 6,
    },

    heroBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 10,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(148,163,184,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.14)",
    },

    heroBadgeText: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: "700",
    },

    heroStatsCompact: {
      minWidth: 78,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.05)"
          : "rgba(99,102,241,0.06)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(99,102,241,0.12)",
    },

    heroStatBig: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
    },

    heroStatSmall: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "600",
      marginTop: 2,
    },

    title: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },

    subtitle: {
      color: theme.colors.muted,
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "500",
    },

    testTypesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },

    typeChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.04)"
          : "rgba(148,163,184,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.14)",
    },

    typeChipText: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "700",
    },

    headerStats: {
      flexDirection: "row",
      alignItems: "center",
    },

    stat: {
      flex: 1,
      alignItems: "center",
    },

    statValue: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "800",
    },

    statLabel: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "600",
      marginTop: 2,
    },

    divider: {
      width: 1,
      height: 24,
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
      fontSize: 16,
      fontWeight: "800",
    },

    sectionCaption: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
    },

    gridRow: {
      justifyContent: "space-between",
    },

    gridItemWrap: {
      flex: 1,
      marginBottom: 12,
    },

    pressed: {
      transform: [{ scale: 0.985 }],
      opacity: 0.96,
    },

    card: {
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 148,
      justifyContent: "space-between",
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "#FFFFFF",
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.1 : 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      overflow: "hidden",
    },

    cardAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
    },

    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 8,
    },

    levelBadge: {
      alignSelf: "flex-start",
      minWidth: 42,
      height: 28,
      paddingHorizontal: 10,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(148,163,184,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.14)",
    },

    levelBadgeText: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.3,
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(34,197,94,0.16)" : "rgba(34,197,94,0.14)",
    },

    statusText: {
      color: theme.mode === "dark" ? "#86EFAC" : "#15803D",
      fontSize: 9,
      fontWeight: "800",
    },

    cardMiddle: {
      marginTop: 10,
    },

    level: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },

    cardDesc: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 3,
    },

    subtitleText: {
      color: theme.mode === "dark" ? "#CBD5E1" : "#475569",
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "500",
      marginTop: 8,
    },

    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },

    meta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    metaText: {
      color: theme.colors.muted,
      fontWeight: "700",
      fontSize: 11,
    },
  });
