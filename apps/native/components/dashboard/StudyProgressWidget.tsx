import { View, Text, Pressable } from "react-native";
import { Layers, Clock, BookOpen, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { StudyStats } from "../../hooks/useStudyStats";

interface StudyProgressWidgetProps {
  stats: StudyStats;
}

export function StudyProgressWidget({ stats }: StudyProgressWidgetProps) {
  const router = useRouter();

  return (
    <View className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border border-border">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-semibold text-foreground">Today's Study</Text>
        <Pressable onPress={() => router.push("/(tabs)/study")}>
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-primary">View All</Text>
            <ArrowRight className="w-3 h-3 text-primary" />
          </View>
        </Pressable>
      </View>

      <View className="gap-3">
        <Pressable onPress={() => router.push("/(tabs)/study")}>
          <View className="p-3 rounded-xl bg-card border border-border">
            <View className="flex-row items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-emerald-500" />
              <Text className="text-xs text-muted-foreground">Due Cards</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">{stats.dueFlashcards}</Text>
            {stats.dueFlashcards > 0 && (
              <Text className="text-[10px] text-emerald-500 font-medium">Ready to review!</Text>
            )}
          </View>
        </Pressable>

        <Pressable onPress={() => router.push("/(tabs)/study")}>
          <View className="p-3 rounded-xl bg-card border border-border">
            <View className="flex-row items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <Text className="text-xs text-muted-foreground">Focus Time</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">{stats.focusMinutesToday}m</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => router.push("/(tabs)/study")}>
          <View className="p-3 rounded-xl bg-card border border-border flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-lg bg-amber-500/10 items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-500" />
              </View>
              <View>
                <Text className="font-medium text-foreground">Quizzes Completed</Text>
                <Text className="text-xs text-muted-foreground">{stats.quizzesCompletedToday} today</Text>
              </View>
            </View>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
