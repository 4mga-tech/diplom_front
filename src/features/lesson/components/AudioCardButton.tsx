import { playAudio, getAudioUrl, stopAudio } from "@/lib/audio";
import { useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  audioKey: string;
  label?: string;
};

export default function AudioCardButton({ audioKey, label }: Props) {
  const { theme } = useAppTheme();
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlay = React.useCallback(async () => {
    const audioUrl = getAudioUrl(audioKey);
    setIsPlaying(true);
    try {
      await playAudio(audioUrl);
    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setIsPlaying(false);
    }
  }, [audioKey]);

  React.useEffect(() => {
    return () => {
      void stopAudio();
    };
  }, []);

  return (
    <Pressable
      onPress={handlePlay}
      disabled={isPlaying}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor:
            theme.mode === "dark"
              ? "rgba(59,130,246,0.12)"
              : "rgba(59,130,246,0.08)",
          borderColor:
            theme.mode === "dark"
              ? "rgba(96,165,250,0.22)"
              : "rgba(59,130,246,0.18)",
          opacity: pressed || isPlaying ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={28}
          color="#3B82F6"
        />
      </View>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 100,
    flex: 1,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(59,130,246,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
