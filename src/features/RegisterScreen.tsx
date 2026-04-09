import { api } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BackButton } from "../ui/BackButton";
import { FormInput } from "../ui/FormInput";
import { GradientButton } from "../ui/GradientButton";
import { theme } from "../ui/theme";

const emailRegex = /\S+@\S+\.\S+/;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const canSubmit = useMemo(
    () => email.length > 0 && password.length > 0 && confirmPassword.length > 0,
    [email, password, confirmPassword],
  );

  const handleRegister = async () => {
    const next: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) next.email = "email required";
    else if (!emailRegex.test(email)) next.email = "invalid email";

    if (!password) next.password = "password required";
    else if (password.length < 4)
      next.password = "Password must be at least 4 characters long.";

    if (!confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      next.confirmPassword = "Password does not match.";

    setErrors(next);

    if (Object.keys(next).length > 0) return;

    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (data.token) await AsyncStorage.setItem("token", data.token);
      if (data.user)
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("registered", "true");

      router.replace("/onboarding");
    } catch (error: any) {
      console.log("REGISTER ERROR:", error.response?.data);
      alert(error.response?.data?.message || "Register failed");
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
              <Text style={styles.title}>Create an account</Text>
              <Text style={styles.subtitle}>Start learning Mongolian</Text>
            </View>

            <View style={{ gap: theme.s(2) }}>
              <FormInput
                placeholder="email"
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
                placeholder="Name"
                value={name}
                onChangeText={setName}
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

              <FormInput
                placeholder="Repeat password"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errors.confirmPassword)
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                secureTextEntry={!showConfirm}
                rightIcon={showConfirm ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowConfirm((v) => !v)}
                error={errors.confirmPassword}
              />
            </View>

            <View style={{ gap: theme.s(2) }}>
              <GradientButton
                title="Sign up"
                onPress={handleRegister}
                disabled={!canSubmit}
              />

              <Text style={styles.terms}>
                By registering, you agree to our Terms of Service and Privacy
                Policy.
              </Text>
            </View>

            <Text style={styles.bottomText}>
              Or{" "}
              <Text
                onPress={() => router.replace("/auth/login")}
                style={styles.link}
              >
                Login
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
  terms: {
    color: "rgba(100,116,139,1)",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  bottomText: {
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: theme.s(1),
  },
  link: { color: "#60A5FA", fontWeight: "700" },
});
