import { api } from "@/lib/api";
import { setAuthSession } from "@/src/store/authStore";
import { BackButton } from "@/src/ui/BackButton";
import { FormInput } from "@/src/ui/FormInput";
import { GradientButton } from "@/src/ui/GradientButton";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const emailRegex = /\S+@\S+\.\S+/;

type Step = "form" | "otp";

type RegisterResponse = {
  token?: string;
  user?: unknown;
};

export default function RegisterScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    otp?: string;
  }>({});

  const canSubmitForm = useMemo(
    () =>
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0,
    [name, email, password, confirmPassword],
  );

  const validateRegisterForm = () => {
    const next: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
    } = {};

    if (!name.trim()) next.name = "Name required";

    if (!email.trim()) next.email = "Email required";
    else if (!emailRegex.test(email.trim())) next.email = "Invalid email";

    if (!password) next.password = "Password required";
    else if (password.length < 4) {
      next.password = "Password must be at least 4 characters long.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Password does not match.";
    }

    setErrors((prev) => ({ ...prev, ...next }));
    return next;
  };

  const handleRequestOtp = async () => {
    const next = validateRegisterForm();

    if (Object.keys(next).length > 0) return;

    try {
      setSendingOtp(true);

      await api.post("/auth/register/request-otp", {
        email: email.trim().toLowerCase(),
      });

      Alert.alert("Success", "OTP sent to your email");
      setStep("otp");
    } catch (error: any) {
      console.log("REGISTER REQUEST OTP ERROR:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpAndRegister = async () => {
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Enter 6-digit OTP" }));
      return;
    }

    try {
      setVerifyingOtp(true);

      const { data } = (await api.post("/auth/register/verify-otp", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        code: cleanOtp,
      })) as { data: RegisterResponse };

      await AsyncStorage.setItem("registered", "true");
      await setAuthSession({ token: data.token, user: data.user });

      Alert.alert("Success", "Account created successfully");
      router.replace("/onboarding");
    } catch (error: any) {
      console.log("REGISTER VERIFY ERROR:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Registration failed",
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setSendingOtp(true);

      await api.post("/auth/register/request-otp", {
        email: email.trim().toLowerCase(),
      });

      Alert.alert("Success", "OTP resent");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to resend OTP",
      );
    } finally {
      setSendingOtp(false);
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
            <BackButton
              onPress={() => {
                if (step === "otp") {
                  setStep("form");
                } else {
                  router.back();
                }
              }}
            />
          </View>

          <View style={styles.content}>
            {step === "form" ? (
              <>
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
                      if (errors.email) {
                        setErrors((p) => ({ ...p, email: undefined }));
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />

                  <FormInput
                    placeholder="Name"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (errors.name) {
                        setErrors((p) => ({ ...p, name: undefined }));
                      }
                    }}
                    error={errors.name}
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

                  <FormInput
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      if (errors.confirmPassword) {
                        setErrors((p) => ({
                          ...p,
                          confirmPassword: undefined,
                        }));
                      }
                    }}
                    secureTextEntry={!showConfirm}
                    rightIcon={showConfirm ? "eye-off-outline" : "eye-outline"}
                    onRightIconPress={() => setShowConfirm((v) => !v)}
                    error={errors.confirmPassword}
                  />
                </View>

                <View style={{ gap: theme.s(2) }}>
                  <GradientButton
                    title={sendingOtp ? "Sending OTP..." : "Send OTP"}
                    onPress={handleRequestOtp}
                    disabled={!canSubmitForm || sendingOtp}
                  />

                  <Text style={styles.terms}>
                    By registering, you agree to our Terms of Service and
                    Privacy Policy.
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
              </>
            ) : (
              <>
                <View style={{ gap: 6 }}>
                  <Text style={styles.title}>Verify OTP</Text>
                  <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to your email
                  </Text>
                </View>

                <View style={{ gap: theme.s(2) }}>
                  <FormInput
                    placeholder="123456"
                    value={otp}
                    onChangeText={(t) => {
                      const clean = t.replace(/\D/g, "").slice(0, 6);
                      setOtp(clean);
                      if (errors.otp) {
                        setErrors((p) => ({ ...p, otp: undefined }));
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    error={errors.otp}
                  />
                </View>

                <View style={{ gap: theme.s(2) }}>
                  <GradientButton
                    title={
                      verifyingOtp
                        ? "Creating account..."
                        : "Verify OTP & Sign up"
                    }
                    onPress={handleVerifyOtpAndRegister}
                    disabled={verifyingOtp}
                  />

                  <Pressable onPress={handleResendOtp} disabled={sendingOtp}>
                    <Text style={styles.link}>
                      {sendingOtp ? "Sending..." : "Resend OTP"}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.bottomText}>
                  Wrong email?{" "}
                  <Text onPress={() => setStep("form")} style={styles.link}>
                    Go back
                  </Text>
                </Text>
              </>
            )}
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
    link: { color: "#60A5FA", fontWeight: "700", textAlign: "center" },
  });
