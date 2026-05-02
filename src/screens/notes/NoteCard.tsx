import { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
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
}: NoteCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const accentColor = SOURCE_COLORS[note.sourceType] || colors.mutedForeground;
  const preview = stripHtml(note.content).slice(0, 150);

  function renderLeftAction() {
    return (
      <Pressable
        style={[styles.swipeAction, styles.pinAction]}
        onPress={() => {
          swipeableRef.current?.close();
          onSwipePin(note.id, !note.isPinned);
        }}
      >
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
        <Text style={styles.swipeActionText}>Delete</Text>
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
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {note.title || "Untitled"}
              </Text>
              {note.isPinned && <Text style={styles.pinIcon}>📌</Text>}
            </View>
            {preview.length > 0 && (
              <Text style={styles.preview} numberOfLines={2}>
                {preview}
              </Text>
            )}
            <View style={styles.bottomRow}>
              <View style={styles.sourceBadge}>
                <View
                  style={[styles.sourceDot, { backgroundColor: accentColor }]}
                />
                <Text style={styles.sourceLabel}>
                  {SOURCE_LABELS[note.sourceType] || "Manual"}
                </Text>
              </View>
              {note.courseName && (
                <View
                  style={[
                    styles.courseTag,
                    note.courseColor
                      ? { backgroundColor: `${note.courseColor}22` }
                      : undefined,
                  ]}
                >
                  {note.courseEmoji && (
                    <Text style={styles.courseEmoji}>{note.courseEmoji}</Text>
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
              )}
              <Text style={styles.date}>{getRelativeDate(note.updatedAt)}</Text>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  accentBar: {
    width: 4,
    marginVertical: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
  },
  pinIcon: {
    fontSize: 14,
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
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sourceLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}22`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  courseEmoji: {
    fontSize: typography.xs,
  },
  courseLabel: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: "500",
  },
  date: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginLeft: "auto",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: spacing.xs,
  },
  pinAction: {
    backgroundColor: colors.primary,
  },
  deleteAction: {
    backgroundColor: colors.destructive,
  },
  swipeActionText: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: typography.sm,
  },
});
