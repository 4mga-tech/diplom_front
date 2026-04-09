import { api } from "@/lib/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../ui/BackButton";
import { FormInput } from "../ui/FormInput";
import { GradientButton } from "../ui/GradientButton";
import { theme } from "../ui/theme";

type Step = "email" | "otp" | "reset";

const emailRegex = /\S+@\S+\.\S+/;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp] = useState("123456"); // mock
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ SEND OTP
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Email required");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email");
      return;
    }

    Alert.alert("OTP sent", "Use 123456 (demo)");
    setStep("otp");
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Enter 6-digit OTP");
      return;
    }

    if (otp.trim() === serverOtp) {
      setStep("reset");
    } else {
      Alert.alert("Error", "Wrong OTP");
    }
  };

  // ✅ RESET PASSWORD (backend)
  const handleResetPassword = async () => {
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
      await api.post("/auth/reset-password", {
        email,
        password: newPassword,
      });

      Alert.alert("Success", "Password updated");

      router.replace("/auth/login");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton
          onPress={() => {
            if (step === "otp") setStep("email");
            else if (step === "reset") setStep("otp");
            else router.back();
          }}
        />
      </View>

      <View style={styles.content}>
        {/* EMAIL */}
        {step === "email" && (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email</Text>

            <FormInput
              placeholder="e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <GradientButton title="Send OTP" onPress={handleSendOtp} />
          </>
        )}

        {/* OTP */}
        {step === "otp" && (
          <>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>Use 123456</Text>

            <FormInput
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <GradientButton title="Verify OTP" onPress={handleVerifyOtp} />
          </>
        )}

        {/* RESET */}
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
              title="Update Password"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 20 },
  header: { marginBottom: 20 },
  content: { gap: 16 },

  title: { fontSize: 26, fontWeight: "800", color: "white" },
  subtitle: { color: theme.colors.muted },

  backToLogin: {
    marginTop: 10,
    color: "#60A5FA",
    textAlign: "center",
    fontWeight: "600",
  },
});
