import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAuthStore } from "../../stores/authStore";
import { getGreeting } from "../../lib/utils";
import { colors, spacing, typography } from "../../lib/theme";

export function GreetingSection() {
  const user = useAuthStore((s) => s.user);
  const isOffline = !useNetInfo().isConnected;
  const displayName = user?.displayName || "Student";
  const avatarUrl = user?.avatarUrl;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {displayName} 👋
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineDot}>●</Text>
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
        <Pressable
          style={styles.bellButton}
          android_ripple={{ color: colors.muted, borderless: true }}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </Pressable>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  avatarWrapper: {
    position: "relative",
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
    backgroundColor: `${colors.primary}30`,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: `${colors.primary}50`,
  },
  avatarText: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.primary,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  name: {
    fontSize: typography.xl,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}18`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
  },
  offlineDot: {
    fontSize: 8,
    color: colors.warning,
  },
  offlineText: {
    fontSize: typography.xs - 1,
    color: colors.warning,
    fontWeight: "600",
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellIcon: {
    fontSize: 18,
  },
});
