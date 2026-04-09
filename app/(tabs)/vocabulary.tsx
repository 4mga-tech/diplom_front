import { theme } from "@/src/ui/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const levels = ["B1", "M1", "M2", "M3"];

export default function VocabularyIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Level</Text>
      {levels.map((lvl) => (
        <Pressable
          key={lvl}
          style={styles.levelBtn}
          onPress={() => router.push(`/vocabulary/${lvl}`)}
        >
          <Text style={styles.levelText}>{lvl}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 24 },
  levelBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#444",
    borderRadius: 12,
    marginBottom: 12,
    width: "60%",
    alignItems: "center",
  },
  levelText: { color: "white", fontSize: 18, fontWeight: "700" },
});
