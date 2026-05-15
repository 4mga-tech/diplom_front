import {
  getAudioUrl,
  getLetterAudioKey,
  playAudio,
  stopAudio,
} from "@/lib/audio";
import { useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
type LetterPracticeData = {
  primary: string;
  uppercase?: string | null;
  lowercase?: string | null;
  printForm?: string | null;
  cursiveForm?: string | null;
  audioKey?: string;
};

type Point = {
  x: number;
  y: number;
};

type CanvasFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  letter: LetterPracticeData | null;
  onClose: () => void;
};

function distanceBetweenPoints(start: Point, end: Point) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function angleBetweenPoints(start: Point, end: Point) {
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
}

export default function LetterPracticeModal({
  visible,
  letter,
  onClose,
}: Props) {
  const { theme } = useAppTheme();
  const [strokes, setStrokes] = React.useState<Point[][]>([]);
  const [canvasFrame, setCanvasFrame] = React.useState<CanvasFrame | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const canvasRef = React.useRef<View | null>(null);

 const handlePlayAudio = React.useCallback(async () => {
  const audioKey =
    letter?.audioKey || getLetterAudioKey(letter?.primary);

  if (!audioKey) return;

  const audioUrl = getAudioUrl(audioKey);

  setIsPlaying(true);

  try {
    await playAudio(audioUrl);
  } catch (error) {
    console.error("Failed to play audio:", error);
  } finally {
    setIsPlaying(false);
  }
}, [letter?.audioKey, letter?.primary]);

  React.useEffect(() => {
    if (!visible) {
      setStrokes([]);
      setIsPlaying(false);
      void stopAudio();
    } else if (letter?.audioKey || letter?.primary) {
      handlePlayAudio();
    }
  }, [visible, letter?.audioKey, letter?.primary, handlePlayAudio]);

  const handleReset = React.useCallback(() => {
    setStrokes([]);
  }, []);

  const updateCanvasFrame = React.useCallback(() => {
    const node = canvasRef.current;

    if (!node) {
      return;
    }

    node.measureInWindow((x, y, width, height) => {
      setCanvasFrame({ x, y, width, height });
    });
  }, []);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      updateCanvasFrame();
    });

    return () => cancelAnimationFrame(frameId);
  }, [updateCanvasFrame, visible]);

  const handleCanvasLayout = React.useCallback(
    (_event: LayoutChangeEvent) => {
      updateCanvasFrame();
    },
    [updateCanvasFrame],
  );

  const toLocalPoint = React.useCallback(
    (nativeEvent: {
      locationX: number;
      locationY: number;
      pageX?: number;
      pageY?: number;
    }): Point => {
      const width = canvasFrame?.width ?? 0;
      const height = canvasFrame?.height ?? 0;
      const hasMeasuredFrame =
        canvasFrame !== null &&
        Number.isFinite(canvasFrame.x) &&
        Number.isFinite(canvasFrame.y) &&
        width > 0 &&
        height > 0 &&
        Number.isFinite(nativeEvent.pageX) &&
        Number.isFinite(nativeEvent.pageY);

      const localX = hasMeasuredFrame
        ? (nativeEvent.pageX as number) - canvasFrame.x
        : nativeEvent.locationX;
      const localY = hasMeasuredFrame
        ? (nativeEvent.pageY as number) - canvasFrame.y
        : nativeEvent.locationY;

      const maxX = width > 0 ? width : localX;
      const maxY = height > 0 ? height : localY;

      return {
        x: Math.max(0, Math.min(localX, maxX)),
        y: Math.max(0, Math.min(localY, maxY)),
      };
    },
    [canvasFrame],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const point = toLocalPoint(event.nativeEvent);

          setStrokes((current) => [...current, [point]]);
        },
        onPanResponderMove: (event) => {
          const point = toLocalPoint(event.nativeEvent);

          setStrokes((current) => {
            if (current.length === 0) {
              return [[point]];
            }

            const next = [...current];
            const lastStroke = next[next.length - 1] ?? [];
            next[next.length - 1] = [...lastStroke, point];
            return next;
          });
        },
      }),
    [toLocalPoint],
  );

  if (!letter) {
    return null;
  }

  const detailRows = [
    letter.uppercase && letter.lowercase
      ? { label: "Upper / lower", value: `${letter.uppercase}  ${letter.lowercase}` }
      : null,
    letter.printForm ? { label: "Print", value: letter.printForm } : null,
    letter.cursiveForm ? { label: "Cursive", value: letter.cursiveForm } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={[
            styles.card,
            {
              backgroundColor:
                theme.mode === "dark" ? "rgba(15,23,42,0.98)" : "#FFFFFF",
              borderColor:
                theme.mode === "dark"
                  ? "rgba(51,65,85,0.58)"
                  : "rgba(148,163,184,0.18)",
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>
                Writing practice
              </Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Trace this letter
              </Text>
            </View>

            <View style={styles.headerControls}>
              {letter?.audioKey || letter?.primary ? (
                <Pressable
                  onPress={handlePlayAudio}
                  disabled={isPlaying}
                  style={[
                    styles.headerButton,
                    {
                      backgroundColor:
                        theme.mode === "dark"
                          ? "rgba(59,130,246,0.15)"
                          : "rgba(59,130,246,0.1)",
                      borderColor:
                        theme.mode === "dark"
                          ? "rgba(96,165,250,0.25)"
                          : "rgba(59,130,246,0.2)",
                    },
                  ]}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={16}
                    color="#3B82F6"
                  />
                </Pressable>
              ) : null}
              <Pressable
                onPress={onClose}
                style={[
                  styles.headerButton,
                  {
                    backgroundColor:
                      theme.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(148,163,184,0.08)",
                    borderColor:
                      theme.mode === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(148,163,184,0.14)",
                  },
                ]}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.topRow}>
            <View
              style={[
                styles.letterHero,
                {
                  backgroundColor:
                    theme.mode === "dark"
                      ? "rgba(37,99,235,0.12)"
                      : "rgba(37,99,235,0.08)",
                  borderColor:
                    theme.mode === "dark"
                      ? "rgba(96,165,250,0.18)"
                      : "rgba(59,130,246,0.14)",
                },
              ]}
            >
              <Text style={[styles.heroLetter, { color: theme.colors.text }]}>
                {letter.primary}
              </Text>
            </View>

            <View style={styles.detailList}>
              {detailRows.length > 0 ? (
                detailRows.map((row) => (
                  <View key={row.label} style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.muted }]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {row.value}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.muted }]}>
                    Letter
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {letter.primary}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.instruction, { color: theme.colors.muted }]}>
            Trace the guide letter in the practice area.
          </Text>

          <View
            {...panResponder.panHandlers}
            ref={canvasRef}
            onLayout={handleCanvasLayout}
            style={[
              styles.canvas,
              {
                backgroundColor:
                  theme.mode === "dark"
                    ? "rgba(2,6,23,0.92)"
                    : "rgba(248,250,252,0.96)",
                borderColor:
                  theme.mode === "dark"
                    ? "rgba(51,65,85,0.56)"
                    : "rgba(148,163,184,0.18)",
              },
            ]}
          >
            <Text pointerEvents="none" style={styles.canvasGuideLetter}>
              {letter.primary}
            </Text>
            {strokes.map((stroke, strokeIndex) =>
              stroke.slice(1).map((point, pointIndex) => {
                const start = stroke[pointIndex];
                const end = point;
                const segmentLength = distanceBetweenPoints(start, end);
                const angle = angleBetweenPoints(start, end);

                return (
                  <View
                    key={`${strokeIndex}-${pointIndex}`}
                    pointerEvents="none"
                    style={[
                      styles.segment,
                      {
                        width: segmentLength,
                        left: start.x,
                        top: start.y,
                        transform: [{ rotate: `${angle}deg` }],
                      },
                    ]}
                  />
                );
              }),
            )}
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={handleReset}
              style={[
                styles.secondaryButton,
                {
                  backgroundColor:
                    theme.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(248,250,252,0.96)",
                  borderColor:
                    theme.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(148,163,184,0.18)",
                },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Clear
              </Text>
            </Pressable>

            <Pressable style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.56)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerControls: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  topRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  letterHero: {
    width: 92,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  heroLetter: {
    fontSize: 54,
    fontWeight: "900",
  },
  detailList: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  detailRow: {
    gap: 3,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  instruction: {
    fontSize: 12,
    fontWeight: "700",
  },
  canvas: {
    height: 280,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  canvasGuideLetter: {
    position: "absolute",
    alignSelf: "center",
    top: 26,
    fontSize: 180,
    fontWeight: "900",
    color: "rgba(148,163,184,0.18)",
  },
  segment: {
    position: "absolute",
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
