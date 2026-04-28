import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";
import { setPin } from "../../services";
import { useAuthStore } from "../../stores/authStore";

interface Props {
  onComplete: () => void;
}

export function PINSetupScreen({ onComplete }: Props) {
  const [pin, setPinState] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [error, setError] = useState("");

  const setPinSet = useAuthStore((s) => s.setPinSet);
  const setLocked = useAuthStore((s) => s.setLocked);

  const handleDigit = useCallback(
    (digit: string) => {
      if (step === "create") {
        if (pin.length >= 4) return;
        const newPin = pin + digit;
        setPinState(newPin);
        if (newPin.length === 4) {
          setStep("confirm");
        }
      } else {
        if (confirmPin.length >= 4) return;
        const newConfirm = confirmPin + digit;
        setConfirmPin(newConfirm);
        if (newConfirm.length === 4) {
          if (newConfirm === pin) {
            handlePinSet(newConfirm);
          } else {
            setConfirmPin("");
            setError("PINs do not match. Try again.");
            setStep("create");
            setPinState("");
          }
        }
      }
    },
    [step, pin, confirmPin],
  );

  async function handlePinSet(finalPin: string) {
    try {
      await setPin(finalPin);
      setPinSet(true);
      setLocked(false);
      onComplete();
    } catch (err: any) {
      Alert.alert("Error", "Failed to set PIN. Please try again.");
      setStep("create");
      setPinState("");
      setConfirmPin("");
    }
  }

  const handleDelete = useCallback(() => {
    setError("");
    if (step === "confirm") {
      if (confirmPin.length > 0) {
        setConfirmPin((p) => p.slice(0, -1));
      } else {
        setStep("create");
      }
    } else {
      setPinState((p) => p.slice(0, -1));
    }
  }, [step, confirmPin]);

  const currentPin = step === "create" ? pin : confirmPin;
  const title = step === "create" ? "Create a 4-digit PIN" : "Confirm your PIN";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.dot, i < currentPin.length && styles.dotFilled]}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
                disabled={key === ""}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>
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
});
