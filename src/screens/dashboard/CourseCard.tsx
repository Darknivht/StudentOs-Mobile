import { View, Text, Pressable, StyleSheet } from "react-native";
import type { CourseWithProgress } from "../../hooks/useCourses";
import { colors, spacing, typography } from "../../lib/theme";

interface CourseCardProps {
  course: CourseWithProgress;
  onPress: (courseId: string) => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const accentColor = course.color || colors.primary;

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(course.id)}
      android_ripple={{ color: colors.muted }}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          {course.emoji ? (
            <Text style={styles.emoji}>{course.emoji}</Text>
          ) : null}
          <Text style={styles.title} numberOfLines={1}>
            {course.title}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${course.overallProgress}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {course.overallProgress}% complete
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    flex: 1,
    flexDirection: "row",
  },
  accentBar: {
    width: 4,
    minHeight: 80,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    flex: 1,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
    marginBottom: spacing.xs,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
});
