import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import type { Database } from "@studentos/shared";

type QuizAttempt = Database["public"]["Tables"]["quiz_attempts"]["Row"];
type QuizAttemptInsert = Database["public"]["Tables"]["quiz_attempts"]["Insert"];

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export function useQuizAttempts(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quiz-attempts", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user,
  });
}

export function useCreateQuizAttempt() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attempt: Omit<QuizAttemptInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({ ...attempt, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as QuizAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    },
  });
}
