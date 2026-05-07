import { View, Text, ScrollView } from "react-native";
import { BookOpen, Brain, GraduationCap, Trophy } from "lucide-react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { ErrorFallback } from "../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-1">Good morning!</Text>
        <Text className="text-muted-foreground mb-6">Ready to study today?</Text>

        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1">
            <CardContent className="p-4 items-center">
              <Trophy className="w-8 h-8 text-warning mb-2" />
              <Text className="text-2xl font-bold text-foreground">0</Text>
              <Text className="text-xs text-muted-foreground">Day Streak</Text>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 items-center">
              <Brain className="w-8 h-8 text-primary mb-2" />
              <Text className="text-2xl font-bold text-foreground">0</Text>
              <Text className="text-xs text-muted-foreground">XP Today</Text>
            </CardContent>
          </Card>
        </View>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-base">Daily Progress</CardTitle>
              <Badge variant="secondary">0%</Badge>
            </View>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={0} className="h-2" />
          </CardContent>
        </Card>

        <Text className="text-lg font-semibold text-foreground mb-3">Quick Actions</Text>
        <View className="gap-3">
          <Card>
            <CardContent className="p-4 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">Smart Notes</Text>
                <Text className="text-sm text-muted-foreground">Create AI-powered notes</Text>
              </View>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-lg bg-secondary/10 items-center justify-center">
                <GraduationCap className="w-5 h-5 text-secondary" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">Exam Prep</Text>
                <Text className="text-sm text-muted-foreground">Practice CBT questions</Text>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
