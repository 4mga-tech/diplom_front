import { AppTheme, useThemedStyles } from "@/src/ui/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const logoImage = require("../../../../assets/logo.png");

export default function WelcomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const logoFrameSize = Math.max(220, Math.min(288, width * 0.76));
  const logoImageSize = logoFrameSize * 1.42;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.brandHero}>
          <View
            style={[
              styles.logoFrame,
              { width: logoFrameSize, height: logoFrameSize },
            ]}
          >
            <Image
              source={logoImage}
              style={[
                styles.logoImage,
                { width: logoImageSize, height: logoImageSize },
              ]}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.subtitle}>
          Learn Mongolian with interactive lessons for international students
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => router.push("/auth/register")}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed ? { opacity: 0.9 } : null,
          ]}
        >
          <LinearGradient
            colors={["#2563EB", "#7C3AED"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryText}>Sign up</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push("/auth/login")}
          style={({ pressed }) => [
            styles.linkBtn,
            pressed ? { opacity: 0.75 } : null,
          ]}
        >
          <Text style={styles.linkText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0B1220",
      paddingHorizontal: theme.s(3),
      paddingVertical: theme.s(6),
      justifyContent: "space-between",
    },
    top: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.s(1.7),
    },
    brandHero: {
      width: "100%",
      minHeight: 268,
      alignItems: "center",
      justifyContent: "center",
    },
    logoFrame: {
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    logoImage: {
      marginTop: -10,
    },
    subtitle: {
      color: "rgba(226,232,240,0.78)",
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 308,
      fontWeight: "500",
    },
    bottom: {
      width: "100%",
      gap: theme.s(2),
      paddingBottom: theme.s(1.2),
    },
    primaryBtn: {
      width: "100%",
      borderRadius: theme.r.xl,
      overflow: "hidden",
    },
    primaryGradient: {
      paddingVertical: theme.s(2),
      alignItems: "center",
      borderRadius: theme.r.xl,
    },
    primaryText: {
      color: "white",
      fontSize: 16,
      fontWeight: "800",
    },
    linkBtn: {
      alignItems: "center",
      paddingVertical: theme.s(1),
    },
    linkText: {
      color: "rgba(226,232,240,0.78)",
      fontSize: 15,
      fontWeight: "600",
    },
  });
