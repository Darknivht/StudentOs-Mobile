import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";
import type { FileUploadState } from "../../hooks/useFileUpload";

interface FileUploadProgressProps {
  state: FileUploadState;
}

export function FileUploadProgress({ state }: FileUploadProgressProps) {
  if (!state.isUploading && !state.error && state.progress < 100) return null;

  if (state.error) {
    return (
      <View style={styles.container}>
        <View style={[styles.inner, styles.errorInner]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText} numberOfLines={2}>
            {state.error}
          </Text>
        </View>
      </View>
    );
  }

  if (state.progress >= 100 && state.extractedText !== null) {
    return (
      <View style={styles.container}>
        <View style={[styles.inner, styles.successInner]}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>
            {state.sourceType === "image" ? "OCR" : "Text"} extraction complete
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <ActivityIndicator size="small" color={colors.primary} />
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>
            {state.sourceType === "image"
              ? "Processing image..."
              : `Extracting ${state.sourceType?.toUpperCase()}...`}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${state.progress}%` }]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorInner: {
    backgroundColor: `${colors.destructive}22`,
    borderWidth: 1,
    borderColor: `${colors.destructive}44`,
  },
  successInner: {
    backgroundColor: `${colors.success}22`,
    borderWidth: 1,
    borderColor: `${colors.success}44`,
  },
  errorIcon: {
    fontSize: typography.lg,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.destructive,
  },
  successIcon: {
    fontSize: typography.lg,
  },
  successText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.success,
  },
  progressInfo: {
    flex: 1,
    gap: 4,
  },
  progressLabel: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
