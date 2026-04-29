import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";
import { useAppStore } from "../stores/appStore";

function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

interface StudyTimeData {
  todayMinutes: number;
  dailyTarget: number;
  weeklyData: Array<{ date: string; minutes: number }>;
}

export function useStudyTime() {
  const user = useAuthStore((s) => s.user);
  const dailyTarget = useAppStore((s) => s.dailyStudyTarget);
  const [data, setData] = useState<StudyTimeData>({
    todayMinutes: 0,
    dailyTarget,
    weeklyData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudyTime = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const startOfToday = getStartOfToday().toISOString();
      const { data: todaySessions, error: todayErr } = await supabase
        .from("study_sessions")
        .select("duration_minutes")
        .eq("user_id", user.id)
        .gte("created_at", startOfToday);

      if (todayErr) {
        setError(todayErr.message);
        setIsLoading(false);
        return;
      }

      const todayMinutes = (todaySessions || []).reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0,
      );

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: weekSessions } = await supabase
        .from("study_sessions")
        .select("created_at, duration_minutes")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo.toISOString());

      const last7Days = getLast7Days();
      const weeklyMap: Record<string, number> = {};
      last7Days.forEach((d) => (weeklyMap[d] = 0));

      (weekSessions || []).forEach((s) => {
        const date = new Date(s.created_at).toISOString().split("T")[0];
        if (date in weeklyMap) {
          weeklyMap[date] += s.duration_minutes || 0;
        }
      });

      const weeklyData = last7Days.map((date) => ({
        date,
        minutes: weeklyMap[date] || 0,
      }));

      setData({ todayMinutes, dailyTarget, weeklyData });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch study time");
    }
    setIsLoading(false);
  }, [user, dailyTarget]);

  useEffect(() => {
    fetchStudyTime();
  }, [fetchStudyTime]);

  return { data, isLoading, error, refetch: fetchStudyTime };
}
