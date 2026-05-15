import { AppTheme } from "@/src/ui/theme";
import { StyleSheet } from "react-native";

export const createLessonStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      paddingHorizontal: theme.s(3),
      paddingTop: theme.s(1.5),
      paddingBottom: 0,
    },
    header: {
      gap: theme.s(1),
      marginBottom: theme.s(1),
    },
    headerMainRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.s(1.25),
    },
    headerIconButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.95)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
    },
    headerIconButtonPressed: {
      opacity: 0.75,
    },
    headerTitleWrap: {
      flex: 1,
      gap: 2,
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: 19,
      fontWeight: "900",
    },
    headerSubtitle: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
    },
    statusPill: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      textAlign: "center",
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
    scrollContent: { paddingBottom: theme.s(4), gap: theme.s(1.5) },
    heroCard: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.62)"
          : "rgba(148,163,184,0.16)",
      backgroundColor: theme.colors.cardStrong,
    },
    heroInner: {
      paddingHorizontal: 16,
      paddingVertical: 13,
      gap: theme.s(0.9),
    },
    heroTopMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.s(1),
    },
    heroStatePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
    },
    heroStatePillText: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    heroTextWrap: { gap: 4 },
    lessonOrderText: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.55,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 24,
    },
    heroTitleEn: {
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
    },
    heroSubtitle: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.82)" : "rgba(71,85,105,0.9)",
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600",
    },
    heroSubtitleEn: {
      color: theme.colors.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "600",
    },
    heroSummaryRow: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: theme.s(1),
      paddingHorizontal: theme.s(1),
      paddingVertical: theme.s(0.9),
      borderRadius: 14,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.54)" : "rgba(248,250,252,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.44)"
          : "rgba(148,163,184,0.16)",
    },
    heroSummaryItem: {
      flex: 1,
      gap: 4,
    },
    heroSummaryLabel: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.55,
    },
    heroSummaryValue: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "800",
      lineHeight: 18,
    },
    heroSummaryDivider: {
      width: 1,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.24)",
    },
    heroNoticeCompact: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      paddingHorizontal: theme.s(1),
      paddingVertical: theme.s(0.9),
      borderRadius: 14,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.1)"
          : "rgba(37,99,235,0.07)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.14)",
    },
    heroNoticeCompactText: {
      flex: 1,
      color: theme.mode === "dark" ? "rgba(226,232,240,0.9)" : "#334155",
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "600",
    },
    progressTrack: {
      height: 7,
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
      borderRadius: 16,
      padding: theme.s(1),
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.66)" : "rgba(255,255,255,0.94)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.14)"
          : "rgba(59,130,246,0.12)",
      gap: theme.s(0.9),
    },
    unitContextTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.s(1),
    },
    unitContextText: {
      flex: 1,
      gap: 4,
    },
    unitContextEyebrow: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.55,
    },
    unitContextTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "900",
      lineHeight: 18,
    },
    unitProgressText: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "700",
      lineHeight: 14,
    },
    unitProgressBadge: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.18)" : "rgba(37,99,235,0.1)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.14)",
    },
    unitProgressBadgeText: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
      fontSize: 11,
      fontWeight: "900",
    },
    navRow: {
      flexDirection: "row",
      gap: theme.s(1),
    },
    navButton: {
      flex: 1,
    },
    section: { gap: theme.s(1) },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: theme.s(1),
    },
    sectionHeaderText: {
      flex: 1,
      gap: 4,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "900",
    },
    sectionHelperText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 17,
    },
    sectionSummaryPill: {
      paddingHorizontal: 10,
      paddingVertical: 7,
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
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
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
      shadowOpacity: theme.mode === "dark" ? 0 : 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: theme.mode === "dark" ? 0 : 2,
    },
    contentCardViewed: {
      borderColor:
        theme.mode === "dark" ? "rgba(34,197,94,0.18)" : "rgba(34,197,94,0.14)",
    },
    contentCardPressed: {
      opacity: 0.97,
      transform: [{ scale: 0.997 }],
    },
    contentHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: theme.s(1.35),
      paddingVertical: theme.s(1.15),
    },
    contentHeaderLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    contentIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 12,
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
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.65,
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
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 19,
    },
    contentTitleEn: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 17,
    },
    contentBodyWrap: {
      paddingHorizontal: theme.s(1.35),
      paddingBottom: theme.s(1.35),
      gap: theme.s(0.85),
      borderTopWidth: 1,
      borderTopColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.35)"
          : "rgba(148,163,184,0.12)",
    },
    contentBody: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#334155",
      fontSize: 14,
      lineHeight: 21,
    },
    supportingText: {
      color: theme.colors.muted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
    },
    glossaryWord: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
      fontWeight: "700",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.14)" : "rgba(37,99,235,0.08)",
      borderRadius: 6,
    },
    glossaryWordActive: {
      color: theme.mode === "dark" ? "#E0F2FE" : "#1E40AF",
      backgroundColor:
        theme.mode === "dark" ? "rgba(59,130,246,0.28)" : "rgba(96,165,250,0.22)",
    },
    translationText: {
      color: theme.mode === "dark" ? "#93C5FD" : "#2563EB",
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "600",
    },
    stack: { gap: 10 },
    stackTight: { gap: 4 },
    innerCard: {
      borderRadius: 14,
      padding: theme.s(1.05),
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
      fontSize: 24,
      fontWeight: "900",
      lineHeight: 30,
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
      lineHeight: 20,
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    writeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    writeLetterCard: {
      width: "31%",
      minWidth: 92,
      borderRadius: 16,
      paddingVertical: theme.s(1.2),
      paddingHorizontal: theme.s(1),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.12)"
          : "rgba(37,99,235,0.07)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.18)"
          : "rgba(59,130,246,0.14)",
      gap: 4,
    },
    writeLetterCardPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    writeLetterPrimary: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900",
      lineHeight: 28,
      textAlign: "center",
    },
    writeLetterSecondary: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "700",
      lineHeight: 14,
      textAlign: "center",
    },
    audioGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    audioCard: {
      flex: 1,
      minWidth: 80,
      borderRadius: 14,
      paddingVertical: theme.s(1.5),
      paddingHorizontal: theme.s(1),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(59,130,246,0.12)"
          : "rgba(59,130,246,0.08)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.22)"
          : "rgba(59,130,246,0.18)",
      gap: 6,
    },
    audioCardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.97 }],
    },
    audioCardIcon: {
      color: "#3B82F6",
      fontSize: 20,
      fontWeight: "700",
    },
    audioCardLabel: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "800",
      textAlign: "center",
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
    exampleWordLabel: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    quizEntryCard: {
      borderRadius: 18,
      padding: theme.s(1.35),
      gap: theme.s(0.9),
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.2)"
          : "rgba(59,130,246,0.16)",
    },
    quizEntryTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.s(1.1),
    },
    quizEntryIconWrap: {
      width: 40,
      height: 40,
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
    quizEntryBody: {
      flex: 1,
      gap: 4,
    },
    quizEntryEyebrow: {
      color: "#93C5FD",
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.55,
    },
    quizEntryTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
      lineHeight: 20,
    },
    quizEntryText: {
      color: theme.mode === "dark" ? "rgba(226,232,240,0.92)" : "#334155",
      fontSize: 11,
      fontWeight: "600",
      lineHeight: 15,
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
    actionBarShell: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.bg,
      paddingHorizontal: theme.s(3),
      paddingBottom: theme.s(1),
      paddingTop: theme.s(1),
    },
    actionBar: {
      gap: theme.s(0.75),
      padding: theme.s(1),
      borderRadius: 18,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.92)"
          : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.58)"
          : "rgba(148,163,184,0.18)",
      shadowColor: theme.colors.shadow,
      shadowOpacity: theme.mode === "dark" ? 0 : 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: -4 },
      elevation: theme.mode === "dark" ? 0 : 6,
    },
    actionHelperText: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 16,
      marginBottom: theme.s(0.25),
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
      paddingVertical: theme.s(1.45),
      paddingHorizontal: theme.s(1.2),
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.r.xl,
    },
    secondaryButtonInner: {
      paddingVertical: theme.s(1.35),
      paddingHorizontal: theme.s(1.2),
      alignItems: "center",
      justifyContent: "center",
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
      fontSize: 14,
      fontWeight: "900",
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
  });

export type LessonStyles = ReturnType<typeof createLessonStyles>;
