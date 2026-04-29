import { View, Text, StyleSheet } from "react-native";
import { useStudyProgress } from "../../hooks/useStudyProgress";
import { formatTime } from "../../lib/utils";
import { colors, spacing, typography } from "../../lib/theme";

export function StudyProgressWidget() {
  const { data, isLoading } = useStudyProgress();

  if (isLoading) {
    return (
      <View style={styles.card}>
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
            <Text style={styles.itemLabel}>
              {item.emoji} {item.label}
            </Text>
            <Text style={styles.itemValue}>{item.value}</Text>
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
    padding: spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    marginBottom: spacing.sm,
  },
  itemLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.foreground,
  },
  skeleton: {
    height: 20,
    width: "80%",
    backgroundColor: colors.muted,
    borderRadius: 4,
    opacity: 0.3,
  },
});
