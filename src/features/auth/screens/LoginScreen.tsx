import { api } from "@/lib/api";
import { claimDailyLoginXpIfNeeded } from "@/src/features/achievements/achievements.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { BackButton } from "../../../ui/BackButton";
import { FormInput } from "../../../ui/FormInput";
import { GradientButton } from "../../../ui/GradientButton";
import { AppTheme, useAppTheme, useThemedStyles } from "../../../ui/theme";

const emailRegex = /\S+@\S+\.\S+/;

type LoginResponse = {
  token?: string;
  user?: unknown;
};

const logoImage = require("../../../../assets/logo.png");

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const logoFrameSize = Math.max(144, Math.min(184, width * 0.44));
  const logoImageSize = logoFrameSize * 1.28;

  const canSubmit = useMemo(
    () => email.length > 0 && password.length > 0 && !submitting,
    [email, password, submitting],
  );
  const router = useRouter();

  const handleLogin = async () => {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = "email required.";
    else if (!emailRegex.test(email)) next.email = "Invalid email.";

    if (!password) next.password = "Password required.";
    else if (password.length < 4) {
      next.password = "Password must be at least 4 characters long.";
    }

    setErrors(next);

    if (Object.keys(next).length === 0) {
      try {
        setSubmitting(true);
        const { data } = (await api.post("/auth/login", {
          email,
          password,
        })) as { data: LoginResponse };

        await AsyncStorage.setItem("registered", "true");
        if (data.token) await AsyncStorage.setItem("token", data.token);
        if (data.user) {
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }

        try {
          await claimDailyLoginXpIfNeeded();
        } catch (claimError) {
          console.log("Daily login XP claim failed after login:", claimError);
        }

        router.replace("/(tabs)");
      } catch (err: any) {
        alert(err.response?.data?.message || "Login failed");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <BackButton />
          </View>

          <View style={styles.content}>
            <View style={styles.logoBlock}>
              <View
                style={[
                  styles.logoFrame,
                  { width: logoFrameSize, height: logoFrameSize },
                ]}
              >
                <Image
                  source={logoImage}
                  style={{
                    width: logoImageSize,
                    height: logoImageSize,
                    marginTop: -6,
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>step forward</Text>
            </View>

            <View style={{ gap: theme.s(2) }}>
              <FormInput
                placeholder="e-mail"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) {
                    setErrors((p) => ({ ...p, email: undefined }));
                  }
                }}
                keyboardType="email-address"
                error={errors.email}
              />

              <FormInput
                placeholder="********"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) {
                    setErrors((p) => ({ ...p, password: undefined }));
                  }
                }}
                secureTextEntry={!showPw}
                rightIcon={showPw ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPw((v) => !v)}
                error={errors.password}
              />

              <View style={{ alignItems: "flex-end" }}>
                <Pressable
                  style={({ pressed }) => [pressed ? { opacity: 0.75 } : null]}
                  onPress={() => router.push("/auth/forgot-password")}
                >
                  <Text style={styles.linkSm}>Forgot password?</Text>
                </Pressable>
              </View>
            </View>

            <GradientButton
              title={submitting ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={!canSubmit}
            />

            {submitting ? (
              <View style={styles.loadingRow}>
                <Image
                  source={logoImage}
                  style={styles.loadingLogo}
                  resizeMode="contain"
                />
                <ActivityIndicator color={theme.colors.text} size="small" />
                <Text style={styles.loadingText}>Signing you in</Text>
              </View>
            ) : null}

            <Text style={styles.bottomText}>
              Or{" "}
              <Text
                onPress={() => router.push("/auth/register")}
                style={styles.link}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    inner: {
      flex: 1,
      paddingHorizontal: theme.s(3),
      paddingVertical: theme.s(4),
    },
    header: { marginBottom: theme.s(2) },
    content: { flex: 1, gap: theme.s(2.2) },
    logoBlock: {
      alignItems: "center",
      marginTop: 0,
      marginBottom: theme.s(0.1),
    },
    logoFrame: {
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    titleBlock: {
      gap: 4,
      alignItems: "flex-start",
    },
    title: { color: theme.colors.text, fontSize: 28, fontWeight: "800" },
    subtitle: { color: theme.colors.muted, fontSize: 15 },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.s(1),
      marginTop: -theme.s(0.4),
    },
    loadingLogo: {
      width: 34,
      height: 34,
    },
    loadingText: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "600",
    },
    linkSm: { color: "#60A5FA", fontSize: 13, fontWeight: "600" },
    bottomText: {
      textAlign: "center",
      color: theme.colors.muted,
      fontSize: 14,
      marginTop: theme.s(1),
    },
    link: { color: "#60A5FA", fontWeight: "700" },
  });
