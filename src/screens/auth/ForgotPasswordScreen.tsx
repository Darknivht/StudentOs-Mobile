import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, spacing, typography } from "../../lib/theme";
import { useAuth } from "../../hooks/useAuth";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPassword, isLoading } = useAuth();

  async function handleReset() {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setError("");
    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Check your email for a password reset link.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("SignIn")}
            >
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.link}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography["3xl"],
    fontWeight: "700",
    color: colors.foreground,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.base,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing["2xl"],
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    color: colors.foreground,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: typography.base,
    fontWeight: "600",
  },
  error: {
    color: colors.destructive,
    fontSize: typography.sm,
  },
  link: {
    color: colors.primary,
    fontSize: typography.sm,
    textAlign: "center",
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  successText: {
    color: colors.success,
    fontSize: typography.base,
    textAlign: "center",
  },
});
