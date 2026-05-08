import { View, Text, Pressable } from "react-native";
import { Clock, Target, CheckCircle, Lock, Unlock } from "lucide-react-native";
import { Progress } from "../ui/progress";
import type { StudyStats } from "../../hooks/useStudyStats";

interface StudyTimeWidgetProps {
  focusMinutesToday: number;
  dailyGoalMinutes: number;
}

export function StudyTimeWidget({ focusMinutesToday, dailyGoalMinutes }: StudyTimeWidgetProps) {
  const isGoalMet = focusMinutesToday >= dailyGoalMinutes;
  const progressPercent = Math.min((focusMinutesToday / dailyGoalMinutes) * 100, 100);
  const remainingMinutes = Math.max(dailyGoalMinutes - focusMinutesToday, 0);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <View
      className={`p-4 rounded-2xl border ${
        isGoalMet
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-card border-border"
      }`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View
            className={`w-8 h-8 rounded-lg items-center justify-center ${
              isGoalMet ? "bg-emerald-500/20" : "bg-primary/10"
            }`}
          >
            {isGoalMet ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-primary" />
            )}
          </View>
          <View>
            <Text className="font-semibold text-sm text-foreground">Daily Study Time</Text>
            <Text className="text-xs text-muted-foreground">
              {isGoalMet ? "Goal achieved! 🎉" : `${formatTime(remainingMinutes)} to go`}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-foreground">{formatTime(focusMinutesToday)}</Text>
          <Text className="text-xs text-muted-foreground">/ {formatTime(dailyGoalMinutes)}</Text>
        </View>
      </View>

      <Progress value={progressPercent} className="h-2" />

      <View className="mt-3 flex-row items-center gap-2">
        {isGoalMet ? (
          <>
            <Unlock className="w-3 h-3 text-emerald-500" />
            <Text className="text-xs text-emerald-600">Apps unlocked for today</Text>
          </>
        ) : (
          <>
            <Lock className="w-3 h-3 text-amber-500" />
            <Text className="text-xs text-amber-600">Complete goal to unlock apps</Text>
          </>
        )}
      </View>
    </View>
  );
}
