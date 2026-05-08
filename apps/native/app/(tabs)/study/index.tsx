import { View, Text, ScrollView, Pressable } from "react-native";
import {
  BookOpen,
  Brain,
  Layers,
  FileText,
  Timer,
  FileCode,
  Lightbulb,
  Zap,
  PenLine,
  Swords,
  Network,
  Calculator,
  Bug,
  Languages,
  Video,
  Sigma,
  Microscope,
  ScanLine,
} from "lucide-react-native";
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
  {
    icon: Timer,
    label: "Pomodoro Timer",
    desc: "Focus sessions with breaks",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
    href: "/study/pomodoro",
  },
  {
    icon: FileCode,
    label: "Cheat Sheet",
    desc: "One-page study guides",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    href: "/study/cheat-sheet",
  },
  {
    icon: Lightbulb,
    label: "Mnemonic Generator",
    desc: "Funny rhymes & acronyms",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
    href: "/study/mnemonic",
  },
  {
    icon: Zap,
    label: "Cram Mode",
    desc: "Rapid-fire flashcard review",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    href: "/study/cram-mode",
  },
  {
    icon: PenLine,
    label: "Fill in the Blanks",
    desc: "AI removes key terms",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    href: "/study/fill-blanks",
  },
  {
    icon: Swords,
    label: "Debate Partner",
    desc: "AI argues the opposite",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    href: "/study/debate",
  },
  {
    icon: Network,
    label: "Mind Map",
    desc: "Interactive concept maps",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    href: "/study/concept-linking",
  },
];

const aiTools = [
  {
    icon: Calculator,
    label: "Math Solver",
    desc: "Photo → step-by-step solution",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    href: "/study/math-solver",
  },
  {
    icon: Bug,
    label: "Code Debugger",
    desc: "Paste code, AI explains fixes",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    href: "/study/code-debugger",
  },
  {
    icon: Languages,
    label: "Translator",
    desc: "Notes in any language",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-500",
    href: "/study/translator",
  },
  {
    icon: Video,
    label: "YouTube Summarizer",
    desc: "Paste transcript → key points",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
    href: "/study/youtube-summarizer",
  },
  {
    icon: Sigma,
    label: "OCR to LaTeX",
    desc: "Handwritten math → formulas",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    href: "/study/ocr-latex",
  },
  {
    icon: Microscope,
    label: "Diagram Interpreter",
    desc: "Explain biology/physics diagrams",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    href: "/study/diagram-interpreter",
  },
  {
    icon: BookOpen,
    label: "Book Scanner",
    desc: "Extract definitions from pages",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    href: "/study/book-scanner",
  },
];

export default function StudyScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-1">Study</Text>
        <Text className="text-muted-foreground mb-6">Your study tools</Text>

        <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
          Core Tools
        </Text>
        <View className="gap-3 mb-8">
          {studyTools.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href as any)}
            >
              <Card>
                <CardContent className="p-4 flex-row items-center gap-3">
                  <View
                    className={`w-10 h-10 rounded-lg ${item.iconBg} items-center justify-center`}
                  >
                    <item.icon size={20} className={item.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-foreground">
                      {item.label}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {item.desc}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
          AI Tools
        </Text>
        <View className="gap-3 mb-8">
          {aiTools.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href as any)}
            >
              <Card>
                <CardContent className="p-4 flex-row items-center gap-3">
                  <View
                    className={`w-10 h-10 rounded-lg ${item.iconBg} items-center justify-center`}
                  >
                    <item.icon size={20} className={item.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-foreground">
                      {item.label}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {item.desc}
                    </Text>
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
