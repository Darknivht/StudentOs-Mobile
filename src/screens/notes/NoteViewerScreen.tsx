import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useNotes } from "../../hooks/useNotes";
import { useNoteAI } from "../../hooks/useNoteAI";
import { SummaryResultSheet } from "./SummaryResultSheet";
import { SocraticChatSheet } from "./SocraticChatSheet";
import type { SummaryLength } from "../../services/notes/aiSummary";
import { colors, spacing, typography } from "../../lib/theme";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  pdf: "PDF",
  docx: "DOCX",
  image: "Image",
};

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

interface NoteViewerScreenProps {
  navigation: any;
  route: {
    params: {
      noteId: string;
    };
  };
}

export function NoteViewerScreen({ navigation, route }: NoteViewerScreenProps) {
  const insets = useSafeAreaInsets();
  const { noteId } = route.params;
  const { notes, refetch: refetchNotes } = useNotes();
  const note = notes.find((n) => n.id === noteId);

  const {
    isStreaming,
    summaryText,
    socraticMessages,
    error: aiError,
    generateSummary,
    startSocratic,
    sendSocratic,
    resetSummary,
    resetSocratic,
  } = useNoteAI();

  const summarySheetRef = useRef<any>(null);
  const socraticSheetRef = useRef<any>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");

  const handleEdit = useCallback(() => {
    navigation.navigate("NoteEditor", { noteId });
  }, [navigation, noteId]);

  const handleShare = useCallback(async () => {
    if (!note) return;
    try {
      const plainText = stripHtml(note.content);
      await Share.share({
        title: note.title,
        message: `${note.title}\n\n${plainText}`,
      });
    } catch {}
  }, [note]);

  const handleGenerateSummary = useCallback(() => {
    if (!note) return;
    summarySheetRef.current?.present();
    generateSummary(note, summaryLength);
  }, [note, generateSummary, summaryLength]);

  const handleSummaryLengthChange = useCallback(
    (length: SummaryLength) => {
      setSummaryLength(length);
      if (note) {
        generateSummary(note, length);
      }
    },
    [note, generateSummary],
  );

  const handleStartSocratic = useCallback(() => {
    if (!note) return;
    socraticSheetRef.current?.present();
    startSocratic(note);
  }, [note, startSocratic]);

  const handleSendSocraticMessage = useCallback(
    (message: string) => {
      if (!note) return;
      sendSocratic(note, message);
    },
    [note, sendSocratic],
  );

  if (!note) {
    return (
      <View
        style={[styles.container, styles.centered, { paddingTop: insets.top }]}
      >
        <Text style={styles.emptyEmoji}>📝</Text>
        <Text style={styles.emptyTitle}>Note not found</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const plainContent = stripHtml(note.content);

  return (
    <BottomSheetModalProvider>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.topBackButton}>← Back</Text>
          </Pressable>
          <View style={styles.topActions}>
            <Pressable style={styles.topAction} onPress={handleGenerateSummary}>
              <Text style={styles.topActionIcon}>📝</Text>
            </Pressable>
            <Pressable style={styles.topAction} onPress={handleStartSocratic}>
              <Text style={styles.topActionIcon}>🎓</Text>
            </Pressable>
            <Pressable style={styles.topAction} onPress={handleShare}>
              <Text style={styles.topActionIcon}>🔗</Text>
            </Pressable>
            <Pressable style={styles.topAction} onPress={handleEdit}>
              <Text style={styles.topActionIcon}>✏️</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{note.title || "Untitled"}</Text>

          <View style={styles.metaRow}>
            <View style={styles.sourceBadge}>
              <View
                style={[
                  styles.sourceDot,
                  {
                    backgroundColor:
                      note.sourceType === "pdf"
                        ? colors.warning
                        : note.sourceType === "docx"
                          ? "#3b82f6"
                          : note.sourceType === "image"
                            ? colors.success
                            : colors.mutedForeground,
                  },
                ]}
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
                    note.courseColor ? { color: note.courseColor } : undefined,
                  ]}
                >
                  {note.courseName}
                </Text>
              </View>
            )}
            <Text style={styles.date}>{getRelativeDate(note.updatedAt)}</Text>
          </View>

          {note.originalFilename && (
            <View style={styles.fileRow}>
              <Text style={styles.fileIcon}>📎</Text>
              <Text style={styles.fileName} numberOfLines={1}>
                {note.originalFilename}
              </Text>
            </View>
          )}

          {note.summary && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>AI Summary</Text>
              <Text style={styles.summaryText}>{note.summary}</Text>
            </View>
          )}

          <View style={styles.aiActionsRow}>
            <Pressable
              style={styles.aiAction}
              onPress={handleGenerateSummary}
              android_ripple={{ color: colors.muted }}
            >
              <Text style={styles.aiActionIcon}>📝</Text>
              <Text style={styles.aiActionLabel}>Summary</Text>
            </Pressable>
            <Pressable
              style={styles.aiAction}
              onPress={handleStartSocratic}
              android_ripple={{ color: colors.muted }}
            >
              <Text style={styles.aiActionIcon}>🎓</Text>
              <Text style={styles.aiActionLabel}>Socratic Tutor</Text>
            </Pressable>
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{plainContent}</Text>
          </View>
        </ScrollView>

        <SummaryResultSheet
          ref={summarySheetRef}
          summaryText={summaryText}
          isStreaming={isStreaming}
          error={aiError}
          onLengthChange={handleSummaryLengthChange}
          currentLength={summaryLength}
          onRetry={() => note && generateSummary(note, summaryLength)}
          onDismiss={resetSummary}
        />

        <SocraticChatSheet
          ref={socraticSheetRef}
          messages={socraticMessages}
          isStreaming={isStreaming}
          error={aiError}
          onSendMessage={handleSendSocraticMessage}
          onDismiss={resetSocratic}
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBackButton: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: "600",
  },
  topActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  topAction: {
    padding: spacing.xs,
  },
  topActionIcon: {
    fontSize: typography.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  fileIcon: {
    fontSize: typography.sm,
  },
  fileName: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.foreground,
  },
  summaryCard: {
    backgroundColor: `${colors.primary}11`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  summaryText: {
    fontSize: typography.sm,
    color: colors.foreground,
    lineHeight: 22,
  },
  aiActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  aiAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flex: 1,
    justifyContent: "center",
  },
  aiActionIcon: {
    fontSize: typography.base,
  },
  aiActionLabel: {
    fontSize: typography.sm,
    color: colors.foreground,
    fontWeight: "500",
  },
  contentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentText: {
    fontSize: typography.base,
    color: colors.foreground,
    lineHeight: 26,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButtonText: {
    color: colors.primaryForeground,
    fontWeight: "600",
    fontSize: typography.base,
  },
});
