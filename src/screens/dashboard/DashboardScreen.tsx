import { useState, useCallback } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { GreetingSection } from "./GreetingSection";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { StreakCard } from "./StreakCard";
import { StudyTimeWidget } from "./StudyTimeWidget";
import { StudyProgressWidget } from "./StudyProgressWidget";
import { BrainBoostCard } from "./BrainBoostCard";
import { CoursesSection } from "./CoursesSection";
import { WidgetBoundary } from "./WidgetBoundary";
import { useAuth } from "../../hooks/useAuth";
import { colors, spacing, typography } from "../../lib/theme";

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [fetchError, setFetchError] = useState(false);
  const navigation = useNavigation();

  const handleRetryFetch = useCallback(() => {
    setFetchError(false);
  }, []);

  const handleExamPrepPress = () => {
    (navigation as any).navigate("ExamPrep");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <WidgetBoundary label="Greeting">
          <GreetingSection />
        </WidgetBoundary>

        {fetchError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>Couldn't load latest data</Text>
            <Pressable onPress={handleRetryFetch}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        <WidgetBoundary label="Announcements">
          <AnnouncementBanner />
        </WidgetBoundary>

        <WidgetBoundary label="Streak">
          <StreakCard />
        </WidgetBoundary>

        <WidgetBoundary label="BrainBoost">
          <BrainBoostCard />
        </WidgetBoundary>

        <Pressable style={styles.examPrepCard} onPress={handleExamPrepPress}>
          <View style={styles.examPrepIcon}>
            <Text style={styles.examPrepEmoji}>🎯</Text>
          </View>
          <View style={styles.examPrepContent}>
            <Text style={styles.examPrepTitle}>Exam Prep</Text>
            <Text style={styles.examPrepSubtitle}>
              Practice WAEC, JAMB, NECO & more
            </Text>
          </View>
          <Text style={styles.examPrepChevron}>›</Text>
        </Pressable>

        <View style={styles.widgetRow}>
          <WidgetBoundary label="StudyTime">
            <StudyTimeWidget />
          </WidgetBoundary>
          <WidgetBoundary label="StudyProgress">
            <StudyProgressWidget />
          </WidgetBoundary>
        </View>

        <WidgetBoundary label="Courses">
          <CoursesSection />
        </WidgetBoundary>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing["2xl"],
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.destructive,
  },
  retryText: {
    fontSize: typography.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  examPrepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 0,
  },
  examPrepIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  examPrepEmoji: {
    fontSize: 22,
  },
  examPrepContent: {
    flex: 1,
  },
  examPrepTitle: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    letterSpacing: -0.1,
  },
  examPrepSubtitle: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  examPrepChevron: {
    fontSize: 20,
    color: colors.mutedForeground,
  },
  widgetRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});
