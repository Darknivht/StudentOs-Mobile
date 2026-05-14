import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuthContext";
import { supabase } from "../services/supabase";

export function useSafety() {
  const { user } = useAuth();
  const [parentalPin, setParentalPin] = useState<string | null>(null);
  const [contentFilterEnabled, setContentFilterEnabled] = useState(false);
  const [safeSearchEnabled, setSafeSearchEnabled] = useState(false);
  const [isUnder14, setIsUnder14] = useState(false);
  const [dailyTimeLimit, setDailyTimeLimit] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSafetySettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("parental_pin, content_filter_enabled, safe_search_enabled, is_under_14, daily_time_limit")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      const profile = data as any;
      setParentalPin(profile.parental_pin || null);
      setContentFilterEnabled(!!profile.content_filter_enabled);
      setSafeSearchEnabled(!!profile.safe_search_enabled);
      setIsUnder14(!!profile.is_under_14);
      setDailyTimeLimit(profile.daily_time_limit || 0);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSafetySettings();
    }
  }, [user, fetchSafetySettings]);

  const setPin = useCallback(async (pin: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from("profiles")
      .update({ parental_pin: pin })
      .eq("id", user.id);

    if (!error) {
      setParentalPin(pin);
      return true;
    }
    return false;
  }, [user]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!parentalPin) return false;
    return pin === parentalPin;
  }, [parentalPin]);

  const toggleContentFilter = useCallback(async (enabled: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ content_filter_enabled: enabled })
      .eq("id", user.id);

    if (!error) {
      setContentFilterEnabled(enabled);
    }
  }, [user]);

  const toggleSafeSearch = useCallback(async (enabled: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ safe_search_enabled: enabled })
      .eq("id", user.id);

    if (!error) {
      setSafeSearchEnabled(enabled);
    }
  }, [user]);

  const toggleUnder14 = useCallback(async (enabled: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_under_14: enabled })
      .eq("id", user.id);

    if (!error) {
      setIsUnder14(enabled);
    }
  }, [user]);

  const setDailyLimit = useCallback(async (minutes: number) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ daily_time_limit: minutes })
      .eq("id", user.id);

    if (!error) {
      setDailyTimeLimit(minutes);
    }
  }, [user]);

  return {
    parentalPin,
    contentFilterEnabled,
    safeSearchEnabled,
    isUnder14,
    dailyTimeLimit,
    loading,
    setPin,
    verifyPin,
    toggleContentFilter,
    toggleSafeSearch,
    toggleUnder14,
    setDailyLimit,
    fetchSafetySettings,
  };
}