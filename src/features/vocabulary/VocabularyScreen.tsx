import { fetchLevels } from "@/lib/levels";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type VocabularyWord = {
  key: string;
  word: string;
  translation: string;
  type: string;
  alphabetGroup: string;
  level: string;
};

const mongolianLetters = [
  "А",
  "Б",
  "В",
  "Г",
  "Д",
  "Е",
  "Ё",
  "Ж",
  "З",
  "И",
  "Й",
  "К",
  "Л",
  "М",
  "Н",
  "О",
  "Ө",
  "П",
  "Р",
  "С",
  "Т",
  "У",
  "Ү",
  "Ф",
  "Х",
  "Ц",
  "Ч",
  "Ш",
  "Щ",
  "Ъ",
  "Ы",
  "Ь",
  "Э",
  "Ю",
  "Я",
];

const getTypeLabel = (type?: string) => {
  if (!type) return "Word";

  const normalized = type.toLowerCase();

  if (normalized.includes("noun")) return "Noun";
  if (normalized.includes("verb")) return "Verb";
  if (normalized.includes("adj")) return "Adjective";
  if (normalized.includes("adv")) return "Adverb";

  return type;
};

export default function VocabularyScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId?: string }>();
  const safeLevel = levelId ?? "M1";

  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);

        const allWords = (await fetchLevels()).flatMap((level) =>
          level.words.map((word) => ({
            ...word,
            level: word.level ?? level.id ?? safeLevel,
          })),
        );

        setWords(allWords);
      } catch (error) {
        console.log("API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [safeLevel]);

  const levelWords = useMemo(
    () => words.filter((w) => w.level === safeLevel),
    [words, safeLevel],
  );

  const displayedWords = useMemo(() => {
    if (!selectedLetter) return levelWords;
    return levelWords.filter((w) => w.alphabetGroup === selectedLetter);
  }, [levelWords, selectedLetter]);

  const availableLetters = useMemo(() => {
    return new Set(levelWords.map((w) => w.alphabetGroup));
  }, [levelWords]);

  const renderWordRow = ({ item }: { item: VocabularyWord }) => (
    <Pressable
      style={({ pressed }) => [
        styles.wordCard,
        pressed && styles.wordCardPressed,
      ]}
    >
      <View style={styles.wordLeft}>
        <View style={styles.wordTopRow}>
          <Text style={styles.word}>{item.word}</Text>

          <View style={styles.letterPill}>
            <Text style={styles.letterPillText}>{item.alphabetGroup}</Text>
          </View>
        </View>

        <Text style={styles.translation}>{item.translation}</Text>
      </View>

      <View style={styles.wordRight}>
        <View style={styles.typeBadge}>
          <Text style={styles.meta}>{getTypeLabel(item.type)}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Vocabulary</Text>
          <Text style={styles.topBarSub}>{safeLevel} collection</Text>
        </View>

        <Pressable style={styles.iconBtn} onPress={() => setModalVisible(true)}>
          <Ionicons
            name="options-outline"
            size={20}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroLevelBadge}>
            <Text style={styles.heroLevelBadgeText}>{safeLevel}</Text>
          </View>

          <View style={styles.heroFilterPill}>
            <Ionicons
              name={selectedLetter ? "funnel" : "grid-outline"}
              size={12}
              color={theme.colors.muted}
            />
            <Text style={styles.heroFilterText}>
              {selectedLetter ? `Letter ${selectedLetter}` : "All letters"}
            </Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Build your vocabulary</Text>
        <Text style={styles.heroDesc}>
          Browse words by level and narrow the list with Mongolian letter
          filters.
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{levelWords.length}</Text>
            <Text style={styles.statLabel}>Total words</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{availableLetters.size}</Text>
            <Text style={styles.statLabel}>Letters</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{displayedWords.length}</Text>
            <Text style={styles.statLabel}>Showing</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {selectedLetter ? `${selectedLetter} words` : "All words"}
        </Text>

        {selectedLetter ? (
          <Pressable
            style={styles.clearInlineBtn}
            onPress={() => setSelectedLetter(null)}
          >
            <Text style={styles.clearInlineText}>Clear</Text>
          </Pressable>
        ) : (
          <Text style={styles.sectionCaption}>List view</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.stateWrap}>
          <Ionicons
            name="hourglass-outline"
            size={22}
            color={theme.colors.muted}
          />
          <Text style={styles.loading}>Loading vocabulary...</Text>
        </View>
      ) : displayedWords.length === 0 ? (
        <View style={styles.stateWrap}>
          <Ionicons
            name="search-outline"
            size={22}
            color={theme.colors.muted}
          />
          <Text style={styles.emptyTitle}>No words found</Text>
          <Text style={styles.emptyText}>
            Try a different letter or clear the current filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedWords}
          keyExtractor={(item) => item.key}
          renderItem={renderWordRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Filter by letter</Text>
                <Text style={styles.modalSubTitle}>
                  Choose a Mongolian letter for {safeLevel}
                </Text>
              </View>

              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <FlatList
              data={mongolianLetters}
              numColumns={5}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.lettersList}
              renderItem={({ item }) => {
                const hasWords = availableLetters.has(item);
                const active = selectedLetter === item;

                return (
                  <Pressable
                    style={[
                      styles.letterBox,
                      active && styles.letterBoxSelected,
                      !hasWords && styles.letterBoxDisabled,
                    ]}
                    disabled={!hasWords}
                    onPress={() => {
                      setSelectedLetter(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.letterText,
                        active && styles.letterTextSelected,
                        !hasWords && styles.letterTextDisabled,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <Pressable
              style={styles.clearBtn}
              onPress={() => {
                setSelectedLetter(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.clearText}>Show all words</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      paddingHorizontal: 20,
      paddingTop: 10,
    },

    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      paddingHorizontal: 2,
    },

    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
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

    topBarCenter: {
      alignItems: "center",
      paddingHorizontal: 10,
    },

    topBarTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    topBarSub: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "600",
      marginTop: 2,
    },

    heroCard: {
      borderRadius: 22,
      padding: 16,
      marginBottom: 18,
      marginHorizontal: 2,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.045)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.16)",
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.14 : 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },

    heroHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      gap: 10,
    },

    heroLevelBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(139,92,246,0.12)"
          : "rgba(139,92,246,0.10)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(139,92,246,0.24)"
          : "rgba(139,92,246,0.18)",
    },

    heroLevelBadgeText: {
      color: theme.mode === "dark" ? "#C4B5FD" : "#7C3AED",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.4,
    },

    heroFilterPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
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
          : "rgba(148,163,184,0.16)",
    },

    heroFilterText: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
    },

    heroTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    heroDesc: {
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
      fontWeight: "500",
    },

    heroStatsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(148,163,184,0.14)",
    },

    statItem: {
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
      fontSize: 11,
      fontWeight: "600",
      marginTop: 4,
    },

    statDivider: {
      width: 1,
      height: 26,
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

    clearInlineBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.14)",
    },

    clearInlineText: {
      color: theme.colors.danger,
      fontSize: 11,
      fontWeight: "700",
    },

    list: {
      paddingBottom: 32,
      paddingHorizontal: 2,
    },

    separator: {
      height: 10,
    },

    wordCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.07)"
          : "rgba(148,163,184,0.14)",
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.1 : 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },

    wordCardPressed: {
      opacity: 0.96,
      transform: [{ scale: 0.995 }],
    },

    wordLeft: {
      flex: 1,
      paddingRight: 10,
    },

    wordTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    word: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "800",
      flex: 1,
    },

    letterPill: {
      minWidth: 28,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(99,102,241,0.12)"
          : "rgba(99,102,241,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(99,102,241,0.18)"
          : "rgba(99,102,241,0.14)",
    },

    letterPillText: {
      color: theme.mode === "dark" ? "#C7D2FE" : "#4F46E5",
      fontSize: 10,
      fontWeight: "800",
    },

    translation: {
      color: theme.colors.muted,
      fontSize: 13,
      marginTop: 6,
      lineHeight: 18,
      fontWeight: "500",
    },

    wordRight: {
      alignItems: "flex-end",
      justifyContent: "center",
    },

    typeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(167,139,250,0.10)"
          : "rgba(167,139,250,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(167,139,250,0.16)"
          : "rgba(167,139,250,0.12)",
    },

    meta: {
      color: theme.mode === "dark" ? "#C4B5FD" : "#7C3AED",
      fontSize: 11,
      fontWeight: "800",
    },

    stateWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 48,
      paddingHorizontal: 24,
    },

    loading: {
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: "500",
      marginTop: 10,
    },

    emptyTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginTop: 10,
    },

    emptyText: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
      textAlign: "center",
      marginTop: 6,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    modalCard: {
      width: "100%",
      maxHeight: "72%",
      borderRadius: 24,
      padding: 16,
      backgroundColor: theme.mode === "dark" ? "#171717" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.16)",
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 14,
      gap: 12,
    },

    modalTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
    },

    modalSubTitle: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "500",
      marginTop: 4,
    },

    modalCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.05)"
          : "rgba(148,163,184,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.14)",
    },

    lettersList: {
      paddingBottom: 8,
    },

    letterBox: {
      width: "18%",
      aspectRatio: 1,
      margin: "1%",
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.05)"
          : "rgba(148,163,184,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.14)",
    },

    letterBoxSelected: {
      backgroundColor: theme.colors.purple,
      borderColor: theme.colors.purple,
    },

    letterBoxDisabled: {
      opacity: 0.35,
    },

    letterText: {
      color: theme.colors.text,
      fontWeight: "800",
      fontSize: 17,
    },

    letterTextSelected: {
      color: "#FFFFFF",
    },

    letterTextDisabled: {
      color: theme.colors.muted,
    },

    clearBtn: {
      marginTop: 14,
      minHeight: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark" ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.14)",
    },

    clearText: {
      color: theme.colors.danger,
      textAlign: "center",
      fontWeight: "800",
      fontSize: 13,
    },
  });
