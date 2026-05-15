import alphabetAudio from "@/src/data/alphabet.audio.json";
import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;
type AlphabetAudioItem = {
  letter: string;
  lowercase: string;
  audioKey: string;
};
export async function playAudio(audioUrl: string): Promise<void> {
  try {
    // console.log("Playing audio:", audioUrl);

    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );

    currentSound = sound;
  } catch (error) {
    console.error("Error playing audio:", audioUrl, error);
  }
}

export async function stopAudio(): Promise<void> {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.error("Error stopping audio:", error);
  }
}

export function getAudioUrl(audioKey?: string, baseUrl?: string): string {
  if (!audioKey) return "";

  const rawBase =
    baseUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    "http://localhost:4000";

  const cleanBase = rawBase.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const cleanKey = audioKey.replace(/^\/+/, "");

  return `${cleanBase}/audio/${cleanKey}`;
}
export function getLetterAudioKey(letterText?: string): string | undefined {
  if (!letterText) return undefined;

  const first = letterText.trim().charAt(0).toUpperCase();

  const item = (alphabetAudio as AlphabetAudioItem[]).find(
    (x) => x.letter === first || x.lowercase === first.toLowerCase()
  );

  return item?.audioKey;
}