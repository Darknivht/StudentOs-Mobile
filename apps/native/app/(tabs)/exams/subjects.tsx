import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Zap,
  Target,
  GraduationCap,
  BarChart3,
  AlertTriangle,
  Lock,
  Calendar,
  FileText,
  Layers,
  Bookmark,
  Lightbulb,
  BookOpen,
} from "lucide-react-native";
import { supabase } from "../../../services/supabase";
import { useSubscription } from "../../../hooks/useSubscription";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

interface ExamSubject {
  id: string;
  name: string;
  icon: string | null;
  topics_count: number;
}

type Mode =
  | "quick"
  | "topic"
  | "mock"
  | "performance"
  | "weakness"
  | "year"
  | "study-material"
  | "bookmarks"
  | "study-plan"
  | "guided-learning";

const modeConfig: {
  id: Mode;
  icon: any;
  label: string;
  desc: string;
  color: string;
  requiresPlus?: boolean;
}[] = [
  {
    id: "guided-learning",
    icon: BookOpen,
    label: "Guided Learning",
    desc: "AI teaches then tests you",
    color: "#059669",
  },
  {
    id: "quick",
    icon: Zap,
    label: "Quick Practice",
    desc: "10 questions, untimed",
    color: "#f59e0b",
  },
  {
    id: "topic",
    icon: Target,
    label: "Topic Practice",
    desc: "Pick a topic, 10-20 Qs",
    color: "#10b981",
  },
  {
    id: "year",
    icon: Calendar,
    label: "Past Questions by Year",
    desc: "Filter by exam year",
    color: "#6366f1",
  },
  {
    id: "study-material",
    icon: FileText,
    label: "Study Material Practice",
    desc: "From admin-uploaded PDFs",
    color: "#ec4899",
  },
  {
    id: "bookmarks",
    icon: Bookmark,
    label: "Bookmarked Questions",
    desc: "Review saved questions",
    color: "#0ea5e9",
  },
  {
    id: "mock",
    icon: GraduationCap,
    label: "Mock Exam",
    desc: "Full timed simulation",
    color: "#ef4444",
    requiresPlus: true,
  },
  {
    id: "performance",
    icon: BarChart3,
    label: "My Performance",
    desc: "Analytics & trend charts",
    color: "#3b82f6",
  },
  {
    id: "weakness",
    icon: AlertTriangle,
    label: "Weak Topics",
    desc: "AI-identified gaps",
    color: "#8b5cf6",
  },
  {
    id: "study-plan",
    icon: Lightbulb,
    label: "AI Study Plan",
    desc: "Personalized recommendations",
    color: "#14b8a6",
  },
];

export default function SubjectsScreen() {
  const {
    examTypeId,
    examName,
    examMode,
    subjectsRequired,
    timeLimitMinutes,
    questionsPerSubject,
  } = useLocalSearchParams<{
    examTypeId: string;
    examName: string;
    examMode: string;
    subjectsRequired: string;
    timeLimitMinutes: string;
    questionsPerSubject: string;
  }>();
  const router = useRouter();
  const { subscription, getRemainingUses } = useSubscription();
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ExamSubject | null>(null);

  const remaining = getRemainingUses("examQuestion");

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase
        .from("exam_subjects")
        .select("*")
        .eq("exam_type_id", examTypeId)
        .eq("is_active", true)
        .order("name");
      setSubjects(data || []);
      setLoading(false);
    };
    fetchSubjects();
  }, [examTypeId]);

  const navigateToMode = (mode: Mode) => {
    if (!selected) return;
    const baseParams = {
      examTypeId,
      examName,
      subjectId: selected.id,
      subjectName: selected.name,
    };

    switch (mode) {
      case "quick":
      case "topic":
      case "year":
      case "study-material":
        router.push({ pathname: "/exams/practice", params: { ...baseParams, mode } });
        break;
      case "mock":
        router.push({ pathname: "/exams/mock", params: baseParams });
        break;
      case "performance":
        router.push({ pathname: "/exams/performance", params: baseParams });
        break;
      case "weakness":
        router.push({ pathname: "/exams/weakness", params: baseParams });
        break;
      case "bookmarks":
        router.push({ pathname: "/exams/bookmarks", params: baseParams });
        break;
      case "study-plan":
        router.push({ pathname: "/exams/study-plan", params: baseParams });
        break;
      case "guided-learning":
        router.push({ pathname: "/exams/guided-learning", params: baseParams });
        break;
    }
  };

  const startCBT = () => {
    router.push({
      pathname: "/exams/multi-cbt",
      params: {
        examTypeId,
        examName,
        subjectsRequired,
        timeLimitMinutes,
        questionsPerSubject,
      },
    });
  };

  if (loading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  if (selected) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-4">
          <Pressable onPress={() => setSelected(null)}>
            <Text className="text-sm text-primary font-medium">
              ← Subjects / {selected.icon || "📘"} {selected.name}
            </Text>
          </Pressable>

          <Text className="text-lg font-bold text-foreground">
            Choose a Mode
          </Text>

          <View className="gap-3">
            {modeConfig.map((mode) => {
              const locked = mode.requiresPlus && !subscription.canUseMockExam;
              return (
                <Pressable
                  key={mode.id}
                  onPress={() => !locked && navigateToMode(mode.id)}
                  disabled={locked}
                  className={locked ? "opacity-60" : ""}
                >
                  <Card>
                    <CardContent className="p-4 flex-row items-center gap-4">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${mode.color}20` }}
                      >
                        {locked ? (
                          <Lock size={20} className="text-muted-foreground" />
                        ) : (
                          <mode.icon
                            size={20}
                            style={{ color: mode.color }}
                          />
                        )}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-semibold text-foreground text-sm">
                            {mode.label}
                          </Text>
                          {locked && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5"
                            >
                              Plus+
                            </Badge>
                          )}
                        </View>
                        <Text className="text-xs text-muted-foreground">
                          {locked
                            ? "Upgrade to Plus or Pro to unlock"
                            : mode.desc}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              );
            })}

            {examMode === "multi_subject" && (
              <Pressable
                onPress={() => subscription.canUseMockExam && startCBT()}
                className={
                  subscription.canUseMockExam ? "" : "opacity-60"
                }
              >
                <Card
                  className={
                    subscription.canUseMockExam
                      ? "bg-primary/5 border-primary/30"
                      : ""
                  }
                >
                  <CardContent className="p-4 flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/20">
                      {subscription.canUseMockExam ? (
                        <Layers size={20} className="text-primary" />
                      ) : (
                        <Lock size={20} className="text-muted-foreground" />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-semibold text-foreground text-sm">
                          Full CBT Simulation
                        </Text>
                        {!subscription.canUseMockExam && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5"
                          >
                            Plus+
                          </Badge>
                        )}
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        {subscription.canUseMockExam
                          ? "Multi-subject timed exam simulation"
                          : "Upgrade to Plus or Pro to unlock"}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-4">
        <Text className="text-lg font-bold text-foreground">
          Subjects — {examName}
        </Text>

        {subjects.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📘</Text>
            <Text className="font-semibold text-foreground">
              No subjects yet for {examName}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Subjects are being added by the admin.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {subjects.map((subj) => (
              <Pressable
                key={subj.id}
                onPress={() => setSelected(subj)}
                className="active:scale-[0.97]"
                style={{ width: "48%" }}
              >
                <Card>
                  <CardContent className="p-4">
                    <Text className="text-2xl">{subj.icon || "📘"}</Text>
                    <Text className="font-semibold text-foreground text-sm mt-2">
                      {subj.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {subj.topics_count} topics
                    </Text>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
