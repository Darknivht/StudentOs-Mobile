import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { OnboardingStep } from "./OnboardingStep";
import { useAppStore } from "../../stores/appStore";
import { colors, spacing, typography } from "../../lib/theme";

const ONBOARDING_STEPS = [
  {
    title: "Welcome to StudentOS",
    description:
      "Your AI-powered learning companion — built for students, by students.",
    icon: "🎓",
    gradientColors: ["#7c3aed", "#3b82f6"] as [string, string],
    particleColor: "#a78bfa",
  },
  {
    title: "AI Learning",
    description:
      "Get instant help from your AI tutor — summaries, quizzes, flashcards, and more.",
    icon: "🤖",
    gradientColors: ["#0d9488", "#06b6d4"] as [string, string],
    particleColor: "#5eead4",
  },
  {
    title: "Spaced Repetition",
    description:
      "Never forget what you learn. Smart flashcards that adapt to your memory.",
    icon: "🧠",
    gradientColors: ["#16a34a", "#34d399"] as [string, string],
    particleColor: "#86efac",
  },
  {
    title: "Focus Tools",
    description:
      "Stay in the zone with timers, app blockers, and study sessions.",
    icon: "⏱️",
    gradientColors: ["#ea580c", "#f59e0b"] as [string, string],
    particleColor: "#fdba74",
  },
  {
    title: "Growth Tracking",
    description: "Watch your streaks grow, earn XP, and climb the leaderboard.",
    icon: "📈",
    gradientColors: ["#e11d48", "#fb7185"] as [string, string],
    particleColor: "#fda4af",
  },
  {
    title: "Learn Together",
    description: "Challenge friends, join study groups, and share resources.",
    icon: "👥",
    gradientColors: ["#4f46e5", "#8b5cf6"] as [string, string],
    particleColor: "#c4b5fd",
  },
  {
    title: "Let's Begin!",
    description:
      "Your learning journey starts now. Tap to explore your dashboard.",
    icon: "🚀",
    gradientColors: ["#7c3aed", "#ec4899"] as [string, string],
    particleColor: "#f0abfc",
  },
] as const;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setOnboardingSeen = useAppStore((s) => s.setOnboardingSeen);

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setOnboardingSeen(true);
  }, [setOnboardingSeen]);

  const handleComplete = useCallback(() => {
    setOnboardingSeen(true);
  }, [setOnboardingSeen]);

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={
          ONBOARDING_STEPS as unknown as readonly (typeof ONBOARDING_STEPS)[number][]
        }
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <OnboardingStep
            title={item.title}
            description={item.description}
            icon={item.icon}
            gradientColors={[item.gradientColors[0], item.gradientColors[1]]}
            particleColor={item.particleColor}
          />
        )}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {isLastStep ? (
          <Pressable style={styles.primaryButton} onPress={handleComplete}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
        ) : (
          <View style={styles.buttonRow}>
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipButtonText: {
    fontSize: typography.base,
    color: "rgba(255, 255, 255, 0.6)",
  },
  primaryButton: {
    backgroundColor: "#ffffff",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: typography.base,
    fontWeight: "700",
    color: "#0f0f23",
  },
});
