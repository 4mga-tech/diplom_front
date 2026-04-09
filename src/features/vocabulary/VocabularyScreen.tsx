import m1Vocabulary from "@/src/data/vocabulary/m1_vocabulary_app_grouped.json";
import { theme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

// Flat mock data
const allWords: VocabularyWord[] = (m1Vocabulary as any)
  .flatMap((g: any) => g.words)
  .map((w: any) => ({ ...w, level: "M1" })); // M1 level

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
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId?: string }>();
  const safeLevel = levelId ?? "M1";

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter by level first
  const words = allWords.filter((w) => w.level === safeLevel);

  // Then filter by selected letter
  const displayedWords = selectedLetter
    ? words.filter((w) => w.alphabetGroup === selectedLetter)
    : words;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.title}>Vocabulary {safeLevel}</Text>
        <Pressable onPress={() => setModalVisible(true)}>
          <Ionicons name="options-outline" size={28} color="white" />
        </Pressable>
      </View>

      <FlatList
        data={displayedWords}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.wordRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.word}>{item.word}</Text>
              <Text style={styles.translation}>{item.translation}</Text>
            </View>
            <Text style={styles.meta}>{item.type}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Letter</Text>
            <FlatList
              data={mongolianLetters}
              keyExtractor={(item) => item}
              numColumns={5}
              renderItem={({ item }) => {
                const hasWords = words.some((w) => w.alphabetGroup === item);
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
              onPress={() => {
                setSelectedLetter(null);
                setModalVisible(false);
              }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearText}>Clear Filter</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 12,
  },
  title: { color: "white", fontSize: 20, fontWeight: "bold" },
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
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  word: { color: "white", fontSize: 16, fontWeight: "700" },
  translation: { color: theme.colors.muted, fontSize: 13, marginTop: 4 },
  meta: { color: "#A78BFA", fontSize: 12, fontWeight: "800" },

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
  letterBoxSelected: { backgroundColor: "#A78BFA" },
  letterText: { color: "white", fontWeight: "800", fontSize: 18 },

  clearBtn: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: "#444",
    borderRadius: 8,
  },
  clearText: { color: "#F87171", textAlign: "center", fontWeight: "700" },
});
