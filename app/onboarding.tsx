import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const PAGES = [
  {
    id: "1",
    title: "Learn Mongolian 🇲🇳",
    description: "Fun, interactive lessons designed for real life.",
    image: require("../assets/onboarding/train1.png"),
  },
  {
    id: "2",
    title: "Stay Consistent 🔥",
    description: "Build your daily streak and never miss a day.",
    image: require("../assets/onboarding/train2.jpeg"),
  },
  {
    id: "3",
    title: "Earn Rewards ⭐",
    description: "Gain XP, unlock levels, and feel progress.",
    image: require("../assets/onboarding/train3.jpg"),
  },
  {
    id: "4",
    title: "Track Your Growth 📊",
    description: "Visualize your improvement over time.",
    image: require("../assets/onboarding/train4.jpg"),
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const next = async () => {
    if (index < PAGES.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      await AsyncStorage.setItem("onboardingDone", "true");
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item, index: i }) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [80, 0, 80],
            extrapolate: "clamp",
          });

          return (
            <View style={{ width, height }}>
              <ImageBackground
                source={item.image}
                style={styles.imageBg}
                imageStyle={{ resizeMode: "cover" }}
              >
                {/* overlay */}
                <View style={styles.overlay} />

                {/* text */}
                <Animated.View
                  style={[
                    styles.textContainer,
                    {
                      opacity,
                      transform: [{ translateY }],
                      bottom: 230 + insets.bottom,
                    },
                  ]}
                >
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                </Animated.View>
              </ImageBackground>
            </View>
          );
        }}
      />

      <View style={[styles.dots, { bottom: 120 + insets.bottom }]}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === index ? 1 : 0.3, width: i === index ? 20 : 8 },
            ]}
          />
        ))}
      </View>

      <View style={[styles.footer, { bottom: 50 + insets.bottom }]}>
        <Pressable onPress={next}>
          <LinearGradient colors={["#7C3AED", "#3B82F6"]} style={styles.button}>
            <Text style={styles.buttonText}>
              {index === PAGES.length - 1 ? "Start Learning" : "Next"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  textContainer: {
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    marginBottom: 10,
  },

  desc: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
  },

  footer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },

  button: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
  },

  buttonText: {
    fontWeight: "600",
    color: "white",
    fontSize: 16,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    position: "absolute",
    width: "100%",
  },

  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
});
