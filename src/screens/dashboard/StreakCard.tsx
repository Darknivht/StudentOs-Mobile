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
        <Text style={styles.emptyText}>Start your streak today! 🔥</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
        <View style={styles.info}>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.value}>{data.currentStreak} days</Text>
        </View>
        <Text style={styles.best}>Best: {data.longestStreak} days</Text>
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
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  flame: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  value: {
    fontSize: typography.xl,
    fontWeight: "700",
    color: colors.foreground,
  },
  best: {
    fontSize: typography.sm,
    color: colors.secondaryForeground,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.secondaryForeground,
    textAlign: "center",
  },
  skeleton: {
    height: 20,
    width: 120,
    backgroundColor: colors.muted,
    borderRadius: 4,
    opacity: 0.3,
  },
});
