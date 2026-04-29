import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export function useStreak() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data: profile, error: err } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak")
        .eq("id", user.id)
        .single();
      if (err) {
        setError(err.message);
      } else if (profile) {
        setData({
          currentStreak: profile.current_streak ?? 0,
          longestStreak: profile.longest_streak ?? 0,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch streak");
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { data, isLoading, error, refetch: fetchStreak };
}
