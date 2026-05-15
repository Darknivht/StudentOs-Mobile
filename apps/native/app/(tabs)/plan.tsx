import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Trash2,
  BookOpen,
  Target,
  CheckCircle,
  CalendarDays,
  AlertTriangle,
  Brain,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  Music,
  Coffee as CoffeeIcon,
  Moon,
  Waves,
  Sun,
  BedDouble,
  Zap,
  Lightbulb,
  Flame,
  Star,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import Toast from "react-native-toast-message";

import { useAuth } from "../../hooks/useAuthContext";
import { supabase } from "../../services/supabase";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { StreakCalendar } from "../../components/study/StreakCalendar";
import { cn } from "@studentos/shared";

const MOTIVATIONAL_QUOTES = [
  "📚 The expert in anything was once a beginner.",
  "🧠 Your brain is a muscle — train it daily.",
  "🔥 Small progress is still progress.",
  "💪 Discipline is choosing what you want most over what you want now.",
  "🎯 Focus on progress, not perfection.",
];

const TABS = [
  { key: "schedule", label: "Schedule", Icon: Calendar },
  { key: "focus", label: "Focus", Icon: Clock },
  { key: "progress", label: "Progress", Icon: TrendingUp },
];

const DAYS_LIST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS_LIST = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export default function PlanScreen() {
  const [activeTab, setActiveTab] = useState("schedule");
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12 pb-24">
        <Animated.View entering={FadeIn.duration(300)}>
          <Text className="text-2xl font-bold text-foreground">Plan & Focus</Text>
          <Text className="text-muted-foreground text-sm mt-1">{randomQuote}</Text>
        </Animated.View>

        <View className="flex-row mt-6 mb-4 rounded-lg bg-muted/50 p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md",
                  isActive ? "bg-card shadow-sm" : ""
                )}
              >
                <tab.Icon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
                <Text
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "schedule" && <ScheduleSection />}
        {activeTab === "focus" && <FocusSection />}
        {activeTab === "progress" && <ProgressSection />}
      </View>
    </ScrollView>
  );
}

function ScheduleSection() {
  return (
    <Animated.View entering={FadeIn.duration(300)} className="space-y-4">
      <StudyTimetable />
      <SmartScheduler />
      <WeaknessDetector />
    </Animated.View>
  );
}

function FocusSection() {
  return (
    <Animated.View entering={FadeIn.duration(300)} className="space-y-4">
      <QuickPomodoro />
      <LofiRadio />
      <SleepCalculator />
    </Animated.View>
  );
}

function ProgressSection() {
  return (
    <Animated.View entering={FadeIn.duration(300)} className="space-y-4">
      <StreakCalendar />
      <ProgressTracker />
    </Animated.View>
  );
}

// ─── Study Timetable ────────────────────────────────────────────────

interface ScheduleEntry {
  id: string;
  title: string;
  courseName?: string;
  courseColor?: string;
  dueDate: Date;
  dayOfWeek: number;
  hour: number;
}

function StudyTimetable() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSchedule();
  }, [user]);

  const fetchSchedule = async () => {
    if (!user) return;
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data: goals } = await supabase
        .from("study_goals")
        .select("id, title, due_date, course_id")
        .eq("user_id", user.id)
        .eq("completed", false)
        .gte("due_date", weekStart.toISOString())
        .lte("due_date", weekEnd.toISOString());

      if (goals && goals.length > 0) {
        const courseIds = [...new Set(goals.filter((g) => g.course_id).map((g) => g.course_id!))];
        const { data: courses } =
          courseIds.length > 0
            ? await supabase.from("courses").select("id, name, color").in("id", courseIds)
            : { data: [] };

        const courseMap = new Map(
          (courses || []).map((c) => [c.id, c])
        );

        const mapped: ScheduleEntry[] = goals.map((g) => {
          const date = new Date(g.due_date);
          const course = g.course_id ? courseMap.get(g.course_id) : null;
          let dow = date.getDay() - 1;
          if (dow < 0) dow = 6;
          return {
            id: g.id,
            title: g.title,
            courseName: course?.name,
            courseColor: course?.color || "hsl(262, 83%, 58%)",
            dueDate: date,
            dayOfWeek: dow,
            hour: date.getHours() || 9,
          };
        });
        setEntries(mapped);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const getEntriesForSlot = (day: number, hour: number) =>
    entries.filter((e) => e.dayOfWeek === day && e.hour === hour);

  const today = (() => {
    const d = new Date().getDay() - 1;
    return d < 0 ? 6 : d;
  })();

  if (loading) {
    return (
      <View className="h-40 rounded-xl bg-muted animate-pulse" />
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <View className="flex-row items-center gap-2 mb-4">
          <Calendar size={20} className="text-primary" />
          <Text className="font-semibold text-foreground">Weekly Timetable</Text>
        </View>

        {entries.length === 0 ? (
          <View className="items-center py-6">
            <Clock size={40} className="text-muted-foreground/30 mb-2" />
            <Text className="text-sm text-muted-foreground">No goals this week</Text>
            <Text className="text-xs text-muted-foreground">Add study goals below</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 600 }}>
              <View className="flex-row mb-1">
                <View className="w-12" />
                {DAYS_LIST.map((day, i) => (
                  <View
                    key={day}
                    className={cn(
                      "flex-1 items-center p-1 rounded",
                      i === today ? "bg-primary/10" : ""
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xs font-medium",
                        i === today ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>
              {HOURS_LIST.map((hour) => {
                const hasEntries = DAYS_LIST.some(
                  (_, dayIdx) => getEntriesForSlot(dayIdx, hour).length > 0
                );
                if (!hasEntries) return null;
                return (
                  <View key={hour} className="flex-row mb-1">
                    <View className="w-12 justify-center">
                      <Text className="text-xs text-muted-foreground text-right">{hour}:00</Text>
                    </View>
                    {DAYS_LIST.map((_, dayIdx) => {
                      const slotEntries = getEntriesForSlot(dayIdx, hour);
                      return (
                        <View key={dayIdx} className="flex-1" style={{ minHeight: 30 }}>
                          {slotEntries.map((entry) => (
                            <Animated.View
                              key={entry.id}
                              entering={FadeIn.duration(200)}
                              className="rounded p-1 mb-0.5"
                              style={{
                                backgroundColor: `${entry.courseColor}20`,
                                borderLeftWidth: 2,
                                borderLeftColor: entry.courseColor || "hsl(262, 83%, 58%)",
                              }}
                            >
                              <Text
                                className="text-[10px] font-medium truncate"
                                style={{ color: entry.courseColor }}
                              >
                                {entry.title}
                              </Text>
                            </Animated.View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Smart Scheduler ────────────────────────────────────────────────

interface StudyGoal {
  id: string;
  title: string;
  description: string | null;
  goal_type: string;
  due_date: string;
  priority: string;
  completed: boolean;
  course_id: string | null;
}

interface CourseItem {
  id: string;
  name: string;
  color: string | null;
}

const GOAL_TYPES = ["exam", "assignment", "quiz", "project", "other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

function SmartScheduler() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState("exam");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [pickerType, setPickerType] = useState<
    "goalType" | "priority" | "course" | null
  >(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [goalsResult, coursesResult] = await Promise.all([
        supabase
          .from("study_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("due_date", { ascending: true }),
        supabase.from("courses").select("id, name, color").eq("user_id", user.id),
      ]);
      setGoals(goalsResult.data || []);
      setCourses(coursesResult.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!user || !title || !dueDate) return;
    try {
      const dateObj = new Date(dueDate);
      if (isNaN(dateObj.getTime())) {
        Toast.show({ type: "error", text1: "Invalid date format (YYYY-MM-DD)" });
        return;
      }
      const { data, error } = await supabase
        .from("study_goals")
        .insert({
          user_id: user.id,
          title,
          goal_type: goalType,
          priority,
          due_date: dateObj.toISOString(),
          course_id: courseId || null,
        })
        .select()
        .single();

      if (error) throw error;
      setGoals((prev) =>
        [...prev, data].sort(
          (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        )
      );
      Toast.show({ type: "success", text1: "Goal added!" });
      setTitle("");
      setShowAddForm(false);
    } catch {
      Toast.show({ type: "error", text1: "Failed to add goal" });
    }
  };

  const toggleComplete = async (goal: StudyGoal) => {
    try {
      await supabase
        .from("study_goals")
        .update({ completed: !goal.completed })
        .eq("id", goal.id);
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, completed: !g.completed } : g))
      );
      if (!goal.completed) {
        Toast.show({ type: "success", text1: "Goal completed!", text2: "+50 XP earned!" });
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("user_id", user!.id)
          .single();
        if (profile) {
          await supabase
            .from("profiles")
            .update({ total_xp: (profile.total_xp || 0) + 50 })
            .eq("user_id", user!.id);
        }
      }
    } catch {}
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await supabase.from("study_goals").delete().eq("id", goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch {}
  };

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days: number, priority: string) => {
    if (days < 0) return "text-red-500";
    if (days <= 1 || priority === "urgent") return "text-red-500";
    if (days <= 3 || priority === "high") return "text-orange-500";
    if (days <= 7) return "text-yellow-500";
    return "text-green-500";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exam": return BookOpen;
      case "assignment": return Target;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <View className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <View key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </View>
    );
  }

  const upcomingGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <View className="space-y-4">
      {!showAddForm ? (
        <Button className="w-full" onPress={() => setShowAddForm(true)}>
          <Plus size={16} className="mr-2" />
          <Text className="text-primary-foreground">Add Exam or Deadline</Text>
        </Button>
      ) : (
        <Animated.View entering={FadeIn.duration(200)}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <View>
                <Text className="text-xs text-muted-foreground mb-1">Title</Text>
                <TextInput
                  className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                  placeholder="e.g., Math Final Exam"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">Type</Text>
                  <PickerButton
                    label={goalType}
                    onPress={() => setPickerType("goalType")}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">Priority</Text>
                  <PickerButton
                    label={priority}
                    onPress={() => setPickerType("priority")}
                  />
                </View>
              </View>
              <View>
                <Text className="text-xs text-muted-foreground mb-1">Due Date</Text>
                <TextInput
                  className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={dueDate}
                  onChangeText={setDueDate}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              {courses.length > 0 && (
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">Course (optional)</Text>
                  <PickerButton
                    label={courseId ? courses.find((c) => c.id === courseId)?.name || "" : "Select"}
                    onPress={() => setPickerType("course")}
                  />
                </View>
              )}
              <View className="flex-row gap-2">
                <Button className="flex-1" onPress={addGoal}>
                  <Text className="text-primary-foreground">Add Goal</Text>
                </Button>
                <Button variant="outline" className="flex-1" onPress={() => setShowAddForm(false)}>
                  <Text className="text-foreground">Cancel</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      )}

      <View className="space-y-3">
        <View className="flex-row items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          <Text className="font-medium text-foreground">Upcoming ({upcomingGoals.length})</Text>
        </View>
        {upcomingGoals.length === 0 ? (
          <View className="items-center py-6">
            <CalendarDays size={40} className="text-muted-foreground/30 mb-2" />
            <Text className="text-sm text-muted-foreground">No upcoming exams or deadlines</Text>
          </View>
        ) : (
          upcomingGoals.map((goal, idx) => {
            const days = getDaysUntil(goal.due_date);
            const Icon = getTypeIcon(goal.goal_type);
            const course = courses.find((c) => c.id === goal.course_id);
            return (
              <Animated.View key={goal.id} entering={FadeIn.duration(200).delay(idx * 50)}>
                <Card>
                  <CardContent className="p-4">
                    <View className="flex-row items-start gap-3">
                      <Pressable
                        onPress={() => toggleComplete(goal)}
                        className="w-5 h-5 mt-1 rounded-full border-2 border-muted-foreground/30 items-center justify-center"
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Icon size={16} className="text-muted-foreground" />
                          <Text className="font-medium text-foreground">{goal.title}</Text>
                          {goal.priority === "urgent" && (
                            <AlertTriangle size={16} className="text-red-500" />
                          )}
                        </View>
                        <View className="flex-row items-center gap-2 mt-1">
                          {course && (
                            <View
                              className="px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${course.color || "#6366f1"}20` }}
                            >
                              <Text className="text-xs" style={{ color: course.color || "#6366f1" }}>
                                {course.name}
                              </Text>
                            </View>
                          )}
                          <Text className={cn("text-sm", getUrgencyColor(days, goal.priority))}>
                            {days < 0
                              ? "Overdue!"
                              : days === 0
                                ? "Today!"
                                : days === 1
                                  ? "Tomorrow"
                                  : `${days} days left`}
                          </Text>
                        </View>
                      </View>
                      <Pressable onPress={() => deleteGoal(goal.id)}>
                        <Trash2 size={16} className="text-muted-foreground" />
                      </Pressable>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            );
          })
        )}
      </View>

      {completedGoals.length > 0 && (
        <View className="space-y-3">
          <View className="flex-row items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <Text className="font-medium text-muted-foreground">
              Completed ({completedGoals.length})
            </Text>
          </View>
          {completedGoals.slice(0, 5).map((goal) => (
            <View
              key={goal.id}
              className="p-3 rounded-xl bg-muted/50 border border-border/50 opacity-60"
            >
              <View className="flex-row items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <Text className="text-foreground line-through">{goal.title}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <GoalPickerModal
        visible={pickerType !== null}
        onClose={() => setPickerType(null)}
        type={pickerType}
        courses={courses}
        onSelect={(value) => {
          if (pickerType === "goalType") setGoalType(value);
          else if (pickerType === "priority") setPriority(value);
          else if (pickerType === "course") setCourseId(value);
          setPickerType(null);
        }}
      />
    </View>
  );
}

function PickerButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      className="border border-border rounded-md px-3 py-2 bg-background"
      onPress={onPress}
    >
      <Text className="text-sm text-foreground capitalize">{label}</Text>
    </Pressable>
  );
}

function GoalPickerModal({
  visible,
  onClose,
  type,
  courses,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  type: "goalType" | "priority" | "course" | null;
  courses: CourseItem[];
  onSelect: (value: string) => void;
}) {
  if (!type) return null;
  const options =
    type === "goalType"
      ? GOAL_TYPES.map((t) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }))
      : type === "priority"
        ? PRIORITIES.map((p) => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))
        : [{ label: "None", value: "" }, ...courses.map((c) => ({ label: c.name, value: c.id }))];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-card rounded-t-2xl max-h-[50%]" onPress={() => {}}>
          <View className="p-4 border-b border-border items-center">
            <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </View>
          <ScrollView>
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                className="px-6 py-3 border-b border-border/50"
                onPress={() => onSelect(opt.value)}
              >
                <Text className="text-base text-foreground">{opt.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable className="p-4 items-center bg-muted/30" onPress={onClose}>
            <Text className="text-foreground font-medium">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Weakness Detector ──────────────────────────────────────────────

interface CourseWeakness {
  courseId: string;
  courseName: string;
  courseColor: string;
  quizAverage: number;
  totalQuizzes: number;
  notesCount: number;
  flashcardsCount: number;
  focusMinutes: number;
  overallScore: number;
  recommendations: string[];
}

function WeaknessDetector() {
  const { user } = useAuth();
  const [weaknesses, setWeaknesses] = useState<CourseWeakness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) analyzeWeaknesses();
  }, [user]);

  const analyzeWeaknesses = async () => {
    if (!user) return;
    try {
      const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id);

      if (!courses || courses.length === 0) {
        setLoading(false);
        return;
      }

      const weaknessData: CourseWeakness[] = [];

      for (const course of courses) {
        const { data: quizzes } = await supabase
          .from("quiz_attempts")
          .select("score, total_questions")
          .eq("user_id", user.id)
          .eq("course_id", course.id);
        const { count: notesCount } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("course_id", course.id);
        const { count: flashcardsCount } = await supabase
          .from("flashcards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("course_id", course.id);
        const { data: pomodoro } = await supabase
          .from("pomodoro_sessions")
          .select("duration_minutes")
          .eq("user_id", user.id)
          .eq("course_id", course.id);

        const focusMinutes = pomodoro?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

        let quizAverage = 0;
        if (quizzes && quizzes.length > 0) {
          const totalScore = quizzes.reduce(
            (sum, q) => sum + (q.score / q.total_questions) * 100,
            0
          );
          quizAverage = totalScore / quizzes.length;
        }

        const notesScore = Math.min(((notesCount || 0) / 10) * 100, 100);
        const flashcardsScore = Math.min(((flashcardsCount || 0) / 20) * 100, 100);
        const focusScore = Math.min((focusMinutes / 120) * 100, 100);

        const overallScore =
          quizzes && quizzes.length > 0
            ? quizAverage * 0.4 + notesScore * 0.2 + flashcardsScore * 0.2 + focusScore * 0.2
            : notesScore * 0.33 + flashcardsScore * 0.33 + focusScore * 0.33;

        const recommendations: string[] = [];
        if (quizAverage < 70 && quizzes && quizzes.length > 0) {
          recommendations.push("Review concepts from failed quiz questions");
        }
        if ((notesCount || 0) < 5) {
          recommendations.push("Create more notes to reinforce learning");
        }
        if ((flashcardsCount || 0) < 10) {
          recommendations.push("Generate flashcards for key concepts");
        }
        if (focusMinutes < 60) {
          recommendations.push("Dedicate more focused study time");
        }
        if (!quizzes || quizzes.length === 0) {
          recommendations.push("Take practice quizzes to test knowledge");
        }

        weaknessData.push({
          courseId: course.id,
          courseName: course.name,
          courseColor: course.color || "#6366f1",
          quizAverage,
          totalQuizzes: quizzes?.length || 0,
          notesCount: notesCount || 0,
          flashcardsCount: flashcardsCount || 0,
          focusMinutes,
          overallScore,
          recommendations,
        });
      }

      weaknessData.sort((a, b) => a.overallScore - b.overallScore);
      setWeaknesses(weaknessData);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <View className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <View key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </View>
    );
  }

  if (weaknesses.length === 0) {
    return (
      <View className="items-center py-8">
        <Brain size={48} className="text-muted-foreground/30 mb-3" />
        <Text className="text-muted-foreground">Add courses and study to see analysis</Text>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      <View className="flex-row items-center gap-2">
        <AlertTriangle size={20} className="text-yellow-500" />
        <Text className="font-semibold text-foreground">Weakness Analysis</Text>
      </View>

      {weaknesses.map((course, idx) => (
        <Animated.View key={course.courseId} entering={FadeIn.duration(200).delay(idx * 100)}>
          <Card>
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.courseColor }}
                  />
                  <Text className="font-medium text-foreground">{course.courseName}</Text>
                </View>
                <Text className={cn("font-bold", getScoreColor(course.overallScore))}>
                  {Math.round(course.overallScore)}%
                </Text>
              </View>
              <Progress value={course.overallScore} className="h-2 mb-3" />
              <View className="flex-row mb-3">
                {[
                  { label: "Quiz", value: course.totalQuizzes > 0 ? `${Math.round(course.quizAverage)}%` : "N/A" },
                  { label: "Notes", value: String(course.notesCount) },
                  { label: "Cards", value: String(course.flashcardsCount) },
                  { label: "Focus", value: `${course.focusMinutes}m` },
                ].map((stat) => (
                  <View key={stat.label} className="flex-1 items-center">
                    <Text className="text-xs text-muted-foreground">{stat.label}</Text>
                    <Text className="text-xs font-bold text-foreground">{stat.value}</Text>
                  </View>
                ))}
              </View>
              {course.recommendations.slice(0, 2).map((rec, i) => (
                <View key={i} className="flex-row items-center gap-2 mt-1">
                  <CheckCircle size={12} className="text-primary" />
                  <Text className="text-xs text-muted-foreground">{rec}</Text>
                </View>
              ))}
            </CardContent>
          </Card>
        </Animated.View>
      ))}
    </View>
  );
}

// ─── Quick Pomodoro (simplified for Plan tab) ──────────────────────

function QuickPomodoro() {
  return (
    <Card>
      <CardContent className="p-4 items-center">
        <View className="flex-row items-center gap-2 mb-2">
          <Clock size={20} className="text-primary" />
          <Text className="font-semibold text-foreground">Pomodoro Timer</Text>
        </View>
        <Text className="text-sm text-muted-foreground text-center mb-3">
          Open the full Pomodoro timer with keep-awake from the Study tab
        </Text>
        <Text className="text-lg font-bold text-primary mb-1">25:00</Text>
        <Text className="text-xs text-muted-foreground">Focus Session</Text>
      </CardContent>
    </Card>
  );
}

// ─── Lofi Radio ─────────────────────────────────────────────────────

interface Station {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
}

const STATIONS: Station[] = [
  { id: "lofi-girl", name: "Lofi Hip Hop", icon: "coffee", url: "https://ice1.somafm.com/groovesalad-128-mp3", color: "#E879F9" },
  { id: "chillhop", name: "Chillhop", icon: "music", url: "https://streams.ilovemusic.de/iloveradio17.mp3", color: "#F97316" },
  { id: "sleep", name: "Sleep Sounds", icon: "moon", url: "https://ice1.somafm.com/dronezone-128-mp3", color: "#6366F1" },
  { id: "nature", name: "Nature Ambient", icon: "waves", url: "https://ice1.somafm.com/suburbsofgoa-128-mp3", color: "#10B981" },
  { id: "jazz", name: "Jazz Study", icon: "music", url: "https://ice1.somafm.com/secretagent-128-mp3", color: "#D97706" },
  { id: "classical", name: "Classical Focus", icon: "music", url: "https://ice1.somafm.com/bagel-128-mp3", color: "#8B5CF6" },
  { id: "ambient", name: "Ambient Space", icon: "moon", url: "https://ice1.somafm.com/spacestation-128-mp3", color: "#0EA5E9" },
  { id: "rain", name: "Deep Space", icon: "waves", url: "https://ice1.somafm.com/deepspaceone-128-mp3", color: "#64748B" },
  { id: "piano", name: "Piano & Classical", icon: "music", url: "https://ice1.somafm.com/thistle-128-mp3", color: "#EC4899" },
  { id: "deep-focus", name: "Deep Focus", icon: "radio", url: "https://streams.ilovemusic.de/iloveradio21.mp3", color: "#14B8A6" },
  { id: "cafe", name: "Cafe Vibes", icon: "coffee", url: "https://ice1.somafm.com/lush-128-mp3", color: "#A16207" },
  { id: "white-noise", name: "White Noise", icon: "waves", url: "https://ice1.somafm.com/fluid-128-mp3", color: "#94A3B8" },
];

function getStationIcon(iconName: string) {
  switch (iconName) {
    case "coffee": return CoffeeIcon;
    case "moon": return Moon;
    case "waves": return Waves;
    case "radio": return Radio;
    default: return Music;
  }
}

function LofiRadio() {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const playStation = async (station: Station) => {
    if (currentStation?.id === station.id) {
      if (isPlaying) {
        await sound?.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound?.playAsync();
        setIsPlaying(true);
      }
    } else {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: station.url },
        { shouldPlay: true, volume: isMuted ? 0 : volume / 100 }
      );
      setSound(newSound);
      setCurrentStation(station);
      setIsPlaying(true);
    }
  };

  const skipStation = () => {
    if (!currentStation) return;
    const currentIndex = STATIONS.findIndex((s) => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % STATIONS.length;
    playStation(STATIONS[nextIndex]);
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (sound) await sound.setVolumeAsync(newMuted ? 0 : volume / 100);
  };

  const changeVolume = async (v: number) => {
    setVolume(v);
    if (sound && !isMuted) await sound.setVolumeAsync(v / 100);
  };

  return (
    <View className="space-y-4">
      <View className="flex-row items-center gap-2">
        <Radio size={20} className="text-primary" />
        <Text className="font-semibold text-foreground">Focus Radio</Text>
      </View>

      {currentStation && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Card>
            <CardContent className="p-4" style={{ backgroundColor: `${currentStation.color}10` }}>
              <View className="flex-row items-center gap-4">
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${currentStation.color}30` }}
                >
                  {(() => {
                    const Icon = getStationIcon(currentStation.icon);
                    return <Icon size={28} color={currentStation.color} />;
                  })()}
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">{currentStation.name}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {isPlaying ? "Now Playing" : "Paused"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-center gap-3 mt-4">
                <Pressable
                  onPress={toggleMute}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  {isMuted ? <VolumeX size={20} className="text-muted-foreground" /> : <Volume2 size={20} className="text-muted-foreground" />}
                </Pressable>

                <Pressable
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: currentStation.color }}
                  onPress={() => playStation(currentStation)}
                >
                  {isPlaying ? (
                    <Pause size={24} color="#fff" />
                  ) : (
                    <Play size={24} color="#fff" style={{ marginLeft: 2 }} />
                  )}
                </Pressable>

                <Pressable
                  onPress={skipStation}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <SkipForward size={20} className="text-muted-foreground" />
                </Pressable>
              </View>

              <View className="flex-row items-center gap-3 mt-4">
                <VolumeX size={16} className="text-muted-foreground" />
                <View className="flex-1">
                  <Slider
                    value={volume}
                    onValueChange={changeVolume}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    minimumTrackTintColor={currentStation.color}
                    maximumTrackTintColor="#1F2937"
                    thumbTintColor={currentStation.color}
                  />
                </View>
                <Volume2 size={16} className="text-muted-foreground" />
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      )}

      <View className="flex-row flex-wrap">
        {STATIONS.map((station) => {
          const isActive = currentStation?.id === station.id;
          const Icon = getStationIcon(station.icon);
          return (
            <Pressable
              key={station.id}
              onPress={() => playStation(station)}
              className={cn(
                "w-1/4 p-2"
              )}
            >
              <View
                className={cn(
                  "p-3 rounded-xl border items-center",
                  isActive ? "border-primary shadow-sm" : "border-border"
                )}
                style={{
                  backgroundColor: isActive ? `${station.color}15` : "transparent",
                }}
              >
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mb-1"
                  style={{ backgroundColor: `${station.color}20` }}
                >
                  <Icon size={20} color={station.color} />
                </View>
                <Text className="text-xs font-medium text-center text-foreground" numberOfLines={1}>
                  {station.name}
                </Text>
                {isActive && isPlaying && (
                  <View className="flex-row items-center justify-center gap-0.5 mt-1">
                    {[...Array(3)].map((_, i) => (
                      <View
                        key={i}
                        className="w-1 rounded-full"
                        style={{
                          backgroundColor: station.color,
                          height: 4 + Math.sin(Date.now() / 200 + i) * 4,
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text className="text-xs text-center text-muted-foreground">
        Free streaming radio for focused studying
      </Text>
    </View>
  );
}

// ─── Sleep Calculator ───────────────────────────────────────────────

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 14;

interface SleepTimeCard {
  time: string;
  hours: number;
  cycles: number;
  isOptimal: boolean;
}

function SleepCalculator() {
  const [wakeUpHour, setWakeUpHour] = useState(7);
  const [wakeUpMinute, setWakeUpMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [calculatedTimes, setCalculatedTimes] = useState<SleepTimeCard[]>([]);
  const [sleepNowTimes, setSleepNowTimes] = useState<SleepTimeCard[]>([]);
  const [mode, setMode] = useState<"wakeup" | "sleepnow" | "nap">("wakeup");

  const get24Hour = () => {
    let h = wakeUpHour;
    if (!isAM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h;
  };

  const calculateBedtimes = () => {
    const now = new Date();
    const hour24 = get24Hour();
    let wakeUpTime = new Date(now);
    wakeUpTime.setHours(hour24, wakeUpMinute, 0, 0);
    if (wakeUpTime <= now) wakeUpTime.setDate(wakeUpTime.getDate() + 1);

    const times: { bedtime: Date; cycles: number; hours: number }[] = [];
    [3, 4, 5, 6, 7, 8].forEach((cycles) => {
      const totalMin = cycles * CYCLE_MINUTES;
      const bedtime = new Date(wakeUpTime.getTime() - (totalMin + FALL_ASLEEP_MINUTES) * 60000);
      const hours = Math.round((totalMin / 60) * 10) / 10;
      times.push({ bedtime, cycles, hours });
    });

    setCalculatedTimes(
      times
        .reverse()
        .map((t) => ({
          time: formatTimeNative(t.bedtime),
          hours: t.hours,
          cycles: t.cycles,
          isOptimal: t.hours >= 7 && t.hours <= 9,
        }))
    );
  };

  const calculateSleepNow = () => {
    const now = new Date();
    const fallAsleep = new Date(now.getTime() + FALL_ASLEEP_MINUTES * 60000);
    const times: { wakeTime: Date; cycles: number; hours: number }[] = [];

    [3, 4, 5, 6, 7, 8].forEach((cycles) => {
      const totalMin = cycles * CYCLE_MINUTES;
      const wakeTime = new Date(fallAsleep.getTime() + totalMin * 60000);
      const hours = Math.round((totalMin / 60) * 10) / 10;
      times.push({ wakeTime, cycles, hours });
    });

    setSleepNowTimes(
      times.map((t) => ({
        time: formatTimeNative(t.wakeTime),
        hours: t.hours,
        cycles: t.cycles,
        isOptimal: t.hours >= 7 && t.hours <= 9,
      }))
    );
  };

  const getNapTimes = () => {
    const now = new Date();
    return [
      { label: "Power Nap", minutes: 20, wakeTime: new Date(now.getTime() + 25 * 60000), description: "Quick recharge" },
      { label: "Short Nap", minutes: 30, wakeTime: new Date(now.getTime() + 35 * 60000), description: "Light refresh" },
      { label: "Full Cycle", minutes: 90, wakeTime: new Date(now.getTime() + 100 * 60000), description: "Deep restoration" },
    ];
  };

  const formatTimeNative = (date: Date) => {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, "0");
    const period = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    if (h > 12) h -= 12;
    return `${h}:${m} ${period}`;
  };

  const SLEEP_MODES = [
    { key: "wakeup", label: "Wake Up", Icon: Sun },
    { key: "sleepnow", label: "Sleep Now", Icon: BedDouble },
    { key: "nap", label: "Nap", Icon: CoffeeIcon },
  ];

  return (
    <View className="space-y-4">
      <View className="flex-row items-center gap-2">
        <Moon size={20} className="text-indigo-500" />
        <Text className="font-semibold text-foreground">Sleep Calculator</Text>
      </View>

      <View className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <Text className="text-sm text-foreground">
          <Lightbulb size={14} color="#6366f1" /> Recommended: 7-9 hours per night
        </Text>
      </View>

      <View className="flex-row rounded-md bg-muted/30 p-1">
        {SLEEP_MODES.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => setMode(m.key as any)}
            className={cn(
              "flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md",
              mode === m.key ? "bg-card" : ""
            )}
          >
            <m.Icon size={14} className={mode === m.key ? "text-primary" : "text-muted-foreground"} />
            <Text
              className={cn(
                "text-xs",
                mode === m.key ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "wakeup" && (
        <View className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <View className="flex-row items-center gap-2">
                <Sun size={16} color="#eab308" />
                <Text className="text-sm text-foreground">I need to wake up at:</Text>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">Hour</Text>
                  <Text className="text-center font-bold text-foreground">{wakeUpHour}</Text>
                  <Slider
                    value={wakeUpHour}
                    onValueChange={setWakeUpHour}
                    minimumValue={1}
                    maximumValue={12}
                    step={1}
                    minimumTrackTintColor="#6366f1"
                    maximumTrackTintColor="#1F2937"
                    thumbTintColor="#6366f1"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">Minute</Text>
                  <Text className="text-center font-bold text-foreground">:{wakeUpMinute.toString().padStart(2, "0")}</Text>
                  <Slider
                    value={wakeUpMinute}
                    onValueChange={setWakeUpMinute}
                    minimumValue={0}
                    maximumValue={45}
                    step={15}
                    minimumTrackTintColor="#6366f1"
                    maximumTrackTintColor="#1F2937"
                    thumbTintColor="#6366f1"
                  />
                </View>
              </View>
              <View className="flex-row justify-center gap-2">
                <Pressable
                  className={cn("px-4 py-1.5 rounded", isAM ? "bg-primary" : "bg-muted")}
                  onPress={() => setIsAM(true)}
                >
                  <Text className={isAM ? "text-primary-foreground" : "text-foreground"}>AM</Text>
                </Pressable>
                <Pressable
                  className={cn("px-4 py-1.5 rounded", !isAM ? "bg-primary" : "bg-muted")}
                  onPress={() => setIsAM(false)}
                >
                  <Text className={!isAM ? "text-primary-foreground" : "text-foreground"}>PM</Text>
                </Pressable>
              </View>
              <Text className="text-center text-lg font-bold text-foreground">
                {wakeUpHour}:{wakeUpMinute.toString().padStart(2, "0")} {isAM ? "AM" : "PM"}
              </Text>
              <Button className="w-full" onPress={calculateBedtimes}>
                <Text className="text-primary-foreground">Calculate Bedtimes</Text>
              </Button>
            </CardContent>
          </Card>
          {calculatedTimes.map((item, idx) => (
            <Animated.View key={idx} entering={FadeIn.duration(200).delay(idx * 50)}>
              <SleepTimeCard {...item} />
            </Animated.View>
          ))}
        </View>
      )}

      {mode === "sleepnow" && (
        <View className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Text className="text-sm text-muted-foreground mb-3">
                Going to bed now? Here are optimal wake-up times:
              </Text>
              <Button className="w-full" onPress={calculateSleepNow}>
                <Text className="text-primary-foreground">Calculate Wake-Up Times</Text>
              </Button>
            </CardContent>
          </Card>
          {sleepNowTimes.map((item, idx) => (
            <Animated.View key={idx} entering={FadeIn.duration(200).delay(idx * 50)}>
              <SleepTimeCard {...item} isWakeUp />
            </Animated.View>
          ))}
        </View>
      )}

      {mode === "nap" && (
        <View className="space-y-3">
          <Text className="text-sm text-muted-foreground">Quick nap calculator — set an alarm for:</Text>
          {getNapTimes().map((nap, idx) => (
            <Animated.View key={idx} entering={FadeIn.duration(200).delay(idx * 100)}>
              <Card>
                <CardContent className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-lg bg-indigo-500/10 items-center justify-center">
                      <CoffeeIcon size={20} color="#6366f1" />
                    </View>
                    <View>
                      <Text className="font-bold text-foreground">{nap.label} ({nap.minutes}min)</Text>
                      <Text className="text-xs text-muted-foreground">{nap.description}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-semibold text-foreground">
                      {formatTimeNative(nap.wakeTime)}
                    </Text>
                    <Text className="text-xs text-muted-foreground">Wake up</Text>
                  </View>
                </CardContent>
              </Card>
            </Animated.View>
          ))}
        </View>
      )}

      <View className="p-3 rounded-lg bg-muted/50 space-y-1">
        <View className="flex-row items-center gap-2 mb-1">
          <Zap size={16} className="text-primary" />
          <Text className="font-medium text-foreground text-sm">Sleep Tips</Text>
        </View>
        <Text className="text-xs text-muted-foreground">• Sleep cycles are ~90 minutes</Text>
        <Text className="text-xs text-muted-foreground">• It takes ~14 minutes to fall asleep</Text>
        <Text className="text-xs text-muted-foreground">• Avoid screens 30 minutes before bed</Text>
      </View>
    </View>
  );
}

function SleepTimeCard({
  time,
  hours,
  cycles,
  isOptimal,
  isWakeUp,
}: SleepTimeCard & { isWakeUp?: boolean }) {
  return (
    <Card>
      <CardContent
        className={cn(
          "p-4",
          isOptimal
            ? "bg-emerald-500/10 border-emerald-500/30"
            : hours < 6
              ? "bg-red-500/10 border-red-500/30"
              : ""
        )}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className={cn(
                "w-10 h-10 rounded-lg items-center justify-center",
                isOptimal ? "bg-emerald-500/20" : "bg-muted"
              )}
            >
              {isWakeUp ? (
                <Sun size={20} className={isOptimal ? "text-emerald-500" : "text-muted-foreground"} />
              ) : (
                <Moon size={20} className={isOptimal ? "text-emerald-500" : "text-muted-foreground"} />
              )}
            </View>
            <View>
              <Text className="font-bold text-lg text-foreground">{time}</Text>
              <Text className="text-sm text-muted-foreground">
                {hours}h ({cycles} cycles)
              </Text>
            </View>
          </View>
          {isOptimal && <Zap size={20} className="text-emerald-500" />}
          {hours < 6 && <AlertTriangle size={20} className="text-red-500" />}
        </View>
      </CardContent>
    </Card>
  );
}

// ─── Progress Tracker ───────────────────────────────────────────────

interface CourseProgress {
  id: string;
  name: string;
  color: string;
  notesCount: number;
  flashcardsCount: number;
  quizzesCompleted: number;
  focusMinutes: number;
  overallProgress: number;
}

function ProgressTracker() {
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [overallStats, setOverallStats] = useState<Record<string, number | string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const [
        { count: totalNotes },
        { count: totalFlashcards },
        { count: totalQuizzes },
        { data: pomodoroData },
        { data: profile },
        { data: courses },
      ] = await Promise.all([
        supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quiz_attempts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("pomodoro_sessions").select("duration_minutes").eq("user_id", user.id),
        supabase.from("profiles").select("current_streak, total_xp").eq("user_id", user.id).single(),
        supabase.from("courses").select("*").eq("user_id", user.id),
      ]);

      const totalFocusMinutes = pomodoroData?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

      setOverallStats({
        totalNotes: totalNotes || 0,
        totalFlashcards: totalFlashcards || 0,
        totalQuizzes: totalQuizzes || 0,
        totalFocusHours: Math.round((totalFocusMinutes / 60) * 10) / 10,
        currentStreak: profile?.current_streak || 0,
        totalXP: profile?.total_xp || 0,
      });

      if (courses) {
        const courseData: CourseProgress[] = [];
        for (const course of courses) {
          const [
            { count: notesCount },
            { count: flashcardsCount },
            { count: quizzesCount },
            { data: cpData },
          ] = await Promise.all([
            supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("course_id", course.id),
            supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("course_id", course.id),
            supabase.from("quiz_attempts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("course_id", course.id),
            supabase.from("pomodoro_sessions").select("duration_minutes").eq("user_id", user.id).eq("course_id", course.id),
          ]);

          const focusMins = cpData?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
          const notesProgress = Math.min(((notesCount || 0) / 10) * 100, 100);
          const fcProgress = Math.min(((flashcardsCount || 0) / 20) * 100, 100);
          const quizProgress = Math.min(((quizzesCount || 0) / 5) * 100, 100);
          const focusProgress = Math.min((focusMins / 120) * 100, 100);
          const overallProgress = (notesProgress + fcProgress + quizProgress + focusProgress) / 4;

          courseData.push({
            id: course.id,
            name: course.name,
            color: course.color || "#6366f1",
            notesCount: notesCount || 0,
            flashcardsCount: flashcardsCount || 0,
            quizzesCompleted: quizzesCount || 0,
            focusMinutes: focusMins,
            overallProgress,
          });
        }
        setCourseProgress(courseData);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <View key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </View>
    );
  }

  return (
    <View className="space-y-4">
      {overallStats && (
        <View className="flex-row flex-wrap">
          {[
            { icon: BookOpen, label: "Notes", value: overallStats.totalNotes, color: "#8B5CF6" },
            { icon: Brain, label: "Cards", value: overallStats.totalFlashcards, color: "#F97316" },
            { icon: Target, label: "Quizzes", value: overallStats.totalQuizzes, color: "#10B981" },
            { icon: Clock, label: "Focus", value: `${overallStats.totalFocusHours}h`, color: "#0EA5E9" },
            { icon: Flame, label: "Streak", value: `${overallStats.currentStreak}d`, color: "#EF4444" },
            { icon: Star, label: "XP", value: overallStats.totalXP, color: "#F59E0B" },
          ].map((stat) => (
            <View key={stat.label} className="w-1/3 p-1.5">
              <View className="p-3 rounded-xl bg-card border border-border items-center">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mb-1"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon size={16} color={stat.color} />
                </View>
                <Text className="font-bold text-foreground">{stat.value}</Text>
                <Text className="text-xs text-muted-foreground">{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="space-y-3">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <Text className="font-medium text-foreground">Course Progress</Text>
        </View>

        {courseProgress.length === 0 ? (
          <View className="items-center py-6">
            <Target size={40} className="text-muted-foreground/30 mb-2" />
            <Text className="text-sm text-muted-foreground">Add courses to track progress</Text>
          </View>
        ) : (
          courseProgress.map((course, idx) => (
            <Animated.View key={course.id} entering={FadeIn.duration(200).delay(idx * 100)}>
              <Card>
                <CardContent className="p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: course.color || "#6366f1" }}
                      />
                      <Text className="font-medium text-foreground">{course.name}</Text>
                    </View>
                    <Text className="text-sm font-bold text-primary">
                      {Math.round(course.overallProgress)}%
                    </Text>
                  </View>
                  <Progress value={course.overallProgress} className="h-2 mb-3" />
                  <View className="flex-row">
                    {[
                      { label: "Notes", value: course.notesCount },
                      { label: "Cards", value: course.flashcardsCount },
                      { label: "Quizzes", value: course.quizzesCompleted },
                      { label: "Focus", value: `${course.focusMinutes}m` },
                    ].map((s) => (
                      <View key={s.label} className="flex-1 items-center">
                        <Text className="text-xs text-muted-foreground">{s.label}</Text>
                        <Text className="text-xs font-bold text-foreground">{s.value}</Text>
                      </View>
                    ))}
                  </View>
                </CardContent>
              </Card>
            </Animated.View>
          ))
        )}
      </View>
    </View>
  );
}