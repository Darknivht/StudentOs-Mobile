import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { typography, spacing } from "../../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingStepProps {
  title: string;
  description: string;
  icon: string;
  gradientColors: [string, string];
  particleColor: string;
}

export function OnboardingStep({
  title,
  description,
  icon,
  gradientColors,
}: OnboardingStepProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
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
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography["3xl"],
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.lg,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: typography.lg * 1.5,
  },
});
