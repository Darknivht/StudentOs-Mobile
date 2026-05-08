import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
} from "lucide-react-native";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { appStorage } from "../../../services/app-storage";
import { env } from "../../../lib/env";
import { Alert } from "react-native";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  topic_id: string | null;
}

interface DraftState {
  questions: Question[];
  answers: Record<number, number>;
  currentIndex: number;
  timeLeft: number;
  sessionId: string;
}

const DRAFT_KEY_PREFIX = "mock_exam_draft_";

export default function MockExamScreen() {
  const { examTypeId, subjectId, subjectName } = useLocalSearchParams<{
    examTypeId: string;
    subjectId: string;
    subjectName: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const { incrementUsage } = useSubscription();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [finished, setFinished] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [reviewWrong, setReviewWrong] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const saveThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftKey = `${DRAFT_KEY_PREFIX}${examTypeId}_${subjectId}`;

  useEffect(() => {
    const checkDraft = async () => {
      try {
        const saved = await appStorage.getItem(draftKey);
        if (saved) {
          const draft: DraftState = JSON.parse(saved);
          if (draft.questions?.length > 0 && draft.timeLeft > 0) {
            setShowResume(true);
            return;
          } else {
            await appStorage.removeItem(draftKey);
          }
        }
      } catch {
        await appStorage.removeItem(draftKey);
      }
      fetchQuestions();
    };
    checkDraft();
  }, []);

  const resumeDraft = async () => {
    try {
      const saved = await appStorage.getItem(draftKey);
      if (saved) {
        const draft: DraftState = JSON.parse(saved);
        setQuestions(draft.questions);
        setAnswers(draft.answers);
        setCurrentIndex(draft.currentIndex);
        setTimeLeft(draft.timeLeft);
        setShowResume(false);
        setLoading(false);
      }
    } catch {
      await appStorage.removeItem(draftKey);
      setShowResume(false);
      fetchQuestions();
    }
  };

  const startFresh = async () => {
    await appStorage.removeItem(draftKey);
    setShowResume(false);
    fetchQuestions();
  };

  const saveDraft = useCallback(async () => {
    if (saveThrottleRef.current) clearTimeout(saveThrottleRef.current);
    saveThrottleRef.current = setTimeout(async () => {
      if (finished || questions.length === 0) return;
      const draft: DraftState = {
        questions,
        answers,
        currentIndex,
        timeLeft,
        sessionId,
      };
      try {
        await appStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {}
    }, 1000);
  }, [questions, answers, currentIndex, timeLeft, sessionId, finished, draftKey]);

  useEffect(() => {
    if (!finished && questions.length > 0 && !showResume) saveDraft();
  }, [answers, currentIndex, timeLeft, saveDraft, finished, showResume]);

  const clearDraft = async () => {
    await appStorage.removeItem(draftKey);
  };

  const fetchQuestions = async () => {
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
            action: "generate-questions",
            exam_type_id: examTypeId,
            subject_id: subjectId,
            count: 40,
          }),
        }
      );

      const result = await resp.json();
      if (result.questions && result.questions.length > 0) {
        setQuestions(
          result.questions.map((q: any) => ({
            id: q.id || crypto.randomUUID(),
            question: q.question,
            options: Array.isArray(q.options) ? q.options : [],
            correct_index: q.correct_index,
            explanation: q.explanation,
            topic_id: q.topic_id || null,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      const { data } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_type_id", examTypeId)
        .eq("subject_id", subjectId)
        .eq("is_active", true)
        .limit(40);
      const mapped = (data || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correct_index: q.correct_index,
        explanation: q.explanation,
        topic_id: q.topic_id,
      }));
      for (let i = mapped.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
      }
      setQuestions(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (finished || loading || showResume) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [finished, loading, showResume]);

  const handleSubmit = useCallback(async () => {
    setFinished(true);
    await clearDraft();
    if (!user) return;

    const inserts = questions.map((q, i) => ({
      user_id: user.id,
      exam_type_id: examTypeId,
      subject_id: subjectId,
      topic_id: q.topic_id,
      question_id: q.id,
      selected_index: answers[i] ?? -1,
      is_correct: answers[i] === q.correct_index,
      session_id: sessionId,
    }));

    await supabase.from("exam_attempts").insert(inserts);
    for (let i = 0; i < questions.length; i++) {
      await incrementUsage("examQuestion");
    }
  }, [user, questions, answers, examTypeId, subjectId, sessionId]);

  const handleExit = () => {
    if (!finished && questions.length > 0) {
      Alert.alert(
        "Leave Exam?",
        "Your progress is saved. You can resume this exam later. Leave now?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "default",
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }
    router.back();
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (showResume) {
    return (
      <View className="items-center py-16 gap-6 px-6">
        <Text className="text-5xl">📝</Text>
        <Text className="text-xl font-bold text-foreground">
          Resume Previous Exam?
        </Text>
        <Text className="text-sm text-muted-foreground text-center">
          You have an unfinished mock exam for {subjectName}. Would you like to
          continue where you left off?
        </Text>
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            onPress={startFresh}
            className="flex-row items-center gap-2"
          >
            <RotateCcw size={16} />
            <Text>Start Fresh</Text>
          </Button>
          <Button
            onPress={resumeDraft}
            className="flex-row items-center gap-2"
          >
            <Clock size={16} />
            <Text className="text-primary-foreground">Resume Exam</Text>
          </Button>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="ml-3 text-sm text-muted-foreground mt-3">
          Generating 40 questions...
        </Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View className="items-center py-20">
        <Text className="text-4xl mb-3">📭</Text>
        <Text className="font-semibold text-foreground">
          Not enough questions for a mock exam
        </Text>
        <Button variant="outline" className="mt-4" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (finished) {
    const score = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0),
      0
    );
    const pct = Math.round((score / questions.length) * 100);
    const wrongQuestions = questions.filter(
      (q, i) => answers[i] !== q.correct_index
    );

    if (reviewWrong && wrongQuestions.length > 0) {
      return (
        <ScrollView className="flex-1 bg-background">
          <View className="p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setReviewWrong(false)}>
                <Text className="text-sm text-primary font-medium">
                  ← Back to Results
                </Text>
              </Pressable>
              <Text className="text-xs text-muted-foreground font-medium">
                {wrongQuestions.length} wrong
              </Text>
            </View>

            <View className="gap-4">
              {wrongQuestions.map((q, idx) => {
                const originalIdx = questions.indexOf(q);
                return (
                  <View
                    key={q.id}
                    className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5 gap-3"
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {originalIdx + 1}. {q.question}
                    </Text>
                    <View className="gap-1.5">
                      {q.options.map((opt, i) => (
                        <View
                          key={i}
                          className={`flex-row items-center gap-2 p-2 rounded-lg ${
                            i === q.correct_index
                              ? "bg-green-500/10 border border-green-500/30"
                              : i === answers[originalIdx]
                                ? "bg-destructive/10 border border-destructive/30"
                                : ""
                          }`}
                        >
                          <View className="w-5 h-5 rounded-full border items-center justify-center">
                            <Text className="text-[10px] font-semibold">
                              {String.fromCharCode(65 + i)}
                            </Text>
                          </View>
                          <Text className="flex-1 text-sm">{opt}</Text>
                          {i === q.correct_index && (
                            <CheckCircle2
                              size={14}
                              className="text-green-500"
                            />
                          )}
                          {i === answers[originalIdx] &&
                            i !== q.correct_index && (
                              <XCircle size={14} className="text-destructive" />
                            )}
                        </View>
                      ))}
                    </View>
                    {q.explanation && (
                      <View className="p-2 rounded-lg bg-muted/50 border border-border">
                        <Text className="text-xs font-semibold text-muted-foreground mb-0.5">
                          Explanation
                        </Text>
                        <Text className="text-xs text-foreground">
                          {q.explanation}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <Button onPress={() => router.back()} className="w-full mt-4">
              Back to Subjects
            </Button>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 items-center gap-4">
          <Text className="text-5xl">
            {pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "💪"}
          </Text>
          <Text className="text-2xl font-bold text-foreground">
            {pct}% — Mock Exam
          </Text>
          <Text className="text-muted-foreground">
            {score} / {questions.length} correct — {subjectName}
          </Text>
          <Progress value={pct} className="w-48" />

          {wrongQuestions.length > 0 && (
            <Button
              variant="outline"
              onPress={() => setReviewWrong(true)}
              className="flex-row items-center gap-2"
            >
              <Eye size={16} />
              <Text>Review Wrong Answers ({wrongQuestions.length})</Text>
            </Button>
          )}

          <View className="w-full mt-4 gap-2">
            {questions.map((q, i) => {
              const correct = answers[i] === q.correct_index;
              return (
                <View
                  key={q.id}
                  className={`p-3 rounded-xl border ${
                    correct
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <Text className="font-medium text-foreground text-sm">
                    {i + 1}. {q.question}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    Your answer:{" "}
                    {answers[i] !== undefined
                      ? q.options[answers[i]]
                      : "Not answered"}{" "}
                    — Correct: {q.options[q.correct_index]}
                  </Text>
                </View>
              );
            })}
          </View>

          <Button onPress={() => router.back()} className="w-full mt-4">
            Back to Subjects
          </Button>
        </View>
      </ScrollView>
    );
  }

  const q = questions[currentIndex];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={handleExit}>
            <Text className="text-sm text-primary font-medium">← Exit</Text>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Clock
              size={14}
              className={
                timeLeft < 300
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            />
            <Text
              className={`text-sm font-mono ${
                timeLeft < 300
                  ? "text-destructive font-bold"
                  : "text-foreground"
              }`}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <Progress
          value={((currentIndex + 1) / questions.length) * 100}
        />
        <Text className="text-xs text-muted-foreground text-center">
          Question {currentIndex + 1} of {questions.length}
        </Text>

        <View className="p-4 rounded-2xl bg-card border border-border">
          <Text className="text-foreground font-medium leading-relaxed">
            {q.question}
          </Text>
        </View>

        <View className="gap-2">
          {q.options.map((opt, i) => (
            <Pressable
              key={i}
              onPress={() =>
                setAnswers((a) => ({ ...a, [currentIndex]: i }))
              }
              className={`w-full flex-row items-center gap-3 p-3.5 rounded-xl border ${
                answers[currentIndex] === i
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              <View className="w-7 h-7 rounded-full border border-border items-center justify-center">
                <Text className="text-xs font-semibold text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text className="text-sm text-foreground">{opt}</Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-2">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex((i) => i - 1)}
            className="flex-1"
          >
            <Text>Previous</Text>
          </Button>
          {currentIndex + 1 < questions.length ? (
            <Button
              onPress={() => setCurrentIndex((i) => i + 1)}
              className="flex-1"
            >
              <Text className="text-primary-foreground">Next</Text>
            </Button>
          ) : (
            <Button onPress={handleSubmit} className="flex-1 bg-green-600">
              <Text className="text-white font-semibold">Submit Exam</Text>
            </Button>
          )}
        </View>

        <View className="flex-row flex-wrap gap-1.5 justify-center pt-2">
          {questions.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => setCurrentIndex(i)}
              className={`w-7 h-7 rounded-lg items-center justify-center ${
                i === currentIndex
                  ? "bg-primary"
                  : answers[i] !== undefined
                    ? "bg-primary/20"
                    : "bg-muted"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  i === currentIndex
                    ? "text-primary-foreground"
                    : answers[i] !== undefined
                      ? "text-primary"
                      : "text-muted-foreground"
                }`}
              >
                {i + 1}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
