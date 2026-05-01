import { View, Text, Image, Pressable, StyleSheet } from "react-native";
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
      <Pressable
        style={styles.bellButton}
        android_ripple={{ color: colors.muted, radius: 18 }}
      >
        <Text style={styles.bellIcon}>🔔</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  name: {
    fontSize: typography.xl,
    fontWeight: "700",
    color: colors.foreground,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  bellIcon: {
    fontSize: 18,
  },
});
