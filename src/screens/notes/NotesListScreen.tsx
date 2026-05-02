import { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useNotes } from "../../hooks/useNotes";
import { useCourses } from "../../hooks/useCourses";
import { SearchBar } from "./SearchBar";
import { QuotaIndicator } from "./QuotaIndicator";
import { NotesSection } from "./NotesSection";
import { QuickActionsSheet } from "./QuickActionsSheet";
import { colors, spacing, typography } from "../../lib/theme";
import type { NoteWithCourse } from "../../types/note";

interface SectionData {
  courseId: string | null;
  title: string;
  emoji: string | null;
  color: string | null;
  notes: NoteWithCourse[];
}

export function NotesListScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { notes, isLoading, deleteNote, togglePin } = useNotes();
  const { courses } = useCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<NoteWithCourse | null>(null);
  const quickActionsRef = useRef<any>(null);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter((n) => n.title.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  const sections = useMemo(() => {
    const grouped = new Map<string, NoteWithCourse[]>();

    for (const note of filteredNotes) {
      const key = note.courseId ?? "__uncategorized__";
      const list = grouped.get(key) ?? [];
      list.push(note);
      grouped.set(key, list);
    }

    const result: SectionData[] = [];

    const courseOrder = courses.map((c) => c.id);
    for (const courseId of courseOrder) {
      const sectionNotes = grouped.get(courseId);
      if (sectionNotes && sectionNotes.length > 0) {
        const course = courses.find((c) => c.id === courseId);
        result.push({
          courseId,
          title: course?.title ?? "Unknown Course",
          emoji: course?.emoji ?? null,
          color: course?.color ?? null,
          notes: sectionNotes,
        });
        grouped.delete(courseId);
      }
    }

    const uncategorized = grouped.get("__uncategorized__");
    if (uncategorized && uncategorized.length > 0) {
      result.push({
        courseId: null,
        title: "Uncategorized",
        emoji: null,
        color: null,
        notes: uncategorized,
      });
    }

    return result;
  }, [filteredNotes, courses]);

  const handleNotePress = useCallback(
    (id: string) => {
      navigation.navigate("NoteViewer", { noteId: id });
    },
    [navigation],
  );

  const handleSwipeDelete = useCallback(
    async (id: string) => {
      await deleteNote(id);
    },
    [deleteNote],
  );

  const handleSwipePin = useCallback(
    async (id: string, isPinned: boolean) => {
      await togglePin(id, isPinned);
    },
    [togglePin],
  );

  const handleNewNote = useCallback(() => {
    navigation.navigate("NoteEditor", {});
  }, [navigation]);

  const handleNoteLongPress = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note) {
        setSelectedNote(note);
        setTimeout(() => quickActionsRef.current?.present?.(), 50);
      }
    },
    [notes],
  );

  const handleQuickActionEdit = useCallback(
    (noteId: string) => {
      navigation.navigate("NoteEditor", { noteId });
    },
    [navigation],
  );

  const handleQuickActionDelete = useCallback(
    async (noteId: string) => {
      await deleteNote(noteId);
      setSelectedNote(null);
    },
    [deleteNote],
  );

  const handleQuickActionSummary = useCallback(
    (noteId: string) => {
      navigation.navigate("NoteViewer", { noteId });
    },
    [navigation],
  );

  const handleQuickActionFlashcards = useCallback(
    (noteId: string) => {
      navigation.navigate("NoteViewer", { noteId });
    },
    [navigation],
  );

  const handleQuickActionQuiz = useCallback(
    (noteId: string) => {
      navigation.navigate("NoteViewer", { noteId });
    },
    [navigation],
  );

  const handleQuickActionTutor = useCallback(
    (noteId: string) => {
      navigation.navigate("NoteViewer", { noteId });
    },
    [navigation],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Notes</Text>
        </View>
        <View style={styles.searchContainer}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <QuotaIndicator />
        {sections.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to create your first note
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {sections.map((section) => (
              <NotesSection
                key={section.courseId ?? "__uncategorized__"}
                title={section.title}
                emoji={section.emoji}
                color={section.color}
                notes={section.notes}
                onNotePress={handleNotePress}
                onSwipeDelete={handleSwipeDelete}
                onSwipePin={handleSwipePin}
                onNoteLongPress={handleNoteLongPress}
              />
            ))}
          </ScrollView>
        )}
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 20 }]}
          onPress={handleNewNote}
          android_ripple={{ color: colors.muted, borderless: true }}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
        <QuickActionsSheet
          ref={quickActionsRef}
          note={selectedNote}
          onEdit={handleQuickActionEdit}
          onDelete={handleQuickActionDelete}
          onGenerateSummary={handleQuickActionSummary}
          onGenerateFlashcards={handleQuickActionFlashcards}
          onGenerateQuiz={handleQuickActionQuiz}
          onAskTutor={handleQuickActionTutor}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  screenTitle: {
    fontSize: typography["3xl"],
    fontWeight: "700",
    color: colors.foreground,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: "600",
    color: colors.foreground,
  },
  emptySubtitle: {
    fontSize: typography.base,
    color: colors.mutedForeground,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
});
