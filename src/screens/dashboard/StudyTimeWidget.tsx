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
              (day.minutes / maxWeeklyMinutes) * 44,
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
                        : `${colors.primary}4D`,
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
  },
  timeValue: {
    fontSize: typography.xl,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
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
    height: 52,
    paddingTop: spacing.xs,
  },
  weeklyBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  weeklyBar: {
    width: 10,
    borderRadius: 3,
    minHeight: 4,
  },
  weeklyLabel: {
    fontSize: 9,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  emptyText: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
  },
  skeleton: {
    height: 20,
    width: "80%",
    backgroundColor: colors.muted,
    borderRadius: 4,
    opacity: 0.3,
  },
});
