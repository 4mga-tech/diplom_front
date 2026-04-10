import { api } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BackButton } from "../ui/BackButton";
import { FormInput } from "../ui/FormInput";
import { GradientButton } from "../ui/GradientButton";
import { theme } from "../ui/theme";

const emailRegex = /\S+@\S+\.\S+/;

type LoginResponse = {
  token?: string;
  user?: unknown;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const canSubmit = useMemo(
    () => email.length > 0 && password.length > 0,
    [email, password],
  );
  const router = useRouter();

  const handleLogin = async () => {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = "email required.";
    else if (!emailRegex.test(email)) next.email = "Invalid email.";

    if (!password) next.password = "Password required.";
    else if (password.length < 4)
      next.password = "Password must be at least 4 characters long.";

    setErrors(next);

    if (Object.keys(next).length === 0) {
      try {
        const { data } = (await api.post("/auth/login", {
          email,
          password,
        })) as { data: LoginResponse };

        await AsyncStorage.setItem("registered", "true");
        if (data.token) await AsyncStorage.setItem("token", data.token);
        if (data.user)
          await AsyncStorage.setItem("user", JSON.stringify(data.user));

        router.replace("/(tabs)");
      } catch (err: any) {
        alert(err.response?.data?.message || "Login failed");
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
            <View style={{ gap: 6 }}>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>step forward</Text>
            </View>

            <View style={{ gap: theme.s(2) }}>
              <FormInput
                placeholder="e-mail"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                keyboardType="email-address"
                error={errors.email}
              />

              <FormInput
                placeholder="********"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                secureTextEntry={!showPw}
                rightIcon={showPw ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPw((v) => !v)}
                error={errors.password}
              />

              <View style={{ alignItems: "flex-end" }}>
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.75 }]}
                  onPress={() => router.push("/auth/forgot-password")}
                >
                  <Text style={styles.linkSm}>Forgot password?</Text>
                </Pressable>
              </View>
            </View>

            <GradientButton
              title="Login"
              onPress={handleLogin}
              disabled={!canSubmit}
            />

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  inner: {
    flex: 1,
    paddingHorizontal: theme.s(3),
    paddingVertical: theme.s(4),
  },
  header: { marginBottom: theme.s(3) },
  content: { flex: 1, gap: theme.s(4) },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: "800" },
  subtitle: { color: theme.colors.muted, fontSize: 15 },
  linkSm: { color: "#60A5FA", fontSize: 13, fontWeight: "600" },
  bottomText: {
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: theme.s(1),
  },
  link: { color: "#60A5FA", fontWeight: "700" },
});
