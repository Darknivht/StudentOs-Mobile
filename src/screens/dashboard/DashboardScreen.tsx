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

export function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GreetingSection />
        <OfflineBanner />
        <AnnouncementBanner />
        <StreakCard />
        <View style={styles.studyRow}>
          <StudyTimeWidget />
          <StudyProgressWidget />
        </View>
        <View style={styles.brainBoostContainer}>
          <BrainBoostCard />
        </View>
        <CoursesSection />
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
