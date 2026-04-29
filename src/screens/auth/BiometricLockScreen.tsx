import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors, spacing, typography } from "../../lib/theme";
import { useAuthContext } from "../../providers/AuthProvider";
import {
  isBiometricAvailable,
  isBiometricEnrolled,
  getBiometricType,
} from "../../services";

interface Props {
  onFallbackPin: () => void;
}

export function BiometricLockScreen({ onFallbackPin }: Props) {
  const { unlockWithBiometrics, pinSet } = useAuthContext();
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectBiometric() {
      const available = await isBiometricAvailable();
      const enrolled = await isBiometricEnrolled();
      if (available && enrolled) {
        const types = await getBiometricType();
        if (types.includes(2)) setBiometricLabel("Face ID");
        else if (types.includes(1)) setBiometricLabel("Fingerprint");
        else setBiometricLabel("Biometrics");
      }
      setLoading(false);
    }
    detectBiometric();
  }, []);

  async function handleUnlock() {
    await unlockWithBiometrics();
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>StudentOS</Text>
        <Text style={styles.title}>Unlock with {biometricLabel}</Text>
        <Text style={styles.description}>
          Use {biometricLabel.toLowerCase()} to access your account
        </Text>

        <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock}>
          <Text style={styles.unlockIcon}>
            {biometricLabel === "Face ID" ? "👤" : "🔐"}
          </Text>
          <Text style={styles.unlockText}>Unlock</Text>
        </TouchableOpacity>

        {pinSet && (
          <TouchableOpacity onPress={onFallbackPin}>
            <Text style={styles.fallbackLink}>Use PIN Instead</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  logo: {
    fontSize: typography["3xl"],
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.base,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing["2xl"],
  },
  unlockButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  unlockIcon: {
    fontSize: 28,
  },
  unlockText: {
    color: colors.primaryForeground,
    fontSize: typography.sm,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  fallbackLink: {
    color: colors.mutedForeground,
    fontSize: typography.sm,
    fontWeight: "600",
  },
});
