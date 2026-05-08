import { useQuery } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";

export interface StudyStats {
  dueFlashcards: number;
  focusMinutesToday: number;
  dailyGoalMinutes: number;
  quizzesCompletedToday: number;
  notesCreatedToday: number;
}

export function useStudyStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["study-stats", user?.id],
    queryFn: async (): Promise<StudyStats> => {
      if (!user) {
        return {
          dueFlashcards: 0,
          focusMinutesToday: 0,
          dailyGoalMinutes: 120,
          quizzesCompletedToday: 0,
          notesCreatedToday: 0,
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [flashcardsRes, pomodoroRes, profileRes, quizzesRes, notesRes] =
        await Promise.all([
          supabase
            .from("flashcards")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .lte("next_review", new Date().toISOString()),
          supabase
            .from("pomodoro_sessions")
            .select("duration_minutes")
            .eq("user_id", user.id)
            .gte("created_at", todayISO),
          supabase
            .from("profiles")
            .select("daily_time_limit, quizzes_today, notes_today")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("quiz_attempts")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("completed_at", todayISO),
          supabase
            .from("notes")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", todayISO),
        ]);

      const focusMinutes = (pomodoroRes.data || []).reduce(
        (sum: number, s: { duration_minutes: number | null }) => sum + (s.duration_minutes ?? 0),
        0
      );

      return {
        dueFlashcards: flashcardsRes.count ?? 0,
        focusMinutesToday: focusMinutes,
        dailyGoalMinutes: profileRes.data?.daily_time_limit ?? 120,
        quizzesCompletedToday: quizzesRes.count ?? 0,
        notesCreatedToday: notesRes.count ?? 0,
      };
    },
    enabled: !!user,
    refetchInterval: 60_000,
  });
}
