import { useState, useCallback, useRef } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";
import { SUBSCRIPTION_TIERS } from "../lib/constants";
import type { SubscriptionTier } from "../types";
import {
  generateNoteSummary,
  type SummaryLength,
} from "../services/notes/aiSummary";
import {
  sendSocraticMessage,
  type SocraticMessage,
} from "../services/notes/aiSocratic";
import type { NoteWithCourse } from "../types/note";

function getStartOfTodayUTC(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function useNoteAI() {
  const user = useAuthStore((s) => s.user);
  const subscription = useAuthStore((s) => s.subscription);
  const [isStreaming, setIsStreaming] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [socraticMessages, setSocraticMessages] = useState<SocraticMessage[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const tier = subscription as SubscriptionTier;
  const aiCallLimit = SUBSCRIPTION_TIERS[tier].aiCalls;

  const checkQuota = useCallback(async (): Promise<boolean> => {
    if (!supabase || !user) return false;
    if (aiCallLimit === Infinity) return true;

    try {
      const { count, error: qErr } = await supabase
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", getStartOfTodayUTC());

      if (qErr) {
        console.error("Failed to check AI quota:", qErr);
        return true;
      }

      return (count ?? 0) < aiCallLimit;
    } catch {
      return true;
    }
  }, [user, aiCallLimit]);

  const recordAIUsage = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      await supabase.from("ai_usage").insert({
        user_id: user.id,
        feature: "notes_ai",
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to record AI usage:", err);
    }
  }, [user]);

  const generateSummary = useCallback(
    async (note: NoteWithCourse, length: SummaryLength = "medium") => {
      const hasQuota = await checkQuota();
      if (!hasQuota) {
        setError("Daily AI call limit reached. Upgrade for more.");
        return;
      }

      setIsStreaming(true);
      setSummaryText("");
      setError(null);
      abortRef.current = false;

      let fullText = "";
      await generateNoteSummary(
        note.content,
        note.title,
        length,
        (chunk) => {
          fullText += chunk;
          setSummaryText(fullText);
        },
        (err) => {
          setError(err.message || "Summary generation failed");
          setIsStreaming(false);
        },
        () => {
          setIsStreaming(false);
          recordAIUsage();
          if (supabase && user && !abortRef.current) {
            supabase
              .from("notes")
              .update({ summary: fullText })
              .eq("id", note.id)
              .eq("user_id", user.id)
              .then(() => {})
              .catch(() => {});
          }
        },
      );
    },
    [checkQuota, recordAIUsage, user],
  );

  const sendSocratic = useCallback(
    async (note: NoteWithCourse, userMessage: string) => {
      const hasQuota = await checkQuota();
      if (!hasQuota) {
        setError("Daily AI call limit reached. Upgrade for more.");
        return;
      }

      setIsStreaming(true);
      setError(null);
      abortRef.current = false;

      const updatedHistory = [
        ...socraticMessages,
        { role: "user" as const, content: userMessage },
      ];
      setSocraticMessages(updatedHistory);

      let fullText = "";
      await sendSocraticMessage(
        note.content,
        note.title,
        socraticMessages,
        (chunk) => {
          fullText += chunk;
        },
        (err) => {
          setError(err.message || "Socratic chat failed");
          setIsStreaming(false);
        },
        () => {
          setSocraticMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullText },
          ]);
          setIsStreaming(false);
          recordAIUsage();
        },
      );
    },
    [checkQuota, recordAIUsage, socraticMessages],
  );

  const startSocratic = useCallback(
    async (note: NoteWithCourse) => {
      const hasQuota = await checkQuota();
      if (!hasQuota) {
        setError("Daily AI call limit reached. Upgrade for more.");
        return;
      }

      setIsStreaming(true);
      setSocraticMessages([]);
      setError(null);
      abortRef.current = false;

      let fullText = "";
      await sendSocraticMessage(
        note.content,
        note.title,
        [],
        (chunk) => {
          fullText += chunk;
        },
        (err) => {
          setError(err.message || "Socratic chat failed");
          setIsStreaming(false);
        },
        () => {
          setSocraticMessages([{ role: "assistant", content: fullText }]);
          setIsStreaming(false);
          recordAIUsage();
        },
      );
    },
    [checkQuota, recordAIUsage],
  );

  const resetSummary = useCallback(() => {
    setSummaryText("");
    setError(null);
    abortRef.current = true;
  }, []);

  const resetSocratic = useCallback(() => {
    setSocraticMessages([]);
    setError(null);
    abortRef.current = true;
  }, []);

  return {
    isStreaming,
    summaryText,
    socraticMessages,
    error,
    generateSummary,
    sendSocratic,
    startSocratic,
    resetSummary,
    resetSocratic,
  };
}
