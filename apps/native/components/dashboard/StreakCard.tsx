import { View, Text, Pressable } from "react-native";
import { Flame, Trophy, Target, Sparkles } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { useScalePress } from "../../hooks/useScalePress";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
}

export function StreakCard({ currentStreak, longestStreak, totalXP }: StreakCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = useScalePress(0.98);
  const isZeroStreak = currentStreak === 0;

  const flameScale = useSharedValue(1);

  useEffect(() => {
    if (isZeroStreak) return;
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, [isZeroStreak]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={animatedStyle}
        className="p-6 rounded-2xl bg-primary overflow-hidden relative"
      >
        <View className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -top-16 right-[-16]" />
        <View className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 bottom-[-12] left-[-12]" />

        <View className="relative z-10">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <Animated.View style={flameStyle}>
                <Flame className="w-8 h-8 text-primary-foreground" />
              </Animated.View>
              <View>
                <Text className="text-sm text-primary-foreground/80">Current Streak</Text>
                {isZeroStreak ? (
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xl font-bold text-primary-foreground">Start your streak!</Text>
                    <Sparkles className="w-4 h-4 text-primary-foreground/80" />
                  </View>
                ) : (
                  <Text className="text-3xl font-bold text-primary-foreground">
                    {currentStreak} days
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="flex-row gap-4 mt-4 pt-4 border-t border-white/20">
            <View className="flex-1 flex-row items-center gap-2">
              <Trophy className="w-5 h-5 text-primary-foreground/80" />
              <View>
                <Text className="text-xs text-primary-foreground/70">Best Streak</Text>
                <Text className="font-semibold text-primary-foreground">{longestStreak} days</Text>
              </View>
            </View>
            <View className="flex-1 flex-row items-center gap-2">
              <Target className="w-5 h-5 text-primary-foreground/80" />
              <View>
                <Text className="text-xs text-primary-foreground/70">Total XP</Text>
                <Text className="font-semibold text-primary-foreground">{totalXP.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
