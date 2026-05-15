import { View, Text, Pressable } from "react-native";
import { Flame, Trophy, Target, Sparkles } from "lucide-react-native";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
}

export function StreakCard({ currentStreak, longestStreak, totalXP }: StreakCardProps) {
  const isZeroStreak = currentStreak === 0;

  return (
    <View className="p-6 rounded-2xl bg-primary overflow-hidden relative">
      <View className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -top-16 right-[-16]" />
      <View className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 bottom-[-12] left-[-12]" />

      <View className="relative z-10">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <Flame className="w-8 h-8 text-primary-foreground" />
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
    </View>
  );
}