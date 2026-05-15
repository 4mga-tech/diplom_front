import {
    LeaderboardSummary,
    LeaderboardTopEntry,
} from "@/src/features/achievements/leaderboard.service";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  loading: boolean;
  error: string | null;
  data: LeaderboardSummary | null;
  currentUserName?: string;
  onClose: () => void;
};

function isCurrentUser(entry: LeaderboardTopEntry, currentUserName?: string) {
  return Boolean(
    currentUserName &&
    entry.name.toLowerCase() === currentUserName.toLowerCase(),
  );
}

export default function LeaderboardModal({
  visible,
  loading,
  error,
  data,
  currentUserName,
  onClose,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Leaderboard</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={theme.colors.text} />
              <Text style={styles.stateText}>Loading ranking...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Top 5 Users</Text>
              <View style={styles.listWrap}>
                {data?.top5.map((item) => {
                  const highlighted = isCurrentUser(item, currentUserName);
                  return (
                    <View
                      key={`${item.rank}-${item.name}`}
                      style={[styles.row, highlighted && styles.rowHighlight]}
                    >
                      <Text style={styles.rankText}>#{item.rank}</Text>
                      <Text
                        style={[
                          styles.rowText,
                          highlighted && styles.rowTextHighlight,
                        ]}
                      >
                        {item.name} • {item.totalXP} XP
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.meCard}>
                <Text style={styles.meTitle}>👤 You</Text>
                <Text style={styles.meText}>Rank: #{data?.me.rank ?? 0}</Text>
                <Text style={styles.meText}>XP: {data?.me.totalXP ?? 0}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(2,6,23,0.6)",
      justifyContent: "flex-end",
      padding: theme.s(2),
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
      borderRadius: 24,
      padding: theme.s(2),
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 12,
      gap: theme.s(1.2),
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
    sectionTitle: { fontSize: 14, fontWeight: "800", color: "#334155" },
    listWrap: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
    },
    row: {
      paddingVertical: theme.s(1.1),
      paddingHorizontal: theme.s(1.2),
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    rowHighlight: { backgroundColor: "#DBEAFE" },
    rankText: { fontWeight: "800", color: "#1E293B" },
    rowText: { color: "#334155", fontWeight: "700" },
    rowTextHighlight: { color: "#1D4ED8" },
    meCard: {
      backgroundColor: "#2563EB",
      borderRadius: 16,
      padding: theme.s(1.4),
      shadowColor: "#1D4ED8",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 10,
      elevation: 8,
      gap: 4,
    },
    meTitle: { color: "#EFF6FF", fontSize: 16, fontWeight: "900" },
    meText: { color: "#DBEAFE", fontSize: 14, fontWeight: "700" },
    centerState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.s(2),
    },
    stateText: { marginTop: theme.s(0.8), color: "#334155", fontWeight: "700" },
    errorText: { color: "#B91C1C", fontWeight: "700", textAlign: "center" },
  });
