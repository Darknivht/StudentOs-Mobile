import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import type { Database } from "@studentos/shared";

type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

export function useFlashcards(courseId?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["flashcards", user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id);
      if (courseId) query = query.eq("course_id", courseId);
      const { data, error } = await query.order("created_at", { ascending: true });
      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!user,
  });
}

export function useDueFlashcards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["flashcards-due", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .lte("next_review", new Date().toISOString())
        .order("next_review", { ascending: true });
      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!user,
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & FlashcardUpdate) => {
      const { data, error } = await supabase
        .from("flashcards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Flashcard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["flashcards-due"] });
    },
  });
}

export function useCreateFlashcards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flashcards: Omit<FlashcardInsert, "user_id">[]) => {
      if (!user) throw new Error("Not authenticated");
      const inserts = flashcards.map((f) => ({ ...f, user_id: user.id }));
      const { data, error } = await supabase
        .from("flashcards")
        .insert(inserts)
        .select();
      if (error) throw error;
      return data as Flashcard[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["flashcards-due"] });
    },
  });
}
