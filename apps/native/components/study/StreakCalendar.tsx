import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react-native";
import { cn } from "@studentos/shared";
import { useAuth } from "../../hooks/useAuthContext";
import { supabase } from "../../services/supabase";
import Animated, { FadeIn } from "react-native-reanimated";

interface StudySession {
  session_date: string;
  total_minutes: number | null;
  xp_earned: number | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const GRADE_OPTIONS = [
  { label: "Select grade level", value: "" },
  { label: "6th Grade", value: "6th" },
  { label: "7th Grade", value: "7th" },
  { label: "8th Grade", value: "8th" },
  { label: "9th Grade", value: "9th" },
  { label: "10th Grade", value: "10th" },
  { label: "11th Grade", value: "11th" },
  { label: "12th Grade", value: "12th" },
  { label: "College Freshman", value: "freshman" },
  { label: "College Sophomore", value: "sophomore" },
  { label: "College Junior", value: "junior" },
  { label: "College Senior", value: "senior" },
  { label: "Graduate School", value: "graduate" },
];

export function StreakCalendar() {
  const { user, authReady } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      );

      const { data, error } = await supabase
        .from("study_sessions")
        .select("session_date, total_minutes, xp_earned")
        .eq("user_id", user.id)
        .gte(
          "session_date",
          startOfMonth.toISOString().split("T")[0]
        )
        .lte(
          "session_date",
          endOfMonth.toISOString().split("T")[0]
        );

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentMonth]);

  useEffect(() => {
    if (authReady) fetchSessions();
  }, [authReady, fetchSessions]);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return days;
  };

  const getSessionForDay = (day: number): StudySession | undefined => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sessions.find((s) => s.session_date === dateStr);
  };

  const getIntensityClass = (minutes: number | null): string => {
    if (!minutes || minutes === 0) return "bg-muted";
    if (minutes < 15) return "bg-emerald-500/30";
    if (minutes < 30) return "bg-emerald-500/50";
    if (minutes < 60) return "bg-emerald-500/70";
    return "bg-emerald-500";
  };

  const days = getDaysInMonth();
  const today = new Date();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  if (loading) {
    return (
      <View className="p-4 rounded-2xl bg-card border border-border items-center justify-center" style={{ height: 200 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} className="p-4 rounded-2xl bg-card border border-border">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <Text className="font-semibold text-foreground">Study Activity</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-md active:bg-accent"
            onPress={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
              )
            }
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </Pressable>
          <Text className="text-sm font-medium min-w-[120px] text-center text-foreground">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-md active:bg-accent"
            onPress={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
              )
            }
            disabled={isCurrentMonth}
          >
            <ChevronRight className={cn("w-4 h-4", isCurrentMonth ? "text-muted-foreground/30" : "text-foreground")} />
          </Pressable>
        </View>
      </View>

      <View className="flex-row mb-2">
        {DAY_NAMES.map((day) => (
          <View key={day} className="flex-1 items-center py-1">
            <Text className="text-xs text-muted-foreground font-medium">{day}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} className="w-[14.28%] aspect-square p-0.5" />;
          }
          const session = getSessionForDay(day);
          const isToday = isCurrentMonth && day === today.getDate();
          const intensity = getIntensityClass(session?.total_minutes || 0);
          return (
            <View key={day} className="w-[14.28%] aspect-square p-0.5">
              <View
                className={cn(
                  "flex-1 rounded-lg items-center justify-center",
                  intensity,
                  isToday && "ring-2 ring-primary"
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-medium",
                    session?.total_minutes ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center justify-center gap-2 mt-4">
        <Text className="text-xs text-muted-foreground">Less</Text>
        <View className="flex-row gap-1">
          <View className="w-3 h-3 rounded bg-muted" />
          <View className="w-3 h-3 rounded bg-emerald-500/30" />
          <View className="w-3 h-3 rounded bg-emerald-500/50" />
          <View className="w-3 h-3 rounded bg-emerald-500/70" />
          <View className="w-3 h-3 rounded bg-emerald-500" />
        </View>
        <Text className="text-xs text-muted-foreground">More</Text>
      </View>
    </Animated.View>
  );
}

export { GRADE_OPTIONS };
