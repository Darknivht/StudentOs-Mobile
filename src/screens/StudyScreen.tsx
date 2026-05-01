import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../lib/theme";

export function StudyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📚</Text>
      <Text style={styles.title}>Study</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.foreground,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.mutedForeground,
  },
});
