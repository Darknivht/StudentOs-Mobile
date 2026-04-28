import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";

interface Props {
  onSignOut: () => void;
}

export function BlockedScreen({ onSignOut }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🚫</Text>
        <Text style={styles.title}>Account Blocked</Text>
        <Text style={styles.description}>
          Your account has been blocked. Please contact support if you believe
          this is an error.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
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
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.base,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.destructive,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: colors.destructiveForeground,
    fontSize: typography.base,
    fontWeight: "600",
  },
});
