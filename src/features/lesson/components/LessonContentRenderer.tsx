import { LessonContentItem, LessonGlossaryItem } from "@/lib/learning";
import { playAudio, getAudioUrl } from "@/lib/audio";
import GlossaryModal from "@/src/features/lesson/components/GlossaryModal";
import LessonActionButton from "@/src/features/lesson/components/LessonActionButton";
import LetterPracticeModal from "@/src/features/lesson/components/LetterPracticeModal";
import { LessonStyles } from "@/src/features/lesson/lesson.styles";
import * as Linking from "expo-linking";
import React from "react";
import { Pressable, Text, View } from "react-native";

type LessonContentRendererProps = {
  item: LessonContentItem;
  styles: LessonStyles;
  onOpenQuiz: () => void;
  isFinalExam?: boolean;
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
};

const TOKEN_PATTERN = /(\s+|[^\s]+)/g;

function openLink(url?: string) {
  if (!url) return;

  void Linking.openURL(url).catch((error) => {
    console.error("Could not open lesson media:", error);
  });
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
        text={content?.textMn || content?.text || "Lesson text will appear here."}
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

function AlphabetTableContentBlock({ item, content, styles }: ContentBlockProps) {
  const letters = asArray<any>(content.letters);

  if (letters.length === 0) {
    return <EmptyBlock message="No letters available yet." styles={styles} />;
  }

  return (
    <View style={styles.stack}>
      {letters.map((letter, idx) => (
        <View key={`${item.id}-letter-${idx}`} style={styles.innerCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.letterText}>
              {letter?.printUpper ?? letter?.upper ?? ""}{" "}
              {letter?.printLower ?? letter?.lower ?? ""}
            </Text>
            {letter?.group ? (
              <Text style={styles.groupBadge}>{letter.group}</Text>
            ) : null}
          </View>
          {!!letter?.nameMn ? (
            <BlockText styles={styles}>Call: {letter.nameMn}</BlockText>
          ) : null}
          {!!letter?.pronunciation ? (
            <BlockText styles={styles}>
              Pronunciation: {letter.pronunciation}
            </BlockText>
          ) : null}
        </View>
      ))}
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
        groups.map((group, idx) => (
          <View key={`${item.id}-group-${idx}`} style={styles.innerCard}>
            <Text style={styles.innerTitle}>{group?.title}</Text>
            <GlossaryText
              text={Array.isArray(group?.items) ? group.items.join(", ") : ""}
              styles={styles}
              glossary={glossary}
              onSelectGlossaryWord={onSelectGlossaryWord}
              activeGlossaryWordKey={activeGlossaryWordKey}
            />
          </View>
        ))
      ) : (
        <EmptyBlock message="No classification groups available yet." styles={styles} />
      )}
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
  const notes = asArray<string>(content.notes);

  if (notes.length === 0) {
    return <EmptyBlock message="No grammar notes available yet." styles={styles} />;
  }

  return (
    <View style={styles.stack}>
      {notes.map((note, idx) => (
        <View key={`${item.id}-note-${idx}`} style={styles.noteRow}>
          <Text style={styles.noteBullet}>-</Text>
          <GlossaryText
            text={note}
            styles={styles}
            glossary={glossary}
            onSelectGlossaryWord={onSelectGlossaryWord}
            activeGlossaryWordKey={activeGlossaryWordKey}
            variant="note"
          />
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
  const items = asArray<any>(content.items);

  if (items.length === 0) {
    return <EmptyBlock message="No vocabulary items available yet." styles={styles} />;
  }

  return (
    <View style={styles.stack}>
      {items.map((vocabItem, idx) => (
        <View key={`${item.id}-vocab-${idx}`} style={styles.innerCard}>
          <GlossaryText
            text={String(vocabItem?.word ?? "")}
            styles={styles}
            glossary={glossary}
            onSelectGlossaryWord={onSelectGlossaryWord}
            activeGlossaryWordKey={activeGlossaryWordKey}
            variant="title"
          />
          <GlossaryText
            text={String(vocabItem?.meaning ?? "")}
            styles={styles}
            glossary={glossary}
            onSelectGlossaryWord={onSelectGlossaryWord}
            activeGlossaryWordKey={activeGlossaryWordKey}
          />
        </View>
      ))}
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
  const rows = asArray<any>(content.rows);
  const hasLetterAudio = rows.some((row: any) => row?.audioKey || (row?.primary && !row?.audioUrl));

  const handleAudioPlay = React.useCallback(async (audioKey: string) => {
    const audioUrl = getAudioUrl(audioKey);
    try {
      await playAudio(audioUrl);
    } catch (error) {
      console.error("Failed to play audio:", error);
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
      {rows.length > 0 ? (
        hasLetterAudio ? (
          <View style={styles.audioGrid}>
            {rows.map((row, idx) => {
              const audioKey = row?.audioKey || (row?.primary ? `letters/${row.primary.toLowerCase()}.mp3` : null);
              if (!audioKey) return null;
              return (
                <Pressable
                  key={`${item.id}-audio-${idx}`}
                  onPress={() => handleAudioPlay(audioKey)}
                  style={({ pressed }) => [
                    styles.audioCard,
                    pressed ? styles.audioCardPressed : null,
                  ]}
                >
                  <Text style={styles.audioCardIcon}>▶</Text>
                  {row?.primary ? (
                    <Text style={styles.audioCardLabel}>{row.primary}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          rows.map((row, idx) => (
            <View key={`${item.id}-row-${idx}`} style={styles.innerCard}>
              {!!row?.prompt ? (
                <GlossaryText
                  text={String(row.prompt)}
                  styles={styles}
                  glossary={glossary}
                  onSelectGlossaryWord={onSelectGlossaryWord}
                  activeGlossaryWordKey={activeGlossaryWordKey}
                  variant="title"
                />
              ) : null}
              {!!row?.line ? (
                <GlossaryText
                  text={String(row.line)}
                  styles={styles}
                  glossary={glossary}
                  onSelectGlossaryWord={onSelectGlossaryWord}
                  activeGlossaryWordKey={activeGlossaryWordKey}
                />
              ) : null}
              {!!row?.text ? (
                <GlossaryText
                  text={String(row.text)}
                  styles={styles}
                  glossary={glossary}
                  onSelectGlossaryWord={onSelectGlossaryWord}
                  activeGlossaryWordKey={activeGlossaryWordKey}
                />
              ) : null}
              {!!row?.audioUrl ? (
                <LessonActionButton
                  label="Play practice audio"
                  onPress={() => openLink(row.audioUrl)}
                  styles={styles}
                  icon="play"
                />
              ) : null}
            </View>
          ))
        )
      ) : (
        <EmptyBlock message="No repeat exercise items available yet." styles={styles} />
      )}
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
        onSelectGlossaryWord={() => {}}
        activeGlossaryWordKey={null}
      />
      <BlockText styles={styles}>Tap any letter tile to open tracing practice.</BlockText>
      {groupedLetters.length > 0 ? (
        <View style={styles.stack}>
          {groupedLetters.map((group) => (
            <View key={group.id} style={styles.innerCard}>
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
  };
}

function ExerciseFillContentBlock({
  item,
  content,
  styles,
  glossary,
  onSelectGlossaryWord,
  activeGlossaryWordKey,
}: ContentBlockProps) {
  const questions = asArray<any>(content.questions);
  const groups = asArray<any>(content.groups);

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
      {questions.map((question, idx) => (
        <View key={`${item.id}-q-${idx}`} style={styles.innerCard}>
          <GlossaryText
            text={String(question?.prompt ?? "")}
            styles={styles}
            glossary={glossary}
            onSelectGlossaryWord={onSelectGlossaryWord}
            activeGlossaryWordKey={activeGlossaryWordKey}
          />
        </View>
      ))}
      {groups.map((group, idx) => (
        <View key={`${item.id}-groupfill-${idx}`} style={styles.innerCard}>
          {Array.isArray(group?.patternLetters) ? (
            <Text style={styles.innerTitle}>{group.patternLetters.join(" ")}</Text>
          ) : null}
          {Array.isArray(group?.lines)
            ? group.lines.map((line: string, lineIdx: number) => (
                <GlossaryText
                  key={`${item.id}-line-${lineIdx}`}
                  text={line}
                  styles={styles}
                  glossary={glossary}
                  onSelectGlossaryWord={onSelectGlossaryWord}
                  activeGlossaryWordKey={activeGlossaryWordKey}
                />
              ))
            : null}
        </View>
      ))}
      {questions.length === 0 && groups.length === 0 ? (
        <EmptyBlock message="No fill exercise items available yet." styles={styles} />
      ) : null}
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
  const questions = asArray<any>(content.questions);
  const example = content.example;

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
        <View style={styles.innerCard}>
          <Text style={styles.innerTitle}>Example</Text>
          <GlossaryText
            text={Array.isArray(example?.numbers) ? example.numbers.join(" ") : ""}
            styles={styles}
            glossary={glossary}
            onSelectGlossaryWord={onSelectGlossaryWord}
            activeGlossaryWordKey={activeGlossaryWordKey}
          />
          <Text style={styles.exampleWord}>Answer: {example?.answer ?? ""}</Text>
        </View>
      ) : null}
      {questions.length > 0 ? (
        questions.map((question, idx) => (
          <View key={`${item.id}-wb-${idx}`} style={styles.innerCard}>
            <Text style={styles.innerTitle}>
              Question {question?.index ?? idx + 1}
            </Text>
            <GlossaryText
              text={Array.isArray(question?.numbers) ? question.numbers.join(" ") : ""}
              styles={styles}
              glossary={glossary}
              onSelectGlossaryWord={onSelectGlossaryWord}
              activeGlossaryWordKey={activeGlossaryWordKey}
            />
          </View>
        ))
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
          onPress={() => openLink(content.audioUrl)}
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
          onPress={() => openLink(content.audioUrl)}
          styles={styles}
          icon="play"
        />
      ) : (
        <EmptyBlock message="Audio URL not available." styles={styles} />
      )}
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
  styles,
  onOpenQuiz,
  isFinalExam,
}: ContentBlockProps) {
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
  alphabet_table: AlphabetTableContentBlock,
  classification: ClassificationContentBlock,
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
