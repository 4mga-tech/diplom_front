import {
  completeLesson,
  fetchLessonDetail,
  LessonContentItem,
  LessonDetail,
} from "@/lib/learning";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
function PrimaryButton({
  label,
  onPress,
  disabled,
  styles,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && !disabled && { opacity: 0.92 },
        disabled && { opacity: 0.55 },
      ]}
    >
      <LinearGradient
        colors={["#2563EB", "#7C3AED"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.primaryGrad}
      >
        <Text style={styles.primaryText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  styles,
}: {
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryBtn,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export default function LessonScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { lessonId, levelId, unitId } = useLocalSearchParams<{
    lessonId?: string;
    levelId?: string;
    unitId?: string;
  }>();
  const navigation = useNavigation();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null,
  );
  const [openContentId, setOpenContentId] = useState<string | null>(null);
  const toggleContent = (id: string) => {
    setOpenContentId((current) => (current === id ? null : id));
  };
  useEffect(() => {
    if (lesson?.contents?.length) {
      const firstId = [...lesson.contents].sort((a, b) => a.order - b.order)[0]
        ?.id;

      setOpenContentId(firstId ?? null);
    }
  }, [lesson]);
  const loadLesson = useCallback(async () => {
    if (!lessonId) {
      setLoading(false);
      setError("Lesson not found.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchLessonDetail(lessonId);
      setLesson(data);
      setError(data ? null : "Lesson not found.");
    } catch (loadError) {
      console.log("Error loading lesson:", loadError);
      setError("We could not load this lesson right now.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useFocusEffect(
    useCallback(() => {
      void loadLesson();
    }, [loadLesson]),
  );

  const goBackToLessons = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    if (levelId && unitId) {
      router.replace({
        pathname: "/units/[levelId]/[unitId]",
        params: { levelId, unitId },
      });
      return;
    }

    router.replace("/");
  };

  const handleCompleteLesson = async () => {
    if (!lessonId || !lesson || lesson.isCompleted) return;

    setSubmitting(true);
    setCompletionMessage(null);

    try {
      const result = await completeLesson(lessonId);
      const xpGained = Number(result?.xpGained ?? lesson.xpReward ?? 0);

      setLesson((current) =>
        current
          ? {
              ...current,
              isCompleted: true,
            }
          : current,
      );

      setCompletionMessage(
        xpGained > 0
          ? `Lesson complete. You earned ${xpGained} XP.`
          : "Lesson complete.",
      );
    } catch (submitError: any) {
      console.log("Error completing lesson:", submitError);
      console.log("COMPLETE LESSON API ERROR:", submitError?.response?.data);
      setCompletionMessage(
        submitError?.response?.data?.message ||
          "We could not complete the lesson right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openAudio = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.log("Could not open audio URL:", err);
    }
  };

  const sortedContents = useMemo(() => {
    return [...(lesson?.contents ?? [])].sort((a, b) => a.order - b.order);
  }, [lesson?.contents]);

  const renderAlphabetTable = (item: LessonContentItem) => {
    const letters = Array.isArray((item.content as any)?.letters)
      ? (item.content as any).letters
      : [];

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Alphabet</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          letters.length === 0 ? (
            <Text style={styles.contentBody}>No letters available yet.</Text>
          ) : (
            <View style={styles.stack}>
              {letters.map((letter: any, idx: number) => (
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
                    <Text style={styles.contentBody}>
                      Call: {letter.nameMn}
                    </Text>
                  ) : null}

                  {/* {!!letter?.transcription ? (
                    <Text style={styles.translitText}>
                      Galig: {letter.transcription}
                    </Text>
                  ) : null} */}

                  {!!letter?.pronunciation ? (
                    <Text style={styles.contentBody}>
                      pronunciation: {letter.pronunciation}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )
        ) : null}
      </Pressable>
    );
  };

  const renderClassification = (item: LessonContentItem) => {
    const groups = Array.isArray((item.content as any)?.groups)
      ? (item.content as any).groups
      : [];

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Classification</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            {!!(item.content as any)?.summary ? (
              <Text style={styles.contentBody}>
                {(item.content as any).summary}
              </Text>
            ) : null}

            <View style={styles.stack}>
              {groups.map((group: any, idx: number) => (
                <View key={`${item.id}-group-${idx}`} style={styles.innerCard}>
                  <Text style={styles.innerTitle}>{group?.title}</Text>
                  <Text style={styles.contentBody}>
                    {Array.isArray(group?.items) ? group.items.join(", ") : ""}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderGrammarNote = (item: LessonContentItem) => {
    const notes = Array.isArray((item.content as any)?.notes)
      ? (item.content as any).notes
      : [];

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Grammar Notes</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <View style={styles.stack}>
            {notes.map((note: string, idx: number) => (
              <View key={`${item.id}-note-${idx}`} style={styles.noteRow}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    );
  };

  const renderVocabList = (item: LessonContentItem) => {
    const items = Array.isArray((item.content as any)?.items)
      ? (item.content as any).items
      : [];

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Vocabulary</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <View style={styles.stack}>
            {items.map((v: any, idx: number) => (
              <View key={`${item.id}-vocab-${idx}`} style={styles.innerCard}>
                <Text style={styles.innerTitle}>{v?.word ?? ""}</Text>
                <Text style={styles.contentBody}>{v?.meaning ?? ""}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    );
  };

  const renderExerciseRepeat = (item: LessonContentItem) => {
    const rows = Array.isArray((item.content as any)?.rows)
      ? (item.content as any).rows
      : [];

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Repeat Exercise</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            {!!(item.content as any)?.instructionMn ? (
              <Text style={styles.contentBody}>
                {(item.content as any).instructionMn}
              </Text>
            ) : null}

            <View style={styles.stack}>
              {rows.map((row: any, idx: number) => (
                <View key={`${item.id}-row-${idx}`} style={styles.innerCard}>
                  {!!row?.prompt ? (
                    <Text style={styles.innerTitle}>{row.prompt}</Text>
                  ) : null}

                  {!!row?.line ? (
                    <Text style={styles.contentBody}>{row.line}</Text>
                  ) : null}

                  {!!row?.text ? (
                    <Text style={styles.contentBody}>{row.text}</Text>
                  ) : null}

                  {!!row?.audioUrl ? (
                    <SecondaryButton
                      label="Play practice audio"
                      onPress={() => void openAudio(row.audioUrl)}
                      styles={styles}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderExerciseWrite = (item: LessonContentItem) => {
    const letters = Array.isArray((item.content as any)?.letters)
      ? (item.content as any).letters
      : [];

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Writing Exercise</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            {!!(item.content as any)?.instructionMn ? (
              <Text style={styles.contentBody}>
                {(item.content as any).instructionMn}
              </Text>
            ) : null}

            <View style={styles.chipsWrap}>
              {letters.map((letter: string, idx: number) => (
                <View key={`${item.id}-write-${idx}`} style={styles.chip}>
                  <Text style={styles.chipText}>{letter}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderExerciseFill = (item: LessonContentItem) => {
    const questions = Array.isArray((item.content as any)?.questions)
      ? (item.content as any).questions
      : [];
    const groups = Array.isArray((item.content as any)?.groups)
      ? (item.content as any).groups
      : [];

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Fill Exercise</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            {!!(item.content as any)?.instructionMn ? (
              <Text style={styles.contentBody}>
                {(item.content as any).instructionMn}
              </Text>
            ) : null}

            {questions.length > 0 ? (
              <View style={styles.stack}>
                {questions.map((q: any, idx: number) => (
                  <View key={`${item.id}-q-${idx}`} style={styles.innerCard}>
                    <Text style={styles.contentBody}>{q?.prompt ?? ""}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {groups.length > 0 ? (
              <View style={styles.stack}>
                {groups.map((g: any, idx: number) => (
                  <View
                    key={`${item.id}-groupfill-${idx}`}
                    style={styles.innerCard}
                  >
                    {Array.isArray(g?.patternLetters) ? (
                      <Text style={styles.innerTitle}>
                        {g.patternLetters.join(" ")}
                      </Text>
                    ) : null}

                    {Array.isArray(g?.lines)
                      ? g.lines.map((line: string, lineIdx: number) => (
                          <Text
                            key={`${item.id}-line-${lineIdx}`}
                            style={styles.contentBody}
                          >
                            {line}
                          </Text>
                        ))
                      : null}
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderExerciseWordBuild = (item: LessonContentItem) => {
    const questions = Array.isArray((item.content as any)?.questions)
      ? (item.content as any).questions
      : [];
    const example = (item.content as any)?.example;

    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Word Build</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            {!!(item.content as any)?.instructionMn ? (
              <Text style={styles.contentBody}>
                {(item.content as any).instructionMn}
              </Text>
            ) : null}

            {example ? (
              <View style={styles.innerCard}>
                <Text style={styles.innerTitle}>Example</Text>
                <Text style={styles.contentBody}>
                  {Array.isArray(example?.numbers)
                    ? example.numbers.join(" ")
                    : ""}
                </Text>
                <Text style={styles.exampleWord}>
                  Answer: {example?.answer ?? ""}
                </Text>
              </View>
            ) : null}

            <View style={styles.stack}>
              {questions.map((q: any, idx: number) => (
                <View key={`${item.id}-wb-${idx}`} style={styles.innerCard}>
                  <Text style={styles.innerTitle}>
                    Question {q?.index ?? idx + 1}
                  </Text>
                  <Text style={styles.contentBody}>
                    {Array.isArray(q?.numbers) ? q.numbers.join(" ") : ""}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderPronunciation = (item: LessonContentItem) => {
    const content = item.content ?? {};
    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Pronunciation</Text>
            <Text style={styles.contentTitle}>{item.title}</Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            {!!content.letter ? (
              <Text style={styles.letterText}>{content.letter}</Text>
            ) : null}

            {!!content.transliteration ? (
              <Text style={styles.translitText}>
                Sound: {content.transliteration}
              </Text>
            ) : null}

            {!!content.pronunciationTip ? (
              <Text style={styles.contentBody}>{content.pronunciationTip}</Text>
            ) : null}

            {!!content.exampleWord ? (
              <Text style={styles.exampleWord}>
                Example: {content.exampleWord}
                {content.exampleMeaning ? ` — ${content.exampleMeaning}` : ""}
              </Text>
            ) : null}

            {!!content.audioUrl ? (
              <SecondaryButton
                label="Play audio"
                onPress={() => void openAudio(content.audioUrl)}
                styles={styles}
              />
            ) : null}
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderAudio = (item: LessonContentItem) => {
    const content = item.content ?? {};
    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Audio</Text>
            <Text style={styles.contentTitle}>
              {item.title || "Lesson audio"}
            </Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            {!!content.text ? (
              <Text style={styles.contentBody}>{content.text}</Text>
            ) : null}

            {!!content.audioUrl ? (
              <SecondaryButton
                label="Play audio"
                onPress={() => void openAudio(content.audioUrl)}
                styles={styles}
              />
            ) : (
              <Text style={styles.contentBody}>Audio URL not available.</Text>
            )}
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderVideo = (item: LessonContentItem) => {
    const content = item.content ?? {};
    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Video</Text>
            <Text style={styles.contentTitle}>
              {item.title || "Lesson video"}
            </Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <Text style={styles.contentBody}>
            {content.videoUrl ||
              content.url ||
              "Video URL will be provided by the backend."}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const renderQuizLink = (item: LessonContentItem) => {
    const quizId = (item.content as any)?.quizId;

    return (
      <View key={item.id} style={styles.contentCard}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Quiz</Text>
            <Text style={styles.contentTitle}>
              {item.title || "Lesson quiz"}
            </Text>
          </View>

          <Ionicons name="help-circle-outline" size={20} color="#A78BFA" />
        </View>

        <Text style={styles.contentBody}>
          Complete the lesson and open the quiz.
        </Text>

        <SecondaryButton
          label="Open quiz"
          onPress={() => {
            if (!quizId) return;

            router.push({
              pathname: "/quiz/[lessonId]",
              params: { lessonId: lesson?.id ?? "" },
            });
          }}
          styles={styles}
        />
      </View>
    );
  };

  const renderText = (item: LessonContentItem) => {
    const content = item.content as any;
    const isOpen = openContentId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => toggleContent(item.id)}
        style={styles.contentCard}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentLabel}>Reading</Text>
            <Text style={styles.contentTitle}>
              {item.title || "Lesson notes"}
            </Text>
          </View>

          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>

        {isOpen ? (
          <>
            <Text style={styles.contentBody}>
              {content?.textMn ||
                content?.text ||
                "Lesson text will appear here."}
            </Text>

            {content?.textEn ? (
              <Text style={styles.translationText}>{content.textEn}</Text>
            ) : null}
          </>
        ) : null}
      </Pressable>
    );
  };

  const renderContent = (item: LessonContentItem) => {
    switch (item.type) {
      case "pronunciation":
        return renderPronunciation(item);
      case "audio":
        return renderAudio(item);
      case "video":
        return renderVideo(item);
      case "alphabet_table":
        return renderAlphabetTable(item);
      case "classification":
        return renderClassification(item);
      case "grammar_note":
        return renderGrammarNote(item);
      case "vocab_list":
        return renderVocabList(item);
      case "exercise_repeat":
        return renderExerciseRepeat(item);
      case "exercise_write":
        return renderExerciseWrite(item);
      case "exercise_fill":
        return renderExerciseFill(item);
      case "exercise_word_build":
        return renderExerciseWordBuild(item);
      case "quiz_link":
      case "quiz":
        return renderQuizLink(item);
      case "text":
      default:
        return renderText(item);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.text} />
          <Text style={styles.stateText}>Loading lesson...</Text>
        </View>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.stateText}>{error || "Lesson not found."}</Text>
          <SecondaryButton
            label="Back"
            onPress={goBackToLessons}
            styles={styles}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={goBackToLessons}
          style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <Animated.View entering={FadeIn.duration(250)} style={styles.counter}>
        <Text style={styles.counterText}>
          {lesson.isCompleted ? "Completed lesson" : "Ready to learn"}
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.center}
        contentContainerStyle={{ paddingBottom: theme.s(2) }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(280)} style={styles.card}>
          <LinearGradient
            colors={["rgba(37,99,235,0.25)", "rgba(124,58,237,0.22)"]}
            style={styles.glow}
          />

          <View style={styles.cardInner}>
            <View style={styles.block}>
              <Text style={styles.label}>Lesson title</Text>
              <Text style={styles.mn}>{lesson.title}</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.label}>Lesson goal</Text>
              <Text style={styles.translit}>
                {lesson.subtitle || "Work through the lesson content below."}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="flash" size={14} color="#FACC15" />
                <Text style={styles.metaText}>{lesson.xpReward} XP</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons
                  name={
                    lesson.isCompleted
                      ? "checkmark-circle"
                      : "lock-open-outline"
                  }
                  size={14}
                  color={lesson.isCompleted ? "#4ADE80" : "#93C5FD"}
                />
                <Text style={styles.metaText}>
                  {lesson.isCompleted ? "Completed" : "Unlocked"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lesson content</Text>
          {sortedContents.map(renderContent)}
        </View>

        {completionMessage ? (
          <View
            style={[
              styles.feedbackCard,
              completionMessage.includes("could not")
                ? styles.feedbackError
                : styles.feedbackSuccess,
            ]}
          >
            <Text style={styles.feedbackText}>{completionMessage}</Text>
          </View>
        ) : null}
      </ScrollView>

      <Animated.View entering={FadeIn.duration(300)} style={styles.bottom}>
        <SecondaryButton
          label="Back to lessons"
          onPress={goBackToLessons}
          styles={styles}
        />
        <PrimaryButton
          label={lesson.isCompleted ? "Completed" : "Complete lesson"}
          onPress={handleCompleteLesson}
          disabled={submitting || lesson.isCompleted}
          styles={styles}
        />
      </Animated.View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      paddingHorizontal: theme.s(3),
      paddingTop: theme.s(5.5),
      paddingBottom: theme.s(4),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: theme.s(1),
      marginBottom: theme.s(1.5),
    },
    headerBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      gap: 6,
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
    },
    progressWrap: { flex: 1 },
    counter: { alignItems: "center", marginBottom: theme.s(1) },
    counterText: { color: theme.colors.muted, fontSize: 12, fontWeight: "700" },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.s(1.5),
    },
    stateText: {
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
    },
    center: { flex: 1 },
    card: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.65)" : "#FFFFFF",
      overflow: "hidden",
    },
    glow: {
      position: "absolute",
      top: -30,
      right: -30,
      width: 220,
      height: 220,
      borderRadius: 999,
      transform: [{ rotate: "12deg" }],
    },
    cardInner: {
      paddingVertical: theme.s(2),
      paddingHorizontal: theme.s(2.5),
      gap: theme.s(1.5),
      alignItems: "flex-start",
    },
    block: { gap: 4, width: "100%" },
    label: {
      color: "rgba(148,163,184,0.65)",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    mn: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "800",
      lineHeight: 28,
    },
    metaRow: {
      flexDirection: "row",
      gap: theme.s(1),
      flexWrap: "wrap",
      marginTop: 2,
    },
    metaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(15,23,42,0.55)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
    },
    metaText: { color: theme.colors.text, fontSize: 12, fontWeight: "800" },
    section: { marginTop: theme.s(3), gap: theme.s(1.5) },
    sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: "900" },
    contentCard: {
      borderRadius: theme.r.xl,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(51,65,85,0.55)"
          : "rgba(148,163,184,0.18)",
      backgroundColor: "rgba(15,23,42,0.65)",
      padding: theme.s(2),
      gap: 8,
    },
    innerCard: {
      borderRadius: theme.r.lg,
      padding: theme.s(1.5),
      backgroundColor: "rgba(30,41,59,0.45)",
      borderWidth: 1,
      borderColor: "rgba(51,65,85,0.35)",
      gap: 6,
    },
    stack: { gap: 10 },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
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
      gap: 8,
    },
    noteBullet: {
      color: "#A78BFA",
      fontSize: 16,
      fontWeight: "900",
      lineHeight: 20,
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 4,
    },

    backText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    noteText: {
      flex: 1,
      color: "rgba(226,232,240,0.92)",
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
      backgroundColor: "rgba(59,130,246,0.18)",
      borderWidth: 1,
      borderColor: "rgba(59,130,246,0.25)",
    },
    chipText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
    },
    innerTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
    },
    contentLabel: {
      color: "rgba(148,163,184,0.7)",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    contentTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "800" },
    contentBody: {
      color: "rgba(226,232,240,0.9)",
      fontSize: 14,
      lineHeight: 21,
    },
    translationText: {
      color: "#93C5FD",
      fontSize: 13,
      lineHeight: 20,
    },
    letterText: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "900",
    },
    translit: {
      color: "rgba(226,232,240,0.9)",
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    },
    translitText: {
      color: "#93C5FD",
      fontSize: 14,
      fontWeight: "700",
    },
    exampleWord: {
      color: "#FDE68A",
      fontSize: 14,
      fontWeight: "700",
    },
    feedbackCard: {
      marginTop: theme.s(2),
      padding: theme.s(2),
      borderRadius: theme.r.xl,
      borderWidth: 1,
    },
    feedbackSuccess: {
      backgroundColor: "rgba(20,83,45,0.25)",
      borderColor: "rgba(34,197,94,0.35)",
    },
    feedbackError: {
      backgroundColor: "rgba(127,29,29,0.2)",
      borderColor: "rgba(248,113,113,0.28)",
    },
    feedbackText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    bottom: { gap: theme.s(1.5), marginTop: theme.s(2) },
    primaryBtn: { borderRadius: theme.r.xl, overflow: "hidden" },
    primaryGrad: {
      paddingVertical: theme.s(2),
      alignItems: "center",
      borderRadius: theme.r.xl,
    },
    primaryText: { color: theme.colors.text, fontSize: 16, fontWeight: "900" },
    secondaryBtn: {
      paddingVertical: theme.s(2),
      alignItems: "center",
      borderRadius: theme.r.xl,
      borderWidth: 1,
      borderColor: "rgba(51,65,85,0.6)",
      backgroundColor:
        theme.mode === "dark" ? "rgba(30,41,59,0.45)" : "#FFFFFF",
    },
    secondaryText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
  });
