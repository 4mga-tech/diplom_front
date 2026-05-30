import { api } from "@/lib/api";
import { getAudioUrl, playAudio } from "@/lib/audio";
import { LessonContentItem, LessonGlossaryItem } from "@/lib/learning";
import GlossaryModal from "@/src/features/lesson/components/GlossaryModal";
import LessonActionButton from "@/src/features/lesson/components/LessonActionButton";
import LetterPracticeModal from "@/src/features/lesson/components/LetterPracticeModal";
import { LessonStyles } from "@/src/features/lesson/lesson.styles";
import * as Linking from "expo-linking";
import React from "react";
import { Animated, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LessonContentRendererProps = {
  item: LessonContentItem;
  styles: LessonStyles;
  onOpenQuiz: () => void;
  isFinalExam?: boolean;
  lessonId?: string;
};

type ContentBlockProps = LessonContentRendererProps & {
  content: any;
  glossary: LessonGlossaryItem[];
  onSelectGlossaryWord: (word: string) => void;
  activeGlossaryWordKey: string | null;
};

const asArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

type PracticeLetter = {
  id: string;
  primary: string;
  uppercase?: string | null;
  lowercase?: string | null;
  printForm?: string | null;
  cursiveForm?: string | null;
  call?: string | null;
  transcription?: string | null;
  pronunciation?: string | null;
  sound?: string | null;
};

const TOKEN_PATTERN = /(\s+|[^\s]+)/g;

function openLink(url?: string) {
  if (!url) return;

  void Linking.openURL(url).catch((error) => {
    console.error("Could not open lesson media:", error);
  });
}

function resolveBackendMediaUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  const apiBaseUrl = (api.defaults.baseURL || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  if (!apiBaseUrl) return url;

  return `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}


function hasTextValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}
function normalizeGlossaryWord(value: string) {
  return value
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .toLocaleLowerCase();
}

function createGlossaryIndex(glossary: LessonGlossaryItem[]) {
  return glossary.reduce<Record<string, LessonGlossaryItem>>((acc, item) => {
    const key = normalizeGlossaryWord(item.word ?? "");

    if (key) {
      acc[key] = item;
    }

    return acc;
  }, {});
}

function tokenizeText(value: string) {
  return value.match(TOKEN_PATTERN) ?? [value];
}

function BlockText({
  children,
  styles,
}: {
  children: React.ReactNode;
  styles: LessonStyles;
}) {
  return <Text style={styles.contentBody}>{children}</Text>;
}

function EmptyBlock({
  message,
  styles,
}: {
  message: string;
  styles: LessonStyles;
}) {
  return <BlockText styles={styles}>{message}</BlockText>;
}

function SupportingText({
  children,
  styles,
}: {
  children: React.ReactNode;
  styles: LessonStyles;
}) {
  return <Text style={styles.supportingText}>{children}</Text>;
}

function GlossaryText({
  text,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
  variant = "body",
}: {
  text: string;
  styles: LessonStyles;
  glossary: LessonGlossaryItem[];
  onSelectGlossaryWord: (word: string) => void;
  activeGlossaryWordKey: string | null;
  variant?: "body" | "title" | "note";
}) {
  const glossaryIndex = React.useMemo(() => createGlossaryIndex(glossary), [glossary]);

  if (glossary.length === 0) {
    if (variant === "title") {
      return <Text style={styles.innerTitle}>{text}</Text>;
    }

    if (variant === "note") {
      return <Text style={styles.noteText}>{text}</Text>;
    }

    return <BlockText styles={styles}>{text}</BlockText>;
  }

  const baseStyle =
    variant === "title"
      ? styles.innerTitle
      : variant === "note"
        ? styles.noteText
        : styles.contentBody;

  return (
    <Text style={baseStyle}>
      {tokenizeText(text).map((token, index) => {
        const normalizedToken = normalizeGlossaryWord(token);
        const glossaryItem = normalizedToken
          ? glossaryIndex[normalizedToken] ?? null
          : null;

        if (!glossaryItem) {
          return token;
        }

        return (
          <Text
            key={`${normalizedToken}-${index}`}
            style={[
              styles.glossaryWord,
              activeGlossaryWordKey === normalizedToken
                ? styles.glossaryWordActive
                : null,
            ]}
            suppressHighlighting
            onPress={() => onSelectGlossaryWord(token)}
          >
            {token}
          </Text>
        );
      })}
    </Text>
  );
}

function BilingualInstruction({
  instructionMn,
  instructionEn,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: {
  instructionMn?: string;
  instructionEn?: string;
  styles: LessonStyles;
  glossary: LessonGlossaryItem[];
  onSelectGlossaryWord: (word: string) => void;
  activeGlossaryWordKey: string | null;
}) {
  if (!instructionMn && !instructionEn) {
    return null;
  }

  return (
    <>
      {instructionMn ? (
        <GlossaryText
          text={instructionMn}
          styles={styles}
          glossary={glossary}
          onSelectGlossaryWord={onSelectGlossaryWord}
          activeGlossaryWordKey={activeGlossaryWordKey}
        />
      ) : null}
      {instructionEn ? (
        <SupportingText styles={styles}>{instructionEn}</SupportingText>
      ) : null}
    </>
  );
}

function TextContentBlock({
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  return (
    <>
      <GlossaryText
        text={content?.textMn || content?.text || ""}
        styles={styles}
        glossary={glossary}
        onSelectGlossaryWord={onSelectGlossaryWord}
        activeGlossaryWordKey={activeGlossaryWordKey}
      />
      {content?.textEn ? (
        <SupportingText styles={styles}>{content.textEn}</SupportingText>
      ) : null}
    </>
  );
}

function AlphabetTableContentBlock({ item, content, styles, lessonId }: ContentBlockProps) {
  const letters = React.useMemo(
    () =>
      (asArray<any>(content.letters).length > 0
        ? asArray<any>(content.letters)
        : asArray<any>(content.items).length > 0
          ? asArray<any>(content.items)
          : asArray<any>(content.rows)
      ).filter((letter) => Boolean(letter && typeof letter === "object")),
    [content.letters, content.items, content.rows],
  );
  const [selectedLetterIndex, setSelectedLetterIndex] = React.useState(0);
  const [isDetailVisible, setDetailVisible] = React.useState(false);
  const [interactionCount, setInteractionCount] = React.useState(0);
  const [gameChoice, setGameChoice] = React.useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { countLabelEn, countLabelMn } = React.useMemo(() => {
    const currentCountLabelEn = typeof content?.countLabelEn === "string" ? content.countLabelEn.trim() : "";
    const currentCountLabelMn = typeof content?.countLabelMn === "string" ? content.countLabelMn.trim() : "";

    return {
      countLabelEn: currentCountLabelEn,
      countLabelMn: currentCountLabelMn,
    };
  }, [content?.countLabelEn, content?.countLabelMn, item?.id]);
  const hasCountLabel = Boolean(countLabelEn || countLabelMn);
  const fallbackCountLabel = `${letters.length} letters`;

  if (letters.length === 0) {
    return <EmptyBlock message="No letters available yet." styles={styles} />;
  }

  const safeSelectedLetterIndex = Math.min(
    Math.max(selectedLetterIndex, 0),
    letters.length - 1,
  );
  const selectedLetter = letters[safeSelectedLetterIndex];
  const heroFloat = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, { toValue: -5, duration: 1800, useNativeDriver: true }),
        Animated.timing(heroFloat, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, [heroFloat]);

  const openLetter = (idx: number) => {
    const letter = letters[idx];
    setSelectedLetterIndex(idx);
    setInteractionCount((count) => count + 1);
    const resolvedAudioUrl = resolveBackendMediaUrl(letter?.audioUrl);
    if (resolvedAudioUrl) void playAudio(resolvedAudioUrl);
    setDetailVisible(true);
  };

  const gameTarget = letters[Math.min(2, letters.length - 1)];
  const gameOptions = [0, 1, 2]
    .map((i) => letters[i])
    .filter(Boolean)
    .map((entry) => entry?.printUpper ?? entry?.upper ?? "")
    .filter(Boolean);

  return (
    <View style={styles.stack}>
      <View style={styles.vowelHeroCard}>
        <Text style={styles.vowelHeroTitle}>Meet the Mongolian vowels</Text>
        <Text style={styles.vowelHeroSubtitle}>{hasCountLabel ? [countLabelEn, countLabelMn].filter(Boolean).join(" • ") : fallbackCountLabel}</Text>
        <Animated.View style={{ transform: [{ translateY: heroFloat }] }}>
          <Text style={styles.vowelHeroLetters}>А Э И О У Ө Ү</Text>
        </Animated.View>
      </View>
      <View style={styles.alphabetGrid}>
        {letters.map((letter, idx) => {
          const upper = letter?.printUpper ?? letter?.upper ?? "";
          const lower = letter?.printLower ?? letter?.lower ?? "";
          const transcription = letter?.transcription ?? letter?.pronunciation ?? "";

          return (
            <Pressable
              key={`${item.id}-letter-${idx}`}
              onPress={() => openLetter(idx)}
              style={({ pressed }) => [
                styles.alphabetTile,
                safeSelectedLetterIndex === idx ? styles.alphabetTileSelected : null,
                pressed ? styles.alphabetTilePressed : null,
              ]}
            >
              <View style={styles.alphabetTileHeader}>
                <Text style={styles.alphabetTileUpper}>{upper}</Text>
                {resolveBackendMediaUrl(letter?.audioUrl) ? <Text style={styles.alphabetTileAudioIcon}>▶</Text> : null}
              </View>
              <Text style={styles.alphabetTileLower}>{lower}</Text>
              {transcription ? <Text style={styles.alphabetTileSubtext}>{transcription}</Text> : null}
            </Pressable>
          );
        })}
      </View>
      {interactionCount >= 3 && lessonId !== "b1-u1-l1" ? (
        <View style={styles.traceCtaCard}>
          <Text style={styles.traceCtaTitle}>Ready to trace?</Text>
          <LessonActionButton label="Start tracing" onPress={() => setDetailVisible(true)} styles={styles} icon="create" />
        </View>
      ) : null}
      {gameOptions.length >= 3 ? (
        <View style={styles.listenGameCard}>
          <Text style={styles.innerTitle}>{lessonId === "b1-u1-l1" ? "Tap the vowel you hear" : lessonId === "b1-u1-l2" ? "Choose the correct vowel group" : "Listen and choose"}</Text>
          <LessonActionButton
            label="Play sound"
            onPress={() => {
              const resolvedAudioUrl = resolveBackendMediaUrl(gameTarget?.audioUrl);
              if (resolvedAudioUrl) void playAudio(resolvedAudioUrl);
            }}
            styles={styles}
            icon="volume-high"
          />
          <View style={styles.alphabetGrid}>
            {gameOptions.map((option) => {
              const isCorrect = option === (gameTarget?.printUpper ?? gameTarget?.upper ?? "");
              const selected = option === gameChoice;
              return (
                <Pressable key={option} onPress={() => setGameChoice(option)} style={[styles.alphabetTile, selected && (isCorrect ? styles.gameCorrect : styles.gameWrong)]}>
                  <Text style={styles.alphabetTileUpper}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
      <Modal visible={isDetailVisible} transparent animationType="slide">
        <Pressable style={styles.lessonSheetBackdrop} onPress={() => setDetailVisible(false)}>
          <Pressable style={[styles.lessonSheet, { paddingBottom: insets.bottom + 24 }]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <ScrollView bounces={false} contentContainerStyle={[styles.sheetContent, { paddingHorizontal: 24, paddingTop: 18 }]}>
              <Text style={styles.sheetLetterTitle}>
                {selectedLetter?.printUpper ?? selectedLetter?.upper ?? ""} {selectedLetter?.printLower ?? selectedLetter?.lower ?? ""}
              </Text>
              <Text style={styles.alphabetTileSubtext}>{selectedLetter?.transcription ?? selectedLetter?.pronunciation ?? ""}</Text>
              <View style={styles.sheetInfoRow}><Text style={styles.sheetInfoLabel}>Call:</Text><Text style={styles.sheetInfoValue}>{selectedLetter?.call ?? selectedLetter?.transcription ?? "—"}</Text></View>
              <View style={styles.sheetInfoRow}><Text style={styles.sheetInfoLabel}>Sound:</Text><Text style={styles.sheetInfoValue}>{selectedLetter?.transcription ?? selectedLetter?.pronunciation ?? "—"}</Text></View>
              <View style={styles.sheetInfoRow}><Text style={styles.sheetInfoLabel}>Type:</Text><Text style={styles.sheetInfoValue}>{selectedLetter?.group ?? "Basic vowel"}</Text></View>
              <View style={styles.sheetInfoRow}><Text style={styles.sheetInfoLabel}>Romanization:</Text><Text style={styles.sheetInfoValue}>{selectedLetter?.transcription ?? "—"}</Text></View>
              {asArray<any>(selectedLetter?.examples).length > 0 ? (
                <View style={styles.stackTight}>
                  <Text style={styles.sheetExamplesText}>Examples</Text>
                  {asArray<any>(selectedLetter?.examples).map((example, idx) => {
                    if (typeof example === "string") {
                      const value = example.trim();
                      return value ? <Text key={`${item.id}-example-${idx}`} style={styles.sheetMutedText}>{value}</Text> : null;
                    }
                    const text = String(example?.text ?? example?.word ?? "").trim();
                    const meaningEn = String(example?.meaningEn ?? "").trim();
                    if (!text && !meaningEn) return null;
                    return <Text key={`${item.id}-example-${idx}`} style={styles.sheetMutedText}>{text}{meaningEn ? ` — ${meaningEn}` : ""}</Text>;
                  })}
                </View>
              ) : null}
              {resolveBackendMediaUrl(selectedLetter?.audioUrl) ? null : <Text style={styles.sheetMutedText}>Audio unavailable</Text>}
              <View style={styles.row}>
                <View style={styles.sheetButtonFlex}>
                  <LessonActionButton label="Listen" onPress={() => {
                    const resolvedAudioUrl = resolveBackendMediaUrl(selectedLetter?.audioUrl);
                    if (!resolvedAudioUrl) return;
                    void playAudio(resolvedAudioUrl);
                  }} styles={styles} icon="play" disabled={!resolveBackendMediaUrl(selectedLetter?.audioUrl)} />
                </View>
                <View style={styles.sheetButtonFlex}>
                  <LessonActionButton label="Trace" onPress={() => setDetailVisible(false)} styles={styles} icon="create" />
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ClassificationContentBlock({
  item,
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  const groups = asArray<any>(content.groups);

  const getGroupItems = (group: any) =>
    asArray<any>(group?.items ?? group?.letters ?? group?.words)
      .map((entry) =>
        typeof entry === "string"
          ? entry
          : String(entry?.text ?? entry?.label ?? entry?.value ?? entry?.word ?? ""),
      )
      .map((value) => value.trim())
      .filter(Boolean);

  return (
    <View style={styles.stack}>
      {!!content.summary ? (
        <GlossaryText
          text={content.summary}
          styles={styles}
          glossary={glossary}
          onSelectGlossaryWord={onSelectGlossaryWord}
          activeGlossaryWordKey={activeGlossaryWordKey}
        />
      ) : null}
      {groups.length > 0 ? (
        <View style={styles.classificationGrid}>
        {groups.map((group, idx) => (
          <View key={`${item.id}-group-${idx}`} style={styles.classificationCard}>
            <Text style={styles.innerTitle}>{group?.title}</Text>
            {!!group?.description ? (
              <GlossaryText
                text={String(group.description)}
                styles={styles}
                glossary={glossary}
                onSelectGlossaryWord={onSelectGlossaryWord}
                activeGlossaryWordKey={activeGlossaryWordKey}
              />
            ) : null}
            <View style={styles.chipsWrap}>
              {getGroupItems(group).map((label, itemIndex) => (
                  <View key={`${item.id}-group-${idx}-item-${itemIndex}`} style={styles.chip}>
                    <Text style={styles.chipText}>{label}</Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
        </View>
      ) : null}
    </View>
  );
}
function HeroIntroContentBlock({
  styles,
}: ContentBlockProps) {
  return (
    <View style={styles.vowelHeroCard}>
      <Text style={styles.vowelHeroTitle}>Meet the Mongolian vowels</Text>
      <Text style={styles.vowelHeroSubtitle}>7 letters • Audio • Tracing</Text>
      <Text style={styles.vowelHeroLetters}>А Э И О У Ө Ү</Text>
    </View>
  );
}
function AlphabetPreviewContentBlock({
  content,
  styles,
}: ContentBlockProps) {
  const letters = asArray<string>(content.letters);

  if (letters.length === 0) {
    return (
      <EmptyBlock
        message="No letters available yet."
        styles={styles}
      />
    );
  }

  return (
    <View style={styles.letterPreviewGrid}>
      {letters.map((letter, idx) => (
        <View key={`${letter}-${idx}`} style={styles.letterPreviewChip}>
          <Text style={styles.letterPreviewText}>
            {letter}
          </Text>
        </View>
      ))}
    </View>
  );
}
function NextStepsContentBlock({

  content,
  styles,
}: ContentBlockProps) {


  const steps = asArray<string>(
    content.steps ?? content.highlights ?? content.items
  );

  if (steps.length === 0) {
    return null;
  }
  return (
    <View style={styles.stackTight}>
      {steps.map((step, idx) => {
        const label =
          typeof step === "string"
            ? step
            : (step as any)?.en ?? (step as any)?.mn ?? "";

        if (!label) return null;

        return (
          <View key={`${label}-${idx}`} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{idx + 1}</Text>
            </View>

            <Text style={styles.stepText}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}
function GrammarNoteContentBlock({
  item,
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  const normalizeNote = (value: unknown) => {
    if (typeof value === "string") {
      const mn = value.trim();
      return mn ? { mn, en: "" } : null;
    }

    if (value && typeof value === "object") {
      const record = value as { mn?: unknown; en?: unknown; textMn?: unknown; textEn?: unknown };
      const mn = typeof (record.mn ?? record.textMn) === "string" ? String(record.mn ?? record.textMn).trim() : "";
      const en = typeof (record.en ?? record.textEn) === "string" ? String(record.en ?? record.textEn).trim() : "";

      if (!mn && !en) {
        return null;
      }

      return { mn, en };
    }

    return null;
  };

  const notes = asArray<unknown>(content.notes)
    .map((note) => normalizeNote(note))
    .filter((note): note is { mn: string; en: string } => Boolean(note));

  const textMn = typeof content.textMn === "string" ? content.textMn.trim() : "";
  const textEn = typeof content.textEn === "string" ? content.textEn.trim() : "";

  if (notes.length === 0 && !textMn && !textEn) {
    return null;
  }

  const combinedNotes = [
    ...notes,
    ...(textMn || textEn ? [{ mn: textMn, en: textEn }] : []),
  ];

  return (
    <View style={styles.stackTight}>
      {combinedNotes.map((note, idx) => (
        <View key={`${item.id}-note-${idx}`} style={styles.grammarNoteCard}>
          <View style={styles.grammarNoteHeader}>
            <Text style={styles.grammarNoteIcon}>✦</Text>
            <GlossaryText
              text={note.mn || note.en}
              styles={styles}
              glossary={glossary}
              onSelectGlossaryWord={onSelectGlossaryWord}
              activeGlossaryWordKey={activeGlossaryWordKey}
              variant="note"
            />
          </View>
          {hasTextValue(note.en) ? (
            <Text style={styles.grammarNoteSubtitle}>{note.en}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function VocabListContentBlock({
  item,
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  const items = asArray<any>(content.items ?? content.words ?? content.vocabulary ?? content.vocab);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.vocabGrid}>
      {items.map((vocabItem, idx) => {
        const word = String(vocabItem?.text ?? vocabItem?.word ?? "").trim();
        const transcription = String(vocabItem?.transcription ?? vocabItem?.pronunciation ?? "").trim();
        const meaningEn = String(vocabItem?.meaningEn ?? vocabItem?.translation ?? vocabItem?.meaning ?? "").trim();
        const resolvedAudioUrl = resolveBackendMediaUrl(vocabItem?.audioUrl);

        if (!word && !transcription && !meaningEn) return null;

        return (
          <View key={`${item.id}-vocab-${idx}`} style={styles.vocabListCard}>
          <View style={styles.rowBetween}>
            <GlossaryText
              text={word}
              styles={styles}
              glossary={glossary}
              onSelectGlossaryWord={onSelectGlossaryWord}
              activeGlossaryWordKey={activeGlossaryWordKey}
              variant="title"
            />
            {resolvedAudioUrl ? (
              <Pressable
                onPress={() => {
                  if (!resolvedAudioUrl) return;
                  void playAudio(resolvedAudioUrl);
                }}
                style={({ pressed }) => [styles.vocabAudioButton, pressed ? styles.audioCardPressed : null]}
                accessibilityRole="button"
                accessibilityLabel={`Play ${word || "vocabulary audio"}`}
              >
                <Text style={styles.vocabAudioIcon}>▶</Text>
              </Pressable>
            ) : null}
          </View>
          {transcription ? (
            <Text style={styles.translitText}>{transcription}</Text>
          ) : null}
          {meaningEn ? (
            <Text style={styles.translationText}>{meaningEn}</Text>
          ) : null}
          </View>
        );
      })}
    </View>
  );
}

function ExerciseRepeatContentBlock({
  item,
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  const rows = asArray<any>(content.items ?? content.rows ?? []);
  const objectiveMn = String(content?.instructionMn ?? content?.textMn ?? "").trim();
  const objectiveEn = String(content?.instructionEn ?? content?.textEn ?? "").trim();
  const [playingKey, setPlayingKey] = React.useState<string | null>(null);

  const normalizeAudio = (row: any) => resolveBackendMediaUrl(row?.audioUrl) ?? (row?.audioKey ? getAudioUrl(row.audioKey) : (row?.primary ? getAudioUrl(`letters/${String(row.primary).toLowerCase()}.mp3`) : null));

  const comparisonRows = asArray<any>(content.comparisons ?? content.pairs ?? [])
    .map((pair) => ({
      left: String(pair?.left ?? pair?.a ?? pair?.first ?? "").trim(),
      leftSub: String(pair?.leftSub ?? pair?.leftTranscription ?? pair?.aSub ?? pair?.aTranscription ?? "").trim(),
      right: String(pair?.right ?? pair?.b ?? pair?.second ?? "").trim(),
      rightSub: String(pair?.rightSub ?? pair?.rightTranscription ?? pair?.bSub ?? pair?.bTranscription ?? "").trim(),
    }))
    .filter((pair) => pair.left && pair.right);

  const handlePlay = React.useCallback(async (row: any, idx: number) => {
    const audioUrl = normalizeAudio(row);
    if (!audioUrl) return;
    const key = `${item.id}-${idx}`;
    setPlayingKey(key);
    try {
      await playAudio(audioUrl);
    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setPlayingKey((current) => (current === key ? null : current));
    }
  }, [item.id]);

  return (
    <View style={styles.stack}>
      {objectiveMn || objectiveEn ? (
        <View style={styles.stackTight}>
          {objectiveMn ? <Text style={styles.innerTitle}>{objectiveMn}</Text> : null}
          {objectiveEn ? <Text style={styles.supportingText}>{objectiveEn}</Text> : null}
        </View>
      ) : null}
      {comparisonRows.length > 0 ? (
        <View style={styles.compactGrid}>
          {comparisonRows.map((pair, idx) => (
            <View key={`${item.id}-cmp-${idx}`} style={styles.comparisonCard}>
              <View style={styles.comparisonSide}>
                <Text style={styles.repeatCardLabel}>{pair.left}</Text>
                {pair.leftSub ? <Text style={styles.repeatCardSubtext}>{pair.leftSub}</Text> : null}
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonSide}>
                <Text style={styles.repeatCardLabel}>{pair.right}</Text>
                {pair.rightSub ? <Text style={styles.repeatCardSubtext}>{pair.rightSub}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
      {rows.length > 0 ? (
        <View style={styles.repeatGrid}>
          {rows.map((row, idx) => {
            const label = row?.primary ?? row?.prompt ?? row?.line ?? row?.text ?? "";
            if (!label) return null;
            const transcription = row?.call ?? row?.transcription ?? row?.pronunciation ?? "";
            const audioUrl = normalizeAudio(row);
            const itemKey = `${item.id}-${idx}`;
            const isPlaying = playingKey === itemKey;
            return (
              <Pressable
                key={`${item.id}-repeat-${idx}`}
                onPress={() => void handlePlay(row, idx)}
                disabled={!audioUrl}
                style={({ pressed }) => [styles.repeatCard, isPlaying ? styles.repeatCardPlaying : null, pressed ? styles.audioCardPressed : null, !audioUrl ? styles.repeatCardDisabled : null]}
              >
                <View style={styles.repeatCardTop}>
                  <Text style={styles.repeatCardLabel}>{label}</Text>
                  <Text style={[styles.repeatPlayIcon, !audioUrl ? styles.repeatPlayIconDisabled : null]}>{isPlaying ? "⏳" : "▶"}</Text>
                </View>
                {transcription ? <Text style={styles.repeatCardSubtext}>{transcription}</Text> : null}
                {isPlaying ? <Text style={styles.repeatPlayingText}>Playing</Text> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function ExerciseWriteContentBlock({
  item,
  content,
  styles,
}: ContentBlockProps) {
  const [selectedLetter, setSelectedLetter] = React.useState<PracticeLetter | null>(
    null,
  );
  const letters = React.useMemo(
    () =>
      asArray<any>(content.letters)
        .map((letter, idx) => normalizePracticeLetter(item.id, letter, idx))
        .filter((letter): letter is PracticeLetter => Boolean(letter?.primary)),
    [content.letters, item.id],
  );
  const groupedLetters = React.useMemo(
    () =>
      asArray<any>(content.groups)
        .map((group, groupIndex) => {
          const groupLetters = asArray<any>(group?.letters ?? group?.items)
            .map((letter, letterIndex) =>
              normalizePracticeLetter(
                `${item.id}-group-${groupIndex}`,
                letter,
                letterIndex,
              ),
            )
            .filter((letter): letter is PracticeLetter => Boolean(letter?.primary));

          if (groupLetters.length === 0) {
            return null;
          }

          return {
            id: String(group?.id ?? `${item.id}-group-${groupIndex}`),
            title: String(group?.title ?? `Group ${groupIndex + 1}`),
            description: String(
              group?.instructionMn ??
              group?.instructionEn ??
              group?.summary ??
              group?.description ??
              "",
            ),
            letters: groupLetters,
          };
        })
        .filter(
          (
            group,
          ): group is {
            id: string;
            title: string;
            description: string;
            letters: PracticeLetter[];
          } => Boolean(group),
        ),
    [content.groups, item.id],
  );

  function renderLetterButton(letter: PracticeLetter, idx: number) {
    return (
      <Pressable
        key={letter.id || `${item.id}-write-${idx}`}
        onPress={() => setSelectedLetter(letter)}
        style={({ pressed }) => [
          styles.writeLetterCard,
          pressed ? styles.writeLetterCardPressed : null,
        ]}
      >
        <Text style={styles.writeLetterPrimary}>{letter.primary}</Text>
        {letter.uppercase && letter.lowercase ? (
          <Text style={styles.writeLetterSecondary}>
            {letter.uppercase} / {letter.lowercase}
          </Text>
        ) : letter.printForm ? (
          <Text style={styles.writeLetterSecondary}>{letter.printForm}</Text>
        ) : (
          <Text style={styles.writeLetterSecondary}>Tap to trace</Text>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.stack}>
      <BilingualInstruction
        instructionMn={content?.instructionMn}
        instructionEn={content?.instructionEn}
        styles={styles}
        glossary={[]}
        onSelectGlossaryWord={() => { }}
        activeGlossaryWordKey={null}
      />
      <BlockText styles={styles}>Tap any letter tile to open tracing practice.</BlockText>
      {groupedLetters.length > 0 ? (
        <View style={styles.stack}>
          {groupedLetters.map((group) => (
            <View key={group.id} style={styles.vocabCard}>
              <Text style={styles.innerTitle}>{group.title}</Text>
              {group.description ? (
                <BlockText styles={styles}>{group.description}</BlockText>
              ) : null}
              <View style={styles.writeGrid}>
                {group.letters.map((letter, idx) => renderLetterButton(letter, idx))}
              </View>
            </View>
          ))}
        </View>
      ) : letters.length > 0 ? (
        <View style={styles.writeGrid}>
          {letters.map((letter, idx) => renderLetterButton(letter, idx))}
        </View>
      ) : (
        <EmptyBlock message="No writing exercise letters available yet." styles={styles} />
      )}
      <LetterPracticeModal
        visible={Boolean(selectedLetter)}
        letter={selectedLetter}
        onClose={() => setSelectedLetter(null)}
      />
    </View>
  );
}

function normalizePracticeLetter(
  itemId: string,
  raw: any,
  index: number,
): PracticeLetter | null {
  if (typeof raw === "string") {
    return {
      id: `${itemId}-letter-${index}`,
      primary: raw,
      uppercase: raw.toUpperCase(),
      lowercase: raw.toLowerCase(),
      printForm: raw,
    };
  }

  if (!raw || typeof raw !== "object") {
    return null;
  }

  const uppercase = raw?.printUpper ?? raw?.upper ?? raw?.uppercase ?? null;
  const lowercase = raw?.printLower ?? raw?.lower ?? raw?.lowercase ?? null;
  const printForm =
    raw?.printForm ??
    [uppercase, lowercase].filter(Boolean).join(" ") ??
    raw?.print ??
    null;
  const cursiveForm =
    raw?.cursiveForm ??
    [raw?.cursiveUpper, raw?.cursiveLower].filter(Boolean).join(" ") ??
    raw?.cursive ??
    null;
  const primary =
    raw?.primary ??
    uppercase ??
    lowercase ??
    raw?.letter ??
    raw?.value ??
    raw?.name ??
    "";

  if (!primary) {
    return null;
  }

  return {
    id: String(raw?.id ?? `${itemId}-letter-${index}`),
    primary: String(primary),
    uppercase: uppercase ? String(uppercase) : null,
    lowercase: lowercase ? String(lowercase) : null,
    printForm: printForm ? String(printForm) : null,
    cursiveForm: cursiveForm ? String(cursiveForm) : null,
    call: raw?.call ? String(raw.call) : null,
    transcription: raw?.transcription ? String(raw.transcription) : null,
    pronunciation: raw?.pronunciation ? String(raw.pronunciation) : null,
    sound: raw?.sound ? String(raw.sound) : null,
  };
}

function ExerciseFillContentBlock({
  content,
  styles,
}: ContentBlockProps) {
  const questions = asArray<any>(content.questions);
  const [selected, setSelected] = React.useState<Record<number, string>>({});

  if (questions.length === 0) {
    return <EmptyBlock message="No fill exercises available yet." styles={styles} />;
  }

  return (
    <View style={styles.stack}>
      {content?.instructionEn ? (
        <SupportingText styles={styles}>{content.instructionEn}</SupportingText>
      ) : null}

      {questions.map((question, idx) => {
        const selectedOption = selected[idx];
        const isCorrect =
          selectedOption?.toUpperCase() === String(question?.answer ?? "").toUpperCase();

        return (
          <View key={`fill-${idx}`} style={styles.fillQuestionCard}>
            <View style={styles.fillPromptRow}>
              <Text style={styles.fillPrompt}>{question?.prompt}</Text>

              {question?.meaningEn ? (
                <Text style={styles.fillMeaning}>{question.meaningEn}</Text>
              ) : null}
            </View>

            <View style={styles.fillOptionsRow}>
              {asArray<string>(question?.options).map((option, optionIdx) => {
                const isSelected = selectedOption === option;

                return (
                  <Pressable
                    key={`${option}-${optionIdx}`}
                    onPress={() =>
                      setSelected((current) => ({
                        ...current,
                        [idx]: option,
                      }))
                    }
                    style={[
                      styles.fillOptionChip,
                      isSelected ? styles.fillOptionSelected : null,
                    ]}
                  >
                    <Text style={styles.fillOptionText}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedOption ? (
              <Text style={isCorrect ? styles.correctText : styles.wrongText}>
                {isCorrect ? `Correct! ${question?.result ?? ""}` : "Try again"}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
function SyllableBuilderContentBlock({
  content,
  styles,
}: ContentBlockProps) {
  const patterns = asArray<any>(content.patterns);

  if (patterns.length === 0) {
    return <EmptyBlock message="No syllable patterns available yet." styles={styles} />;
  }

  return (
    <View style={styles.stack}>
      {content?.instructionEn ? (
        <SupportingText styles={styles}>{content.instructionEn}</SupportingText>
      ) : null}

      {patterns.map((pattern, idx) => {
        const base = String(pattern?.base ?? "");
        const vowels = asArray<string>(pattern?.vowels);
        const results = asArray<string>(pattern?.results);

        return (
          <View key={`${base}-${idx}`} style={styles.vocabCard}>
            <Text style={styles.innerTitle}>{base} + vowel</Text>

            <View style={styles.syllableGrid}>
              {results.map((result, resultIndex) => (
                <View key={`${result}-${resultIndex}`} style={styles.syllableChip}>
                  <Text style={styles.syllableFormula}>
                    {base} + {vowels[resultIndex] ?? ""}
                  </Text>
                  <Text style={styles.syllableResult}>{result}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function WordBuilderContentBlock({
  content,
  styles,
}: ContentBlockProps) {
  const words = asArray<any>(content.words);

  if (words.length === 0) {
    return (
      <EmptyBlock
        message="No word builder items available yet."
        styles={styles}
      />
    );
  }

  return (
    <View style={styles.stack}>
      {content?.instructionEn ? (
        <Text style={styles.supportingText}>
          {String(content.instructionEn)}
        </Text>
      ) : null}

      {words.map((wordItem, idx) => {
        const letters = asArray<string>(wordItem?.letters);
        const word = String(wordItem?.word ?? "");
        const meaning = String(wordItem?.meaningEn ?? "");

        return (
          <View key={`${word}-${idx}`} style={styles.wordPreviewRow}>
            <View style={styles.wordBuildLetters}>
              {letters.map((letter, letterIndex) => (
                <View
                  key={`${letter}-${letterIndex}`}
                  style={styles.letterPreviewChip}
                >
                  <Text style={styles.letterPreviewText}>
                    {String(letter)}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.wordBuildArrow}>↓</Text>

            <Text style={styles.wordBuildWord}>
              {word}
            </Text>

            {meaning ? (
              <Text style={styles.fillMeaning}>
                {meaning}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
function ExerciseWordBuildContentBlock({
  item,
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  const questions = asArray<any>(content.questions ?? content.items ?? content.rows ?? []);
  const example = content.example;
  const [playingKey, setPlayingKey] = React.useState<string | null>(null);

  const handlePlay = React.useCallback(async (audioUrl: string, key: string) => {
    setPlayingKey(key);
    try {
      await playAudio(audioUrl);
    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setPlayingKey((current) => (current === key ? null : current));
    }
  }, []);
  return (
    <View style={styles.stack}>
      <BilingualInstruction
        instructionMn={content?.instructionMn}
        instructionEn={content?.instructionEn}
        styles={styles}
        glossary={glossary}
        onSelectGlossaryWord={onSelectGlossaryWord}
        activeGlossaryWordKey={activeGlossaryWordKey}
      />
      {example ? (
        <View style={styles.vocabCard}>
          <Text style={styles.innerTitle}>Example</Text>
          <GlossaryText
            text={
              Array.isArray(example?.letters)
                ? example.letters.join(" ")
                : Array.isArray(example?.numbers)
                  ? example.numbers.join(" ")
                  : ""
            } styles={styles}
            glossary={glossary}
            onSelectGlossaryWord={onSelectGlossaryWord}
            activeGlossaryWordKey={activeGlossaryWordKey}
          />
          <Text style={styles.exampleWord}>Answer: {example?.answer ?? ""}</Text>
        </View>
      ) : null}
      {questions.length > 0 ? (
        <View style={styles.stack}>
          {questions.map((question, idx) => {
            const left = String(question?.left ?? "");
            const right = String(question?.right ?? "");
            const normalizedResult = String(question?.result ?? question?.correctAnswer ?? question?.answer ?? "").trim();
            const fallbackResultFromRight = !normalizedResult && right ? right : "";
            const visualResult = normalizedResult || fallbackResultFromRight;
            const transcription = String(question?.transcription ?? question?.pronunciation ?? "").trim();
            const audioUrl = resolveBackendMediaUrl(question?.audioUrl);
            const playKey = `${item.id}-word-build-${idx}`;
            const isPlaying = playingKey === playKey;

            return (
              <View key={`${item.id}-wb-${idx}`} style={[styles.wordBuildMiniCard, isPlaying ? styles.wordBuildMiniCardPlaying : null]}>
                <View style={styles.wordBuildFormulaRow}>
                  <View style={styles.wordBuildOperandChip}>
                    <Text style={styles.wordBuildOperandText}>{left}</Text>
                  </View>
                  <Text style={styles.wordBuildOperatorText}>+</Text>
                  <View style={styles.wordBuildOperandChip}>
                    <Text style={styles.wordBuildOperandText}>{right}</Text>
                  </View>
                  <Text style={styles.wordBuildOperatorText}>=</Text>
                  <View style={styles.wordBuildResultChip}>
                    <Text style={styles.wordBuildResultText}>{visualResult}</Text>
                  </View>
                </View>
                <Text style={styles.wordBuildArrow}>↓</Text>
                {!!visualResult ? (
                  <View style={styles.wordBuildResultCenter}>
                    <Text style={styles.wordBuildResultCenterText}>{visualResult}</Text>
                  </View>
                ) : null}
                {!!transcription ? (
                  <Text style={styles.supportingText}>{transcription}</Text>
                ) : null}
                <Pressable
                  onPress={() => {
                    if (!audioUrl) return;
                    void handlePlay(audioUrl, playKey);
                  }}
                  disabled={!audioUrl}
                  style={({ pressed }) => [
                    styles.wordBuildAudioButton,
                    isPlaying ? styles.wordBuildAudioButtonPlaying : null,
                    pressed ? styles.audioCardPressed : null,
                    !audioUrl ? styles.repeatCardDisabled : null,
                  ]}
                >
                  <Text style={[styles.repeatPlayIcon, !audioUrl ? styles.repeatPlayIconDisabled : null]}>
                    {isPlaying ? "⏳" : "▶"}
                  </Text>
                  <Text style={styles.wordBuildAudioButtonText}>
                    "Play"
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyBlock message="No word-build questions available yet." styles={styles} />
      )}
    </View>
  );
}

function PronunciationContentBlock({
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  return (
    <View style={styles.stack}>
      {!!content.letter ? <Text style={styles.letterText}>{content.letter}</Text> : null}
      {!!content.transliteration ? (
        <Text style={styles.translitText}>Sound: {content.transliteration}</Text>
      ) : null}
      {!!content.pronunciationTip ? (
        <BlockText styles={styles}>{content.pronunciationTip}</BlockText>
      ) : null}
      {!!content.exampleWord ? (
        <View style={styles.stackTight}>
          <Text style={styles.exampleWordLabel}>Example</Text>
          <GlossaryText
            text={String(content.exampleWord)}
            styles={styles}
            glossary={glossary}
            onSelectGlossaryWord={onSelectGlossaryWord}
            activeGlossaryWordKey={activeGlossaryWordKey}
          />
        </View>
      ) : null}
      {!!content.audioUrl ? (
        <LessonActionButton
          label="Play audio"
          onPress={() => { const resolvedAudioUrl = resolveBackendMediaUrl(content.audioUrl); if (!resolvedAudioUrl) return; void playAudio(resolvedAudioUrl); }}
          styles={styles}
          icon="play"
        />
      ) : null}
    </View>
  );
}

function AudioContentBlock({
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  return (
    <View style={styles.stack}>
      {!!content.text ? (
        <GlossaryText
          text={content.text}
          styles={styles}
          glossary={glossary}
          onSelectGlossaryWord={onSelectGlossaryWord}
          activeGlossaryWordKey={activeGlossaryWordKey}
        />
      ) : null}
      {!!content.audioUrl ? (
        <LessonActionButton
          label="Play audio"
          onPress={() => { const resolvedAudioUrl = resolveBackendMediaUrl(content.audioUrl); if (!resolvedAudioUrl) return; void playAudio(resolvedAudioUrl); }}
          styles={styles}
          icon="play"
        />
      ) : null}
    </View>
  );
}

function VideoContentBlock({ content, styles }: ContentBlockProps) {
  return (
    <BlockText styles={styles}>
      {content.videoUrl || content.url || "Video URL will be provided by the backend."}
    </BlockText>
  );
}

function QuizContentBlock({
  item,
  styles,
  onOpenQuiz,
  isFinalExam,
}: ContentBlockProps) {
  const quizContent = (item?.content ?? {}) as any;
  const hasQuizLink = Boolean(
    quizContent.quiz_link ??
      quizContent.quizLink ??
      quizContent.quizId ??
      quizContent.quiz_id ??
      quizContent.url,
  );
  if (!hasQuizLink) {
    return null;
  }

  return (
    <View style={styles.stack}>
      <BlockText styles={styles}>
        {isFinalExam
          ? "Complete the lesson and open the final exam."
          : "Complete the lesson and open the quiz."}
      </BlockText>
      <LessonActionButton
        label={isFinalExam ? "Open final exam" : "Open quiz"}
        onPress={onOpenQuiz}
        styles={styles}
        icon={isFinalExam ? "school" : "arrow-forward"}
      />
    </View>
  );
}

const CONTENT_COMPONENTS: Partial<
  Record<LessonContentItem["type"], React.ComponentType<ContentBlockProps>>
> = {
  text: TextContentBlock,
  hero_intro: HeroIntroContentBlock,
  alphabet_preview: AlphabetPreviewContentBlock,
  next_steps: NextStepsContentBlock,
  alphabet_table: AlphabetTableContentBlock,
  classification: ClassificationContentBlock,
  syllable_builder: SyllableBuilderContentBlock,
  word_builder: WordBuilderContentBlock,
  grammar_note: GrammarNoteContentBlock,
  vocab_list: VocabListContentBlock,
  exercise_repeat: ExerciseRepeatContentBlock,
  exercise_write: ExerciseWriteContentBlock,
  exercise_fill: ExerciseFillContentBlock,
  exercise_word_build: ExerciseWordBuildContentBlock,
  pronunciation: PronunciationContentBlock,
  audio: AudioContentBlock,
  video: VideoContentBlock,
  quiz: QuizContentBlock,
  quiz_link: QuizContentBlock,
};

export default function LessonContentRenderer({
  item,
  styles,
  onOpenQuiz,
  isFinalExam = false,
  lessonId,
}: LessonContentRendererProps) {
  const content = (item.content ?? {}) as any;
  const glossary = React.useMemo(
    () =>
      asArray<LessonGlossaryItem>(content.glossary).filter(
        (glossaryItem) =>
          Boolean(glossaryItem?.word) && Boolean(glossaryItem?.translation),
      ),
    [content.glossary],
  );
  const glossaryIndex = React.useMemo(() => createGlossaryIndex(glossary), [glossary]);
  const [selectedGlossaryItem, setSelectedGlossaryItem] =
    React.useState<LessonGlossaryItem | null>(null);
  const [activeGlossaryWordKey, setActiveGlossaryWordKey] = React.useState<string | null>(
    null,
  );
  const highlightTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const Component = CONTENT_COMPONENTS[item.type] ?? TextContentBlock;

  React.useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectGlossaryWord = React.useCallback(
    (word: string) => {
      if (glossary.length === 0) {
        return;
      }

      const normalizedWord = normalizeGlossaryWord(word);
      const glossaryItem = normalizedWord ? glossaryIndex[normalizedWord] ?? null : null;

      if (!glossaryItem) {
        return;
      }

      setSelectedGlossaryItem(glossaryItem);
      setActiveGlossaryWordKey(normalizedWord);

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = setTimeout(() => {
        setActiveGlossaryWordKey((current) =>
          current === normalizedWord ? null : current,
        );
      }, 700);
    },
    [glossary.length, glossaryIndex],
  );

  const handleCloseGlossary = React.useCallback(() => {
    setSelectedGlossaryItem(null);
    setActiveGlossaryWordKey(null);
  }, []);

  return (
    <>
      <Component
        item={item}
        content={content}
        styles={styles}
        lessonId={lessonId}
        glossary={glossary}
        onSelectGlossaryWord={handleSelectGlossaryWord}
        activeGlossaryWordKey={activeGlossaryWordKey}
        onOpenQuiz={onOpenQuiz}
        isFinalExam={isFinalExam}
      />
      <GlossaryModal
        visible={Boolean(selectedGlossaryItem)}
        item={selectedGlossaryItem}
        onClose={handleCloseGlossary}
      />
    </>
  );
}
