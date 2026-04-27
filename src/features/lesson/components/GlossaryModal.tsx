import { LessonGlossaryItem } from "@/lib/learning";
import { useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  item: LessonGlossaryItem | null;
  onClose: () => void;
};

export default function GlossaryModal({ visible, item, onClose }: Props) {
  const { theme } = useAppTheme();
  const fade = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    fade.setValue(0);
    translateY.setValue(24);
  }, [fade, translateY, visible]);

  if (!item) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[styles.sheetWrap, { transform: [{ translateY }] }]}
        >
          <Pressable
            onPress={() => {}}
            style={[
              styles.sheet,
              {
                backgroundColor:
                  theme.mode === "dark" ? "rgba(15,23,42,0.98)" : "#FFFFFF",
                borderColor:
                  theme.mode === "dark"
                    ? "rgba(51,65,85,0.58)"
                    : "rgba(148,163,184,0.18)",
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[styles.word, { color: theme.colors.text }]}>
                  {item.word}
                </Text>
                <Text
                  style={[
                    styles.translation,
                    { color: theme.mode === "dark" ? "#93C5FD" : "#2563EB" },
                  ]}
                >
                  {item.translation}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor:
                      theme.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(148,163,184,0.08)",
                    borderColor:
                      theme.mode === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(148,163,184,0.14)",
                  },
                ]}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            {item.noteMn ? (
              <Text
                style={[
                  styles.notePrimary,
                  {
                    color:
                      theme.mode === "dark"
                        ? "rgba(226,232,240,0.92)"
                        : "#334155",
                  },
                ]}
              >
                {item.noteMn}
              </Text>
            ) : null}

            {item.noteEn ? (
              <Text style={[styles.noteSecondary, { color: theme.colors.muted }]}>
                {item.noteEn}
              </Text>
            ) : null}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.42)",
    justifyContent: "flex-end",
  },
  sheetWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 10,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.35)",
    marginBottom: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  word: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  translation: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  notePrimary: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  noteSecondary: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
});
