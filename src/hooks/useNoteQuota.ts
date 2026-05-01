import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";
import { SUBSCRIPTION_TIERS } from "../lib/constants";
import type { SubscriptionTier } from "../types";

function getStartOfTodayUTC(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function useNoteQuota() {
  const user = useAuthStore((s) => s.user);
  const subscription = useAuthStore((s) => s.subscription);
  const [notesCreatedToday, setNotesCreatedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuota = useCallback(async () => {
    if (!supabase || !user) {
      setNotesCreatedToday(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { count, error } = await supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", getStartOfTodayUTC());

      if (!error && count !== null) {
        setNotesCreatedToday(count);
      }
    } catch (err) {
      console.error("Failed to fetch note quota:", err);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const tier = subscription as SubscriptionTier;
  const quotaLimit = SUBSCRIPTION_TIERS[tier].noteQuota;
  const isQuotaExceeded =
    quotaLimit === Infinity ? false : notesCreatedToday >= quotaLimit;
  const remainingQuota =
    quotaLimit === Infinity
      ? Infinity
      : Math.max(0, quotaLimit - notesCreatedToday);

  return {
    notesCreatedToday,
    quotaLimit,
    remainingQuota,
    isQuotaExceeded,
    tier,
    isLoading,
    refetch: fetchQuota,
  };
}
