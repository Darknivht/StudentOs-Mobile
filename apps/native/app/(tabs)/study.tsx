import { View, Text, ScrollView } from "react-native";
import { BookOpen, Brain, Layers, FileText } from "lucide-react-native";
import { Card, CardContent } from "../../components/ui/card";

export default function StudyScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-1">Study</Text>
        <Text className="text-muted-foreground mb-6">Your study tools</Text>

        <View className="gap-3">
          {[
            { icon: BookOpen, label: "Smart Notes", desc: "AI-powered note-taking", color: "primary" },
            { icon: Brain, label: "AI Tutor", desc: "Chat with your AI tutor", color: "secondary" },
            { icon: Layers, label: "Flashcards", desc: "Spaced repetition review", color: "accent" },
            { icon: FileText, label: "Quizzes", desc: "Test your knowledge", color: "success" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4 flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-lg bg-${item.color}/10 items-center justify-center`}>
                  <item.icon className={`w-5 h-5 text-${item.color}`} />
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
