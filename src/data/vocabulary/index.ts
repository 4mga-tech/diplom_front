import m1 from "./m1_vocabulary_app_grouped.json";

export function getVocabularyByLevel(levelId: string) {
  switch (levelId) {
    case "B1":
      return m1;
    case "M1":
      return m1;
    case "M2":
      return m1;
    case "M3":
      return m1;
    default:
      return [];
  }
}
