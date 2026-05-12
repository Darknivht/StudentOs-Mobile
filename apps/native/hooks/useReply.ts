import { useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import type { ChatMessage } from "../types/chat";

export function useReply() {
  const { user } = useAuth();

  const getReplyPreview = useCallback(async (messageId: string): Promise<string | null> => {
    if (!user) return null;

    const tables = ["direct_messages" as const, "group_messages" as const];
    for (const table of tables) {
      const { data } = await supabase
        .from(table)
        .select("content")
        .eq("id", messageId)
        .single();

      if (data) {
        const msg = data as unknown as { content: string };
        return msg.content.length > 80
          ? msg.content.substring(0, 80) + "..."
          : msg.content;
      }
    }
    return null;
  }, [user]);

  const createReply = useCallback(async (
    content: string,
    replyToId: string,
    table: "direct_messages" | "group_messages",
    extraFields: Record<string, string>
  ): Promise<ChatMessage | null> => {
    if (!user) return null;

    const replyPreview = await getReplyPreview(replyToId);

    const { data, error } = await supabase
      .from(table)
      .insert({
        ...(extraFields as any),
        sender_id: user.id,
        content,
        reply_to_id: replyToId,
        reply_preview: replyPreview,
      })
      .select("*")
      .single();

    if (!error && data) {
      return data as unknown as ChatMessage;
    }
    return null;
  }, [user, getReplyPreview]);

  return { createReply, getReplyPreview };
}