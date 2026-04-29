import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  created_at: string;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const { data, error: err } = await supabase
        .from("announcements")
        .select("id, title, message, type, created_at")
        .eq("is_active", true)
        .lte("starts_at", now)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("created_at", { ascending: false })
        .limit(3);

      if (err) {
        setError(err.message);
      } else {
        setAnnouncements((data || []) as Announcement[]);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch announcements",
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, isLoading, error, refetch: fetchAnnouncements };
}
