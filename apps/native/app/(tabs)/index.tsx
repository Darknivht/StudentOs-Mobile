import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Settings, WifiOff, RefreshCw, Target, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuthContext";
import { useProfile } from "../../hooks/useProfile";
import { useCourses, useCreateCourse, useDeleteCourse } from "../../hooks/useCourses";
import { useStudyStats } from "../../hooks/useStudyStats";
import { useNetInfo } from "../../hooks/useNetInfo";
import { StreakCard } from "../../components/dashboard/StreakCard";
import { CourseCard } from "../../components/dashboard/CourseCard";
import { AddCourseSheet } from "../../components/dashboard/AddCourseSheet";
import { AnnouncementBanner } from "../../components/dashboard/AnnouncementBanner";
import { DailyQuizChallenge } from "../../components/dashboard/DailyQuizChallenge";
import { StudyTimeWidget } from "../../components/dashboard/StudyTimeWidget";
import { StudyProgressWidget } from "../../components/dashboard/StudyProgressWidget";
import { AdBanner } from "../../components/AdBanner";
import { ErrorFallback } from "../../components/ErrorFallback";
import { useState, useCallback } from "react";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: courses, isLoading: coursesLoading, refetch: refetchCourses } = useCourses();
  const { data: stats, isLoading: statsLoading } = useStudyStats();
  const { isOnline } = useNetInfo();
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const handleAddCourse = useCallback(
    async (name: string, color: string, icon: string) => {
      try {
        await createCourse.mutateAsync({ name, color, icon });
        Toast.show({ type: "success", text1: "Course added! 📚", text2: `${name} has been added to your dashboard.` });
      } catch {
        Toast.show({ type: "error", text1: "Error", text2: "Failed to add course. Please try again." });
      }
    },
    [createCourse]
  );

  const handleDeleteCourse = useCallback(
    async (id: string) => {
      try {
        await deleteCourse.mutateAsync(id);
        Toast.show({ type: "success", text1: "Course deleted", text2: "The course has been removed." });
      } catch {
        Toast.show({ type: "error", text1: "Error", text2: "Failed to delete course." });
      }
    },
    [deleteCourse]
  );

  const handleRetry = useCallback(() => {
    setFetchError(false);
    refetchProfile();
    refetchCourses();
  }, [refetchProfile, refetchCourses]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const isLoading = profileLoading && coursesLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color=""#6D28D9"" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12 gap-6">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-muted-foreground text-sm">{getGreeting()}</Text>
              {!isOnline && (
                <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10">
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <Text className="text-amber-600 text-xs">Offline</Text>
                </View>
              )}
            </View>
            <Text className="text-2xl font-bold text-foreground">{firstName} 👋</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          >
            <Settings size={20} className="text-muted-foreground" />
          </Pressable>
        </View>

        {fetchError && (
          <View className="flex-row items-center justify-between p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <Text className="text-sm text-foreground">Couldn't load latest data</Text>
            <Pressable onPress={handleRetry} className="flex-row items-center gap-1">
              <RefreshCw className="w-3 h-3 text-foreground" />
              <Text className="text-xs text-foreground">Retry</Text>
            </Pressable>
          </View>
        )}

        <AnnouncementBanner />

        <StreakCard
          currentStreak={profile?.current_streak || 0}
          longestStreak={profile?.longest_streak || 0}
          totalXP={profile?.total_xp || 0}
        />

        <DailyQuizChallenge onComplete={handleRetry} />

        <StudyTimeWidget
          focusMinutesToday={stats?.focusMinutesToday ?? 0}
          dailyGoalMinutes={stats?.dailyGoalMinutes ?? 120}
        />

        <AdBanner />

        <Pressable onPress={() => router.push("/(tabs)/exams")}>
          <View className="p-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-xl bg-primary/20 items-center justify-center">
              <Target size={24} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm text-foreground">Exam Prep</Text>
              <Text className="text-xs text-muted-foreground">Practice WAEC, JAMB, NECO & more</Text>
            </View>
            <ChevronRight size={18} className="text-muted-foreground" />
          </View>
        </Pressable>

        {stats && <StudyProgressWidget stats={stats} />}

        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">My Courses</Text>
            <Text className="text-sm text-muted-foreground">
              {courses?.length ?? 0} {courses?.length === 1 ? "course" : "courses"}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {(courses || []).map((course, index) => (
              <View key={course.id} className="w-[48%]">
                <CourseCard
                  id={course.id}
                  name={course.name}
                  icon={course.icon || "📚"}
                  color={course.color || "#8B5CF6"}
                  progress={course.progress || 0}
                  onDelete={handleDeleteCourse}
                  onPress={() => {}}
                  index={index}
                />
              </View>
            ))}
            <View className="w-[48%]">
              <Pressable
                onPress={() => setAddSheetOpen(true)}
                className="w-full p-5 rounded-2xl border-2 border-dashed border-border items-center justify-center min-h-[160px]"
              >
                <View className="w-12 h-12 rounded-xl bg-muted items-center justify-center mb-2">
                  <Text className="text-2xl text-muted-foreground">+</Text>
                </View>
                <Text className="text-sm font-medium text-muted-foreground">Add Course</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {courses?.length === 0 && !coursesLoading && (
          <View className="items-center py-8">
            <Text className="text-muted-foreground text-sm">Start by adding your first course! 🎓</Text>
          </View>
        )}
      </View>

      <AddCourseSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onAdd={handleAddCourse}
      />
    </ScrollView>
  );
}
