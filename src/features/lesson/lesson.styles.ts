import { AppTheme } from "@/src/ui/theme";
import { StyleSheet } from "react-native";

export const createLessonStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      paddingHorizontal: theme.s(3),
      paddingTop: theme.s(5),
      paddingBottom: theme.s(3),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.s(1.25),
      marginBottom: theme.s(2.25),
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.68)"
          : "rgba(255,255,255,0.9)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.16)",
      maxWidth: "62%",
    },
    statusPillText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.s(1.5),
      paddingHorizontal: theme.s(3),
    },
    stateCard: {
      width: "100%",
      maxWidth: 360,
      padding: theme.s(3),
      borderRadius: theme.r.xl,
      backgroundColor: theme.colors.cardStrong,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.16)",
      alignItems: "center",
      gap: theme.s(1.5),
    },
    stateIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.16)" : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.14)",
    },
    stateTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
      textAlign: "center",
    },
    stateText: {
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 21,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: theme.s(4), gap: theme.s(3) },
    heroCard: {
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.65)"
          : "rgba(148,163,184,0.18)",
      backgroundColor: theme.colors.cardStrong,
      position: "relative",
    },
    heroGlow: {
      position: "absolute",
      top: -72,
      right: -48,
      width: 240,
      height: 240,
      borderRadius: 999,
      opacity: theme.mode === "dark" ? 1 : 0.8,
      transform: [{ rotate: "14deg" }],
    },
    heroInner: {
      paddingHorizontal: theme.s(3),
      paddingVertical: theme.s(3.1),
      gap: theme.s(2.35),
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.s(2),
    },
    heroBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.16)"
          : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.16)",
    },
    heroBadgeText: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    heroIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.78)",
    },
    heroTextWrap: { gap: 8 },
    lessonOrderText: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 30,
      fontWeight: "900",
      lineHeight: 36,
    },
    heroSubtitle: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#475569",
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
    },
    heroNotice: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: theme.s(1.75),
      borderRadius: 18,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.62)"
          : "rgba(255,255,255,0.82)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.14)"
          : "rgba(59,130,246,0.12)",
    },
    heroNoticeText: {
      flex: 1,
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#334155",
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
    },
    metaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.s(1.25),
    },
    metaCard: {
      minWidth: 132,
      flex: 1,
      borderRadius: 18,
      paddingHorizontal: 15,
      paddingVertical: 15,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.72)"
          : "rgba(255,255,255,0.88)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.52)"
          : "rgba(148,163,184,0.18)",
      gap: 8,
    },
    metaValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    metaLabel: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    metaValue: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
    },
    progressTrack: {
      height: 10,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.48)" : "rgba(226,232,240,0.92)",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: "#60A5FA",
    },
    unitContextCard: {
      borderRadius: 22,
      padding: theme.s(2),
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.92)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.16)"
          : "rgba(59,130,246,0.14)",
      gap: theme.s(1.25),
    },
    unitContextTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.s(1.25),
    },
    unitContextText: {
      flex: 1,
      gap: 4,
    },
    unitContextEyebrow: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    unitContextTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
      lineHeight: 22,
    },
    unitContextMeta: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
      fontSize: 12,
      fontWeight: "800",
    },
    unitProgressText: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 20,
    },
    navRow: {
      flexDirection: "row",
      gap: theme.s(1),
    },
    navButton: {
      flex: 1,
    },
    section: { gap: theme.s(1.5) },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: theme.s(1.5),
    },
    sectionHeaderText: {
      flex: 1,
      gap: 4,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
    },
    sectionHelperText: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
    },
    sectionSummaryPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.12)"
          : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.14)"
          : "rgba(59,130,246,0.12)",
    },
    sectionCaption: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    contentCard: {
      borderRadius: theme.r.xl,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.95)",
      overflow: "hidden",
    },
    contentCardActive: {
      borderColor:
        theme.mode === "dark" ? "rgba(96,165,250,0.28)" : "rgba(59,130,246,0.22)",
      shadowColor: theme.colors.shadow,
      shadowOpacity: theme.mode === "dark" ? 0 : 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: theme.mode === "dark" ? 0 : 2,
    },
    contentCardViewed: {
      borderColor:
        theme.mode === "dark" ? "rgba(34,197,94,0.18)" : "rgba(34,197,94,0.14)",
    },
    contentCardPressed: {
      opacity: 0.96,
      transform: [{ scale: 0.995 }],
    },
    contentHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: theme.s(2),
      paddingVertical: theme.s(2),
    },
    contentHeaderLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    contentIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.14)"
          : "rgba(37,99,235,0.08)",
    },
    contentIconWrapActive: {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.2)"
          : "rgba(37,99,235,0.14)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.16)",
    },
    contentHeaderText: { flex: 1, gap: 3 },
    contentMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    contentLabel: {
      color: "rgba(148,163,184,0.78)",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      flexShrink: 1,
    },
    contentStatusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },
    contentStatusText: {
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    contentTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "800",
      lineHeight: 22,
    },
    contentBodyWrap: {
      paddingHorizontal: theme.s(2),
      paddingBottom: theme.s(2.2),
      gap: theme.s(1.25),
      borderTopWidth: 1,
      borderTopColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.35)"
          : "rgba(148,163,184,0.12)",
    },
    contentBody: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#334155",
      fontSize: 14,
      lineHeight: 22,
    },
    translationText: {
      color: theme.mode === "dark" ? "#93C5FD" : "#2563EB",
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
    },
    stack: { gap: 10 },
    innerCard: {
      borderRadius: 18,
      padding: theme.s(1.6),
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.5)"
          : "rgba(241,245,249,0.95)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.35)"
          : "rgba(148,163,184,0.14)",
      gap: 6,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    innerTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 20,
    },
    letterText: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "900",
      lineHeight: 34,
    },
    groupBadge: {
      color: "#C4B5FD",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    noteRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    noteBullet: {
      color: "#60A5FA",
      fontSize: 16,
      fontWeight: "900",
      lineHeight: 20,
    },
    noteText: {
      flex: 1,
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#334155",
      fontSize: 14,
      lineHeight: 21,
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(59,130,246,0.18)"
          : "rgba(37,99,235,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.25)"
          : "rgba(37,99,235,0.14)",
    },
    chipText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
    },
    translitText: {
      color: theme.mode === "dark" ? "#93C5FD" : "#2563EB",
      fontSize: 14,
      fontWeight: "700",
    },
    exampleWord: {
      color: theme.mode === "dark" ? "#FDE68A" : "#B45309",
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 21,
    },
    quizEntryCard: {
      borderRadius: 24,
      padding: theme.s(2.1),
      gap: theme.s(1.3),
      overflow: "hidden",
      position: "relative",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.16)",
    },
    quizEntryGlow: {
      position: "absolute",
      top: -24,
      right: -18,
      width: 160,
      height: 160,
      borderRadius: 999,
    },
    quizEntryTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.s(1.25),
    },
    quizEntryIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.2)" : "rgba(37,99,235,0.12)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.22)"
          : "rgba(59,130,246,0.16)",
    },
    quizEntryTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 24,
    },
    quizEntryText: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#334155",
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 20,
      marginTop: 4,
    },
    quizEntryMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.s(1),
    },
    quizEntryMeta: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    actionBar: {
      marginTop: theme.s(2),
      padding: theme.s(1),
      gap: theme.s(1),
      borderRadius: 22,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.82)"
          : "rgba(255,255,255,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.58)"
          : "rgba(148,163,184,0.18)",
      shadowColor: theme.colors.shadow,
      shadowOpacity: theme.mode === "dark" ? 0 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: theme.mode === "dark" ? 0 : 2,
    },
    actionButton: {
      borderRadius: theme.r.xl,
      overflow: "hidden",
    },
    actionButtonPressed: {
      opacity: 0.92,
    },
    actionButtonDisabled: {
      opacity: 0.55,
    },
    primaryButtonInner: {
      paddingVertical: theme.s(2),
      alignItems: "center",
      borderRadius: theme.r.xl,
    },
    secondaryButtonInner: {
      paddingVertical: theme.s(2),
      alignItems: "center",
      borderRadius: theme.r.xl,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.6)"
          : "rgba(148,163,184,0.2)",
      backgroundColor:
        theme.mode === "dark" ? "rgba(30,41,59,0.45)" : "rgba(248,250,252,0.96)",
    },
    primaryButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
  });

export type LessonStyles = ReturnType<typeof createLessonStyles>;
