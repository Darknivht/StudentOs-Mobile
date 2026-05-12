import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import type { ChatMessage, Conversation } from "../types/chat";

const PAGE_SIZE = 25;

export function useDirectMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastIdRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (reset = false) => {
    if (!user || !conversationId) return;

    setLoading(true);
    const offset = reset ? 0 : messages.length;

    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (!error && data) {
      const sorted = (data as ChatMessage[]).reverse();
      setMessages((prev) => (reset ? sorted : [...prev, ...sorted]));
      setHasMore(data.length === PAGE_SIZE);
      if (data.length > 0) {
        lastIdRef.current = data[data.length - 1].id;
      }
    }

    setLoading(false);
  }, [user, conversationId, messages.length]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(true);
    }
  }, [conversationId]);

  const createConversation = useCallback(async (recipientId: string) => {
    if (!user) return null;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .contains("participants", [user.id, recipientId])
      .single();

    if (existing) return existing.id;

    const { data } = await supabase
      .from("conversations")
      .insert({
        participants: [user.id, recipientId],
      })
      .select("id")
      .single();

    return data?.id || null;
  }, [user]);

  const sendMessage = useCallback(async (content: string, recipientId: string, mediaUrl?: string, replyToId?: string) => {
    if (!user || !conversationId) return null;

    const { data, error } = await supabase
      .from("direct_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        media_url: mediaUrl || null,
        reply_to_id: replyToId || null,
      })
      .select("*")
      .single();

    if (!error && data) {
      setMessages((prev) => [data as ChatMessage, ...prev]);
    }
    return data as ChatMessage | null;
  }, [user, conversationId]);

  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length) return;

    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .in("id", messageIds);
  }, []);

  return {
    messages,
    loading,
    hasMore,
    fetchMessages,
    createConversation,
    sendMessage,
    markAsRead,
  };
}