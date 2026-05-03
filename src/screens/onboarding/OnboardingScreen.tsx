import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { OnboardingStep } from "./OnboardingStep";
import { useAppStore } from "../../stores/appStore";
import { colors, spacing, typography } from "../../lib/theme";

const ONBOARDING_STEPS = [
  {
    title: "Welcome to StudentOS",
    description: "The smartest way to study. Built by students, for students.",
    icon: "📚",
    gradientColors: ["#7c3aed", "#3b82f6"] as [string, string],
    particleColor: "#a78bfa",
    iconBg: ["#8b5cf6", "#6366f1"] as [string, string],
  },
  {
    title: "AI-Powered Learning",
    description:
      "Smart notes, AI tutor, math solver — AI that actually understands your homework.",
    icon: "🤖",
    gradientColors: ["#0891b2", "#06b6d4"] as [string, string],
    particleColor: "#67e8f9",
    iconBg: ["#22d3ee", "#06b6d4"] as [string, string],
  },
  {
    title: "Never Forget Again",
    description:
      "Spaced-repetition flashcards and quizzes that adapt to how you learn.",
    icon: "🧠",
    gradientColors: ["#16a34a", "#10b981"] as [string, string],
    particleColor: "#6ee7b7",
    iconBg: ["#4ade80", "#22c55e"] as [string, string],
  },
  {
    title: "Stay in the Zone",
    description:
      "Pomodoro timer, lofi radio, and app blocking to keep distractions away.",
    icon: "⏱️",
    gradientColors: ["#ea580c", "#f59e0b"] as [string, string],
    particleColor: "#fdba74",
    iconBg: ["#fb923c", "#f59e0b"] as [string, string],
  },
  {
    title: "Track Your Growth",
    description:
      "Streaks, XP, levels, and achievements — watch yourself level up every day.",
    icon: "🏆",
    gradientColors: ["#e11d48", "#f43f5e"] as [string, string],
    particleColor: "#fda4af",
    iconBg: ["#fb7185", "#e11d48"] as [string, string],
  },
  {
    title: "Study Together",
    description:
      "Join study groups, challenge friends, and climb the global leaderboard.",
    icon: "👥",
    gradientColors: ["#4f46e5", "#6366f1"] as [string, string],
    particleColor: "#c4b5fd",
    iconBg: ["#818cf8", "#4f46e5"] as [string, string],
  },
  {
    title: "Ready to Begin?",
    description:
      "Join thousands of students already crushing their goals with StudentOS.",
    icon: "🚀",
    gradientColors: ["#c026d3", "#7c3aed"] as [string, string],
    particleColor: "#e879f9",
    iconBg: ["#d946ef", "#c026d3"] as [string, string],
  },
] as const;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function PulsingButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
    opacity.value = withTiming(0.2, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    opacity.value = withTiming(0.4, { duration: 100 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.pulsingWrapper, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

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

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      flatListRef.current?.scrollToIndex({ index: prev, animated: true });
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setOnboardingSeen(true);
  }, [setOnboardingSeen]);

  const handleComplete = useCallback(() => {
    setOnboardingSeen(true);
  }, [setOnboardingSeen]);

  const handleDotPress = useCallback((index: number) => {
    setCurrentStep(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.topBar}>
        <View style={styles.spacer} />
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

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
            iconBg={[item.iconBg[0], item.iconBg[1]]}
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
            <Pressable key={index} onPress={() => handleDotPress(index)}>
              <View
                style={[
                  styles.dot,
                  index === currentStep ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </Pressable>
          ))}
        </View>

        {isLastStep ? (
          <PulsingButton onPress={handleComplete}>
            <View style={styles.getStartedBtn}>
              <Text style={styles.getStartedText}>Get Started</Text>
              <Text style={styles.rocketEmoji}>🚀</Text>
            </View>
          </PulsingButton>
        ) : (
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>Back</Text>
              </Pressable>
            )}
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Text style={styles.arrowIcon}>→</Text>
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
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  skipText: {
    fontSize: typography.base,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  bottomContainer: {
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
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: "#ffffff",
    width: 32,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 10,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  backBtnText: {
    fontSize: typography.base,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    gap: spacing.sm,
  },
  nextBtnText: {
    fontSize: typography.base,
    color: "#ffffff",
    fontWeight: "600",
  },
  arrowIcon: {
    fontSize: typography.lg,
    color: "#ffffff",
  },
  pulsingWrapper: {
    shadowColor: "rgba(255,255,255,0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
  getStartedBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing["2xl"],
    borderRadius: 16,
    gap: spacing.sm,
  },
  getStartedText: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: "#7c3aed",
  },
  rocketEmoji: {
    fontSize: 20,
  },
});
