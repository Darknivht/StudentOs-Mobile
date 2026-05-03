import { View, Text, StyleSheet } from "react-native";
import { useStudyProgress } from "../../hooks/useStudyProgress";
import { formatTime } from "../../lib/utils";
import { colors, spacing, typography } from "../../lib/theme";

export function StudyProgressWidget() {
  const { data, isLoading } = useStudyProgress();

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Today</Text>
        <View style={styles.skeleton} />
      </View>
    );
  }

  const items = [
    { emoji: "📝", label: "Notes", value: data.notesCreated.toString() },
    { emoji: "✅", label: "Quizzes", value: data.quizzesCompleted.toString() },
    { emoji: "🃏", label: "Cards", value: data.flashcardsReviewed.toString() },
    { emoji: "⏱️", label: "Focus", value: formatTime(data.focusMinutes) },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.gridItem}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemValue}>{item.value}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.sm,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  gridItem: {
    width: "47%",
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: spacing.sm,
  },
  itemEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  itemLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
  skeleton: {
    height: 20,
    width: "80%",
    backgroundColor: colors.muted,
    borderRadius: 4,
    opacity: 0.3,
  },
});
