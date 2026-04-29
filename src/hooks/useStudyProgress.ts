import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";

function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

interface StudyProgressData {
  notesCreated: number;
  quizzesCompleted: number;
  flashcardsReviewed: number;
  focusMinutes: number;
}

export function useStudyProgress() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<StudyProgressData>({
    notesCreated: 0,
    quizzesCompleted: 0,
    flashcardsReviewed: 0,
    focusMinutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const startOfToday = getStartOfToday().toISOString();
      const userId = user.id;

      const [notesRes, quizzesRes, flashcardsRes, focusRes] =
        await Promise.allSettled([
          supabase
            .from("notes")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", startOfToday),
          supabase
            .from("quiz_attempts")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", startOfToday),
          supabase
            .from("flashcards")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("updated_at", startOfToday),
          supabase
            .from("focus_sessions")
            .select("duration_minutes")
            .eq("user_id", userId)
            .gte("created_at", startOfToday),
        ]);

      const notesCreated =
        notesRes.status === "fulfilled" ? notesRes.value.count || 0 : 0;
      const quizzesCompleted =
        quizzesRes.status === "fulfilled" ? quizzesRes.value.count || 0 : 0;
      const flashcardsReviewed =
        flashcardsRes.status === "fulfilled"
          ? flashcardsRes.value.count || 0
          : 0;
      const focusMinutes =
        focusRes.status === "fulfilled"
          ? (focusRes.value.data || []).reduce(
              (sum: number, s: { duration_minutes: number }) =>
                sum + (s.duration_minutes || 0),
              0,
            )
          : 0;

      setData({
        notesCreated,
        quizzesCompleted,
        flashcardsReviewed,
        focusMinutes,
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch study progress",
      );
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { data, isLoading, error, refetch: fetchProgress };
}
