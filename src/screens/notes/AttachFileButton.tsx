import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";

interface AttachFileButtonProps {
  onPress: () => void;
  isUploading: boolean;
}

export function AttachFileButton({
  onPress,
  isUploading,
}: AttachFileButtonProps) {
  return (
    <Pressable
      style={[styles.button, isUploading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isUploading}
      android_ripple={{ color: colors.muted }}
    >
      <Text style={styles.buttonIcon}>📎</Text>
      <Text style={styles.buttonLabel}>Attach File</Text>
      <Text style={styles.buttonHint}>PDF / DOCX</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: typography.base,
  },
  buttonLabel: {
    fontSize: typography.sm,
    color: colors.foreground,
    fontWeight: "500",
  },
  buttonHint: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
});
