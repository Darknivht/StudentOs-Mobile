import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { ParticleAnimation } from "./ParticleAnimation";
import { typography, spacing } from "../../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingStepProps {
  title: string;
  description: string;
  icon: string;
  gradientColors: [string, string];
  particleColor: string;
  iconBg: [string, string];
}

export function OnboardingStep({
  title,
  description,
  icon,
  gradientColors,
  particleColor,
  iconBg,
}: OnboardingStepProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ParticleAnimation color={particleColor} />
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Animated.View style={styles.glowRing}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glowGradient}
            />
          </Animated.View>
          <LinearGradient
            colors={iconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBox}
          >
            <Text style={styles.iconText}>{icon}</Text>
            <View style={styles.sparkle}>
              <Text style={styles.sparkleIcon}>✨</Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    zIndex: 1,
  },
  iconWrapper: {
    position: "relative",
    width: 128,
    height: 128,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  glowRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 40,
    opacity: 0.4,
    overflow: "hidden",
  },
  glowGradient: {
    width: "100%",
    height: "100%",
  },
  iconBox: {
    width: 128,
    height: 128,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconText: {
    fontSize: 56,
  },
  sparkle: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  sparkleIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 26,
  },
});
