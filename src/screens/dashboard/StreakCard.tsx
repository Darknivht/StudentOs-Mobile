import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useStreak } from "../../hooks/useStreak";
import { colors, spacing, typography } from "../../lib/theme";

export function StreakCard() {
  const { data, isLoading } = useStreak();
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1.0, { duration: 600 }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(flameScale);
    };
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  if (data.currentStreak === 0) {
    return (
      <View style={styles.card}>
        <Animated.Text style={[styles.flameEmpty, flameStyle]}>
          🔥
        </Animated.Text>
        <Text style={styles.emptyTitle}>Start your streak today!</Text>
        <Text style={styles.emptySub}>Complete one activity to begin</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.flameContainer}>
          <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.value}>{data.currentStreak} days</Text>
        </View>
        <View style={styles.bestContainer}>
          <Text style={styles.bestLabel}>Best</Text>
          <Text style={styles.bestValue}>{data.longestStreak}d</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flameContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  flame: {
    fontSize: 24,
  },
  flameEmpty: {
    fontSize: 32,
    textAlign: "center",
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  value: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.foreground,
  },
  bestContainer: {
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bestLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
  bestValue: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.secondaryForeground,
  },
  emptyTitle: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  skeleton: {
    height: 48,
    width: "60%",
    backgroundColor: colors.muted,
    borderRadius: 8,
    opacity: 0.3,
  },
});
