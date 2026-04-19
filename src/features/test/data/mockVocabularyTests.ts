import { TestQuestion } from "../types/test.types";

export const mockVocabularyTests: Record<string, TestQuestion[]> = {
  B1: [
    {
      id: "b1-vocab-1",
      levelId: "B1",
      testType: "vocabulary",
      question: '"ээж" гэдэг үгийн утга аль нь вэ?',
      options: [
        { id: "a", text: "mother" },
        { id: "b", text: "father" },
        { id: "c", text: "friend" },
        { id: "d", text: "teacher" },
      ],
      correctOptionId: "a",
      explanation: '"ээж" = mother',
    },
    {
      id: "b1-vocab-2",
      levelId: "B1",
      testType: "vocabulary",
      question: '"ус" гэдэг үгийн орчуулга аль нь вэ?',
      options: [
        { id: "a", text: "water" },
        { id: "b", text: "milk" },
        { id: "c", text: "bread" },
        { id: "d", text: "school" },
      ],
      correctOptionId: "a",
      explanation: '"ус" = water',
    },
  ],
  M1: [
    {
      id: "m1-vocab-1",
      levelId: "M1",
      testType: "vocabulary",
      question: '"аав" гэдэг үгийн утга аль нь вэ?',
      options: [
        { id: "a", text: "mother" },
        { id: "b", text: "father" },
        { id: "c", text: "brother" },
        { id: "d", text: "doctor" },
      ],
      correctOptionId: "b",
      explanation: '"аав" = father',
    },
    {
      id: "m1-vocab-2",
      levelId: "M1",
      testType: "vocabulary",
      question: '"ном" гэдэг үгийн орчуулга аль нь вэ?',
      options: [
        { id: "a", text: "book" },
        { id: "b", text: "pen" },
        { id: "c", text: "window" },
        { id: "d", text: "bag" },
      ],
      correctOptionId: "a",
      explanation: '"ном" = book',
    },
  ],
  M2: [
    {
      id: "m2-vocab-1",
      levelId: "M2",
      testType: "vocabulary",
      question: '"нисэх буудал" гэдэг үгийн утга аль нь вэ?',
      options: [
        { id: "a", text: "hospital" },
        { id: "b", text: "airport" },
        { id: "c", text: "restaurant" },
        { id: "d", text: "market" },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-vocab-2",
      levelId: "M2",
      testType: "vocabulary",
      question: '"аялал" гэдэг үгийн утга аль нь вэ?',
      options: [
        { id: "a", text: "travel" },
        { id: "b", text: "homework" },
        { id: "c", text: "meeting" },
        { id: "d", text: "weather" },
      ],
      correctOptionId: "a",
    },
  ],
  M3: [
    {
      id: "m3-vocab-1",
      levelId: "M3",
      testType: "vocabulary",
      question: '"шийдвэр" гэдэг үгийн утга аль нь вэ?',
      options: [
        { id: "a", text: "decision" },
        { id: "b", text: "question" },
        { id: "c", text: "example" },
        { id: "d", text: "history" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m3-vocab-2",
      levelId: "M3",
      testType: "vocabulary",
      question: '"туршлага" гэдэг үгийн утга аль нь вэ?',
      options: [
        { id: "a", text: "experience" },
        { id: "b", text: "holiday" },
        { id: "c", text: "village" },
        { id: "d", text: "promise" },
      ],
      correctOptionId: "a",
    },
  ],
};
