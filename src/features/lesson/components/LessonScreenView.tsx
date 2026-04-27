import { getLessonProgressState, LessonDetail } from "@/lib/learning";
import LessonActionButton from "@/src/features/lesson/components/LessonActionButton";
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
import { SafeAreaView } from "react-native-safe-area-context";

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
}: Props) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createLessonStyles);
  const sortedContents = React.useMemo(
    () => [...(lesson?.contents ?? [])].sort((a, b) => a.order - b.order),
    [lesson?.contents],
  );
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null);
  const [viewedSectionIds, setViewedSectionIds] = React.useState<string[]>([]);
  const lessonState = lesson ? getLessonProgressState(lesson) : null;
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
  const heroNoticeText = isFinalExamLesson
    ? "Review each section, then take the final exam when you are ready."
    : canOpenQuiz
      ? "Finish the practice quiz after the lesson."
      : "This lesson focuses on guided study and practice only.";
  const quizCardEyebrow = isFinalExamLesson ? "Final check" : "Practice check";
  const quizCardTitle = quizLessonLabel;
  const quizCardText = isFinalExamLesson
    ? "Complete the final exam after reviewing the full lesson."
    : activeSection
      ? `Check ${activeSection.title || `Section ${activeSection.order}`}.`
      : "Check the lesson before moving on.";
  const quizCardMeta = isFinalExamLesson
    ? "Final assessment"
    : lessonState === "completed"
      ? "Practice again"
      : "Short practice";
  const quizButtonLabel = isFinalExamLesson
    ? "Start Final Exam"
    : lessonState === "completed"
      ? "Restart Practice Quiz"
      : "Start Practice Quiz";
  const resolvedNextActionLabel = canManuallyCompleteLesson
    ? "Complete Lesson"
    : nextActionLabel;
  const resolvedHeroNoticeText = canManuallyCompleteLesson
    ? "Finish the lesson, then press Complete Lesson to unlock the next lesson."
    : heroNoticeText;

  React.useEffect(() => {
    const firstSectionId = sortedContents[0]?.id ?? null;
    setActiveSectionId(firstSectionId);
    setViewedSectionIds(firstSectionId ? [firstSectionId] : []);
  }, [lesson?.id, sortedContents]);

  const handleFocusSection = React.useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    setViewedSectionIds((current) =>
      current.includes(sectionId) ? current : [...current, sectionId],
    );
  }, []);

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
              label="Back to lessons"
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
            <Text style={styles.headerTitle}>Lesson</Text>
            <Text style={styles.headerSubtitle}>{lessonPositionLabel}</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.statusPill,
          {
            borderColor: `${stateColor}33`,
            backgroundColor:
              theme.mode === "dark" ? `${stateColor}16` : `${stateColor}10`,
          },
        ]}
      >
        <Ionicons name={stateIcon} size={13} color={stateColor} />
        <Text style={[styles.statusPillText, { color: stateColor }]}>
          {lessonStateLabel}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(240)} style={styles.heroCard}>
          <View style={styles.heroInner}>
            <View style={styles.heroTopMeta}>
              <Text style={styles.lessonOrderText}>{lessonPositionLabel}</Text>
              <View
                style={[
                  styles.heroStatePill,
                  {
                    borderColor: `${stateColor}33`,
                    backgroundColor:
                      theme.mode === "dark" ? `${stateColor}16` : `${stateColor}10`,
                  },
                ]}
              >
                <Ionicons name={stateIcon} size={14} color={stateColor} />
                <Text style={[styles.heroStatePillText, { color: stateColor }]}>
                  {lessonStateLabel}
                </Text>
              </View>
            </View>

            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>{lesson.title}</Text>
              {lesson.titleEn ? (
                <Text style={styles.heroTitleEn}>{lesson.titleEn}</Text>
              ) : null}
              <Text style={styles.heroSubtitle}>
                {lesson.subtitle || "Lesson overview"}
              </Text>
              {lesson.subtitleEn ? (
                <Text style={styles.heroSubtitleEn}>{lesson.subtitleEn}</Text>
              ) : null}
            </View>

            <View style={styles.heroSummaryRow}>
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryLabel}>Sections</Text>
                <Text style={styles.heroSummaryValue}>{lesson.contents.length}</Text>
              </View>
              <View style={styles.heroSummaryDivider} />
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryLabel}>Reward</Text>
                <Text style={styles.heroSummaryValue}>{lesson.xpReward} XP</Text>
              </View>
              <View style={styles.heroSummaryDivider} />
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryLabel}>Next action</Text>
                <Text style={styles.heroSummaryValue}>{resolvedNextActionLabel}</Text>
              </View>
            </View>

            <View style={styles.heroNoticeCompact}>
              <Ionicons
                name="navigate-outline"
                size={16}
                color={theme.mode === "dark" ? "#BFDBFE" : "#2563EB"}
              />
              <Text style={styles.heroNoticeCompactText}>
                {resolvedHeroNoticeText}
              </Text>
            </View>

            {lesson.unit ? (
              <View style={styles.unitContextCard}>
                <View style={styles.unitContextTop}>
                  <View style={styles.unitContextText}>
                    <Text style={styles.unitContextEyebrow}>Unit progress</Text>
                    <Text style={styles.unitContextTitle}>{lesson.unit.title}</Text>
                    {completedLessonsLabel ? (
                      <Text style={styles.unitProgressText}>{completedLessonsLabel}</Text>
                    ) : null}
                  </View>
                  <View style={styles.unitProgressBadge}>
                    <Text style={styles.unitProgressBadgeText}>{lesson.unit.progress}%</Text>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${lesson.unit.progress}%` },
                    ]}
                  />
                </View>
                <View style={styles.navRow}>
                  <View style={styles.navButton}>
                    <LessonActionButton
                      label="Previous"
                      onPress={onOpenPreviousLesson}
                      styles={styles}
                      icon="chevron-back"
                      disabled={!hasPrev}
                    />
                  </View>
                  <View style={styles.navButton}>
                    <LessonActionButton
                      label="Next"
                      onPress={onOpenNextLesson}
                      styles={styles}
                      icon="chevron-forward"
                      disabled={!hasNext}
                    />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Lesson sections</Text>
              <Text style={styles.sectionHelperText}>
                Work through each section in order.
              </Text>
            </View>
            <View style={styles.sectionSummaryPill}>
              <Text style={styles.sectionCaption}>
                {viewedCount}/{sortedContents.length} viewed
              </Text>
            </View>
          </View>

          {sortedContents.map((item) => (
            <LessonContentCard
              key={item.id}
              item={item}
              styles={styles}
              onOpenQuiz={onOpenQuiz}
              isFinalExam={isFinalExamLesson && item.type === "quiz_link"}
              isActive={item.id === activeSectionId}
              isViewed={viewedSectionIds.includes(item.id)}
              onPress={() => handleFocusSection(item.id)}
            />
          ))}

          {canOpenQuiz && sortedContents.length > 0 ? (
            <View style={styles.quizEntryCard}>
              <View style={styles.quizEntryTop}>
                <View style={styles.quizEntryIconWrap}>
                  <Ionicons name="sparkles-outline" size={18} color="#BFDBFE" />
                </View>
                <View style={styles.quizEntryBody}>
                  <Text style={styles.quizEntryEyebrow}>{quizCardEyebrow}</Text>
                  <Text style={styles.quizEntryTitle}>{quizCardTitle}</Text>
                  <Text style={styles.quizEntryText}>{quizCardText}</Text>
                </View>
              </View>
              <View style={styles.quizEntryMetaRow}>
                <Text style={styles.quizEntryMeta}>
                  {viewedCount}/{sortedContents.length} sections viewed
                </Text>
                <Text style={styles.quizEntryMeta}>{quizCardMeta}</Text>
              </View>
              <LessonActionButton
                label={quizButtonLabel}
                onPress={onOpenQuiz}
                styles={styles}
                variant="primary"
                icon={isFinalExamLesson ? "school" : lessonState === "completed" ? "refresh" : "play"}
              />
            </View>
          ) : null}

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

      <Animated.View entering={FadeIn.duration(240)} style={styles.actionBar}>
        <LessonActionButton
          label="Back to lessons"
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
            disabled={completingLesson}
          />
        ) : null}
        {canOpenQuiz ? (
          <LessonActionButton
            label={quizButtonLabel}
            onPress={onOpenQuiz}
            styles={styles}
            variant="primary"
            icon={
              isFinalExamLesson
                ? "school"
                : lessonState === "completed"
                  ? "refresh"
                  : "play"
            }
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
      </Animated.View>
    </SafeAreaView>
  );
}
