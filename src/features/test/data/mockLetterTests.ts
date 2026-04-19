import { TestQuestion } from "../types/test.types";

export const mockLetterTests: Record<string, TestQuestion[]> = {
  B1: [
    {
      id: "b1-letter-1",
      levelId: "B1",
      testType: "letter",
      question: 'Аль нь кирилл үсэг "А" вэ?',
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "Б" },
        { id: "c", text: "А" },
        { id: "d", text: "Г" },
      ],
      correctOptionId: "c",
    },
    {
      id: "b1-letter-2",
      levelId: "B1",
      testType: "letter",
      question: '"Ном" үгийн эхний үсэг аль нь вэ?',
      options: [
        { id: "a", text: "М" },
        { id: "b", text: "Н" },
        { id: "c", text: "О" },
        { id: "d", text: "Л" },
      ],
      correctOptionId: "b",
    },
  ],
  M1: [
    {
      id: "m1-letter-1",
      levelId: "M1",
      testType: "letter",
      question: '"Аав" үг ямар үсгээр эхэлдэг вэ?',
      options: [
        { id: "a", text: "А" },
        { id: "b", text: "Б" },
        { id: "c", text: "В" },
        { id: "d", text: "Г" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m1-letter-2",
      levelId: "M1",
      testType: "letter",
      question: "Аль нь эгшиг үсэг вэ?",
      options: [
        { id: "a", text: "М" },
        { id: "b", text: "С" },
        { id: "c", text: "У" },
        { id: "d", text: "Н" },
      ],
      correctOptionId: "c",
    },
  ],
  M2: [
    {
      id: "m2-letter-1",
      levelId: "M2",
      testType: "letter",
      question: '"Өдөр" үг ямар үсгээр эхэлдэг вэ?',
      options: [
        { id: "a", text: "О" },
        { id: "b", text: "Ө" },
        { id: "c", text: "Ү" },
        { id: "d", text: "Э" },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-letter-2",
      levelId: "M2",
      testType: "letter",
      question: "Аль нь зөв бичигдсэн үг вэ?",
      options: [
        { id: "a", text: "гэр" },
        { id: "b", text: "gэр" },
        { id: "c", text: "гэr" },
        { id: "d", text: "gэr" },
      ],
      correctOptionId: "a",
    },
  ],
  M3: [
    {
      id: "m3-letter-1",
      levelId: "M3",
      testType: "letter",
      question: '"Шийдвэр" үгийн эхний үсэг аль нь вэ?',
      options: [
        { id: "a", text: "Ш" },
        { id: "b", text: "С" },
        { id: "c", text: "Ч" },
        { id: "d", text: "Ж" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m3-letter-2",
      levelId: "M3",
      testType: "letter",
      question: "Аль нь зөв кирилл бичиглэл вэ?",
      options: [
        { id: "a", text: "турshлага" },
        { id: "b", text: "туршлага" },
        { id: "c", text: "tuршлага" },
        { id: "d", text: "туршlага" },
      ],
      correctOptionId: "b",
    },
  ],
};
