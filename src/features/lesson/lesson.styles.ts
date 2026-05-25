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
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 23,
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
      borderRadius: 22,
      padding: theme.s(1.5),
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.88)"
          : "rgba(255,255,255,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.42)"
          : "rgba(148,163,184,0.12)",
      gap: theme.s(1),
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
    heroBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.9)"
          : "rgba(241,245,249,1)",
    },
    heroBadgeText: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    heroStatusDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    heroTextWrap: {
      flex: 1,
      gap: 3,
    }, lessonOrderText: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      lineHeight: 28,
    },
    heroMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    heroMetaDivider: {
      width: 4,
      height: 4,
      borderRadius: 999,
      backgroundColor: "rgba(148,163,184,0.5)",
    },

    heroMetaText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
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
      borderRadius: 16,
      borderWidth: 1,
      padding: 0,
      marginBottom: 8,
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.62)" : "rgba(255,255,255,0.95)",
      borderColor:
        theme.mode === "dark" ? "rgba(51,65,85,0.35)" : "rgba(148,163,184,0.14)",
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
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
      gap: 10,
    },
    contentHeaderLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    contentIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(37,99,235,0.16)" : "rgba(37,99,235,0.08)",
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
      fontSize: 15,
      fontWeight: "900",
      lineHeight: 18,
    },
    contentTitleEn: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 17,
    },
    contentBodyWrap: {
      paddingHorizontal: 12,
      paddingBottom: 10,
      paddingTop: 2,
      gap: theme.s(0.85),
      borderTopWidth: 0,
      borderTopColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.35)"
          : "rgba(148,163,184,0.12)",
      marginTop: 6,

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
      borderRadius: 12,
      padding: 9,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.5)"
          : "rgba(241,245,249,0.95)",
      borderWidth: 0,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.35)"
          : "rgba(148,163,184,0.14)",
      gap: 5,
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
    grammarNoteCard: {
      borderRadius: 12,
      paddingHorizontal: theme.s(1),
      paddingVertical: theme.s(0.8),
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.62)"
          : "rgba(248,250,252,0.96)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(71,85,105,0.5)"
          : "rgba(148,163,184,0.22)",
      gap: 4,
    },
    grammarNoteHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    grammarNoteIcon: {
      color: "#60A5FA",
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "900",
      marginTop: 1,
    },
    grammarNoteSubtitle: {
      marginLeft: 20,
      color: theme.colors.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "600",
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    alphabetGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "space-between",
    },
    alphabetTile: {
      width: "23.5%",
      minWidth: 74,
      borderRadius: 16,
      paddingVertical: theme.s(0.8),
      paddingHorizontal: theme.s(0.65),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.82)"
          : "rgba(248,250,252,0.94)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(71,85,105,0.65)"
          : "rgba(148,163,184,0.28)",
      gap: 2,
    },
    alphabetTileSelected: {
      borderColor: "#60A5FA",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(37,99,235,0.22)"
          : "rgba(59,130,246,0.12)",
      shadowColor: "#60A5FA",
      shadowOpacity: theme.mode === "dark" ? 0.35 : 0.16,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 3,
    },
    alphabetTilePressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    alphabetTileUpper: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      lineHeight: 24,
      textAlign: "center",
    },
    alphabetTileLower: {
      color: theme.mode === "dark" ? "#CBD5E1" : "#475569",
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 16,
      textAlign: "center",
    },
    alphabetTileHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    alphabetTileAudioIcon: {
      color: "#93C5FD",
      fontSize: 11,
      fontWeight: "900",
    },
    alphabetTileSubtext: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 14,
      textAlign: "center",
    },
    vowelHeroCard: {
      borderRadius: 22,
      padding: theme.s(1.5),
      backgroundColor: theme.mode === "dark" ? "rgba(2,6,23,0.95)" : "rgba(15,23,42,0.96)",
      borderWidth: 1,
      borderColor: "rgba(96,165,250,0.35)",
      gap: theme.s(0.8),
    },
    vowelHeroTitle: {
      color: "#E2E8F0",
      fontSize: 24,
      fontWeight: "900",
    },
    vowelHeroSubtitle: {
      color: "#93C5FD",
      fontSize: 13,
      fontWeight: "700",
    },
    vowelHeroLetters: {
      color: "#F8FAFC",
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: 4,
    },
    traceCtaCard: {
      borderRadius: 16,
      padding: theme.s(1.2),
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.82)" : "rgba(241,245,249,0.95)",
      borderWidth: 1,
      borderColor: "rgba(96,165,250,0.3)",
      gap: 8,
    },
    traceCtaTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
    },
    listenGameCard: {
      borderRadius: 16,
      padding: theme.s(1.1),
      backgroundColor: theme.mode === "dark" ? "rgba(15,23,42,0.88)" : "rgba(255,255,255,0.98)",
      borderWidth: 1,
      borderColor: "rgba(96,165,250,0.3)",
      gap: 10,
    },
    gameCorrect: {
      borderColor: "#22C55E",
      backgroundColor: "rgba(34,197,94,0.18)",
    },
    gameWrong: {
      borderColor: "#F87171",
      backgroundColor: "rgba(248,113,113,0.18)",
    },
    lessonSheetBackdrop: {
      flex: 1,
      backgroundColor: "rgba(2,6,23,0.65)",
      justifyContent: "flex-end",
    },
    lessonSheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 10,
      backgroundColor: theme.mode === "dark" ? "rgba(15,23,42,0.99)" : "#fff",
      borderWidth: 1,
      borderColor: "rgba(96,165,250,0.28)",
      maxHeight: "92%",
    },
    sheetHandle: {
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: "rgba(148,163,184,0.7)",
      alignSelf: "center",
      marginBottom: 6,
    },
    sheetContent: {
      gap: 12,
    },
    sheetLetterTitle: {
      color: theme.colors.text,
      fontSize: 36,
      textAlign: "center",
      fontWeight: "900",
      lineHeight: 42,
    },
    sheetInfoRow: {
      flexDirection: "row",
      gap: 8,
    },
    sheetInfoLabel: {
      width: 56,
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "700",
    },
    sheetInfoValue: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    sheetExamplesText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    sheetMutedText: {
      color: theme.colors.muted,
      fontSize: 12,
      textAlign: "center",
    },
    sheetButtonFlex: { flex: 1 },
    row: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
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
    repeatGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    repeatCard: {
      width: "48%",
      minHeight: 84,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.82)" : "rgba(248,250,252,0.98)",
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(71,85,105,0.6)" : "rgba(148,163,184,0.22)",
      gap: 6,
    },
    repeatCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    repeatCardLabel: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
    },
    repeatCardSubtext: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
    },
    repeatPlayIcon: {
      color: "#93C5FD",
      fontSize: 16,
      fontWeight: "900",
    },
    repeatPlayIconDisabled: {
      color: "rgba(148,163,184,0.5)",
    },
    repeatCardDisabled: {
      opacity: 0.7,
    },
    repeatCardPlaying: {
      borderColor: "#60A5FA",
      shadowColor: "#60A5FA",
      shadowOpacity: 0.28,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 2,
    },
    repeatPlayingText: {
      color: "#93C5FD",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
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
    syllableGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 6,
    },

    syllableChip: {
      minWidth: 58,

      borderRadius: 12,
      paddingVertical: 7,
      paddingHorizontal: 12,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(59,130,246,0.16)"
          : "rgba(59,130,246,0.08)",
    },

    syllableFormula: {
      fontSize: 10,
      opacity: 0.65,
      color: theme.colors.text,
    },

    syllableResult: {
      marginTop: 2,
      fontSize: 16,
      fontWeight: "900",
      color: theme.colors.text,
    },
    wordPreviewRow: {
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor:
        theme.mode === "dark" ? "rgba(30,41,59,0.24)" : "rgba(241,245,249,0.65)",
      gap: 6,
    },
    wordBuildLetters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
      justifyContent: "center",
    },

    wordBuildArrow: {
      marginTop: 0,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "800",
      color: theme.colors.muted,
    },
    builtWordBox: {
      marginTop: 6,
      minHeight: 34,
      paddingVertical: 6,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(15,23,42,0.55)"
          : "rgba(241,245,249,0.9)",
    },

    builtWordText: {
      fontSize: 16,
      fontWeight: "900",
      letterSpacing: 1.5,
      color: theme.colors.text,
    },

    wordBuildActions: {
      marginTop: 6,
      flexDirection: "row",
      gap: 8,
    },

    wordBuildPrimaryButton: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: "#3B82F6",
    },

    wordBuildSecondaryButton: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(148,163,184,0.12)",
    },



    wordBuildSecondaryText: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.text,
    },

    wordBuildPrimaryText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    correctText: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "800",
      color: "#22C55E",
    },
    fillQuestionCard: {
      borderRadius: 12,
      padding: 10,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.28)"
          : "rgba(241,245,249,0.72)",
      gap: 8,
    },

    fillPromptRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    fillPrompt: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.colors.text,
      letterSpacing: 1,
    },

    fillMeaning: {
      fontSize: 12,
      opacity: 0.65,
      color: theme.colors.text,
    },

    fillOptionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    fillOptionChip: {
      minWidth: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(59,130,246,0.14)"
          : "rgba(59,130,246,0.08)",
    },
    fillOptionSelected: {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(59,130,246,0.35)"
          : "rgba(59,130,246,0.22)",
      borderWidth: 1,
      borderColor: "#3B82F6",
    },
    fillOptionText: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.colors.text,
    },
    wrongText: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "800",
      color: "#EF4444",
    },
    wordBuildWord: {
      marginTop: 0,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "900",
      color: theme.colors.text,
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
    heroMn: {
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 21,
      color: theme.colors.text,

    },

    heroEn: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 17,
      opacity: 0.72,
      color: theme.colors.text,

    },

    heroStatsRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: 8,
    },

    heroStatCard: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 6,
      alignItems: "center",
      backgroundColor: "rgba(59,130,246,0.08)",
    },


    heroStatValue: {
      fontSize: 15,
      fontWeight: "900",
      color: theme.colors.text,

    },
    wordBuildMiniCard: {
      borderRadius: 12,
      padding: 8,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(30,41,59,0.32)"
          : "rgba(241,245,249,0.72)",
      gap: 6,
    },

    heroStatLabel: {
      marginTop: 2,
      fontSize: 10,
      opacity: 0.7,
      color: theme.colors.text,

    },
    letterPreviewGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    letterPreviewChip: {
      width: 28,
      height: 28,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(59,130,246,0.10)",
    },

    letterPreviewText: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.colors.text,

    },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    stepBadge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(59,130,246,0.12)",
    },

    stepBadgeText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.colors.text,

    },

    stepText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,

    },
  });

export type LessonStyles = ReturnType<typeof createLessonStyles>;
