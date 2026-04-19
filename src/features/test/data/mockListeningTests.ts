import { TestQuestion } from "../types/test.types";

export const mockListeningTests: Record<string, TestQuestion[]> = {
  B1: [
    {
      id: "b1-listen-1",
      levelId: "B1",
      testType: "listening",
      question: 'Аудио: "Сайн уу?" — юу сонсогдсон бэ?',
      options: [
        { id: "a", text: "Баяртай" },
        { id: "b", text: "Сайн уу" },
        { id: "c", text: "Уучлаарай" },
        { id: "d", text: "За" },
      ],
      correctOptionId: "b",
    },
    {
      id: "b1-listen-2",
      levelId: "B1",
      testType: "listening",
      question: 'Аудио: "Баярлалаа" — зөв хариуг сонго.',
      options: [
        { id: "a", text: "Thank you" },
        { id: "b", text: "Sorry" },
        { id: "c", text: "Hello" },
        { id: "d", text: "Good night" },
      ],
      correctOptionId: "a",
    },
  ],
  M1: [
    {
      id: "m1-listen-1",
      levelId: "M1",
      testType: "listening",
      question: 'Аудио: "Би багш." — юу сонсогдсон бэ?',
      options: [
        { id: "a", text: "I am a teacher" },
        { id: "b", text: "I am a student" },
        { id: "c", text: "I am a doctor" },
        { id: "d", text: "I am tired" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m1-listen-2",
      levelId: "M1",
      testType: "listening",
      question: 'Аудио: "Тэр гэртээ байна."',
      options: [
        { id: "a", text: "He is at school" },
        { id: "b", text: "He is at home" },
        { id: "c", text: "He is outside" },
        { id: "d", text: "He is running" },
      ],
      correctOptionId: "b",
    },
  ],
  M2: [
    {
      id: "m2-listen-1",
      levelId: "M2",
      testType: "listening",
      question: 'Аудио: "Би маргааш Улаанбаатар явна."',
      options: [
        { id: "a", text: "I went yesterday" },
        { id: "b", text: "I will go tomorrow" },
        { id: "c", text: "I am staying here" },
        { id: "d", text: "I arrived today" },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-listen-2",
      levelId: "M2",
      testType: "listening",
      question: 'Аудио: "Автобус арван цагт ирнэ."',
      options: [
        { id: "a", text: "The bus leaves at ten" },
        { id: "b", text: "The bus arrives at ten" },
        { id: "c", text: "The bus is late" },
        { id: "d", text: "The bus is full" },
      ],
      correctOptionId: "b",
    },
  ],
  M3: [
    {
      id: "m3-listen-1",
      levelId: "M3",
      testType: "listening",
      question: 'Аудио: "Тэр хурлын дараа илтгэлээ үргэлжлүүлсэн."',
      options: [
        { id: "a", text: "He canceled the speech" },
        { id: "b", text: "He continued the presentation after the meeting" },
        { id: "c", text: "He missed the meeting" },
        { id: "d", text: "He started a new class" },
      ],
      correctOptionId: "b",
    },
    {
      id: "m3-listen-2",
      levelId: "M3",
      testType: "listening",
      question: 'Аудио: "Тэд асуудлыг тайван хэлэлцсэн."',
      options: [
        { id: "a", text: "They ignored the issue" },
        { id: "b", text: "They discussed the issue calmly" },
        { id: "c", text: "They argued loudly" },
        { id: "d", text: "They forgot the issue" },
      ],
      correctOptionId: "b",
    },
  ],
};
