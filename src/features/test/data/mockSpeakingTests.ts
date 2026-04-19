import { TestQuestion } from "../types/test.types";

export const mockSpeakingTests: Record<string, TestQuestion[]> = {
  B1: [
    {
      id: "b1-speak-1",
      levelId: "B1",
      testType: "speaking",
      question: '"Сайн уу" гэж яаж хэлэх вэ?',
      options: [
        { id: "a", text: "Hello" },
        { id: "b", text: "Goodbye" },
        { id: "c", text: "Sorry" },
        { id: "d", text: "Please" },
      ],
      correctOptionId: "a",
    },
    {
      id: "b1-speak-2",
      levelId: "B1",
      testType: "speaking",
      question: '"Баярлалаа" гэж яаж хэлэх вэ?',
      options: [
        { id: "a", text: "Thank you" },
        { id: "b", text: "Excuse me" },
        { id: "c", text: "See you" },
        { id: "d", text: "Welcome" },
      ],
      correctOptionId: "a",
    },
  ],
  M1: [
    {
      id: "m1-speak-1",
      levelId: "M1",
      testType: "speaking",
      question: '"Намайг ... гэдэг" өгүүлбэрийн зөв утгыг сонго.',
      options: [
        { id: "a", text: "My name is ..." },
        { id: "b", text: "I am hungry" },
        { id: "c", text: "I live here" },
        { id: "d", text: "I am leaving" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m1-speak-2",
      levelId: "M1",
      testType: "speaking",
      question: '"Би Монгол хэл сурч байна."',
      options: [
        { id: "a", text: "I teach Mongolian" },
        { id: "b", text: "I am learning Mongolian" },
        { id: "c", text: "I forgot Mongolian" },
        { id: "d", text: "I wrote Mongolian" },
      ],
      correctOptionId: "b",
    },
  ],
  M2: [
    {
      id: "m2-speak-1",
      levelId: "M2",
      testType: "speaking",
      question: '"Та хаашаа явж байна вэ?" гэсэн асуултын утга аль нь вэ?',
      options: [
        { id: "a", text: "Where are you going?" },
        { id: "b", text: "What are you buying?" },
        { id: "c", text: "When did you come?" },
        { id: "d", text: "Who are you meeting?" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-speak-2",
      levelId: "M2",
      testType: "speaking",
      question: '"Би уулзалтанд оройтох гэж байна."',
      options: [
        { id: "a", text: "I am going to miss the bus" },
        { id: "b", text: "I am going to be late for the meeting" },
        { id: "c", text: "I have finished the meeting" },
        { id: "d", text: "I canceled the meeting" },
      ],
      correctOptionId: "b",
    },
  ],
  M3: [
    {
      id: "m3-speak-1",
      levelId: "M3",
      testType: "speaking",
      question: '"Санал нэг байна" гэдэг нь аль вэ?',
      options: [
        { id: "a", text: "I agree" },
        { id: "b", text: "I refuse" },
        { id: "c", text: "I doubt it" },
        { id: "d", text: "I forgot" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m3-speak-2",
      levelId: "M3",
      testType: "speaking",
      question: '"Энэ асуудлыг дахин авч үзье."',
      options: [
        { id: "a", text: "Let's ignore this issue" },
        { id: "b", text: "Let's reconsider this issue" },
        { id: "c", text: "Let's finish the class" },
        { id: "d", text: "Let's move tomorrow" },
      ],
      correctOptionId: "b",
    },
  ],
};
