import { View, Text, StyleSheet } from "react-native";
import { useNetInfo } from "../../hooks/useNetInfo";
import { colors, spacing, typography } from "../../lib/theme";

export function OfflineBanner() {
  const { isOffline } = useNetInfo();
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        ⚠️ You're offline — some features may be limited
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  text: {
    fontSize: typography.sm,
    color: colors.warning,
  },
});
