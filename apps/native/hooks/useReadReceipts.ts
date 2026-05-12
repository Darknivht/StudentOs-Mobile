import { useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";

export function useReadReceipts() {
  const { user } = useAuth();

  const markMessagesAsRead = useCallback(async (
    messageIds: string[],
    table: "direct_messages" | "group_messages"
  ) => {
    if (!user || !messageIds.length) return;

    const { error } = await supabase
      .from(table)
      .update({ is_read: true })
      .in("id", messageIds);

    if (error) {
      console.warn("Failed to mark messages as read:", error.message);
    }
  }, [user]);

  const markConversationAsRead = useCallback(async (
    conversationId: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (error) {
      console.warn("Failed to mark conversation as read:", error.message);
    }
  }, [user]);

  const markGroupAsRead = useCallback(async (
    groupId: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("group_messages")
      .update({ is_read: true })
      .eq("group_id", groupId)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (error) {
      console.warn("Failed to mark group messages as read:", error.message);
    }
  }, [user]);

  return { markMessagesAsRead, markConversationAsRead, markGroupAsRead };
}