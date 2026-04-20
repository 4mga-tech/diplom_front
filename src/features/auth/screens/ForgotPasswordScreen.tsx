import { api } from "@/lib/api";
import { BackButton } from "@/src/ui/BackButton";
import { FormInput } from "@/src/ui/FormInput";
import { GradientButton } from "@/src/ui/GradientButton";
import { AppTheme, useThemedStyles } from "@/src/ui/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type Step = "email" | "reset";
const emailRegex = /\S+@\S+\.\S+/;

export default function ForgotPasswordScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Email required");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email");
      return;
    }

    try {
      setLoadingSendOtp(true);

      await api.post("/auth/reset/request-otp", {
        email: email.trim().toLowerCase(),
      });

      Alert.alert("Success", "OTP sent to your email");
      setStep("reset");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert("Error", "Enter 6-digit OTP");
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields required");
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoadingReset(true);

      await api.post("/auth/reset/verify-otp", {
        email: email.trim().toLowerCase(),
        code: otp.trim(),
        newPassword,
      });

      Alert.alert("Success", "Password updated");
      router.replace("/auth/login");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Reset failed");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton
          onPress={() => {
            if (step === "reset") setStep("email");
            else router.back();
          }}
        />
      </View>

      <View style={styles.content}>
        {step === "email" && (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email</Text>

            <FormInput
              placeholder="e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <GradientButton
              title={loadingSendOtp ? "Sending..." : "Send OTP"}
              onPress={handleSendOtp}
            />
          </>
        )}

        {step === "reset" && (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter OTP and new password</Text>

            <FormInput
              placeholder="OTP (123456)"
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />

            <FormInput
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <FormInput
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <GradientButton
              title={loadingReset ? "Updating..." : "Update Password"}
              onPress={handleResetPassword}
            />

            <Pressable onPress={handleSendOtp}>
              <Text style={styles.backToLogin}>Resend OTP</Text>
            </Pressable>
          </>
        )}

        {step === "reset" && (
          <>
            <Text style={styles.title}>New Password</Text>

            <FormInput
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <FormInput
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <GradientButton
              title={loadingReset ? "Updating..." : "Update Password"}
              onPress={handleResetPassword}
            />
          </>
        )}

        <Pressable onPress={() => router.replace("/auth/login")}>
          <Text style={styles.backToLogin}>Back to Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg, padding: 20 },
    header: { marginBottom: 20 },
    content: { gap: 16 },

    title: { fontSize: 26, fontWeight: "800", color: theme.colors.text },
    subtitle: { color: theme.colors.muted },

    backToLogin: {
      marginTop: 10,
      color: "#60A5FA",
      textAlign: "center",
      fontWeight: "600",
    },
  });
