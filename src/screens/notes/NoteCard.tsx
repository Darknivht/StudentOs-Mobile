import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import type { NoteWithCourse } from "../../types/note";
import { colors, spacing, typography } from "../../lib/theme";

const SOURCE_COLORS: Record<string, string> = {
  manual: colors.mutedForeground,
  pdf: colors.warning,
  docx: "#3b82f6",
  image: colors.success,
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  pdf: "PDF",
  docx: "DOCX",
  image: "Image",
};

interface NoteCardProps {
  note: NoteWithCourse;
  onPress: (id: string) => void;
  onSwipeDelete: (id: string) => void;
  onSwipePin: (id: string, isPinned: boolean) => void;
  onLongPress?: (id: string) => void;
  onSummary?: (id: string) => void;
  onTutor?: (id: string) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function getRelativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NoteCard({
  note,
  onPress,
  onSwipeDelete,
  onSwipePin,
  onLongPress,
  onSummary,
  onTutor,
}: NoteCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const accentColor = SOURCE_COLORS[note.sourceType] || colors.mutedForeground;
  const preview = stripHtml(note.content).slice(0, 120);

  function renderLeftAction() {
    return (
      <Pressable
        style={[styles.swipeAction, styles.pinAction]}
        onPress={() => {
          swipeableRef.current?.close();
          onSwipePin(note.id, !note.isPinned);
        }}
      >
        <Text style={styles.swipeActionEmoji}>
          {note.isPinned ? "📌" : "📍"}
        </Text>
        <Text style={styles.swipeActionText}>
          {note.isPinned ? "Unpin" : "Pin"}
        </Text>
      </Pressable>
    );
  }

  function renderRightAction() {
    return (
      <Pressable
        style={[styles.swipeAction, styles.deleteAction]}
        onPress={() => {
          swipeableRef.current?.close();
          Alert.alert("Delete Note?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => onSwipeDelete(note.id),
            },
          ]);
        }}
      >
        <Text style={styles.swipeActionEmoji}>🗑️</Text>
        <Text style={[styles.swipeActionText, { color: "#fca5a5" }]}>
          Delete
        </Text>
      </Pressable>
    );
  }

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftAction}
        renderRightActions={renderRightAction}
        overshootLeft={false}
        overshootRight={false}
        friction={2}
      >
        <Pressable
          style={styles.card}
          onPress={() => onPress(note.id)}
          onLongPress={() => onLongPress?.(note.id)}
          delayLongPress={400}
          android_ripple={{ color: colors.muted }}
        >
          <View style={styles.cardBody}>
            {/* Icon + Title row */}
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Text style={styles.iconText}>📄</Text>
              </View>
              <View style={styles.titleMeta}>
                <Text style={styles.title} numberOfLines={1}>
                  {note.title || "Untitled"}
                </Text>
                {note.isPinned && <Text style={styles.pinBadge}>📌</Text>}
              </View>
              {/* Inline menu trigger */}
              <Pressable
                style={styles.menuBtn}
                onPress={() => setMenuOpen(!menuOpen)}
                hitSlop={8}
              >
                <Text style={styles.menuIcon}>⋮</Text>
              </Pressable>
            </View>

            {/* AI Summary badge — shown when summary exists */}
            {note.summary && (
              <View style={styles.summaryBadge}>
                <View style={styles.summaryBadgeLeft}>
                  <Text style={styles.summaryBadgeIcon}>✨</Text>
                  <Text style={styles.summaryBadgeLabel}>AI Summary</Text>
                </View>
                <Text style={styles.summaryBadgePreview} numberOfLines={1}>
                  {note.summary}
                </Text>
              </View>
            )}

            {/* Preview text */}
            {preview.length > 0 && (
              <Text style={styles.preview} numberOfLines={2}>
                {preview}
                {note.content.length > 120 ? "..." : ""}
              </Text>
            )}

            {/* Bottom row: course tag + source + date + actions */}
            <View style={styles.bottomRow}>
              <View style={styles.badges}>
                {/* Source badge */}
                <View style={styles.sourceBadge}>
                  <View
                    style={[styles.sourceDot, { backgroundColor: accentColor }]}
                  />
                  <Text style={styles.sourceLabel}>
                    {SOURCE_LABELS[note.sourceType] || "Manual"}
                  </Text>
                </View>

                {/* Course tag */}
                {note.courseName && (
                  <>
                    <Text style={styles.badgeDot}>·</Text>
                    <View
                      style={[
                        styles.courseTag,
                        note.courseColor
                          ? {
                              backgroundColor: `${note.courseColor}15`,
                              borderColor: `${note.courseColor}33`,
                            }
                          : undefined,
                      ]}
                    >
                      {note.courseEmoji && (
                        <Text style={styles.courseEmoji}>
                          {note.courseEmoji}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.courseLabel,
                          note.courseColor
                            ? { color: note.courseColor }
                            : undefined,
                        ]}
                        numberOfLines={1}
                      >
                        {note.courseName}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <Text style={styles.date}>{getRelativeDate(note.updatedAt)}</Text>
            </View>

            {/* Inline action buttons */}
            <View style={styles.actionRow}>
              {onSummary && (
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => onSummary(note.id)}
                  android_ripple={{ color: colors.muted }}
                >
                  <Text style={styles.actionIcon}>📝</Text>
                  <Text style={styles.actionLabel}>Summary</Text>
                </Pressable>
              )}
              {onTutor && (
                <>
                  {onSummary && <Text style={styles.actionDot}>·</Text>}
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => onTutor(note.id)}
                    android_ripple={{ color: colors.muted }}
                  >
                    <Text style={styles.actionIcon}>🎓</Text>
                    <Text style={styles.actionLabel}>Tutor</Text>
                  </Pressable>
                </>
              )}
            </View>

            {/* Inline dropdown menu */}
            {menuOpen && (
              <View style={styles.inlineMenu}>
                {note.summary && (
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuOpen(false);
                      onSummary?.(note.id);
                    }}
                  >
                    <Text style={styles.menuItemIcon}>📝</Text>
                    <Text style={styles.menuItemText}>View Summary</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    onPress(note.id);
                  }}
                >
                  <Text style={styles.menuItemIcon}>👁️</Text>
                  <Text style={styles.menuItemText}>View Note</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    onSwipePin(note.id, !note.isPinned);
                  }}
                >
                  <Text style={styles.menuItemIcon}>
                    {note.isPinned ? "📍" : "📌"}
                  </Text>
                  <Text style={styles.menuItemText}>
                    {note.isPinned ? "Unpin" : "Pin note"}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.menuItem, styles.menuItemDestructive]}
                  onPress={() => {
                    setMenuOpen(false);
                    Alert.alert("Delete Note?", "This cannot be undone.", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => onSwipeDelete(note.id),
                      },
                    ]);
                  }}
                >
                  <Text style={styles.menuItemIcon}>🗑️</Text>
                  <Text
                    style={[
                      styles.menuItemText,
                      styles.menuItemTextDestructive,
                    ]}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  cardBody: {
    padding: spacing.md,
    paddingLeft: spacing.md + 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  iconText: {
    fontSize: 16,
  },
  titleMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
  },
  pinBadge: {
    fontSize: 12,
  },
  menuBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  menuIcon: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  summaryBadge: {
    backgroundColor: `${colors.success}12`,
    borderWidth: 1,
    borderColor: `${colors.success}25`,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: 4,
  },
  summaryBadgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  summaryBadgeIcon: {
    fontSize: 10,
  },
  summaryBadgeLabel: {
    fontSize: typography.xs - 1,
    color: colors.success,
    fontWeight: "700",
  },
  summaryBadgePreview: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  preview: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sourceDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  sourceLabel: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
  },
  badgeDot: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
  },
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}14`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    gap: 3,
    maxWidth: 140,
  },
  courseEmoji: {
    fontSize: 10,
  },
  courseLabel: {
    fontSize: typography.xs - 1,
    color: colors.primary,
    fontWeight: "500",
    flex: 1,
  },
  date: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.muted,
  },
  actionIcon: {
    fontSize: 12,
  },
  actionLabel: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  actionDot: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
  },
  inlineMenu: {
    marginTop: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemDestructive: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    fontSize: 14,
    width: 20,
    textAlign: "center",
  },
  menuItemText: {
    fontSize: typography.sm,
    color: colors.foreground,
    flex: 1,
  },
  menuItemTextDestructive: {
    color: colors.destructive,
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 12,
    marginVertical: spacing.xs,
    gap: 4,
  },
  pinAction: {
    backgroundColor: `${colors.primary}22`,
  },
  deleteAction: {
    backgroundColor: `${colors.destructive}22`,
  },
  swipeActionEmoji: {
    fontSize: 20,
  },
  swipeActionText: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: typography.xs,
  },
});
