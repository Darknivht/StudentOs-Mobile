import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  school: string | null;
  total_xp: number;
  weekly_xp: number;
  level: number;
  rank: number;
}

export function useLeaderboard() {
  const { user } = useAuth();
  const [weekly, setWeekly] = useState<LeaderboardEntry[]>([]);
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (filter?: string) => {
    if (!user) return;

    setLoading(true);

    const [{ data: weeklyData }, { data: allTimeData }] = await Promise.all([
      supabase
        .from("weekly_xp")
        .select("*")
        .order("xp_earned", { ascending: false })
        .limit(100),
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, school, total_xp, level")
        .order("total_xp", { ascending: false })
        .limit(100),
    ]);

    if (weeklyData) {
      const entries = (weeklyData as any[]).map((entry, index) => ({
        user_id: entry.user_id,
        full_name: "",
        avatar_url: null,
        school: null,
        total_xp: entry.xp_earned,
        weekly_xp: entry.xp_earned,
        level: Math.floor(entry.xp_earned / 1000) + 1,
        rank: index + 1,
      }));
      setWeekly(entries);
    }

    if (allTimeData) {
      const entries = (allTimeData as any[]).map((entry, index) => ({
        user_id: entry.id,
        full_name: entry.full_name || "",
        avatar_url: entry.avatar_url,
        school: entry.school,
        total_xp: entry.total_xp || 0,
        weekly_xp: 0,
        level: entry.level || 1,
        rank: index + 1,
      }));
      setAllTime(entries);

      const found = entries.find((e) => e.user_id === user.id);
      if (found) setUserRank(found);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user, fetchLeaderboard]);

  return { weekly, allTime, userRank, loading, fetchLeaderboard };
}