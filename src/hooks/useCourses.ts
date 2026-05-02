import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";

export interface CourseWithProgress {
  id: string;
  title: string;
  description?: string;
  color?: string;
  emoji?: string;
  notesProgress: number;
  quizzesProgress: number;
  flashcardsProgress: number;
  overallProgress: number;
}

export function useCourses() {
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      if (supabase && user) {
        const { data, error } = await supabase
          .from("courses")
          .select("id, title, description, color, emoji")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          const coursesWithProgress: CourseWithProgress[] = await Promise.all(
            data.map(async (c) => {
              let notesCount = 0;
              let flashcardsCount = 0;
              let quizzesCount = 0;

              try {
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                const [notesRes, flashRes, quizRes] = await Promise.allSettled([
                  supabase!
                    .from("notes")
                    .select("id", { count: "exact", head: true })
                    .eq("course_id", c.id),
                  supabase!
                    .from("flashcards")
                    .select("id", { count: "exact", head: true })
                    .eq("course_id", c.id),
                  supabase!
                    .from("quiz_attempts")
                    .select("id", { count: "exact", head: true })
                    .eq("course_id", c.id),
                ]);

                notesCount =
                  notesRes.status === "fulfilled"
                    ? notesRes.value.count || 0
                    : 0;
                flashcardsCount =
                  flashRes.status === "fulfilled"
                    ? flashRes.value.count || 0
                    : 0;
                quizzesCount =
                  quizRes.status === "fulfilled" ? quizRes.value.count || 0 : 0;
              } catch {
                // Progress defaults to 0
              }

              const notesProgress = Math.min((notesCount / 10) * 100, 100);
              const quizzesProgress = Math.min((quizzesCount / 5) * 100, 100);
              const flashcardsProgress = Math.min(
                (flashcardsCount / 20) * 100,
                100,
              );
              const overallProgress = Math.round(
                notesProgress * 0.3 +
                  quizzesProgress * 0.3 +
                  flashcardsProgress * 0.4,
              );

              return {
                id: c.id,
                title: c.title,
                description: c.description ?? undefined,
                color: c.color ?? undefined,
                emoji: c.emoji ?? undefined,
                notesProgress,
                quizzesProgress,
                flashcardsProgress,
                overallProgress,
              };
            }),
          );
          setCourses(coursesWithProgress);
        }
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const createCourse = useCallback(
    async (params: {
      title: string;
      description?: string;
      color?: string;
      emoji?: string;
    }): Promise<CourseWithProgress | null> => {
      if (!supabase || !user) return null;

      const { data, error } = await supabase
        .from("courses")
        .insert({
          user_id: user.id,
          title: params.title,
          description: params.description ?? null,
          color: params.color ?? null,
          emoji: params.emoji ?? null,
        })
        .select("id, title, description, color, emoji")
        .single();

      if (error) {
        console.error("Failed to create course:", error);
        return null;
      }

      await fetchCourses();
      return data
        ? {
            id: data.id,
            title: data.title,
            description: data.description ?? undefined,
            color: data.color ?? undefined,
            emoji: data.emoji ?? undefined,
            notesProgress: 0,
            quizzesProgress: 0,
            flashcardsProgress: 0,
            overallProgress: 0,
          }
        : null;
    },
    [user, fetchCourses],
  );

  const deleteCourse = useCallback(
    async (id: string): Promise<void> => {
      if (!supabase || !user) return;

      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to delete course:", error);
      } else {
        await fetchCourses();
      }
    },
    [user, fetchCourses],
  );

  return {
    courses,
    isLoading,
    refetch: fetchCourses,
    createCourse,
    deleteCourse,
  };
}
