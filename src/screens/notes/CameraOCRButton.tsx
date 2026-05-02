import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";

interface CameraOCRButtonProps {
  onCameraPress: () => void;
  onGalleryPress: () => void;
  isUploading: boolean;
}

export function CameraOCRButton({
  onCameraPress,
  onGalleryPress,
  isUploading,
}: CameraOCRButtonProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, isUploading && styles.buttonDisabled]}
        onPress={onCameraPress}
        disabled={isUploading}
        android_ripple={{ color: colors.muted }}
      >
        <Text style={styles.buttonIcon}>📷</Text>
        <Text style={styles.buttonLabel}>Camera</Text>
      </Pressable>
      <Pressable
        style={[styles.button, isUploading && styles.buttonDisabled]}
        onPress={onGalleryPress}
        disabled={isUploading}
        android_ripple={{ color: colors.muted }}
      >
        <Text style={styles.buttonIcon}>🖼️</Text>
        <Text style={styles.buttonLabel}>Gallery</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
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
  },
});
