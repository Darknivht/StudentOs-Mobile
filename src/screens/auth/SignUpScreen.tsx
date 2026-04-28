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

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { signUp, isLoading } = useAuth();

  async function handleSignUp() {
    if (!email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    try {
      await signUp(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>StudentOS</Text>
        <Text style={styles.subtitle}>Create your account</Text>

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
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={colors.mutedForeground}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    fontSize: typography["4xl"],
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
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
    color: colors.mutedForeground,
    fontSize: typography.sm,
    textAlign: "center",
  },
  linkBold: {
    color: colors.primary,
    fontWeight: "600",
  },
});
