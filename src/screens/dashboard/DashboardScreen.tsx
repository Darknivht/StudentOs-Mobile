import { ScrollView, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GreetingSection } from "./GreetingSection";
import { OfflineBanner } from "./OfflineBanner";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { StreakCard } from "./StreakCard";
import { StudyTimeWidget } from "./StudyTimeWidget";
import { StudyProgressWidget } from "./StudyProgressWidget";
import { BrainBoostCard } from "./BrainBoostCard";
import { CoursesSection } from "./CoursesSection";
import { WidgetBoundary } from "./WidgetBoundary";
import { colors, spacing } from "../../lib/theme";

export function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <WidgetBoundary label="Greeting">
          <GreetingSection />
        </WidgetBoundary>
        <WidgetBoundary label="Offline">
          <OfflineBanner />
        </WidgetBoundary>
        <WidgetBoundary label="Announcements">
          <AnnouncementBanner />
        </WidgetBoundary>
        <WidgetBoundary label="Streak">
          <StreakCard />
        </WidgetBoundary>
        <View style={styles.studyRow}>
          <WidgetBoundary label="StudyTime">
            <StudyTimeWidget />
          </WidgetBoundary>
          <WidgetBoundary label="StudyProgress">
            <StudyProgressWidget />
          </WidgetBoundary>
        </View>
        <View style={styles.brainBoostContainer}>
          <WidgetBoundary label="BrainBoost">
            <BrainBoostCard />
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
    paddingBottom: spacing.xl,
  },
  studyRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  brainBoostContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
