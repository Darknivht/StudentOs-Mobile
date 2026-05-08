import { View, Text, ScrollView, Pressable } from "react-native";
import { BookOpen, Brain, Layers, FileText } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Card, CardContent } from "../../../components/ui/card";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

const studyTools = [
  {
    icon: BookOpen,
    label: "Smart Notes",
    desc: "AI-powered note-taking",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    href: "/study/notes",
  },
  {
    icon: Brain,
    label: "AI Tutor",
    desc: "Chat with your AI tutor",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    href: "/study/tutor",
  },
  {
    icon: Layers,
    label: "Flashcards",
    desc: "Spaced repetition review",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    href: "/study/flashcards",
  },
  {
    icon: FileText,
    label: "Quizzes",
    desc: "Test your knowledge",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    href: "/study/quizzes",
  },
];

export default function StudyScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-1">Study</Text>
        <Text className="text-muted-foreground mb-6">Your study tools</Text>

        <View className="gap-3">
          {studyTools.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href as any)}
            >
              <Card>
                <CardContent className="p-4 flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg ${item.iconBg} items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-foreground">{item.label}</Text>
                    <Text className="text-sm text-muted-foreground">{item.desc}</Text>
                  </View>
                </CardContent>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
