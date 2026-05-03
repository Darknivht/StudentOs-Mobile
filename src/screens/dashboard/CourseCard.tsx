import { View, Text, Pressable, StyleSheet } from "react-native";
import type { CourseWithProgress } from "../../hooks/useCourses";
import { colors, spacing, typography } from "../../lib/theme";

interface CourseCardProps {
  course: CourseWithProgress;
  onPress: (courseId: string) => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const accentColor = course.color || colors.primary;
  const progressPct = Math.round(course.overallProgress);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        { borderColor: `${accentColor}25` },
      ]}
      onPress={() => onPress(course.id)}
      android_ripple={{ color: `${accentColor}15` }}
    >
      {/* Emoji / Icon */}
      <View style={styles.topRow}>
        {course.emoji ? (
          <Text style={styles.emoji}>{course.emoji}</Text>
        ) : (
          <View
            style={[
              styles.iconFallback,
              { backgroundColor: `${accentColor}18` },
            ]}
          >
            <Text style={[styles.iconFallbackText, { color: accentColor }]}>
              {course.title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View
          style={[styles.progressPill, { backgroundColor: `${accentColor}18` }]}
        >
          <Text style={[styles.progressPctText, { color: accentColor }]}>
            {progressPct}%
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {course.title}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPct}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>{progressPct}% complete</Text>
      </View>

      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.md,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    position: "relative",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  iconFallback: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconFallbackText: {
    fontSize: typography.lg,
    fontWeight: "800",
  },
  progressPill: {
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  progressPctText: {
    fontSize: typography.xs - 1,
    fontWeight: "700",
  },
  title: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  progressSection: {
    gap: 4,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 5,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
  },
  accentBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
