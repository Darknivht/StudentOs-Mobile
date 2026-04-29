import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";
import { useAuthContext } from "../../providers/AuthProvider";
import { getPinLockoutRemaining, getFailedPinAttempts } from "../../services";

interface Props {
  onFallbackBiometric: () => void;
  biometricEnabled: boolean;
}

export function PINLockScreen({
  onFallbackBiometric,
  biometricEnabled,
}: Props) {
  const { unlockWithPin } = useAuthContext();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [lockoutMs, setLockoutMs] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    async function checkLockout() {
      const remaining = await getPinLockoutRemaining();
      const failed = await getFailedPinAttempts();
      setLockoutMs(remaining);
      setFailedAttempts(failed);
    }
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(async () => {
          const valid = await unlockWithPin(newPin);
          if (!valid) {
            setPin("");
            setError(
              lockoutMs > 0
                ? "Too many attempts. Please wait."
                : "Incorrect PIN",
            );
            const remaining = await getPinLockoutRemaining();
            const failed = await getFailedPinAttempts();
            setLockoutMs(remaining);
            setFailedAttempts(failed);
          }
        }, 200);
      }
    },
    [pin, lockoutMs, unlockWithPin],
  );

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError("");
  }, []);

  const formatLockout = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const isLocked = lockoutMs > 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>StudentOS</Text>
        <Text style={styles.title}>Enter PIN</Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.dot, i < pin.length && styles.dotFilled]}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {isLocked ? (
          <Text style={styles.lockoutText}>
            Try again in {formatLockout(lockoutMs)}
          </Text>
        ) : null}

        <View style={styles.keypad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
            (key) => (
              <TouchableOpacity
                key={key}
                style={[styles.key, key === "" && styles.keyEmpty]}
                onPress={() => {
                  if (key === "⌫") handleDelete();
                  else if (key !== "") handleDigit(key);
                }}
                disabled={key === "" || isLocked}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {biometricEnabled && (
          <TouchableOpacity
            onPress={onFallbackBiometric}
            style={styles.fallbackButton}
          >
            <Text style={styles.fallbackLink}>Use Biometrics</Text>
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
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  logo: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.xl,
  },
  dots: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  error: {
    color: colors.destructive,
    fontSize: typography.sm,
    marginBottom: spacing.sm,
  },
  lockoutText: {
    color: colors.warning,
    fontSize: typography.sm,
    marginBottom: spacing.sm,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    maxWidth: 280,
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  keyEmpty: {
    backgroundColor: "transparent",
  },
  keyText: {
    color: colors.foreground,
    fontSize: typography["2xl"],
    fontWeight: "500",
  },
  fallbackButton: {
    marginTop: spacing.xl,
  },
  fallbackLink: {
    color: colors.mutedForeground,
    fontSize: typography.sm,
    fontWeight: "600",
  },
});
