import { fetchLevels } from "@/lib/levels";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  const levelWords = words.filter((w) => w.level === safeLevel);

  const displayedWords = selectedLetter
    ? levelWords.filter((w) => w.alphabetGroup === selectedLetter)
    : levelWords;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.title}>Vocabulary {safeLevel}</Text>

        <Pressable onPress={() => setModalVisible(true)}>
          <Ionicons
            name="options-outline"
            size={28}
            color={theme.colors.muted}
          />
        </Pressable>
      </View>

      {loading ? (
        <Text style={{ color: theme.colors.text, marginTop: 20 }}>
          Loading...
        </Text>
      ) : (
        <FlatList
          data={displayedWords}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.wordRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.translation}>{item.translation}</Text>
              </View>

              <Text style={styles.meta}>{item.type}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Letter</Text>

            <FlatList
              data={mongolianLetters}
              numColumns={5}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const hasWords = levelWords.some(
                  (w) => w.alphabetGroup === item,
                );

                return (
                  <Pressable
                    style={[
                      styles.letterBox,
                      selectedLetter === item && styles.letterBoxSelected,
                      !hasWords && { backgroundColor: "#555" },
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
                        !hasWords && { color: "#aaa" },
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
              <Text style={styles.clearText}>Clear Filter</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// =========================
// STYLES
// =========================
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: 16,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 30,
      marginBottom: 12,
    },

    title: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "bold",
    },

    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(30,41,59,0.35)",
      borderWidth: 1,
      borderColor: "rgba(51,65,85,0.55)",
    },

    wordRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    },

    word: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
    },

    translation: {
      color: theme.colors.muted,
      fontSize: 13,
      marginTop: 4,
    },

    meta: {
      color: "#A78BFA",
      fontSize: 12,
      fontWeight: "800",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },

    modalContent: {
      backgroundColor: "#222",
      padding: 16,
      borderRadius: 12,
      width: "85%",
      maxHeight: "70%",
    },

    modalTitle: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
    },

    letterBox: {
      width: 50,
      height: 50,
      backgroundColor: "#333",
      justifyContent: "center",
      alignItems: "center",
      margin: 4,
      borderRadius: 8,
    },

    letterBoxSelected: {
      backgroundColor: theme.colors.purple,
    },

    letterText: {
      color: "white",
      fontWeight: "800",
      fontSize: 18,
    },

    clearBtn: {
      marginTop: 12,
      paddingVertical: 8,
      backgroundColor: "#444",
      borderRadius: 8,
    },

    clearText: {
      color: theme.colors.danger,
      textAlign: "center",
      fontWeight: "700",
    },
  });
