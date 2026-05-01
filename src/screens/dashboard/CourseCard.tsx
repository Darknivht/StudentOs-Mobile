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
      <View style={styles.topRow}>
        {course.emoji ? (
          <Text style={styles.emoji}>{course.emoji}</Text>
        ) : (
          <View
            style={[
              styles.emojiFallback,
              { backgroundColor: `${accentColor}33` },
            ]}
          >
            <Text style={[styles.emojiFallbackText, { color: accentColor }]}>
              {course.title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 22,
  },
  emojiFallback: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiFallbackText: {
    fontSize: typography.sm,
    fontWeight: "700",
  },
  title: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    flex: 1,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.muted,
    marginBottom: spacing.xs,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 5,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
});
