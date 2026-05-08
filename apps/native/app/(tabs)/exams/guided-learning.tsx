import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  BookOpen,
} from "lucide-react-native";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { supabase } from "../../../services/supabase";
import { env } from "../../../lib/env";
import Toast from "react-native-toast-message";
import { ErrorFallback } from "../../../components/ErrorFallback";
import Markdown from "react-native-markdown-display";

export { ErrorFallback as ErrorBoundary };

interface LessonQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface LessonData {
  topic: string;
  lesson: string;
  questions: LessonQuestion[];
}

export default function GuidedLearningScreen() {
  const { examTypeId, subjectId, subjectName, topicId } =
    useLocalSearchParams<{
      examTypeId: string;
      subjectId: string;
      subjectName: string;
      topicId?: string;
    }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [phase, setPhase] = useState<"idle" | "learning" | "practice" | "done">(
    "idle"
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const generateLesson = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const resp = await fetch(
        `${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/exam-practice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: "guided-learning",
            exam_type_id: examTypeId,
            subject_id: subjectId,
            topic_id: topicId || undefined,
          }),
        }
      );

      const result = await resp.json();
      if (result.error) throw new Error(result.error);

      setLesson(result as LessonData);
      setPhase("learning");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to generate lesson",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult || !lesson) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === lesson.questions[currentQ].correct_index) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (!lesson) return;
    if (currentQ + 1 >= lesson.questions.length) {
      setPhase("done");
    } else {
      setCurrentQ((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (phase === "idle") {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-6">
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.back()}>
              <Text className="text-sm text-primary font-medium">← Back</Text>
            </Pressable>
          </View>

          <View className="items-center py-12 gap-4">
            <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center">
              <BookOpen size={32} className="text-primary" />
            </View>
            <Text className="text-xl font-bold text-foreground">
              Guided Learning
            </Text>
            <Text className="text-sm text-muted-foreground text-center max-w-md">
              Your AI teacher will explain a topic in {subjectName}, then test
              your understanding with practice questions.
            </Text>
            <Button
              onPress={generateLesson}
              disabled={loading}
              className="flex-row items-center gap-2"
            >
              {loading && (
                <ActivityIndicator size="small" className="text-primary-foreground" />
              )}
              <Text className="text-primary-foreground">
                Start Learning Session
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-3">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-sm text-muted-foreground">
          Your teacher is preparing the lesson...
        </Text>
      </View>
    );
  }

  if (!lesson) return null;

  if (phase === "learning") {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-5">
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.back()}>
              <Text className="text-sm text-primary font-medium">← Back</Text>
            </Pressable>
            <Text className="text-muted-foreground text-sm">/</Text>
            <Text className="text-sm font-semibold text-foreground">
              📖 {lesson.topic}
            </Text>
          </View>

          <View className="gap-4">
            <View className="p-5 rounded-2xl bg-card border border-border">
              <Text className="text-lg font-bold text-foreground mb-3">
                📖 Lesson: {lesson.topic}
              </Text>
              <Markdown
                style={{ body: { fontSize: 14, lineHeight: 22, color: "#000" } }}
              >
                {lesson.lesson}
              </Markdown>
            </View>

            <Button
              onPress={() => setPhase("practice")}
              className="flex-row items-center justify-center gap-2"
            >
              <Text className="text-primary-foreground font-semibold">
                I'm Ready — Start Practice Questions
              </Text>
              <ChevronRight size={16} className="text-primary-foreground" />
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (phase === "done") {
    const pct =
      lesson.questions.length > 0
        ? Math.round((score / lesson.questions.length) * 100)
        : 0;
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <View className="items-center gap-4">
          <Text className="text-5xl">
            {pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "💪"}
          </Text>
          <Text className="text-2xl font-bold text-foreground">
            {pct}% Score
          </Text>
          <Text className="text-muted-foreground">
            {score} / {lesson.questions.length} correct — {lesson.topic}
          </Text>
          <View className="w-48">
            <Progress value={pct} />
          </View>
          <Text className="text-sm text-muted-foreground text-center">
            {pct >= 80
              ? "Excellent! You understood the lesson well."
              : pct >= 60
              ? "Good effort! Review the lesson to strengthen weak areas."
              : "Consider re-reading the lesson and trying again."}
          </Text>
          <View className="flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onPress={() => {
                setPhase("learning");
                setCurrentQ(0);
                setScore(0);
                setSelectedAnswer(null);
                setShowResult(false);
              }}
            >
              <Text className="text-foreground">Review Lesson</Text>
            </Button>
            <Button onPress={generateLesson}>
              <Text className="text-primary-foreground">New Topic</Text>
            </Button>
            <Button variant="outline" onPress={() => router.back()}>
              <Text className="text-foreground">Back</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }

  const q = lesson.questions[currentQ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => setPhase("learning")} className="flex-row items-center gap-1">
            <Text className="text-sm text-primary font-medium">← Lesson</Text>
          </Pressable>
          <Text className="text-xs text-muted-foreground font-medium">
            Q{currentQ + 1} / {lesson.questions.length}
          </Text>
        </View>

        <Progress
          value={((currentQ + 1) / lesson.questions.length) * 100}
        />

        <View className="gap-4">
          <View className="p-4 rounded-2xl bg-card border border-border">
            <Text className="text-foreground font-medium leading-relaxed">
              {q.question}
            </Text>
          </View>

          <View className="gap-2">
            {q.options.map((opt, i) => {
              let borderColor = "border-border";
              let bgColor = "";
              if (showResult) {
                if (i === q.correct_index) {
                  borderColor = "border-green-500";
                  bgColor = "bg-green-500/10";
                } else if (i === selectedAnswer) {
                  borderColor = "border-destructive";
                  bgColor = "bg-destructive/10";
                } else {
                  bgColor = "opacity-50";
                }
              } else if (selectedAnswer === i) {
                borderColor = "border-primary";
                bgColor = "bg-primary/10";
              }

              return (
                <Pressable
                  key={i}
                  onPress={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`flex-row items-center gap-3 p-3.5 rounded-xl border ${borderColor} ${bgColor}`}
                >
                  <View className="w-7 h-7 rounded-full border border-border items-center justify-center">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground flex-1">
                    {opt}
                  </Text>
                  {showResult && i === q.correct_index && (
                    <CheckCircle2 size={18} className="text-green-500" />
                  )}
                  {showResult &&
                    i === selectedAnswer &&
                    i !== q.correct_index && (
                      <XCircle size={18} className="text-destructive" />
                    )}
                </Pressable>
              );
            })}
          </View>

          {showResult && q.explanation && (
            <View className="p-3 rounded-xl bg-muted/50 border border-border">
              <Text className="text-xs font-semibold text-muted-foreground mb-1">
                Explanation
              </Text>
              <Text className="text-sm text-foreground">{q.explanation}</Text>
            </View>
          )}

          {showResult && (
            <Button
              onPress={handleNext}
              className="flex-row items-center justify-center gap-2"
            >
              <Text className="text-primary-foreground">
                {currentQ + 1 >= lesson.questions.length
                  ? "See Results"
                  : "Next Question"}
              </Text>
              <ChevronRight size={16} className="text-primary-foreground" />
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
