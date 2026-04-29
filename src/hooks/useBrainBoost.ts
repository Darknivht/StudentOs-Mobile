import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";

interface BrainBoostQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
}

interface BrainBoostState {
  questions: BrainBoostQuestion[];
  currentQuestionIndex: number;
  answers: number[];
  score: number;
  isCompleted: boolean;
  isCompletedToday: boolean;
  xpEarned: number;
  isLoading: boolean;
  error: string | null;
}

export function useBrainBoost() {
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<BrainBoostState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    isCompleted: false,
    isCompletedToday: false,
    xpEarned: 0,
    isLoading: true,
    error: null,
  });

  const checkCompletion = useCallback(async () => {
    if (!supabase || !user) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: profile } = await supabase
        .from("profiles")
        .select("brain_boost_completed_at")
        .eq("id", user.id)
        .single();

      if (profile?.brain_boost_completed_at) {
        const completedDate = new Date(profile.brain_boost_completed_at)
          .toISOString()
          .split("T")[0];
        if (completedDate === today) {
          setState((s) => ({
            ...s,
            isCompletedToday: true,
            isCompleted: true,
            isLoading: false,
          }));
          return;
        }
      }
    } catch {
      // Profile may not exist yet — that's fine, not completed
    }
    setState((s) => ({ ...s, isLoading: false }));
  }, [user]);

  const fetchQuestions = useCallback(async () => {
    if (!supabase || !user) return;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase
        .from("brain_boost_questions")
        .select("id, question, options, correct_index")
        .eq("is_active", true)
        .limit(5);

      if (error || !data || data.length === 0) {
        const { data: quizData, error: quizErr } = await supabase
          .from("quiz_questions")
          .select("id, question, options, correct_index")
          .limit(5);

        if (quizErr || !quizData || quizData.length === 0) {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: "No questions available right now",
          }));
          return;
        }
        const questions = (quizData as BrainBoostQuestion[]).slice(0, 5);
        setState((s) => ({
          ...s,
          questions,
          answers: new Array(questions.length).fill(-1),
          isLoading: false,
        }));
        return;
      }

      const questions = (data as BrainBoostQuestion[]).slice(0, 5);
      setState((s) => ({
        ...s,
        questions,
        answers: new Array(questions.length).fill(-1),
        isLoading: false,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: e instanceof Error ? e.message : "Failed to fetch questions",
      }));
    }
  }, [user]);

  const answerQuestion = useCallback(
    (questionIndex: number, answerIndex: number) => {
      setState((prev) => {
        const newAnswers = [...prev.answers];
        newAnswers[questionIndex] = answerIndex;
        const isCorrect =
          prev.questions[questionIndex]?.correct_index === answerIndex;
        return {
          ...prev,
          answers: newAnswers,
          score: prev.score + (isCorrect ? 1 : 0),
        };
      });
    },
    [],
  );

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.min(
        prev.currentQuestionIndex + 1,
        prev.questions.length - 1,
      ),
    }));
  }, []);

  const completeBoost = useCallback(async () => {
    if (!supabase || !user) return;
    const xp = state.score * 10;
    setState((prev) => ({
      ...prev,
      isCompleted: true,
      xpEarned: xp,
      isCompletedToday: true,
    }));
    try {
      await supabase
        .from("profiles")
        .update({ brain_boost_completed_at: new Date().toISOString() })
        .eq("id", user.id);
      await supabase.from("weekly_xp").upsert(
        {
          user_id: user.id,
          xp_earned: xp,
          source: "brain_boost",
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,created_at,source" },
      );
    } catch {
      // Non-critical — XP update can be retried
    }
  }, [user, state.score]);

  const getTimeUntilMidnight = useCallback(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }, []);

  useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  return {
    ...state,
    fetchQuestions,
    answerQuestion,
    nextQuestion,
    completeBoost,
    getTimeUntilMidnight,
  };
}
