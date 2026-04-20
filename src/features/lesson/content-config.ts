import { LessonContentItem, LessonContentType } from "@/lib/learning";
import { Ionicons } from "@expo/vector-icons";

export type LessonContentSectionType =
  | "reading"
  | "reference"
  | "practice"
  | "listening"
  | "quiz";

export type LessonContentTypeConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sectionType: LessonContentSectionType;
  tint: string;
  getDefaultTitle: (item: LessonContentItem) => string;
};

function createDefaultTitle(label: string) {
  return (item: LessonContentItem) => item.title || `Lesson ${label.toLowerCase()}`;
}

export const LESSON_CONTENT_TYPE_CONFIG: Record<
  LessonContentType,
  LessonContentTypeConfig
> = {
  text: {
    icon: "book-outline",
    label: "Reading",
    sectionType: "reading",
    tint: "#94A3B8",
    getDefaultTitle: createDefaultTitle("Reading"),
  },
  video: {
    icon: "videocam-outline",
    label: "Video",
    sectionType: "reading",
    tint: "#A78BFA",
    getDefaultTitle: createDefaultTitle("Video"),
  },
  quiz: {
    icon: "help-circle-outline",
    label: "Quiz",
    sectionType: "quiz",
    tint: "#A78BFA",
    getDefaultTitle: createDefaultTitle("Quiz"),
  },
  audio: {
    icon: "musical-notes-outline",
    label: "Audio",
    sectionType: "listening",
    tint: "#38BDF8",
    getDefaultTitle: createDefaultTitle("Audio"),
  },
  pronunciation: {
    icon: "volume-medium-outline",
    label: "Pronunciation",
    sectionType: "listening",
    tint: "#60A5FA",
    getDefaultTitle: createDefaultTitle("Pronunciation"),
  },
  image: {
    icon: "image-outline",
    label: "Image",
    sectionType: "reference",
    tint: "#F59E0B",
    getDefaultTitle: createDefaultTitle("Image"),
  },
  alphabet_table: {
    icon: "grid-outline",
    label: "Alphabet",
    sectionType: "reference",
    tint: "#F59E0B",
    getDefaultTitle: createDefaultTitle("Alphabet"),
  },
  classification: {
    icon: "git-network-outline",
    label: "Classification",
    sectionType: "reference",
    tint: "#14B8A6",
    getDefaultTitle: createDefaultTitle("Classification"),
  },
  grammar_note: {
    icon: "document-text-outline",
    label: "Grammar Notes",
    sectionType: "reference",
    tint: "#8B5CF6",
    getDefaultTitle: createDefaultTitle("Grammar Notes"),
  },
  vocab_list: {
    icon: "library-outline",
    label: "Vocabulary",
    sectionType: "reference",
    tint: "#22C55E",
    getDefaultTitle: createDefaultTitle("Vocabulary"),
  },
  exercise_repeat: {
    icon: "repeat-outline",
    label: "Repeat Exercise",
    sectionType: "practice",
    tint: "#60A5FA",
    getDefaultTitle: createDefaultTitle("Repeat Exercise"),
  },
  exercise_write: {
    icon: "create-outline",
    label: "Writing Exercise",
    sectionType: "practice",
    tint: "#F97316",
    getDefaultTitle: createDefaultTitle("Writing Exercise"),
  },
  exercise_fill: {
    icon: "checkbox-outline",
    label: "Fill Exercise",
    sectionType: "practice",
    tint: "#06B6D4",
    getDefaultTitle: createDefaultTitle("Fill Exercise"),
  },
  exercise_word_build: {
    icon: "construct-outline",
    label: "Word Build",
    sectionType: "practice",
    tint: "#EAB308",
    getDefaultTitle: createDefaultTitle("Word Build"),
  },
  quiz_link: {
    icon: "help-circle-outline",
    label: "Quiz",
    sectionType: "quiz",
    tint: "#A78BFA",
    getDefaultTitle: createDefaultTitle("Quiz"),
  },
};

export function getLessonContentTypeConfig(
  type: LessonContentType,
): LessonContentTypeConfig {
  return LESSON_CONTENT_TYPE_CONFIG[type] ?? LESSON_CONTENT_TYPE_CONFIG.text;
}

export function formatLessonContentSectionType(
  sectionType: LessonContentSectionType,
) {
  switch (sectionType) {
    case "reading":
      return "Reading";
    case "reference":
      return "Reference";
    case "practice":
      return "Practice";
    case "listening":
      return "Listening";
    case "quiz":
      return "Quiz";
    default:
      return "Reading";
  }
}
