import { LessonContentItem } from "@/lib/learning";
import LessonActionButton from "@/src/features/lesson/components/LessonActionButton";
import { LessonStyles } from "@/src/features/lesson/lesson.styles";
import * as Linking from "expo-linking";
import React from "react";
import { Text, View } from "react-native";

type LessonContentRendererProps = {
  item: LessonContentItem;
  styles: LessonStyles;
  onOpenQuiz: () => void;
};

type ContentBlockProps = LessonContentRendererProps & {
  content: any;
};

const asArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

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
  const letters = asArray<string>(content.letters);

  return (
    <View style={styles.stack}>
      {!!content.instructionMn ? (
        <BlockText styles={styles}>{content.instructionMn}</BlockText>
      ) : null}
      {letters.length > 0 ? (
        <View style={styles.chipsWrap}>
          {letters.map((letter, idx) => (
            <View key={`${item.id}-write-${idx}`} style={styles.chip}>
              <Text style={styles.chipText}>{letter}</Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptyBlock message="No writing exercise letters available yet." styles={styles} />
      )}
    </View>
  );
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
}: ContentBlockProps) {
  return (
    <View style={styles.stack}>
      <BlockText styles={styles}>Complete the lesson and open the quiz.</BlockText>
      <LessonActionButton
        label="Open quiz"
        onPress={onOpenQuiz}
        styles={styles}
        icon="arrow-forward"
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
}: LessonContentRendererProps) {
  const content = (item.content ?? {}) as any;
  const Component = CONTENT_COMPONENTS[item.type] ?? TextContentBlock;

  return (
    <Component
      item={item}
      content={content}
      styles={styles}
      onOpenQuiz={onOpenQuiz}
    />
  );
}
