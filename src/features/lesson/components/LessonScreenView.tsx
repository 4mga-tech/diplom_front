import { getLessonProgressState, LessonDetail } from "@/lib/learning";
import LessonActionButton from "@/src/features/lesson/components/LessonActionButton";
import LessonCompleteModal from "@/src/features/lesson/components/LessonCompleteModal";
import LessonContentCard from "@/src/features/lesson/components/LessonContentCard";
import { createLessonStyles } from "@/src/features/lesson/lesson.styles";
import { useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  lesson: LessonDetail | null;
  levelId: string;
  loading: boolean;
  error: string | null;
  completingLesson: boolean;
  completionMessage: string | null;
  onBack: () => void;
  onOpenQuiz: () => void;
  onCompleteLesson: () => void;
  onOpenPreviousLesson: () => void;
  onOpenNextLesson: () => void;
  completionModalVisible: boolean;
  completionXp: number;
  completionProgressMessage: string | null;
  onContinueAfterCompletion: () => void;
};

export default function LessonScreenView({
  lesson,
  levelId,
  loading,
  error,
  completingLesson,
  completionMessage,
  onBack,
  onOpenQuiz,
  onCompleteLesson,
  onOpenPreviousLesson,
  onOpenNextLesson,
  completionModalVisible,
  completionXp,
  completionProgressMessage,
  onContinueAfterCompletion,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createLessonStyles);
  const insets = useSafeAreaInsets();
  const sortedContents = React.useMemo(
    () => [...(lesson?.contents ?? [])].sort((a, b) => a.order - b.order),
    [lesson?.contents],
  );
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null);
  const [viewedSectionIds, setViewedSectionIds] = React.useState<string[]>([]);
  const [actionBarHeight, setActionBarHeight] = React.useState(0);
  const [hasReachedBottomOnce, setHasReachedBottomOnce] = React.useState(false);
  const [scrollViewportHeight, setScrollViewportHeight] = React.useState(0);
  const [scrollContentHeight, setScrollContentHeight] = React.useState(0);
  const lessonState = lesson
    ? lesson.isCompleted
      ? "completed"
      : getLessonProgressState(lesson)
    : null;
  const bottomThreshold = 32;
  const stateColor =
    lessonState === "completed"
      ? "#22C55E"
      : lessonState === "current"
        ? "#60A5FA"
        : lessonState === "unlocked"
          ? "#0EA5E9"
          : theme.colors.muted;
  const stateIcon =
    lessonState === "completed"
      ? "checkmark-circle"
      : lessonState === "current"
        ? "play-circle"
        : lessonState === "unlocked"
          ? "lock-open"
          : "lock-closed";
  const lessonStateLabel =
    lessonState === "completed"
      ? "Completed"
      : lessonState === "current"
        ? "In progress"
        : lessonState === "unlocked"
          ? "Ready"
          : "Locked";
  const unitLessonCount = lesson?.unit?.lessonCount ?? 0;
  const lessonPositionLabel =
    unitLessonCount > 0
      ? `Lesson ${lesson?.order ?? 1} of ${unitLessonCount}`
      : `Lesson ${lesson?.order ?? 1}`;
  const completedLessonsLabel = lesson?.unit
    ? `${lesson.unit.completedLessonCount}/${lesson.unit.lessonCount} lessons completed`
    : null;
  const hasPrev = Boolean(lesson?.previousLessonId);
  const hasNext = Boolean(lesson?.nextLessonId);
  const viewedCount = viewedSectionIds.length;
  const activeSection = sortedContents.find((item) => item.id === activeSectionId) ?? null;
  const canStartPracticeQuiz =
    lessonState === "current" || lessonState === "unlocked" || lessonState === "completed";
  const hasQuiz = Boolean(lesson?.hasQuiz);
  const canOpenQuiz = hasQuiz && canStartPracticeQuiz;
  const canManuallyCompleteLesson = Boolean(
    lesson &&
    hasQuiz === false &&
    lesson.isCompleted === false,
  );
  const isFinalExamLesson = Boolean(
    levelId === "b1" && lesson?.hasQuiz && lesson?.order === 6,
  );
  const quizLessonLabel = isFinalExamLesson ? "Final Exam" : "Practice Quiz";
  const nextActionLabel = isFinalExamLesson
    ? "Final Exam"
    : canOpenQuiz
      ? quizLessonLabel
      : "Lesson content";


  const quizButtonLabel = isFinalExamLesson
    ? "Start Final Exam"
    : lessonState === "completed"
      ? "Restart Practice Quiz"
      : "Start Practice Quiz";
  const shouldShowPrimaryQuizCtaInBar =
    canOpenQuiz && lessonState !== "completed";
  const hasLockedPrimaryForwardAction =
    canManuallyCompleteLesson || shouldShowPrimaryQuizCtaInBar;
  const primaryForwardActionEnabled =
    !hasLockedPrimaryForwardAction || hasReachedBottomOnce;
  const resolvedNextActionLabel = canManuallyCompleteLesson
    ? "Complete Lesson"
    : nextActionLabel;

  const shouldShowStickyActionBar =
    canManuallyCompleteLesson ||
    shouldShowPrimaryQuizCtaInBar ||
    (!canManuallyCompleteLesson && lessonState === "completed");
  const scrollBottomPadding =
    shouldShowStickyActionBar
      ? Math.max(actionBarHeight + theme.s(1.5), theme.s(14))
      : theme.s(4);
  const showScrollToEndHelper =
    hasLockedPrimaryForwardAction && !primaryForwardActionEnabled;

  React.useEffect(() => {
    const firstSectionId = sortedContents[0]?.id ?? null;
    setActiveSectionId(firstSectionId);
    setViewedSectionIds(firstSectionId ? [firstSectionId] : []);
  }, [lesson?.id, sortedContents]);

  React.useEffect(() => {
    setHasReachedBottomOnce(false);
    setScrollViewportHeight(0);
    setScrollContentHeight(0);
  }, [lesson?.id]);

  const handleFocusSection = React.useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    setViewedSectionIds((current) =>
      current.includes(sectionId) ? current : [...current, sectionId],
    );
  }, []);

  const updateBottomReachState = React.useCallback(
    (
      offsetY: number,
      layoutHeight: number,
      contentHeight: number,
    ) => {
      if (layoutHeight <= 0 || contentHeight <= 0) {
        return;
      }

      const contentFitsOnScreen = contentHeight <= layoutHeight + bottomThreshold;
      const reachedBottom =
        offsetY + layoutHeight >= contentHeight - bottomThreshold ||
        contentFitsOnScreen;

      if (reachedBottom) {
        setHasReachedBottomOnce(true);
      }
    },
    [bottomThreshold],
  );

  React.useEffect(() => {
    if (scrollViewportHeight <= 0 || scrollContentHeight <= 0) {
      return;
    }

    updateBottomReachState(0, scrollViewportHeight, scrollContentHeight);
  }, [scrollContentHeight, scrollViewportHeight, updateBottomReachState]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <ActivityIndicator color={theme.colors.text} />
            </View>
            <Text style={styles.stateTitle}>Loading lesson</Text>
            <Text style={styles.stateText}>Preparing your lesson content now.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <Ionicons name="cloud-offline-outline" size={22} color="#FDE68A" />
            </View>
            <Text style={styles.stateTitle}>Lesson unavailable</Text>
            <Text style={styles.stateText}>{error || "Lesson not found."}</Text>
            <LessonActionButton
              label="Back to units"
              onPress={onBack}
              styles={styles}
              icon="chevron-back"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerMainRow}>
          <Pressable
            onPress={onBack}
            hitSlop={6}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed ? styles.headerIconButtonPressed : null,
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {lesson.title}
            </Text>
            <Text style={styles.headerSubtitle}>{lessonPositionLabel}</Text>
          </View>
        </View>
      </View>



      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(event) => {
          const layoutHeight = event.nativeEvent.layout.height;
          setScrollViewportHeight(layoutHeight);
          updateBottomReachState(0, layoutHeight, scrollContentHeight);
        }}
        onContentSizeChange={(_width, height) => {
          setScrollContentHeight(height);
          updateBottomReachState(0, scrollViewportHeight, height);
        }}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } =
            event.nativeEvent;
          updateBottomReachState(
            contentOffset.y,
            layoutMeasurement.height,
            contentSize.height,
          );
        }}
      >


        <View style={styles.section}>


          {sortedContents.map((item) => (
            <LessonContentCard
              key={item.id}
              item={item}
              styles={styles}
              onOpenQuiz={onOpenQuiz}
              lessonId={lesson.id}
              isFinalExam={isFinalExamLesson && item.type === "quiz_link"}
              isActive={item.id === activeSectionId}
              onPress={() => handleFocusSection(item.id)}
            />
          ))}



          {completionMessage ? (
            <View style={styles.quizEntryCard}>
              <View style={styles.quizEntryTop}>
                <View style={styles.quizEntryIconWrap}>
                  <Ionicons
                    name={
                      lessonState === "completed"
                        ? "checkmark-circle-outline"
                        : "information-circle-outline"
                    }
                    size={18}
                    color={lessonState === "completed" ? "#86EFAC" : "#BFDBFE"}
                  />
                </View>
                <View style={styles.quizEntryBody}>
                  <Text style={styles.quizEntryEyebrow}>Lesson status</Text>
                  <Text style={styles.quizEntryTitle}>
                    {lessonState === "completed" ? "Lesson completed" : "Update"}
                  </Text>
                  <Text style={styles.quizEntryText}>{completionMessage}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {shouldShowStickyActionBar ? (
        <Animated.View
          entering={FadeIn.duration(240)}
          style={styles.actionBarShell}
          pointerEvents="box-none"
        >
          <View
            onLayout={(event) => {
              const nextHeight = Math.ceil(event.nativeEvent.layout.height);
              if (nextHeight !== actionBarHeight) {
                setActionBarHeight(nextHeight);
              }
            }}
            style={[
              styles.actionBar,
              {
                paddingBottom: Math.max(insets.bottom, theme.s(0.75)),
              },
            ]}
          >
            {showScrollToEndHelper ? (
              <Text style={styles.actionHelperText}>
                Scroll to the end to continue
              </Text>
            ) : null}
            <LessonActionButton
              label="Back to units"
              onPress={onBack}
              styles={styles}
              icon="arrow-back"
            />
            {canManuallyCompleteLesson ? (
              <LessonActionButton
                label={completingLesson ? "Completing..." : "Complete Lesson"}
                onPress={onCompleteLesson}
                styles={styles}
                variant="primary"
                icon="checkmark-done"
                disabled={completingLesson || !primaryForwardActionEnabled}
              />
            ) : null}
            {shouldShowPrimaryQuizCtaInBar ? (
              <LessonActionButton
                label={quizButtonLabel}
                onPress={onOpenQuiz}
                styles={styles}
                variant="primary"
                disabled={!primaryForwardActionEnabled}
                icon={isFinalExamLesson ? "school" : "play"}
              />
            ) : null}
            {!canManuallyCompleteLesson && lessonState === "completed" && hasNext ? (
              <LessonActionButton
                label="Next Lesson"
                onPress={onOpenNextLesson}
                styles={styles}
                icon="arrow-forward"
              />
            ) : null}
          </View>
        </Animated.View>
      ) : null}

      <LessonCompleteModal
        visible={completionModalVisible}
        xpEarned={completionXp}
        progressMessage={completionProgressMessage}
        hasNextLesson={hasNext}
        onContinue={onContinueAfterCompletion}
        onNextLesson={onOpenNextLesson}
        onBackToUnit={onBack}
      />
    </SafeAreaView>
  );
}
