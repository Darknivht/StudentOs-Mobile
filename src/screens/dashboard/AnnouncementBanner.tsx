import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { colors, spacing, typography } from "../../lib/theme";

const TYPE_STYLES: Record<
  string,
  { bg: string; border: string; text: string; icon: string }
> = {
  info: {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "#3b82f6",
    text: "#93c5fd",
    icon: "ℹ️",
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "#f59e0b",
    text: "#fcd34d",
    icon: "⚠️",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.15)",
    border: "#22c55e",
    text: "#86efac",
    icon: "✅",
  },
};

export function AnnouncementBanner() {
  const { announcements } = useAnnouncements();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = announcements.find((a) => !dismissed.has(a.id));
  if (!visible) return null;

  const style = TYPE_STYLES[visible.type] || TYPE_STYLES.info;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: style.bg,
          borderLeftColor: style.border,
        },
      ]}
    >
      <Text style={styles.icon}>{style.icon}</Text>
      <View style={styles.content}>
        <Text style={[styles.title, { color: style.text }]}>
          {visible.title}
        </Text>
        <Text style={[styles.message, { color: style.text }]}>
          {visible.message}
        </Text>
      </View>
      <Pressable
        style={styles.dismissBtn}
        onPress={() => setDismissed((prev) => new Set(prev).add(visible.id))}
      >
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.sm,
    fontWeight: "600",
  },
  message: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  dismissBtn: {
    padding: spacing.sm,
  },
  dismissText: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
});
