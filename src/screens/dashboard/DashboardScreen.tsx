import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GreetingSection } from "./GreetingSection";
import { OfflineBanner } from "./OfflineBanner";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { StreakCard } from "./StreakCard";
import { StudyTimeWidget } from "./StudyTimeWidget";
import { StudyProgressWidget } from "./StudyProgressWidget";
import { BrainBoostCard } from "./BrainBoostCard";
import { CoursesSection } from "./CoursesSection";
import { colors, spacing } from "../../lib/theme";
import { Component, type ReactNode, type ErrorInfo } from "react";

class WidgetBoundary extends Component<
  { children: ReactNode; name: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `WidgetBoundary[${this.props.name}]:`,
      error.message,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <WidgetBoundary name="GreetingSection">
          <GreetingSection />
        </WidgetBoundary>
        <WidgetBoundary name="OfflineBanner">
          <OfflineBanner />
        </WidgetBoundary>
        <WidgetBoundary name="AnnouncementBanner">
          <AnnouncementBanner />
        </WidgetBoundary>
        <WidgetBoundary name="StreakCard">
          <StreakCard />
        </WidgetBoundary>
        <View style={styles.studyRow}>
          <WidgetBoundary name="StudyTimeWidget">
            <StudyTimeWidget />
          </WidgetBoundary>
          <WidgetBoundary name="StudyProgressWidget">
            <StudyProgressWidget />
          </WidgetBoundary>
        </View>
        <View style={styles.brainBoostContainer}>
          <WidgetBoundary name="BrainBoostCard">
            <BrainBoostCard />
          </WidgetBoundary>
        </View>
        <WidgetBoundary name="CoursesSection">
          <CoursesSection />
        </WidgetBoundary>
      </ScrollView>
    </SafeAreaView>
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
