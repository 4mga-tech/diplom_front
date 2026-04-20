import { getLessonProgressState, LessonDetail } from "@/lib/learning";
import LessonActionButton from "@/src/features/lesson/components/LessonActionButton";
import LessonContentCard from "@/src/features/lesson/components/LessonContentCard";
import { createLessonStyles } from "@/src/features/lesson/lesson.styles";
import { useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type Props = {
  lesson: LessonDetail | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onOpenQuiz: () => void;
  onOpenPreviousLesson: () => void;
  onOpenNextLesson: () => void;
};

export default function LessonScreenView({
  lesson,
  loading,
  error,
  onBack,
  onOpenQuiz,
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
      <View style={styles.container}>
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <ActivityIndicator color={theme.colors.text} />
            </View>
            <Text style={styles.stateTitle}>Loading lesson</Text>
            <Text style={styles.stateText}>Preparing your lesson content now.</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <Ionicons name="cloud-offline-outline" size={22} color="#FDE68A" />
            </View>
            <Text style={styles.stateTitle}>Lesson unavailable</Text>
            <Text style={styles.stateText}>{error || "Lesson not found."}</Text>
            <LessonActionButton
              label="Back"
              onPress={onBack}
              styles={styles}
              icon="chevron-back"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LessonActionButton
          label="Back"
          onPress={onBack}
          styles={styles}
          icon="chevron-back"
        />
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
          <Text style={[styles.statusPillText, { color: stateColor }]}>
            {lessonState === "completed"
              ? "Completed lesson"
              : lessonState === "current"
                ? "Current lesson"
                : lessonState === "unlocked"
                  ? "Unlocked lesson"
                  : "Locked lesson"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(280)} style={styles.heroCard}>
          <LinearGradient
            colors={["rgba(37,99,235,0.25)", "rgba(124,58,237,0.22)"]}
            style={styles.heroGlow}
          />

          <View style={styles.heroInner}>
            <View style={styles.heroTopRow}>
              <View
                style={[
                  styles.heroBadge,
                  {
                    borderColor: `${stateColor}33`,
                    backgroundColor:
                      theme.mode === "dark" ? `${stateColor}16` : `${stateColor}10`,
                  },
                ]}
              >
                <Text style={[styles.heroBadgeText, { color: stateColor }]}>
                  Lesson focus
                </Text>
              </View>
              <View style={styles.heroIconWrap}>
                <Ionicons
                  name={stateIcon}
                  size={20}
                  color={stateColor}
                />
              </View>
            </View>

            <View style={styles.heroTextWrap}>
              <Text style={styles.lessonOrderText}>{lessonPositionLabel}</Text>
              <Text style={styles.heroTitle}>{lesson.title}</Text>
              <Text style={styles.heroSubtitle}>
                {lesson.subtitle || "Work through the lesson content below."}
              </Text>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaCard}>
                <View style={styles.metaTopRow}>
                  <Text style={styles.metaLabel}>Reward</Text>
                  <Ionicons name="flash" size={15} color="#FACC15" />
                </View>
                <View style={styles.metaValueRow}>
                  <Text style={styles.metaValue}>{lesson.xpReward} XP</Text>
                </View>
              </View>

              <View style={styles.metaCard}>
                <View style={styles.metaTopRow}>
                  <Text style={styles.metaLabel}>Status</Text>
                  <Ionicons
                    name={
                      lessonState === "completed"
                        ? "checkmark-circle"
                        : lessonState === "current" || lessonState === "unlocked"
                          ? "lock-open-outline"
                          : "lock-closed-outline"
                    }
                    size={15}
                    color={
                      lessonState === "completed"
                        ? "#4ADE80"
                        : lessonState === "current" || lessonState === "unlocked"
                          ? "#93C5FD"
                          : theme.colors.muted
                    }
                  />
                </View>
                <View style={styles.metaValueRow}>
                  <Text style={styles.metaValue}>
                    {lessonState === "completed"
                      ? "Completed"
                      : lessonState === "current"
                        ? "Current"
                        : lessonState === "unlocked"
                          ? "Unlocked"
                          : "Locked"}
                  </Text>
                </View>
              </View>
              <View style={styles.metaCard}>
                <View style={styles.metaTopRow}>
                  <Text style={styles.metaLabel}>Sections</Text>
                  <Ionicons name="albums-outline" size={15} color="#60A5FA" />
                </View>
                <View style={styles.metaValueRow}>
                  <Text style={styles.metaValue}>{lesson.contents.length}</Text>
                </View>
              </View>
              <View style={styles.metaCard}>
                <View style={styles.metaTopRow}>
                  <Text style={styles.metaLabel}>Quiz</Text>
                  <Ionicons
                    name={lessonState === "locked" ? "lock-closed-outline" : "play-outline"}
                    size={15}
                    color={lessonState === "locked" ? theme.colors.muted : "#60A5FA"}
                  />
                </View>
                <View style={styles.metaValueRow}>
                  <Text style={styles.metaValue}>
                    {lessonState === "locked" ? "Locked" : "Ready"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.heroNotice}>
              <Ionicons
                name="school-outline"
                size={18}
                color={theme.mode === "dark" ? "#BFDBFE" : "#2563EB"}
              />
              <Text style={styles.heroNoticeText}>
                {lessonState === "current" || lessonState === "unlocked"
                  ? "Read the content first, then take the quiz to complete this lesson and unlock the next step."
                  : "This lesson is still locked. Complete the current unlocked lesson first to continue."}
              </Text>
            </View>

            {lesson.unit ? (
              <View style={styles.unitContextCard}>
                <View style={styles.unitContextTop}>
                  <View style={styles.unitContextText}>
                    <Text style={styles.unitContextEyebrow}>Inside unit</Text>
                    <Text style={styles.unitContextTitle}>
                      {lesson.unit.title}
                    </Text>
                    <Text style={styles.unitContextMeta}>{lessonPositionLabel}</Text>
                  </View>
                  <View style={styles.heroIconWrap}>
                    <Ionicons name="albums-outline" size={20} color="#60A5FA" />
                  </View>
                </View>
                {completedLessonsLabel ? (
                  <Text style={styles.unitProgressText}>{completedLessonsLabel}</Text>
                ) : null}
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
              <Text style={styles.sectionTitle}>Lesson content</Text>
              <Text style={styles.sectionHelperText}>
                Tap a section to focus it as you work through the lesson.
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
              isActive={item.id === activeSectionId}
              isViewed={viewedSectionIds.includes(item.id)}
              onPress={() => handleFocusSection(item.id)}
            />
          ))}

          {(lessonState === "current" || lessonState === "unlocked" || lessonState === "completed") &&
          sortedContents.length > 0 ? (
            <View style={styles.quizEntryCard}>
              <LinearGradient
                colors={["rgba(37,99,235,0.22)", "rgba(124,58,237,0.18)"]}
                style={styles.quizEntryGlow}
              />
              <View style={styles.quizEntryTop}>
                <View style={styles.quizEntryIconWrap}>
                  <Ionicons name="sparkles-outline" size={18} color="#BFDBFE" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quizEntryTitle}>Ready for the quiz?</Text>
                  <Text style={styles.quizEntryText}>
                    {activeSection
                      ? `You are focused on "${activeSection.title || `Section ${activeSection.order}`}".`
                      : "Review the lesson sections, then start the quiz when you are ready."}
                  </Text>
                </View>
              </View>
              <View style={styles.quizEntryMetaRow}>
                <Text style={styles.quizEntryMeta}>
                  {viewedCount}/{sortedContents.length} sections viewed
                </Text>
                <Text style={styles.quizEntryMeta}>
                  {lessonState === "completed" ? "Retake available" : "Quiz ready"}
                </Text>
              </View>
              <LessonActionButton
                label={lessonState === "completed" ? "Retake lesson quiz" : "Start lesson quiz"}
                onPress={onOpenQuiz}
                styles={styles}
                variant="primary"
                icon={lessonState === "completed" ? "refresh" : "play"}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Animated.View entering={FadeIn.duration(300)} style={styles.actionBar}>
        <LessonActionButton
          label="Back to lessons"
          onPress={onBack}
          styles={styles}
          icon="arrow-back"
        />
        <LessonActionButton
          label={
            lessonState === "completed"
              ? "Retake quiz"
              : lessonState === "current" || lessonState === "unlocked"
                ? "Start quiz"
                : "Lesson locked"
          }
          onPress={onOpenQuiz}
          styles={styles}
          variant="primary"
          icon={
            lessonState === "completed"
              ? "refresh"
              : lessonState === "current" || lessonState === "unlocked"
                ? "play"
                : "lock-closed"
          }
          disabled={lessonState === "locked"}
        />
      </Animated.View>
    </View>
  );
}
