import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import type { ChatMessage } from "../types/chat";

type MessageHandler = (message: ChatMessage) => void;

export function useChat(channelName: string, filter?: Record<string, unknown>) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const handlerRef = useRef<MessageHandler | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const onMessage = useCallback((handler: MessageHandler) => {
    handlerRef.current = handler;
  }, []);

  const subscribe = useCallback(() => {
    if (!user) return;

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: user.id },
      },
    });

    if (filter) {
      channel.on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: filter as any,
      }, (payload) => {
        if (handlerRef.current) {
          handlerRef.current(payload.new as ChatMessage);
        }
      });
    } else {
      channel.on("broadcast", { event: "message" }, (payload) => {
        if (handlerRef.current) {
          handlerRef.current(payload.payload as ChatMessage);
        }
      });
    }

    channel.subscribe((status) => {
      setIsConnected(status === "SUBSCRIBED");
    });

    channelRef.current = channel;
  }, [user, channelName, filter]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const handleAppStateChange = useCallback((nextState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
      unsubscribe();
      subscribe();
    }
    appStateRef.current = nextState;
  }, [subscribe, unsubscribe]);

  useEffect(() => {
    if (user) {
      subscribe();
    }
    return () => {
      unsubscribe();
    };
  }, [user, subscribe, unsubscribe]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  const queuePending = useCallback((message: ChatMessage) => {
    setPendingMessages((prev) => [...prev, message]);
  }, []);

  const flushPending = useCallback(() => {
    setPendingMessages([]);
  }, []);

  return {
    isConnected,
    pendingMessages,
    onMessage,
    subscribe,
    unsubscribe,
    queuePending,
    flushPending,
  };
}