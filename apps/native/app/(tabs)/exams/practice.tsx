import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Flag,
} from "lucide-react-native";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import SessionReview from "../../../components/exam-prep/SessionReview";
import Toast from "react-native-toast-message";
import { env } from "../../../lib/env";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  difficulty: string;
  topic_id: string | null;
}

export default function PracticeScreen() {
  const {
    examTypeId,
    subjectId,
    subjectName,
    mode,
    topicId: topicIdParam,
    year: yearParam,
    source: sourceParam,
  } = useLocalSearchParams<{
    examTypeId: string;
    subjectId: string;
    subjectName: string;
    mode: string;
    topicId?: string;
    year?: string;
    source?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const { gateFeature, incrementUsage } = useSubscription();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [gateOpen, setGateOpen] = useState(false);
  const [gateInfo, setGateInfo] = useState({ currentUsage: 0, limit: 0 });
  const [answers, setAnswers] = useState<
    { selectedAnswer: number; isCorrect: boolean }[]
  >([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const topicId = topicIdParam || undefined;
  const year = yearParam || undefined;
  const source = sourceParam || undefined;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("exam_bookmarks")
      .select("question_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setBookmarkedIds(new Set(data.map((b) => b.question_id)));
      });
  }, [user]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const gate = gateFeature("examQuestion");
      if (!gate.allowed) {
        setGateInfo({ currentUsage: gate.currentUsage, limit: gate.limit });
        setGateOpen(true);
        setLoading(false);
        return;
      }

      try {
        if (year || source) {
          let query = supabase
            .from("exam_questions")
            .select("*")
            .eq("exam_type_id", examTypeId)
            .eq("subject_id", subjectId)
            .eq("is_active", true);
          if (topicId) query = query.eq("topic_id", topicId);
          if (year) query = query.eq("year", year);
          if (source) query = query.eq("source", source);
          const { data } = await query.limit(10);
          const mapped = (data || []).map((q: any) => ({
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options) ? q.options : [],
            correct_index: q.correct_index,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topic_id: q.topic_id,
          }));
          for (let i = mapped.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
          }
          setQuestions(mapped);
          setLoading(false);
          return;
        }

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
              topic_id: topicId,
              count: 10,
            }),
          }
        );

        const result = await resp.json();
        if (result.questions?.length > 0) {
          setQuestions(
            result.questions.map((q: any) => ({
              id: q.id || crypto.randomUUID(),
              question: q.question,
              options: Array.isArray(q.options) ? q.options : [],
              correct_index: q.correct_index,
              explanation: q.explanation,
              difficulty: q.difficulty || "medium",
              topic_id: q.topic_id || null,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        let query = supabase
          .from("exam_questions")
          .select("*")
          .eq("exam_type_id", examTypeId)
          .eq("subject_id", subjectId)
          .eq("is_active", true);
        if (topicId) query = query.eq("topic_id", topicId);
        const { data } = await query.limit(10);
        const mapped = (data || []).map((q: any) => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correct_index: q.correct_index,
          explanation: q.explanation,
          difficulty: q.difficulty,
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
    fetchQuestions();
  }, [examTypeId, subjectId, topicId, year, source]);

  const toggleBookmark = async (questionId: string) => {
    if (!user) return;
    if (bookmarkedIds.has(questionId)) {
      await supabase
        .from("exam_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", questionId);
      setBookmarkedIds((prev) => {
        const n = new Set(prev);
        n.delete(questionId);
        return n;
      });
      Toast.show({ type: "info", text1: "Bookmark removed" });
    } else {
      await supabase
        .from("exam_bookmarks")
        .insert({ user_id: user.id, question_id: questionId });
      setBookmarkedIds((prev) => new Set(prev).add(questionId));
      Toast.show({ type: "success", text1: "Question bookmarked" });
    }
  };

  const handleSelect = async (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const q = questions[currentIndex];
    const correct = index === q.correct_index;
    if (correct) {
      setScore((s) => s + 1);
      setConsecutiveCorrect((c) => c + 1);
      setConsecutiveWrong(0);
    } else {
      setConsecutiveWrong((c) => c + 1);
      setConsecutiveCorrect(0);
    }

    setAnswers((prev) => [
      ...prev,
      { selectedAnswer: index, isCorrect: correct },
    ]);
    await incrementUsage("examQuestion");

    if (user) {
      await supabase.from("exam_attempts").insert({
        user_id: user.id,
        exam_type_id: examTypeId,
        subject_id: subjectId,
        topic_id: q.topic_id,
        question_id: q.id,
        selected_index: index,
        is_correct: correct,
        session_id: sessionId,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      const gate = gateFeature("examQuestion");
      if (!gate.allowed) {
        setGateInfo({ currentUsage: gate.currentUsage, limit: gate.limit });
        setGateOpen(true);
        setFinished(true);
        return;
      }
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (loading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="ml-3 text-sm text-muted-foreground mt-3">
          Generating questions...
        </Text>
      </View>
    );
  }

  if (questions.length === 0 && !gateOpen) {
    return (
      <View className="items-center py-20">
        <Text className="text-4xl mb-3">📭</Text>
        <Text className="font-semibold text-foreground">
          No questions available
        </Text>
        <Button variant="outline" className="mt-4" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (showReview) {
    const reviewQuestions = questions.map((q, i) => ({
      ...q,
      selectedAnswer: answers[i]?.selectedAnswer ?? -1,
      isCorrect: answers[i]?.isCorrect ?? false,
    }));
    return (
      <SessionReview
        questions={reviewQuestions}
        score={score}
        subjectName={subjectName}
        onBack={() => router.back()}
      />
    );
  }

  if (finished) {
    const answered = Math.min(questions.length, currentIndex + 1);
    const pct = answered > 0 ? Math.round((score / answered) * 100) : 0;
    return (
      <View className="items-center py-12 gap-4">
        <Text className="text-5xl">
          {pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "💪"}
        </Text>
        <Text className="text-2xl font-bold text-foreground">
          {pct}% Score
        </Text>
        <Text className="text-muted-foreground">
          {score} / {answered} correct — {subjectName}
        </Text>
        <Progress value={pct} className="w-48" />
        <View className="flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onPress={() => setShowReview(true)}
          >
            Review Answers
          </Button>
          <Button onPress={() => router.back()}>Back to Subjects</Button>
        </View>
        <FeatureGateSheet
          open={gateOpen}
          onOpenChange={setGateOpen}
          feature="Exam Questions"
          currentUsage={gateInfo.currentUsage}
          limit={gateInfo.limit}
          requiredTier="plus"
        />
      </View>
    );
  }

  const q = questions[currentIndex];
  const isBookmarked = bookmarkedIds.has(q.id);
  const adaptiveHint =
    consecutiveCorrect >= 3
      ? "🔥 On fire!"
      : consecutiveWrong >= 2
        ? "💪 Keep trying!"
        : null;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm text-primary font-medium">← Back</Text>
          </Pressable>
          <View className="flex-row items-center gap-2">
            {adaptiveHint ? (
              <Text className="text-xs">{adaptiveHint}</Text>
            ) : null}
            <Pressable onPress={() => toggleBookmark(q.id)}>
              {isBookmarked ? (
                <BookmarkCheck size={18} className="text-primary" />
              ) : (
                <Bookmark size={18} className="text-muted-foreground" />
              )}
            </Pressable>
            <Text className="text-xs text-muted-foreground font-medium">
              {currentIndex + 1} / {questions.length}
            </Text>
          </View>
        </View>

        <Progress
          value={((currentIndex + 1) / questions.length) * 100}
        />

        <View className="p-4 rounded-2xl bg-card border border-border">
          <View className="bg-muted rounded-full px-2 py-0.5 self-start mb-2">
            <Text className="text-[10px] text-muted-foreground capitalize">
              {q.difficulty}
            </Text>
          </View>
          <Text className="text-foreground font-medium leading-relaxed">
            {q.question}
          </Text>
        </View>

        <View className="gap-2">
          {q.options.map((opt, i) => {
            let borderColor = "border-border";
            let bgColor = "";
            let opacity = "";
            if (showResult) {
              if (i === q.correct_index) {
                borderColor = "border-green-500";
                bgColor = "bg-green-500/10";
              } else if (i === selectedAnswer) {
                borderColor = "border-destructive";
                bgColor = "bg-destructive/10";
              } else {
                opacity = "opacity-50";
              }
            } else if (selectedAnswer === i) {
              borderColor = "border-primary";
              bgColor = "bg-primary/10";
            }

            return (
              <Pressable
                key={i}
                onPress={() => handleSelect(i)}
                disabled={showResult}
                className={`w-full flex-row items-center gap-3 p-3.5 rounded-xl border text-left ${borderColor} ${bgColor} ${opacity}`}
              >
                <View className="w-7 h-7 rounded-full border border-border items-center justify-center">
                  <Text className="text-xs font-semibold text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text className="text-sm text-foreground flex-1">{opt}</Text>
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
            <Text className="text-sm text-foreground">
              {q.explanation}
            </Text>
          </View>
        )}

        {showResult && (
          <Button onPress={handleNext} className="w-full flex-row items-center justify-center gap-2">
            <Text className="text-primary-foreground font-semibold">
              {currentIndex + 1 >= questions.length
                ? "See Results"
                : "Next Question"}
            </Text>
            <ChevronRight size={16} className="text-primary-foreground" />
          </Button>
        )}
      </View>

      <FeatureGateSheet
        open={gateOpen}
        onOpenChange={setGateOpen}
        feature="Exam Questions"
        currentUsage={gateInfo.currentUsage}
        limit={gateInfo.limit}
        requiredTier="plus"
      />
    </ScrollView>
  );
}
