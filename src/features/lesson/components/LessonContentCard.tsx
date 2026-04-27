import { LessonContentItem } from "@/lib/learning";
import {
  formatLessonContentSectionType,
  getLessonContentTypeConfig,
} from "@/src/features/lesson/content-config";
import LessonContentRenderer from "@/src/features/lesson/components/LessonContentRenderer";
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
  isFinalExam?: boolean;
  isActive?: boolean;
  isViewed?: boolean;
  onPress?: () => void;
};

export default function LessonContentCard({
  item,
  styles,
  onOpenQuiz,
  isFinalExam = false,
  isActive = false,
  isViewed = false,
  onPress,
}: Props) {
  const meta = getLessonContentTypeConfig(item.type);
  const statusLabel = isActive ? "Current" : isViewed ? "Viewed" : null;
  const statusIcon = isActive ? "sparkles-outline" : "checkmark-circle";
  const statusColor = isActive ? "#60A5FA" : "#22C55E";

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
          isViewed ? styles.contentCardViewed : null,
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
                <Text style={styles.contentLabel}>
                  {formatLessonContentSectionType(meta.sectionType)} / {meta.label}
                </Text>
                {statusLabel ? (
                  <View
                    style={[
                      styles.contentStatusPill,
                      {
                        borderColor: `${statusColor}33`,
                        backgroundColor: `${statusColor}12`,
                      },
                    ]}
                  >
                    <Ionicons name={statusIcon} size={12} color={statusColor} />
                    <Text style={[styles.contentStatusText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
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
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}
