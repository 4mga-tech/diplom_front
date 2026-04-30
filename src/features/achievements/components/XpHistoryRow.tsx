import { XpHistoryEntry } from "@/src/features/achievements/achievements.service";
import { AppTheme, useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function formatAmount(amount: number) {
  return `${amount > 0 ? "+" : ""}${amount} XP`;
}

function getHistoryDirectionLabel(amount: number) {
  return amount >= 0 ? "Added" : "Spent";
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString();
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    historyCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1.5),
      borderRadius: 22,
      padding: theme.s(2),
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
    historyIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    historyContent: {
      flex: 1,
    },
    historyReason: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 20,
    },
    historyDirection: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.45,
      marginTop: 4,
    },
    historyTimestamp: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 4,
    },
    historyAmount: {
      fontSize: 13,
      fontWeight: "900",
      textAlign: "right",
      maxWidth: 84,
    },
  });
}

export default function XpHistoryRow({ item }: { item: XpHistoryEntry }) {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const positive = item.amount >= 0;
  const accent = positive ? "#22C55E" : "#F87171";

  return (
    <View style={styles.historyCard}>
      <View
        style={[
          styles.historyIconWrap,
          {
            backgroundColor: theme.mode === "dark" ? `${accent}20` : `${accent}12`,
            borderColor: theme.mode === "dark" ? `${accent}40` : `${accent}22`,
          },
        ]}
      >
        <Ionicons
          name={positive ? "arrow-up-outline" : "arrow-down-outline"}
          size={18}
          color={accent}
        />
      </View>

      <View style={styles.historyContent}>
        <Text style={styles.historyReason}>{item.reason}</Text>
        <Text style={[styles.historyDirection, { color: accent }]}>
          {getHistoryDirectionLabel(item.amount)}
        </Text>
        <Text style={styles.historyTimestamp}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>

      <Text style={[styles.historyAmount, { color: accent }]}>
        {formatAmount(item.amount)}
      </Text>
    </View>
  );
}
