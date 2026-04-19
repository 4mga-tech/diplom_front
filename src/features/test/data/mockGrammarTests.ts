import { TestQuestion } from "../types/test.types";

export const mockGrammarTests: Record<string, TestQuestion[]> = {
  B1: [
    {
      id: "b1-grammar-1",
      levelId: "B1",
      testType: "grammar",
      question: '"Би ___ сурагч." хоосон хэсгийг нөх.',
      options: [
        { id: "a", text: "байна" },
        { id: "b", text: "бай" },
        { id: "c", text: "байв" },
        { id: "d", text: "байжээ" },
      ],
      correctOptionId: "a",
    },
    {
      id: "b1-grammar-2",
      levelId: "B1",
      testType: "grammar",
      question: '"Тэр ном ___." зөв хувилбарыг сонго.',
      options: [
        { id: "a", text: "уншина" },
        { id: "b", text: "иднэ" },
        { id: "c", text: "уух" },
        { id: "d", text: "гүйх" },
      ],
      correctOptionId: "a",
    },
  ],
  M1: [
    {
      id: "m1-grammar-1",
      levelId: "M1",
      testType: "grammar",
      question: '"Бид сургууль ___ явна."',
      options: [
        { id: "a", text: "-руу" },
        { id: "b", text: "-аас" },
        { id: "c", text: "-тай" },
        { id: "d", text: "-гүй" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m1-grammar-2",
      levelId: "M1",
      testType: "grammar",
      question: '"Би цай ___."',
      options: [
        { id: "a", text: "ууна" },
        { id: "b", text: "уншина" },
        { id: "c", text: "бичнэ" },
        { id: "d", text: "сууна" },
      ],
      correctOptionId: "a",
    },
  ],
  M2: [
    {
      id: "m2-grammar-1",
      levelId: "M2",
      testType: "grammar",
      question: '"Хэрэв завтай бол, би чамтай ___."',
      options: [
        { id: "a", text: "уулзана" },
        { id: "b", text: "унтана" },
        { id: "c", text: "иднэ" },
        { id: "d", text: "зурна" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-grammar-2",
      levelId: "M2",
      testType: "grammar",
      question: '"Өчигдөр би кино ___."',
      options: [
        { id: "a", text: "үзсэн" },
        { id: "b", text: "үзнэ" },
        { id: "c", text: "үздэг" },
        { id: "d", text: "үзэх" },
      ],
      correctOptionId: "a",
    },
  ],
  M3: [
    {
      id: "m3-grammar-1",
      levelId: "M3",
      testType: "grammar",
      question: '"Тэр ирсэн бол бид уулзах ___ байсан."',
      options: [
        { id: "a", text: "байлаа" },
        { id: "b", text: "болно" },
        { id: "c", text: "юм" },
        { id: "d", text: "байх" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m3-grammar-2",
      levelId: "M3",
      testType: "grammar",
      question: '"Сайн сурахын тулд өдөр бүр давтах ___."',
      options: [
        { id: "a", text: "хэрэгтэй" },
        { id: "b", text: "байсан" },
        { id: "c", text: "ирнэ" },
        { id: "d", text: "явна" },
      ],
      correctOptionId: "a",
    },
  ],
};
