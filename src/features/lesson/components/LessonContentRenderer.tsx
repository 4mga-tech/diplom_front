import { LessonContentItem } from "@/lib/learning";
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

function openLink(url?: string) {
  if (!url) return;

  void Linking.openURL(url).catch((error) => {
    console.log("Could not open lesson media:", error);
  });
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

function TextContentBlock({ content, styles }: ContentBlockProps) {
  return (
    <>
      <BlockText styles={styles}>
        {content?.textMn || content?.text || "Lesson text will appear here."}
      </BlockText>
      {content?.textEn ? (
        <Text style={styles.translationText}>{content.textEn}</Text>
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
}: ContentBlockProps) {
  const groups = asArray<any>(content.groups);

  return (
    <View style={styles.stack}>
      {!!content.summary ? (
        <BlockText styles={styles}>{content.summary}</BlockText>
      ) : null}
      {groups.length > 0 ? (
        groups.map((group, idx) => (
          <View key={`${item.id}-group-${idx}`} style={styles.innerCard}>
            <Text style={styles.innerTitle}>{group?.title}</Text>
            <BlockText styles={styles}>
              {Array.isArray(group?.items) ? group.items.join(", ") : ""}
            </BlockText>
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
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ))}
    </View>
  );
}

function VocabListContentBlock({ item, content, styles }: ContentBlockProps) {
  const items = asArray<any>(content.items);

  if (items.length === 0) {
    return <EmptyBlock message="No vocabulary items available yet." styles={styles} />;
  }

  return (
    <View style={styles.stack}>
      {items.map((vocabItem, idx) => (
        <View key={`${item.id}-vocab-${idx}`} style={styles.innerCard}>
          <Text style={styles.innerTitle}>{vocabItem?.word ?? ""}</Text>
          <BlockText styles={styles}>{vocabItem?.meaning ?? ""}</BlockText>
        </View>
      ))}
    </View>
  );
}

function ExerciseRepeatContentBlock({
  item,
  content,
  styles,
}: ContentBlockProps) {
  const rows = asArray<any>(content.rows);

  return (
    <View style={styles.stack}>
      {!!content.instructionMn ? (
        <BlockText styles={styles}>{content.instructionMn}</BlockText>
      ) : null}
      {rows.length > 0 ? (
        rows.map((row, idx) => (
          <View key={`${item.id}-row-${idx}`} style={styles.innerCard}>
            {!!row?.prompt ? <Text style={styles.innerTitle}>{row.prompt}</Text> : null}
            {!!row?.line ? <BlockText styles={styles}>{row.line}</BlockText> : null}
            {!!row?.text ? <BlockText styles={styles}>{row.text}</BlockText> : null}
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
      {!!content.instructionMn ? (
        <BlockText styles={styles}>{content.instructionMn}</BlockText>
      ) : null}
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

function ExerciseFillContentBlock({ item, content, styles }: ContentBlockProps) {
  const questions = asArray<any>(content.questions);
  const groups = asArray<any>(content.groups);

  return (
    <View style={styles.stack}>
      {!!content.instructionMn ? (
        <BlockText styles={styles}>{content.instructionMn}</BlockText>
      ) : null}
      {questions.map((question, idx) => (
        <View key={`${item.id}-q-${idx}`} style={styles.innerCard}>
          <BlockText styles={styles}>{question?.prompt ?? ""}</BlockText>
        </View>
      ))}
      {groups.map((group, idx) => (
        <View key={`${item.id}-groupfill-${idx}`} style={styles.innerCard}>
          {Array.isArray(group?.patternLetters) ? (
            <Text style={styles.innerTitle}>{group.patternLetters.join(" ")}</Text>
          ) : null}
          {Array.isArray(group?.lines)
            ? group.lines.map((line: string, lineIdx: number) => (
                <BlockText key={`${item.id}-line-${lineIdx}`} styles={styles}>
                  {line}
                </BlockText>
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
}: ContentBlockProps) {
  const questions = asArray<any>(content.questions);
  const example = content.example;

  return (
    <View style={styles.stack}>
      {!!content.instructionMn ? (
        <BlockText styles={styles}>{content.instructionMn}</BlockText>
      ) : null}
      {example ? (
        <View style={styles.innerCard}>
          <Text style={styles.innerTitle}>Example</Text>
          <BlockText styles={styles}>
            {Array.isArray(example?.numbers) ? example.numbers.join(" ") : ""}
          </BlockText>
          <Text style={styles.exampleWord}>Answer: {example?.answer ?? ""}</Text>
        </View>
      ) : null}
      {questions.length > 0 ? (
        questions.map((question, idx) => (
          <View key={`${item.id}-wb-${idx}`} style={styles.innerCard}>
            <Text style={styles.innerTitle}>
              Question {question?.index ?? idx + 1}
            </Text>
            <BlockText styles={styles}>
              {Array.isArray(question?.numbers) ? question.numbers.join(" ") : ""}
            </BlockText>
          </View>
        ))
      ) : (
        <EmptyBlock message="No word-build questions available yet." styles={styles} />
      )}
    </View>
  );
}

function PronunciationContentBlock({ content, styles }: ContentBlockProps) {
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
        <Text style={styles.exampleWord}>
          Example: {content.exampleWord}
          {content.exampleMeaning ? ` - ${content.exampleMeaning}` : ""}
        </Text>
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

function AudioContentBlock({ content, styles }: ContentBlockProps) {
  return (
    <View style={styles.stack}>
      {!!content.text ? <BlockText styles={styles}>{content.text}</BlockText> : null}
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
  const Component = CONTENT_COMPONENTS[item.type] ?? TextContentBlock;

  return (
    <Component
      item={item}
      content={content}
      styles={styles}
      onOpenQuiz={onOpenQuiz}
      isFinalExam={isFinalExam}
    />
  );
}
