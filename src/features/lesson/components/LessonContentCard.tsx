import { LessonContentItem } from "@/lib/learning";
import LessonContentRenderer from "@/src/features/lesson/components/LessonContentRenderer";
import {
  formatLessonContentSectionType,
  getLessonContentTypeConfig,
} from "@/src/features/lesson/content-config";
import { LessonStyles } from "@/src/features/lesson/lesson.styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";

type Props = {
  item: LessonContentItem;
  styles: LessonStyles;
  onOpenQuiz: () => void;
  lessonId?: string;
  isFinalExam?: boolean;
  isActive?: boolean;
  onPress?: () => void;
};

export default function LessonContentCard({
  item,
  styles,
  onOpenQuiz,
  lessonId,
  isFinalExam = false,
  isActive = false,
  onPress,
}: Props) {
  const meta = getLessonContentTypeConfig(item.type);
  const compactTypes = ["hero_intro", "alphabet_preview", "next_steps"];
  const isCompactType = compactTypes.includes(item.type);

  return (
    <Animated.View
      entering={FadeInDown.delay(item.order * 45).duration(260)}
      layout={LinearTransition.duration(240)}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.contentCard,
          isActive ? styles.contentCardActive : null,
          pressed ? styles.contentCardPressed : null,
        ]}
      >
        <View style={styles.contentHeader}>
          <View style={styles.contentHeaderLeft}>
            <View
              style={[
                styles.contentIconWrap,
                isActive ? styles.contentIconWrapActive : null,
              ]}
            >
              <Ionicons name={meta.icon} size={18} color={meta.tint} />
            </View>
            <View style={styles.contentHeaderText}>
              <View style={styles.contentMetaRow}>
                {!isCompactType ? (
  <Text style={styles.contentLabel}>
    {formatLessonContentSectionType(meta.sectionType)} / {meta.label}
  </Text>
) : null}

              </View>
              <Text style={styles.contentTitle}>{meta.getDefaultTitle(item)}</Text>
              {item.titleEn ? (
                <Text style={styles.contentTitleEn}>{item.titleEn}</Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.contentBodyWrap}>
          <LessonContentRenderer
            item={item}
            styles={styles}
            onOpenQuiz={onOpenQuiz}
            isFinalExam={isFinalExam}
            lessonId={lessonId}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}
