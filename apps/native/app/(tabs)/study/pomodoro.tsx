import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  CheckCircle,
  Settings,
  Minus,
  Plus,
  Shield,
} from "lucide-react-native";
import { useKeepAwake } from "expo-keep-awake";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { ErrorFallback } from "../../../components/ErrorFallback";
import { appStorage } from "../../../services/app-storage";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

type SessionType = "focus" | "short_break" | "long_break";

const DEFAULT_DURATIONS: Record<SessionType, number> = {
  focus: 25,
  short_break: 5,
  long_break: 15,
};

const DURATIONS_KEY = "pomodoro_custom_durations";

export default function PomodoroTimerScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useKeepAwake();

  const getStoredDurations = (): Record<SessionType, number> => {
    try {
      const stored = appStorage.getItemSync(DURATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_DURATIONS;
  };

  const [durations, setDurations] = useState<Record<SessionType, number>>(
    getStoredDurations
  );
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeLeft, setTimeLeft] = useState(durations.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(durations[sessionType] * 60);
    }
  }, [durations, sessionType, isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setIsRunning(false);

    if (sessionType === "focus" && user) {
      try {
        await supabase.from("pomodoro_sessions").insert({
          user_id: user.id,
          duration_minutes: durations.focus,
          session_type: "focus",
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          const newXP = (profile.total_xp || 0) + durations.focus;
          await supabase
            .from("profiles")
            .update({ total_xp: newXP })
            .eq("user_id", user.id);
        }

        setCompletedPomodoros((prev) => prev + 1);
        Toast.show({
          type: "success",
          text1: "Great work!",
          text2: `+${durations.focus} XP earned! Time for a break.`,
        });
      } catch (error) {
        console.error("Failed to save session:", error);
      }

      const nextBreak =
        (completedPomodoros + 1) % 4 === 0 ? "long_break" : "short_break";
      setSessionType(nextBreak);
      setTimeLeft(durations[nextBreak] * 60);
    } else {
      Toast.show({
        type: "info",
        text1: "Break over!",
        text2: "Ready to focus again?",
      });
      setSessionType("focus");
      setTimeLeft(durations.focus * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[sessionType] * 60);
  };

  const switchSession = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(durations[type] * 60);
  };

  const updateDuration = (type: SessionType, change: number) => {
    setDurations((prev) => {
      const newValue = Math.max(1, Math.min(120, prev[type] + change));
      const updated = { ...prev, [type]: newValue };
      appStorage.setItemSync(DURATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress =
    ((durations[sessionType] * 60 - timeLeft) /
      (durations[sessionType] * 60)) *
    100;

  const sessionColors: Record<SessionType, string> = {
    focus: "bg-primary",
    short_break: "bg-emerald-500",
    long_break: "bg-blue-500",
  };

  if (showSettings) {
    return (
      <View className="flex-1 bg-background p-6 gap-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-foreground">
            Timer Settings
          </Text>
          <Pressable onPress={() => setShowSettings(false)}>
            <Text className="text-primary font-medium">Done</Text>
          </Pressable>
        </View>

        {(["focus", "short_break", "long_break"] as const).map((type) => {
          const labels: Record<SessionType, string> = {
            focus: "Focus Duration",
            short_break: "Short Break",
            long_break: "Long Break",
          };
          const step = type === "focus" ? 5 : type === "short_break" ? 1 : 5;
          const max = type === "focus" ? 120 : type === "short_break" ? 30 : 60;
          const min = type === "focus" ? 5 : type === "short_break" ? 1 : 5;

          return (
            <Card key={type} className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  {type === "focus" ? (
                    <Brain size={16} className="text-primary" />
                  ) : (
                    <Coffee
                      size={16}
                      className={
                        type === "short_break"
                          ? "text-emerald-500"
                          : "text-blue-500"
                      }
                    />
                  )}
                  <Text className="font-medium text-foreground">
                    {labels[type]}
                  </Text>
                </View>
                <Text className="text-sm text-muted-foreground">
                  {durations[type]} min
                </Text>
              </View>
              <View className="flex-row items-center justify-center gap-4">
                <Pressable
                  onPress={() => updateDuration(type, -step)}
                  disabled={durations[type] <= min}
                  className="w-10 h-10 rounded-full border border-border items-center justify-center"
                >
                  <Minus size={16} className="text-foreground" />
                </Pressable>
                <Text className="text-2xl font-bold text-foreground w-16 text-center">
                  {durations[type]}
                </Text>
                <Pressable
                  onPress={() => updateDuration(type, step)}
                  disabled={durations[type] >= max}
                  className="w-10 h-10 rounded-full border border-border items-center justify-center"
                >
                  <Plus size={16} className="text-foreground" />
                </Pressable>
              </View>
            </Card>
          );
        })}

        <Text className="text-sm font-medium text-muted-foreground mt-2">
          Quick Presets
        </Text>
        <View className="flex-row gap-2">
          {[
            { label: "Classic", d: { focus: 25, short_break: 5, long_break: 15 } },
            { label: "Long", d: { focus: 50, short_break: 10, long_break: 30 } },
            { label: "Short", d: { focus: 15, short_break: 3, long_break: 10 } },
          ].map((preset) => (
            <Pressable
              key={preset.label}
              onPress={() => {
                setDurations(preset.d);
                appStorage.setItemSync(
                  DURATIONS_KEY,
                  JSON.stringify(preset.d)
                );
              }}
              className="flex-1 p-3 rounded-xl border border-border items-center"
            >
              <Text className="text-sm font-medium text-foreground">
                {preset.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <Pressable
        onPress={() => router.back()}
        className="absolute top-12 left-6"
      >
        <Text className="text-sm text-primary font-medium">← Back</Text>
      </Pressable>

      <Pressable
        onPress={() => setShowSettings(true)}
        className="absolute top-12 right-6"
      >
        <Settings size={20} className="text-muted-foreground" />
      </Pressable>

      <View className="flex-row gap-2 mb-8">
        {(["focus", "short_break", "long_break"] as const).map((type) => (
          <Pressable
            key={type}
            onPress={() => switchSession(type)}
            className={`px-4 py-2 rounded-xl ${
              sessionType === type
                ? `${sessionColors[type]}`
                : "bg-muted"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                sessionType === type
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {type === "focus"
                ? `${durations.focus}m`
                : type === "short_break"
                ? `${durations.short_break}m`
                : `${durations.long_break}m`}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="w-48 h-48 items-center justify-center mb-6 relative">
        <View className="absolute inset-0 rounded-full border-8 border-muted" />
        <View
          className="absolute inset-0 rounded-full border-8 border-primary"
          style={{
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            transform: [{ rotate: `${-90 + progress * 3.6}deg` }],
          }}
        />
        <View className="items-center">
          <Text className="text-4xl font-bold text-foreground">
            {formatTime(timeLeft)}
          </Text>
          <Text className="text-sm text-muted-foreground capitalize mt-1">
            {sessionType.replace("_", " ")}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3 mb-6">
        <Pressable
          onPress={resetTimer}
          className="w-12 h-12 rounded-full border border-border items-center justify-center"
        >
          <RotateCcw size={20} className="text-foreground" />
        </Pressable>
        <Pressable
          onPress={toggleTimer}
          className="w-16 h-16 rounded-full bg-primary items-center justify-center"
        >
          {isRunning ? (
            <Pause size={28} className="text-primary-foreground" />
          ) : (
            <Play size={28} className="text-primary-foreground ml-1" />
          )}
        </Pressable>
        <Pressable
          onPress={handleSessionComplete}
          disabled={timeLeft === durations[sessionType] * 60}
          className="w-12 h-12 rounded-full border border-border items-center justify-center"
        >
          <CheckCircle
            size={20}
            className={
              timeLeft === durations[sessionType] * 60
                ? "text-muted-foreground"
                : "text-foreground"
            }
          />
        </Pressable>
      </View>

      <View className="flex-row gap-2 mb-2">
        {[...Array(4)].map((_, i) => (
          <View
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < completedPomodoros % 4 ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </View>
      <Text className="text-xs text-muted-foreground">
        {completedPomodoros} sessions completed today
      </Text>
    </View>
  );
}
