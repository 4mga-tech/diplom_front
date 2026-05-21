import { useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";

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
  const entrance = React.useRef(new Animated.Value(0)).current;
  const iconPulse = React.useRef(new Animated.Value(1)).current;
  const sparkle = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!visible) {
      entrance.setValue(0);
      iconPulse.setValue(1);
      sparkle.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(140),
        Animated.timing(sparkle, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.05,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [entrance, iconPulse, sparkle, visible]);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(3, 7, 18, 0.74)",
          justifyContent: "center",
          padding: theme.s(2),
        },
        cardShell: {
          borderRadius: 28,
          padding: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.45,
          shadowRadius: 28,
          elevation: 16,
        },
        card: {
          borderRadius: 27,
          backgroundColor: "rgba(15, 23, 42, 0.96)",
          borderWidth: 1,
          borderColor: "rgba(148, 163, 184, 0.2)",
          paddingHorizontal: theme.s(2),
          paddingTop: theme.s(2.1),
          paddingBottom: theme.s(1.6),
          gap: theme.s(0.95),
          overflow: "hidden",
        },
        iconBlock: {
          marginTop: theme.s(0.25),
          alignItems: "center",
          marginBottom: theme.s(0.45),
        },
        iconGlow: {
          width: 70,
          height: 70,
          borderRadius: 35,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#FACC15",
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        sparkle: {
          position: "absolute",
          right: 4,
          top: 0,
        },
        title: {
          color: theme.colors.text,
          fontSize: 24,
          fontWeight: "700",
          textAlign: "center",
          letterSpacing: 0.2,
        },
        xpChip: {
          alignSelf: "center",
          borderRadius: 999,
          paddingHorizontal: theme.s(1.2),
          paddingVertical: theme.s(0.55),
          borderWidth: 1,
          borderColor: "rgba(110, 231, 183, 0.48)",
          backgroundColor: "rgba(16, 185, 129, 0.17)",
          shadowColor: "#22C55E",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        xpText: {
          color: "#BBF7D0",
          fontSize: 16,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
        text: {
          color: "rgba(203, 213, 225, 0.92)",
          fontSize: 13,
          lineHeight: 18,
          textAlign: "center",
        },
        actions: {
          marginTop: theme.s(0.55),
          gap: theme.s(0.7),
        },
        button: {
          minHeight: 41,
          borderRadius: theme.r.lg,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(148, 163, 184, 0.3)",
          backgroundColor: "rgba(30, 41, 59, 0.85)",
          paddingHorizontal: theme.s(1),
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
        buttonTertiary: {
          borderWidth: 0,
          backgroundColor: "transparent",
          minHeight: 34,
        },
        buttonTertiaryText: {
          color: "rgba(203, 213, 225, 0.82)",
          fontSize: 13,
          fontWeight: "500",
        },
      }),
    [theme],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.cardShell,
            {
              opacity: entrance,
              transform: [
                { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
                { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              ],
            },
          ]}
        >
          <LinearGradient colors={["rgba(148, 163, 184, 0.38)", "rgba(56, 189, 248, 0.18)", "rgba(16,185,129,0.22)"]}>
            <View style={styles.card}>
              <View style={styles.iconBlock}>
                <Animated.View style={[styles.iconGlow, { transform: [{ scale: iconPulse }] }]}> 
                  <LinearGradient
                    colors={["rgba(250, 204, 21, 0.35)", "rgba(250, 204, 21, 0.12)"]}
                    style={styles.iconGlow}
                  >
                    <Ionicons name="trophy" size={28} color="#FDE047" />
                  </LinearGradient>
                </Animated.View>
                <Animated.View style={[styles.sparkle, { opacity: sparkle, transform: [{ scale: sparkle }] }]}>
                  <Ionicons name="sparkles" size={14} color="#FDE68A" />
                </Animated.View>
              </View>

              <Text style={styles.title}>Lesson completed</Text>
              <Animated.View style={[styles.xpChip, { transform: [{ scale: iconPulse }] }]}>
                <Text style={styles.xpText}>+{xpEarned} XP earned</Text>
              </Animated.View>
              {progressMessage ? <Text style={styles.text}>{progressMessage}</Text> : null}

              <View style={styles.actions}>
                <Pressable style={[styles.button, styles.buttonPrimary]} onPress={onContinue}>
                  <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Continue</Text>
                </Pressable>

                {hasNextLesson ? (
                  <Pressable style={styles.button} onPress={onNextLesson}>
                    <Text style={styles.buttonText}>Next Lesson</Text>
                  </Pressable>
                ) : null}

                <Pressable style={[styles.button, styles.buttonTertiary]} onPress={onBackToUnit}>
                  <Text style={styles.buttonTertiaryText}>Back to Unit</Text>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
