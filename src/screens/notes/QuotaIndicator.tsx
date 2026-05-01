import { View, Text, StyleSheet } from "react-native";
import { useNoteQuota } from "../../hooks/useNoteQuota";
import { colors, spacing, typography } from "../../lib/theme";

export function QuotaIndicator() {
  const { notesCreatedToday, quotaLimit, isQuotaExceeded, isLoading } =
    useNoteQuota();

  if (isLoading) return null;

  if (quotaLimit === Infinity) {
    return (
      <View style={styles.container}>
        <Text style={styles.unlimited}>Unlimited notes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.text, isQuotaExceeded && styles.exceeded]}>
        {isQuotaExceeded
          ? "Daily limit reached — upgrade for more"
          : `${notesCreatedToday}/${quotaLimit} notes today`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
  unlimited: {
    fontSize: typography.xs,
    color: colors.success,
  },
  exceeded: {
    color: colors.destructive,
  },
});
