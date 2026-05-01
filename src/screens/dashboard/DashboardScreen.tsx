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
        <View style={styles.widgetRow}>
          <WidgetBoundary label="StudyTime">
            <StudyTimeWidget />
          </WidgetBoundary>
          <WidgetBoundary label="StudyProgress">
            <StudyProgressWidget />
          </WidgetBoundary>
        </View>
        <WidgetBoundary label="BrainBoost">
          <BrainBoostCard />
        </WidgetBoundary>
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
  widgetRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});
