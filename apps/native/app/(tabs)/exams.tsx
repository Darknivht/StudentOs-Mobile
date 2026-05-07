import { View, Text, ScrollView } from "react-native";
import { GraduationCap, BookOpen, Clock, BarChart3 } from "lucide-react-native";
import { Card, CardContent } from "../../components/ui/card";

export default function ExamsScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-1">Exams</Text>
        <Text className="text-muted-foreground mb-6">Prepare for your exams</Text>

        <View className="gap-3">
          {[
            { icon: GraduationCap, label: "CBT Practice", desc: "Computer-based test simulation" },
            { icon: BookOpen, label: "Subject Review", desc: "Review by subject and topic" },
            { icon: Clock, label: "Mock Exam", desc: "Timed full exam simulation" },
            { icon: BarChart3, label: "Performance", desc: "Track your progress" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">{item.label}</Text>
                  <Text className="text-sm text-muted-foreground">{item.desc}</Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
