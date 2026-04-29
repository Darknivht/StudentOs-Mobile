import { View, Text, Image, StyleSheet } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { getGreeting } from "../../lib/utils";
import { colors, spacing, typography } from "../../lib/theme";

export function GreetingSection() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.displayName || "Student";
  const avatarUrl = user?.avatarUrl;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>
      <View style={styles.bellPlaceholder}>
        <Text style={styles.bellIcon}>🔔</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.lg,
    color: colors.secondaryForeground,
  },
  name: {
    fontSize: typography.xl,
    fontWeight: "700",
    color: colors.foreground,
  },
  bellPlaceholder: {
    padding: spacing.sm,
  },
  bellIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
});
