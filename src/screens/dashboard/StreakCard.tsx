import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const flameRotate = useSharedValue(0);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 700 }),
        withTiming(1.0, { duration: 700 }),
      ),
      -1,
      true,
    );

    flameRotate.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 900 }),
        withTiming(-8, { duration: 900 }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(flameScale);
      cancelAnimation(flameRotate);
    };
  }, []);

  const flameStyle = useAnimatedStyle(
    () =>
      ({
        transform: [
          { scale: flameScale.value as number },
          { rotate: `${flameRotate.value}deg` },
        ],
      }) as any,
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={["rgba(124, 58, 237, 0.15)", "rgba(124, 58, 237, 0.05)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.skeleton} />
      </LinearGradient>
    );
  }

  if (data.currentStreak === 0) {
    return (
      <LinearGradient
        colors={["rgba(124, 58, 237, 0.15)", "rgba(124, 58, 237, 0.05)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.emptyRow}>
          <Animated.Text style={[styles.flameEmpty, flameStyle]}>
            🔥
          </Animated.Text>
          <View style={styles.emptyTextGroup}>
            <Text style={styles.emptyTitle}>Start your streak!</Text>
            <Text style={styles.emptySub}>Complete one activity today</Text>
          </View>
        </View>
        {/* Decorative circles */}
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["rgba(245, 158, 11, 0.18)", "rgba(124, 58, 237, 0.08)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.row}>
        {/* Flame */}
        <View style={styles.flameContainer}>
          <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
        </View>

        {/* Streak info */}
        <View style={styles.info}>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.value}>
            {data.currentStreak}{" "}
            <Text style={styles.valueUnit}>
              day{data.currentStreak !== 1 ? "s" : ""}
            </Text>
          </Text>
          {data.longestStreak > 0 && (
            <Text style={styles.xpText}>Best: {data.longestStreak} days</Text>
          )}
        </View>

        {/* Best streak */}
        <View style={styles.bestContainer}>
          <Text style={styles.bestLabel}>Best</Text>
          <Text style={styles.bestValue}>{data.longestStreak}d</Text>
          {data.currentStreak >= data.longestStreak && (
            <Text style={styles.bestBadge}>🏆</Text>
          )}
        </View>
      </View>
      {/* Decorative circles */}
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    zIndex: 1,
  },
  flameContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  flame: {
    fontSize: 28,
  },
  flameEmpty: {
    fontSize: 36,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: typography["2xl"] + 2,
    fontWeight: "800",
    color: colors.foreground,
    lineHeight: 32,
  },
  valueUnit: {
    fontSize: typography.base,
    fontWeight: "400",
    color: colors.mutedForeground,
  },
  xpText: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  bestContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 60,
  },
  bestLabel: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  bestValue: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.foreground,
  },
  bestBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    zIndex: 1,
  },
  emptyTextGroup: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
  },
  emptySub: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  skeleton: {
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decoCircle1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(124, 58, 237, 0.08)",
  },
  decoCircle2: {
    position: "absolute",
    bottom: -10,
    right: 60,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(245, 158, 11, 0.06)",
  },
});
