import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import type { Database } from "@studentos/shared";

type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
type ChatMessageInsert = Database["public"]["Tables"]["chat_messages"]["Insert"];

export function useChatMessages(
  mode: "course" | "note",
  targetId?: string | null
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat-messages", user?.id, mode, targetId],
    queryFn: async () => {
      if (!user || !targetId) return [];
      const col = mode === "course" ? "course_id" : "note_id";
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .eq(col, targetId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!user && !!targetId,
  });
}

export function useInsertChatMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Omit<ChatMessageInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({ ...message, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: (_data, variables) => {
      const key = variables.course_id
        ? ["chat-messages", user?.id, "course", variables.course_id]
        : ["chat-messages", user?.id, "note", variables.note_id];
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
