import { View, Text, StyleSheet } from "react-native";
import { useStudyTime } from "../../hooks/useStudyTime";
import { formatTime } from "../../lib/utils";
import { colors, spacing, typography } from "../../lib/theme";

export function StudyTimeWidget() {
  const { data, isLoading } = useStudyTime();
  const { todayMinutes, dailyTarget, weeklyData } = data;
  const progressPercent = Math.min(
    dailyTarget > 0 ? (todayMinutes / dailyTarget) * 100 : 0,
    100,
  );
  const maxWeeklyMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);
  const todayStr = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Study Time</Text>
        <View style={styles.skeleton} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Study Time</Text>
      <Text style={styles.timeValue}>{formatTime(todayMinutes)}</Text>

      <View style={styles.progressBarBg}>
        <View
          style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
        />
      </View>

      <Text style={styles.progressLabel}>
        {todayMinutes} / {dailyTarget} min
      </Text>

      {weeklyData.length > 0 && (
        <View style={styles.weeklyContainer}>
          {weeklyData.map((day) => {
            const barHeight = Math.max(
              (day.minutes / maxWeeklyMinutes) * 48,
              4,
            );
            const isToday = day.date === todayStr;
            return (
              <View key={day.date} style={styles.weeklyBarContainer}>
                <View
                  style={[
                    styles.weeklyBar,
                    {
                      height: barHeight,
                      backgroundColor: isToday
                        ? colors.primary
                        : `${colors.primary}33`,
                    },
                  ]}
                />
                <Text style={styles.weeklyLabel}>{day.date.slice(8, 10)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {todayMinutes === 0 && weeklyData.length === 0 && (
        <Text style={styles.emptyText}>
          No study time yet — start a session!
        </Text>
      )}
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
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
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
    backgroundColor: colors.primary,
  },
  progressLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  weeklyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 56,
    paddingTop: spacing.xs,
  },
  weeklyBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  weeklyBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  weeklyLabel: {
    fontSize: 9,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  emptyText: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
  },
  skeleton: {
    height: 28,
    width: "60%",
    backgroundColor: colors.muted,
    borderRadius: 6,
    opacity: 0.3,
  },
});
