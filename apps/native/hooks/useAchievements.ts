import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "study_time" | "streak" | "social" | "academic" | "exam_prep";
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  study_time: "Study Time",
  streak: "Streak",
  social: "Social",
  academic: "Academic Mastery",
  exam_prep: "Exam Prep",
};

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const [{ data: allAchievements }, { data: userAchievements }] = await Promise.all([
      supabase.from("achievements").select("*"),
      supabase.from("user_achievements").select("*").eq("user_id", user.id),
    ]);

    if (allAchievements) {
      const unlocked = new Set<string>();
      const unlockedMap = new Map<string, string>();

      if (userAchievements) {
        (userAchievements as any[]).forEach((ua) => {
          unlocked.add(ua.achievement_id);
          unlockedMap.set(ua.achievement_id, ua.unlocked_at);
        });
      }

      const merged: Achievement[] = (allAchievements as any[]).map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.requirement_type as Achievement["category"],
        requirement_type: a.requirement_type,
        requirement_value: a.requirement_value,
        xp_reward: a.xp_reward,
        is_unlocked: unlocked.has(a.id),
        unlocked_at: unlockedMap.get(a.id) || null,
        progress: unlocked.has(a.id) ? 1 : 0,
      }));

      setAchievements(merged);
      setUnlockedIds(unlocked);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user, fetchAchievements]);

  const getByCategory = useCallback((category: string) => {
    return achievements.filter((a) => a.category === category);
  }, [achievements]);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter((a) => a.is_unlocked).length;
  }, [achievements]);

  const getCategoryLabel = useCallback((category: string) => {
    return CATEGORY_LABELS[category] || category;
  }, []);

  return {
    achievements,
    unlockedIds,
    loading,
    fetchAchievements,
    getByCategory,
    getUnlockedCount,
    getCategoryLabel,
  };
}