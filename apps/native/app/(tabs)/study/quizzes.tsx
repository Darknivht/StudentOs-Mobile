import { useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { FileText, CheckCircle, XCircle, Trophy, BookOpen, GraduationCap, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuthContext";
import { useCourses } from "../../../hooks/useCourses";
import { useNotes } from "../../../hooks/useNotes";
import { useQuizAttempts, useCreateQuizAttempt, type QuizQuestion } from "../../../hooks/useQuizzes";
import { useProfile } from "../../../hooks/useProfile";
import { streamSSE } from "../../../services/sse-client";
import { supabase } from "../../../services/supabase";
import { env } from "../../../lib/env";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select } from "../../../components/ui/select";
import { Progress } from "../../../components/ui/progress";
import { Skeleton } from "../../../components/ui/skeleton";
import { ErrorFallback } from "../../../components/ErrorFallback";
import Toast from "react-native-toast-message";
import Animated, { FadeIn } from "react-native-reanimated";

export { ErrorFallback as ErrorBoundary };

type QuizView = "start" | "generating" | "playing" | "result" | "history";

export default function QuizzesScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { data: courses } = useCourses();
  const { data: profile } = useProfile();
  const { data: attempts, isLoading: attemptsLoading } = useQuizAttempts();
  const createAttempt = useCreateQuizAttempt();

  const [view, setView] = useState<QuizView>("start");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"course" | "note">("course");
  const { data: notes } = useNotes(sourceType === "note" ? selectedCourseId : null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  const courseOptions = [
    { label: "Select a course", value: "" },
    ...(courses || []).map((c) => ({ label: c.name, value: c.id })),
  ];

  const noteOptions = [
    { label: "Select a note", value: "" },
    ...(notes || []).map((n) => ({ label: n.title, value: n.id })),
  ];

  const generateQuiz = useCallback(async () => {
    if (!user || !session) return;
    setView("generating");
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    scoreRef.current = 0;
    setUserAnswers([]);

    try {
      let content = "";
      if (sourceType === "note" && selectedNoteId) {
        const { data: note } = await supabase
          .from("notes")
          .select("content, title")
          .eq("id", selectedNoteId)
          .single();
        if (note?.content) content = note.content.slice(0, 3000);
      } else if (sourceType === "course" && selectedCourseId) {
        const { data: courseNotes } = await supabase
          .from("notes")
          .select("content, title")
          .eq("user_id", user.id)
          .eq("course_id", selectedCourseId)
          .not("content", "is", null)
          .limit(5);
        if (courseNotes) {
          content = courseNotes.map((n) => `${n.title}:\n${(n.content || "").slice(0, 800)}`).join("\n\n");
        }
      }

      if (!content.trim()) {
        Toast.show({ type: "error", text1: "No content", text2: "Add notes first to generate a quiz." });
        setView("start");
        return;
      }

      let fullResponse = "";
      const generator = streamSSE(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stream-ai-chat`, {
        body: {
          messages: [],
          mode: "quiz",
          content,
          persona: profile?.study_persona || "friendly",
        },
        token: session.access_token,
      });

      for await (const chunk of generator) {
        fullResponse += chunk;
      }

      const jsonMatch = fullResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        Toast.show({ type: "error", text1: "Generation failed", text2: "Couldn't parse quiz questions." });
        setView("start");
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const valid: QuizQuestion[] = parsed
        .filter(
          (q: any) =>
            q.question &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correct_index === "number" &&
            q.explanation
        )
        .slice(0, 10);

      if (valid.length < 3) {
        Toast.show({ type: "error", text1: "Not enough questions", text2: "Try with more detailed notes." });
        setView("start");
        return;
      }

      setQuestions(valid);
      setView("playing");
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to generate quiz." });
      setView("start");
    }
  }, [user, session, sourceType, selectedNoteId, selectedCourseId, profile]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered) return;
      setSelected(idx);
      setAnswered(true);
      setUserAnswers((prev) => {
        const updated = [...prev];
        updated[currentQ] = idx;
        return updated;
      });
      if (idx === questions[currentQ].correct_index) {
        scoreRef.current += 1;
        setScore((s) => s + 1);
      }
    },
    [answered, questions, currentQ]
  );

  const nextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      finishQuiz();
    }
  }, [currentQ, questions]);

  const finishQuiz = useCallback(async () => {
    const finalScore = scoreRef.current;
    setView("result");

    if (!user) return;
    try {
      await createAttempt.mutateAsync({
        score: finalScore,
        total_questions: questions.length,
        quiz_data: questions.map((q) => ({
          question: q.question,
          correct: q.correct_index,
          explanation: q.explanation,
        })),
        course_id: sourceType === "course" ? selectedCourseId : null,
        note_id: sourceType === "note" ? selectedNoteId : null,
      });
    } catch {}
  }, [user, questions, createAttempt, sourceType, selectedCourseId, selectedNoteId]);

  if (view === "start" || view === "history") {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-4">
          <Text className="text-2xl font-bold text-foreground">Quizzes</Text>

          <View className="flex-row gap-2 mb-2">
            <Pressable
              onPress={() => setView("start")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                view === "start" ? "bg-primary border-primary" : "border-border bg-card"
              }`}
            >
              <Text className={`text-sm font-medium text-center ${view === "start" ? "text-primary-foreground" : "text-foreground"}`}>
                Start Quiz
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setView("history")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                view === "history" ? "bg-primary border-primary" : "border-border bg-card"
              }`}
            >
              <Text className={`text-sm font-medium text-center ${view === "history" ? "text-primary-foreground" : "text-foreground"}`}>
                History
              </Text>
            </Pressable>
          </View>

          {view === "start" ? (
            <View className="gap-4">
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSourceType("course")}
                  className={`flex-1 py-2 px-3 rounded-lg border ${
                    sourceType === "course" ? "bg-primary/10 border-primary" : "border-border"
                  }`}
                >
                  <Text className={`text-sm font-medium text-center ${sourceType === "course" ? "text-primary" : "text-foreground"}`}>
                    From Course
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSourceType("note")}
                  className={`flex-1 py-2 px-3 rounded-lg border ${
                    sourceType === "note" ? "bg-primary/10 border-primary" : "border-border"
                  }`}
                >
                  <Text className={`text-sm font-medium text-center ${sourceType === "note" ? "text-primary" : "text-foreground"}`}>
                    From Note
                  </Text>
                </Pressable>
              </View>

              {sourceType === "course" ? (
                <Select
                  options={courseOptions}
                  value={selectedCourseId || ""}
                  onValueChange={(v) => setSelectedCourseId(v || null)}
                  placeholder="Select course"
                />
              ) : (
                <View className="gap-2">
                  {selectedCourseId && (
                    <Select
                      options={noteOptions}
                      value={selectedNoteId || ""}
                      onValueChange={(v) => setSelectedNoteId(v || null)}
                      placeholder="Select note"
                    />
                  )}
                  <Select
                    options={courseOptions}
                    value={selectedCourseId || ""}
                    onValueChange={(v) => {
                      setSelectedCourseId(v || null);
                      setSelectedNoteId(null);
                    }}
                    placeholder="Filter by course"
                  />
                </View>
              )}

              <Button
                onPress={generateQuiz}
                disabled={!selectedCourseId && !selectedNoteId}
                className="w-full bg-primary"
              >
                <FileText className="w-4 h-4 text-primary-foreground" />
                <Text className="text-primary-foreground font-semibold">Generate Quiz</Text>
              </Button>
            </View>
          ) : (
            <View className="gap-3">
              {(attempts || []).length === 0 ? (
                <Text className="text-muted-foreground text-center py-8">No quiz attempts yet</Text>
              ) : (
                (attempts || []).map((attempt) => (
                  <Card key={attempt.id}>
                    <CardContent className="p-4 flex-row items-center justify-between">
                      <View>
                        <Text className="font-medium text-foreground">
                          {attempt.score}/{attempt.total_questions}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text className="font-bold text-primary">
                        {Math.round((attempt.score / attempt.total_questions) * 100)}%
                      </Text>
                    </CardContent>
                  </Card>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  if (view === "generating") {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-sm font-medium text-foreground mt-4">Generating quiz from your notes...</Text>
        <Text className="text-xs text-muted-foreground mt-1">AI is creating personalized questions</Text>
      </View>
    );
  }

  if (view === "result") {
    const finalScore = scoreRef.current;
    const percentage = Math.round((finalScore / questions.length) * 100);
    return (
      <Animated.View entering={FadeIn} className="flex-1 bg-background items-center justify-center p-6">
        <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-primary" />
        </View>
        <Text className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</Text>
        <Text className="text-4xl font-bold text-primary mb-1">
          {finalScore}/{questions.length}
        </Text>
        <Text className="text-xl text-foreground mb-6">{percentage}%</Text>

        <Button
          onPress={() => router.push("/study/tutor")}
          className="w-full mb-3 bg-secondary"
        >
          <GraduationCap className="w-4 h-4 text-secondary-foreground" />
          <Text className="text-secondary-foreground font-semibold">Review with AI Tutor</Text>
        </Button>

        <Button
          onPress={() => setView("start")}
          variant="outline"
          className="w-full"
        >
          <Text className="text-foreground font-semibold">Take Another Quiz</Text>
        </Button>
      </Animated.View>
    );
  }

if (view === "playing" && questions[currentQ]) {
  const q = questions[currentQ];
  const currentIndex = currentQ;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-2">
            <Pressable onPress={() => setView("start")}>
              <Text className="text-primary font-medium">Exit</Text>
            </Pressable>
            <Text className="text-sm text-muted-foreground">{currentQ + 1} / {questions.length}</Text>
          </View>
          <Progress value={progressPercent} className="h-1" />
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <Text className="font-semibold text-foreground text-lg mb-4">{q.question}</Text>
          <View className="gap-3">
            {q.options.map((opt, i) => {
              let optBg = "bg-background";
              let optBorder = "border-border";
              if (answered) {
                if (i === q.correct_index) {
                  optBg = "bg-emerald-500/10";
                  optBorder = "border-emerald-500";
                } else if (i === selected && i !== q.correct_index) {
                  optBg = "bg-red-500/10";
                  optBorder = "border-red-500";
                } else {
                  optBg = "bg-background/50";
                  optBorder = "border-border";
                }
              } else if (i === selected) {
                optBg = "bg-primary/5";
                optBorder = "border-primary";
              }

              return (
                <Pressable
                  key={i}
                  onPress={() => handleAnswer(i)}
                  disabled={answered}
                  className={`w-full p-4 rounded-xl border ${optBg} ${optBorder} flex-row items-center gap-3`}
                >
                  <View className="w-7 h-7 rounded-full border border-current items-center justify-center">
                    <Text className="text-xs font-medium text-foreground">
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground flex-1">{opt}</Text>
                  {answered && i === q.correct_index && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  {answered && i === selected && i !== q.correct_index && <XCircle className="w-5 h-5 text-red-500" />}
                </Pressable>
              );
            })}
          </View>

          {answered && q.explanation && (
            <View className="mt-4 p-4 rounded-xl bg-muted/50">
              <Text className="text-xs font-medium text-muted-foreground mb-1">Explanation</Text>
              <Text className="text-sm text-foreground">{q.explanation}</Text>
            </View>
          )}
        </ScrollView>

        {answered && (
          <View className="px-6 pb-8">
            <Button onPress={nextQuestion} className="w-full bg-primary">
              <Text className="text-primary-foreground font-semibold">
                {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
              </Text>
            </Button>
          </View>
        )}
      </View>
    );
  }

  return null;
}
