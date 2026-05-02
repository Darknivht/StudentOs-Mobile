import { useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import type { NoteWithCourse } from "../../types/note";
import { NoteCard } from "./NoteCard";
import { colors, spacing, typography } from "../../lib/theme";

interface NotesSectionProps {
  title: string;
  emoji: string | null;
  color: string | null;
  notes: NoteWithCourse[];
  onNotePress: (id: string) => void;
  onSwipeDelete: (id: string) => void;
  onSwipePin: (id: string, isPinned: boolean) => void;
  onNoteLongPress?: (id: string) => void;
}

export function NotesSection({
  title,
  emoji,
  color,
  notes,
  onNotePress,
  onSwipeDelete,
  onSwipePin,
  onNoteLongPress,
}: NotesSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.header}
        onPress={() => setIsCollapsed(!isCollapsed)}
        android_ripple={{ color: colors.muted }}
      >
        <View style={styles.headerLeft}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <View
              style={[
                styles.emojiFallback,
                color ? { backgroundColor: `${color}33` } : undefined,
              ]}
            >
              <Text
                style={[
                  styles.emojiFallbackText,
                  color ? { color } : undefined,
                ]}
              >
                {title.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.noteCount}>{notes.length} notes</Text>
          <Text style={styles.chevron}>{isCollapsed ? "▸" : "▾"}</Text>
        </View>
      </Pressable>
      {!isCollapsed && (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={onNotePress}
              onSwipeDelete={onSwipeDelete}
              onSwipePin={onSwipePin}
              onLongPress={onNoteLongPress}
            />
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  emoji: {
    fontSize: typography.lg,
  },
  emojiFallback: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${colors.primary}33`,
  },
  emojiFallbackText: {
    fontSize: typography.xs,
    fontWeight: "700",
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  noteCount: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
  chevron: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
