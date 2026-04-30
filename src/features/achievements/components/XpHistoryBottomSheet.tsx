import {
  XpHistoryEntry,
  XpHistoryResult,
} from "@/src/features/achievements/achievements.service";
import XpHistoryRow from "@/src/features/achievements/components/XpHistoryRow";
import { AppTheme, useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  history: XpHistoryEntry[];
  historyState: XpHistoryResult["state"];
  onClose: () => void;
};

type HistoryFilter = "all" | "earned" | "spent";

const SHEET_HEIGHT = 560;
const SWIPE_CLOSE_THRESHOLD = 90;

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(2,6,23,0.52)",
    },
    sheetWrap: {
      overflow: "hidden",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.98)"
          : "rgba(255,255,255,1)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.58)"
          : "rgba(148,163,184,0.18)",
      maxHeight: "86%",
      minHeight: 320,
    },
    handle: {
      alignSelf: "center",
      width: 44,
      height: 5,
      borderRadius: 999,
      marginTop: 10,
      marginBottom: 8,
      backgroundColor:
        theme.mode === "dark" ? "rgba(148,163,184,0.42)" : "rgba(148,163,184,0.55)",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.s(1),
      paddingHorizontal: theme.s(2),
      paddingTop: theme.s(1),
      paddingBottom: theme.s(1.5),
      borderBottomWidth: 1,
      borderBottomColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.42)"
          : "rgba(148,163,184,0.14)",
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(30,41,59,0.72)" : "rgba(248,250,252,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.5)"
          : "rgba(148,163,184,0.18)",
    },
    content: {
      paddingHorizontal: theme.s(2),
      paddingTop: theme.s(1.5),
      gap: theme.s(1.25),
    },
    filterRow: {
      flexDirection: "row",
      gap: theme.s(0.75),
    },
    filterButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.72)"
          : "rgba(248,250,252,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.44)"
          : "rgba(148,163,184,0.16)",
    },
    filterButtonActive: {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.22)"
          : "rgba(37,99,235,0.1)",
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.28)"
          : "rgba(59,130,246,0.2)",
    },
    filterButtonText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "800",
      textAlign: "center",
    },
    filterButtonTextActive: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
    },
    emptyCard: {
      alignItems: "center",
      padding: theme.s(3),
      borderRadius: 24,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.84)"
          : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.52)"
          : "rgba(148,163,184,0.18)",
    },
    emptyIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.s(1.5),
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.16)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.14)",
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    emptyText: {
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 8,
    },
  });
}

export default function XpHistoryBottomSheet({
  visible,
  history,
  historyState,
  onClose,
}: Props) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [mounted, setMounted] = React.useState(visible);
  const [selectedFilter, setSelectedFilter] =
    React.useState<HistoryFilter>("all");
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const animateOpen = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY]);

  const animateClose = React.useCallback(
    (afterClose?: () => void) => {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
          afterClose?.();
        }
      });
    },
    [backdropOpacity, translateY],
  );

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      setSelectedFilter("all");
      translateY.setValue(SHEET_HEIGHT);
      backdropOpacity.setValue(0);
      animateOpen();
      return;
    }

    if (mounted) {
      animateClose();
    }
  }, [animateClose, animateOpen, backdropOpacity, mounted, translateY, visible]);

  const requestClose = React.useCallback(() => {
    animateClose(onClose);
  }, [animateClose, onClose]);

  const filteredHistory = React.useMemo(() => {
    if (selectedFilter === "earned") {
      return history.filter((item) => item.amount > 0);
    }

    if (selectedFilter === "spent") {
      return history.filter((item) => item.amount < 0);
    }

    return history;
  }, [history, selectedFilter]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > SWIPE_CLOSE_THRESHOLD) {
            requestClose();
            return;
          }

          Animated.timing(translateY, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.timing(translateY, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        },
      }),
    [requestClose, translateY],
  );

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={requestClose}
    >
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetWrap,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>XP History</Text>
            <Pressable onPress={requestClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, 16) + 12 },
            ]}
          >
            <View style={styles.filterRow}>
              {(
                [
                  { key: "all", label: "All" },
                  { key: "earned", label: "Earned" },
                  { key: "spent", label: "Spent" },
                ] as const
              ).map((option) => {
                const active = selectedFilter === option.key;

                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setSelectedFilter(option.key)}
                    style={[
                      styles.filterButton,
                      active ? styles.filterButtonActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        active ? styles.filterButtonTextActive : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => <XpHistoryRow key={item.id} item={item} />)
            ) : historyState === "error" ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={20}
                    color={theme.colors.text}
                  />
                </View>
                <Text style={styles.emptyTitle}>Could not load XP history</Text>
                <Text style={styles.emptyText}>
                  Pull to refresh on the achievements screen and try again.
                </Text>
              </View>
            ) : historyState === "mapping_problem" ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="construct-outline"
                    size={20}
                    color={theme.colors.text}
                  />
                </View>
                <Text style={styles.emptyTitle}>XP history needs a refresh</Text>
                <Text style={styles.emptyText}>
                  Your XP wallet loaded, but some history fields are not fully labeled yet.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={theme.colors.text}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {selectedFilter === "earned"
                    ? "No earned XP yet"
                    : selectedFilter === "spent"
                      ? "No spent XP yet"
                      : "No XP history yet"}
                </Text>
                <Text style={styles.emptyText}>
                  {selectedFilter === "earned"
                    ? "Claim XP, complete lessons, or pass quizzes to see earned XP here."
                    : selectedFilter === "spent"
                      ? "Spent XP from hint usage will appear here once you use hints."
                      : "Daily claims, lesson completions, quiz rewards, and hint spends will show here once you start earning or spending XP."}
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
