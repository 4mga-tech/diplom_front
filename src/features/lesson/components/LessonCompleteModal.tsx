import { useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  xpEarned: number;
  progressMessage?: string | null;
  hasNextLesson: boolean;
  onContinue: () => void;
  onNextLesson: () => void;
  onBackToUnit: () => void;
};

export default function LessonCompleteModal({
  visible,
  xpEarned,
  progressMessage,
  hasNextLesson,
  onContinue,
  onNextLesson,
  onBackToUnit,
}: Props) {
  const { theme } = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(10, 14, 25, 0.64)",
          justifyContent: "center",
          padding: theme.s(2),
        },
        card: {
          borderRadius: theme.r.xl,
          backgroundColor: theme.colors.cardStrong,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.s(2),
          gap: theme.s(1.25),
        },
        iconWrap: {
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(34,197,94,0.18)",
        },
        title: {
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: "700",
        },
        text: {
          color: theme.colors.muted,
          fontSize: 14,
          lineHeight: 20,
        },
        xp: {
          color: "#86EFAC",
          fontSize: 16,
          fontWeight: "700",
        },
        button: {
          minHeight: 44,
          borderRadius: theme.r.lg,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
        },
        buttonPrimary: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        buttonText: {
          color: theme.colors.text,
          fontWeight: "600",
          fontSize: 14,
        },
        buttonPrimaryText: {
          color: "#041326",
        },
      }),
    [theme],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="trophy" size={24} color="#4ADE80" />
          </View>
          <Text style={styles.title}>Lesson completed</Text>
          <Text style={styles.xp}>+{xpEarned} XP earned</Text>
          {progressMessage ? <Text style={styles.text}>{progressMessage}</Text> : null}

          <Pressable style={[styles.button, styles.buttonPrimary]} onPress={onContinue}>
            <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Continue</Text>
          </Pressable>

          {hasNextLesson ? (
            <Pressable style={styles.button} onPress={onNextLesson}>
              <Text style={styles.buttonText}>Next Lesson</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.button} onPress={onBackToUnit}>
            <Text style={styles.buttonText}>Back to Unit</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
