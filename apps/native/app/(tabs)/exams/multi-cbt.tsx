import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
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
import { Checkbox } from "../../../components/ui/checkbox";
import { appStorage } from "../../../services/app-storage";
import { env } from "../../../lib/env";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

interface Subject {
  id: string;
  name: string;
  icon: string | null;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  topic_id: string | null;
  subject_id: string;
}

interface DraftState {
  selectedSubjectIds: string[];
  questionsBySubject: Record<string, Question[]>;
  answers: Record<string, Record<number, number>>;
  currentIndexes: Record<string, number>;
  activeSubject: string;
  timeLeft: number;
  sessionId: string;
}

type Phase = "select" | "exam" | "results";

const DRAFT_KEY_PREFIX = "cbt_draft_";

export default function MultiCBTScreen() {
  const {
    examTypeId,
    examName,
    subjectsRequired: subjectsRequiredStr,
    timeLimitMinutes: timeLimitMinutesStr,
    questionsPerSubject: questionsPerSubjectStr,
  } = useLocalSearchParams<{
    examTypeId: string;
    examName: string;
    subjectsRequired: string;
    timeLimitMinutes: string;
    questionsPerSubject: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const { incrementUsage } = useSubscription();

  const subjectsRequired = parseInt(subjectsRequiredStr || "4", 10);
  const timeLimitMinutes = parseInt(timeLimitMinutesStr || "120", 10);
  const questionsPerSubject = parseInt(questionsPerSubjectStr || "50", 10);

  const [phase, setPhase] = useState<Phase>("select");
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResume, setShowResume] = useState(false);

  const [questionsBySubject, setQuestionsBySubject] = useState<
    Record<string, Question[]>
  >({});
  const [answers, setAnswers] = useState<
    Record<string, Record<number, number>>
  >({});
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [currentIndexes, setCurrentIndexes] = useState<
    Record<string, number>
  >({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [finished, setFinished] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [reviewWrong, setReviewWrong] = useState(false);
  const saveThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftKey = `${DRAFT_KEY_PREFIX}${examTypeId}`;

  useEffect(() => {
    const checkDraft = async () => {
      try {
        const saved = await appStorage.getItem(draftKey);
        if (saved) {
          const draft: DraftState = JSON.parse(saved);
          if (
            draft.timeLeft > 0 &&
            Object.keys(draft.questionsBySubject).length > 0
          ) {
            const { data } = await supabase
              .from("exam_subjects")
              .select("id, name, icon")
              .eq("exam_type_id", examTypeId)
              .eq("is_active", true)
              .order("name");
            setAllSubjects(data || []);
            setLoading(false);
            setShowResume(true);
            return;
          } else {
            await appStorage.removeItem(draftKey);
          }
        }
      } catch {
        await appStorage.removeItem(draftKey);
      }
      const { data } = await supabase
        .from("exam_subjects")
        .select("id, name, icon")
        .eq("exam_type_id", examTypeId)
        .eq("is_active", true)
        .order("name");
      setAllSubjects(data || []);
      setLoading(false);
    };
    checkDraft();
  }, [examTypeId]);

  const resumeDraft = async () => {
    try {
      const saved = await appStorage.getItem(draftKey);
      if (saved) {
        const draft: DraftState = JSON.parse(saved);
        setSelectedSubjectIds(draft.selectedSubjectIds);
        setQuestionsBySubject(draft.questionsBySubject);
        setAnswers(draft.answers);
        setCurrentIndexes(draft.currentIndexes);
        setActiveSubject(draft.activeSubject);
        setTimeLeft(draft.timeLeft);
        setPhase("exam");
        setShowResume(false);
      }
    } catch {
      await appStorage.removeItem(draftKey);
      setShowResume(false);
    }
  };

  const startFresh = async () => {
    await appStorage.removeItem(draftKey);
    setShowResume(false);
  };

  const saveDraft = useCallback(() => {
    if (saveThrottleRef.current) clearTimeout(saveThrottleRef.current);
    saveThrottleRef.current = setTimeout(async () => {
      if (finished || phase !== "exam") return;
      const draft: DraftState = {
        selectedSubjectIds,
        questionsBySubject,
        answers,
        currentIndexes,
        activeSubject,
        timeLeft,
        sessionId,
      };
      try {
        await appStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {}
    }, 1000);
  }, [
    selectedSubjectIds,
    questionsBySubject,
    answers,
    currentIndexes,
    activeSubject,
    timeLeft,
    sessionId,
    finished,
    phase,
    draftKey,
  ]);

  useEffect(() => {
    if (phase === "exam" && !finished && !showResume) saveDraft();
  }, [answers, currentIndexes, activeSubject, timeLeft, saveDraft, phase, finished, showResume]);

  const clearDraft = async () => {
    await appStorage.removeItem(draftKey);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= subjectsRequired) return prev;
      return [...prev, id];
    });
  };

  const startExam = async () => {
    setLoading(true);
    const qBySubj: Record<string, Question[]> = {};
    const initAnswers: Record<string, Record<number, number>> = {};
    const initIndexes: Record<string, number> = {};

    for (const subjId of selectedSubjectIds) {
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
              subject_id: subjId,
              count: questionsPerSubject,
            }),
          }
        );

        const result = await resp.json();
        if (result.questions?.length > 0) {
          qBySubj[subjId] = result.questions.map((q: any) => ({
            id: q.id || crypto.randomUUID(),
            question: q.question,
            options: Array.isArray(q.options) ? q.options : [],
            correct_index: q.correct_index,
            explanation: q.explanation,
            topic_id: q.topic_id || null,
            subject_id: subjId,
          }));
        } else {
          qBySubj[subjId] = [];
        }
      } catch {
        const { data } = await supabase
          .from("exam_questions")
          .select("*")
          .eq("exam_type_id", examTypeId)
          .eq("subject_id", subjId)
          .eq("is_active", true)
          .limit(questionsPerSubject);

        qBySubj[subjId] = (data || []).map((q: any) => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correct_index: q.correct_index,
          explanation: q.explanation,
          topic_id: q.topic_id,
          subject_id: subjId,
        }));
      }

      initAnswers[subjId] = {};
      initIndexes[subjId] = 0;
    }

    setQuestionsBySubject(qBySubj);
    setAnswers(initAnswers);
    setCurrentIndexes(initIndexes);
    setActiveSubject(selectedSubjectIds[0]);
    setPhase("exam");
    setLoading(false);
  };

  useEffect(() => {
    if (phase !== "exam" || finished) return;
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
  }, [phase, finished]);

  const handleSubmit = useCallback(async () => {
    setFinished(true);
    setPhase("results");
    await clearDraft();
    if (!user) return;

    const inserts: any[] = [];
    for (const subjId of selectedSubjectIds) {
      const qs = questionsBySubject[subjId] || [];
      const subjAnswers = answers[subjId] || {};
      qs.forEach((q, i) => {
        inserts.push({
          user_id: user.id,
          exam_type_id: examTypeId,
          subject_id: subjId,
          topic_id: q.topic_id,
          question_id: q.id,
          selected_index: subjAnswers[i] ?? -1,
          is_correct: subjAnswers[i] === q.correct_index,
          session_id: sessionId,
        });
      });
    }

    await supabase.from("exam_attempts").insert(inserts);
    for (let i = 0; i < inserts.length; i++) {
      await incrementUsage("examQuestion");
    }
  }, [user, selectedSubjectIds, questionsBySubject, answers, examTypeId, sessionId]);

  const handleExit = () => {
    if (phase === "exam" && !finished) {
      Alert.alert(
        "Leave Exam?",
        "Your progress is saved. You can resume this exam later. Leave now?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
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

  const selectedSubjects = allSubjects.filter((s) =>
    selectedSubjectIds.includes(s.id)
  );

  if (showResume) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="text-5xl mb-4">📋</Text>
        <Text className="text-xl font-bold text-foreground text-center">
          Resume Previous CBT?
        </Text>
        <Text className="text-sm text-muted-foreground text-center max-w-sm mt-2">
          You have an unfinished {examName} CBT exam. Would you like to continue
          where you left off?
        </Text>
        <View className="flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onPress={startFresh}
            className="flex-row items-center gap-2"
          >
            <RotateCcw size={16} className="text-foreground" />
            <Text className="text-foreground">Start Fresh</Text>
          </Button>
          <Button
            onPress={resumeDraft}
            className="flex-row items-center gap-2"
          >
            <Clock size={16} className="text-primary-foreground" />
            <Text className="text-primary-foreground">Resume Exam</Text>
          </Button>
        </View>
      </View>
    );
  }

  if (phase === "select") {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-5">
          <View className="items-center gap-2">
            <Text className="text-4xl">📋</Text>
            <Text className="text-xl font-bold text-foreground text-center">
              Select {subjectsRequired} Subjects
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              {examName} — {questionsPerSubject} questions per subject ·{" "}
              {timeLimitMinutes} minutes total
            </Text>
          </View>

          <View className="gap-3">
            {allSubjects.map((subj) => {
              const checked = selectedSubjectIds.includes(subj.id);
              const disabled =
                !checked && selectedSubjectIds.length >= subjectsRequired;
              return (
                <Pressable
                  key={subj.id}
                  onPress={() => !disabled && toggleSubject(subj.id)}
                  disabled={disabled}
                  className={`flex-row items-center gap-4 p-4 rounded-2xl border ${
                    checked
                      ? "border-primary bg-primary/10"
                      : disabled
                      ? "opacity-40 border-border"
                      : "border-border"
                  }`}
                >
                  <Checkbox checked={checked} />
                  <Text className="text-2xl">{subj.icon || "📘"}</Text>
                  <Text className="font-semibold text-foreground flex-1">
                    {subj.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={handleExit}
              className="flex-1"
            >
              <Text className="text-foreground">Back</Text>
            </Button>
            <Button
              onPress={startExam}
              disabled={selectedSubjectIds.length !== subjectsRequired}
              className="flex-1"
            >
              <Text className="text-primary-foreground">
                Start CBT ({selectedSubjectIds.length}/{subjectsRequired})
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
          Loading {selectedSubjectIds.length * questionsPerSubject} questions...
        </Text>
      </View>
    );
  }

  if (phase === "results") {
    const subjectResults = selectedSubjects.map((subj) => {
      const qs = questionsBySubject[subj.id] || [];
      const subjAnswers = answers[subj.id] || {};
      const score = qs.reduce(
        (acc, q, i) => acc + (subjAnswers[i] === q.correct_index ? 1 : 0),
        0
      );
      const wrong = qs.filter((q, i) => subjAnswers[i] !== q.correct_index);
      return {
        ...subj,
        questions: qs,
        answers: subjAnswers,
        score,
        total: qs.length,
        pct: qs.length
          ? Math.round((score / qs.length) * 100)
          : 0,
        wrong,
      };
    });

    const totalScore = subjectResults.reduce((a, r) => a + r.score, 0);
    const totalQs = subjectResults.reduce((a, r) => a + r.total, 0);
    const totalPct = totalQs
      ? Math.round((totalScore / totalQs) * 100)
      : 0;

    if (reviewWrong) {
      return (
        <ScrollView className="flex-1 bg-background">
          <View className="p-6 gap-4">
            <Pressable onPress={() => setReviewWrong(false)}>
              <Text className="text-sm text-primary font-medium">
                ← Back to Results
              </Text>
            </Pressable>

            {subjectResults.map(
              (sr) =>
                sr.wrong.length > 0 && (
                  <View key={sr.id} className="gap-3">
                    <Text className="font-semibold text-foreground">
                      {sr.icon} {sr.name} — {sr.wrong.length} wrong
                    </Text>
                    {sr.wrong.map((q) => {
                      const origIdx = sr.questions.indexOf(q);
                      return (
                        <View
                          key={q.id}
                          className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 gap-2"
                        >
                          <Text className="text-sm font-medium text-foreground">
                            {origIdx + 1}. {q.question}
                          </Text>
                          <View className="gap-1">
                            {q.options.map((opt, i) => (
                              <View
                                key={i}
                                className={`flex-row items-center gap-2 p-2 rounded-lg ${
                                  i === q.correct_index
                                    ? "bg-green-500/10 border border-green-500/30"
                                    : i === sr.answers[origIdx]
                                    ? "bg-destructive/10 border border-destructive/30"
                                    : ""
                                }`}
                              >
                                <View className="w-5 h-5 rounded-full border border-border items-center justify-center">
                                  <Text className="text-[10px] font-semibold text-muted-foreground">
                                    {String.fromCharCode(65 + i)}
                                  </Text>
                                </View>
                                <Text className="text-sm text-foreground flex-1">
                                  {opt}
                                </Text>
                                {i === q.correct_index && (
                                  <CheckCircle2
                                    size={14}
                                    className="text-green-500"
                                  />
                                )}
                                {i === sr.answers[origIdx] &&
                                  i !== q.correct_index && (
                                    <XCircle
                                      size={14}
                                      className="text-destructive"
                                    />
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
                )
            )}

            <Button onPress={handleExit} className="w-full">
              <Text className="text-primary-foreground">Back to Exams</Text>
            </Button>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-5">
          <View className="items-center gap-3">
            <Text className="text-5xl">
              {totalPct >= 70 ? "🏆" : totalPct >= 50 ? "👍" : "💪"}
            </Text>
            <Text className="text-2xl font-bold text-foreground">
              {totalPct}% Overall
            </Text>
            <Text className="text-muted-foreground">
              {totalScore} / {totalQs} correct — {examName}
            </Text>
            <View className="w-48">
              <Progress value={totalPct} />
            </View>
          </View>

          <View className="gap-3">
            {subjectResults.map((sr) => (
              <View
                key={sr.id}
                className={`p-4 rounded-xl border ${
                  sr.pct >= 50
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Text className="text-xl">{sr.icon}</Text>
                    <Text className="font-semibold text-foreground">
                      {sr.name}
                    </Text>
                  </View>
                  <Text className="font-bold text-foreground">
                    {sr.pct}%
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground mt-1">
                  {sr.score} / {sr.total} correct
                </Text>
                <View className="mt-2">
                  <Progress value={sr.pct} />
                </View>
              </View>
            ))}
          </View>

          {subjectResults.some((sr) => sr.wrong.length > 0) && (
            <Button
              variant="outline"
              onPress={() => setReviewWrong(true)}
              className="w-full flex-row items-center justify-center gap-2"
            >
              <Eye size={16} className="text-foreground" />
              <Text className="text-foreground">Review Wrong Answers</Text>
            </Button>
          )}

          <Button onPress={handleExit} className="w-full">
            <Text className="text-primary-foreground">Back to Exams</Text>
          </Button>
        </View>
      </ScrollView>
    );
  }

  const activeQs = questionsBySubject[activeSubject] || [];
  const activeIdx = currentIndexes[activeSubject] || 0;
  const activeQ = activeQs[activeIdx];
  const totalAnswered = Object.values(answers).reduce(
    (acc, subjAnswers) => acc + Object.keys(subjAnswers).length,
    0
  );
  const totalQuestions = Object.values(questionsBySubject).reduce(
    (acc, qs) => acc + qs.length,
    0
  );

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
                timeLeft < 300 ? "text-destructive" : "text-muted-foreground"
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

        <Text className="text-xs text-center text-muted-foreground">
          {totalAnswered} / {totalQuestions} answered
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          <View className="flex-row gap-1 bg-muted rounded-xl p-1">
            {selectedSubjects.map((subj) => {
              const subjQs = questionsBySubject[subj.id] || [];
              const subjAnswered = Object.keys(answers[subj.id] || {}).length;
              const isActive = activeSubject === subj.id;
              return (
                <Pressable
                  key={subj.id}
                  onPress={() => setActiveSubject(subj.id)}
                  className={`px-3 py-2 rounded-lg ${
                    isActive ? "bg-primary" : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {subj.icon} {subj.name}{" "}
                    <Text className="opacity-70">
                      ({subjAnswered}/{subjQs.length})
                    </Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {activeQ ? (
          <View className="gap-3">
            <Progress
              value={((activeIdx + 1) / activeQs.length) * 100}
            />
            <Text className="text-xs text-muted-foreground text-center">
              Question {activeIdx + 1} of {activeQs.length}
            </Text>

            <View className="p-4 rounded-2xl bg-card border border-border">
              <Text className="text-foreground font-medium leading-relaxed">
                {activeQ.question}
              </Text>
            </View>

            <View className="gap-2 mb-4">
              {activeQ.options.map((opt, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    setAnswers((a) => ({
                      ...a,
                      [activeSubject]: {
                        ...a[activeSubject],
                        [activeIdx]: i,
                      },
                    }))
                  }
                  className={`flex-row items-center gap-3 p-3.5 rounded-xl border ${
                    answers[activeSubject]?.[activeIdx] === i
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <View className="w-7 h-7 rounded-full border border-border items-center justify-center">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground flex-1">
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                variant="outline"
                disabled={activeIdx === 0}
                onPress={() =>
                  setCurrentIndexes((c) => ({
                    ...c,
                    [activeSubject]: c[activeSubject] - 1,
                  }))
                }
                className="flex-1"
              >
                <Text className="text-foreground">Previous</Text>
              </Button>
              {activeIdx + 1 < activeQs.length ? (
                <Button
                  onPress={() =>
                    setCurrentIndexes((c) => ({
                      ...c,
                      [activeSubject]: c[activeSubject] + 1,
                    }))
                  }
                  className="flex-1"
                >
                  <Text className="text-primary-foreground">Next</Text>
                </Button>
              ) : (
                <>
                  {(() => {
                    const nextIncomplete = selectedSubjects.find((s) => {
                      if (s.id === activeSubject) return false;
                      const sQs = questionsBySubject[s.id] || [];
                      const sAnswered = Object.keys(
                        answers[s.id] || {}
                      ).length;
                      return sAnswered < sQs.length;
                    });
                    if (nextIncomplete) {
                      return (
                        <Button
                          variant="secondary"
                          onPress={() => {
                            setActiveSubject(nextIncomplete.id);
                            const subjAnswers =
                              answers[nextIncomplete.id] || {};
                            const subjQs =
                              questionsBySubject[nextIncomplete.id] || [];
                            const firstUnanswered = subjQs.findIndex(
                              (_, i) => subjAnswers[i] === undefined
                            );
                            setCurrentIndexes((c) => ({
                              ...c,
                              [nextIncomplete.id]:
                                firstUnanswered >= 0 ? firstUnanswered : 0,
                            }));
                          }}
                          className="flex-1"
                        >
                          <Text className="text-foreground">
                            Next Subject →
                          </Text>
                        </Button>
                      );
                    }
                    return null;
                  })()}
                  <Button
                    onPress={handleSubmit}
                    className="flex-1 bg-green-600"
                  >
                    <Text className="text-white font-semibold">
                      Submit Exam
                    </Text>
                  </Button>
                </>
              )}
            </View>

            <View className="flex-row flex-wrap gap-1.5 justify-center pt-3">
              {activeQs.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    setCurrentIndexes((c) => ({
                      ...c,
                      [activeSubject]: i,
                    }))
                  }
                  className={`w-7 h-7 rounded-lg items-center justify-center ${
                    i === activeIdx
                      ? "bg-primary"
                      : answers[activeSubject]?.[i] !== undefined
                      ? "bg-primary/20"
                      : "bg-muted"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      i === activeIdx
                        ? "text-primary-foreground"
                        : answers[activeSubject]?.[i] !== undefined
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
        ) : (
          <View className="items-center py-12">
            <Text className="text-muted-foreground">
              No questions loaded for this subject
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
