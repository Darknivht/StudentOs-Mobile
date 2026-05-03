import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Text, Pressable, Share, Alert, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import type { NoteWithCourse } from "../../types/note";
import { colors, spacing, typography } from "../../lib/theme";

interface QuickActionsSheetProps {
  note: NoteWithCourse | null;
  onEdit: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onGenerateSummary: (noteId: string) => void;
  onGenerateFlashcards: (noteId: string) => void;
  onGenerateQuiz: (noteId: string) => void;
  onAskTutor: (noteId: string) => void;
}

interface ActionConfig {
  icon: string;
  label: string;
  gradient: [string, string];
  action: "edit" | "summary" | "flashcards" | "quiz" | "tutor" | "share";
}

const ACTION_CONFIGS: ActionConfig[] = [
  {
    icon: "📝",
    label: "View & Edit",
    gradient: ["#7c3aed", "#6366f1"],
    action: "edit",
  },
  {
    icon: "✨",
    label: "AI Summary",
    gradient: ["#10b981", "#059669"],
    action: "summary",
  },
  {
    icon: "🃏",
    label: "Flashcards",
    gradient: ["#0ea5e9", "#0284c7"],
    action: "flashcards",
  },
  {
    icon: "❓",
    label: "Generate Quiz",
    gradient: ["#f59e0b", "#d97706"],
    action: "quiz",
  },
  {
    icon: "🎓",
    label: "Ask AI Tutor",
    gradient: ["#8b5cf6", "#7c3aed"],
    action: "tutor",
  },
  {
    icon: "🔗",
    label: "Share",
    gradient: ["#6b7280", "#4b5563"],
    action: "share",
  },
];

export const QuickActionsSheet = forwardRef(function QuickActionsSheet(
  {
    note,
    onEdit,
    onDelete,
    onGenerateSummary,
    onGenerateFlashcards,
    onGenerateQuiz,
    onAskTutor,
  }: QuickActionsSheetProps,
  ref,
) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  if (!note) return null;

  const handleAction = useCallback(
    (action: ActionConfig["action"]) => {
      sheetRef.current?.dismiss();
      switch (action) {
        case "edit":
          onEdit(note.id);
          break;
        case "summary":
          onGenerateSummary(note.id);
          break;
        case "flashcards":
          onGenerateFlashcards(note.id);
          break;
        case "quiz":
          onGenerateQuiz(note.id);
          break;
        case "tutor":
          onAskTutor(note.id);
          break;
        case "share":
          (async () => {
            try {
              const plainText = note.content.replace(/<[^>]*>/g, "");
              await Share.share({
                title: note.title,
                message: `${note.title}\n\n${plainText.slice(0, 500)}`,
              });
            } catch {}
          })();
          break;
      }
    },
    [
      note,
      onEdit,
      onGenerateSummary,
      onGenerateFlashcards,
      onGenerateQuiz,
      onAskTutor,
    ],
  );

  const handleDelete = () => {
    sheetRef.current?.dismiss();
    Alert.alert("Delete Note?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(note.id),
      },
    ]);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["60%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle} numberOfLines={1}>
            {note.title || "Quick Actions"}
          </Text>
          <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={12}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        {note.courseName && (
          <View style={styles.courseTag}>
            {note.courseEmoji && (
              <Text style={styles.courseTagEmoji}>{note.courseEmoji}</Text>
            )}
            <Text style={styles.courseTagText}>{note.courseName}</Text>
          </View>
        )}

        <View style={styles.actionsGrid}>
          {ACTION_CONFIGS.map((action) => (
            <Pressable
              key={action.label}
              style={styles.actionCard}
              onPress={() => handleAction(action.action)}
            >
              <LinearGradient
                colors={action.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconBox}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}

          <Pressable style={styles.actionCard} onPress={handleDelete}>
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIconBox}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
            </LinearGradient>
            <Text style={[styles.actionLabel, styles.deleteLabel]}>Delete</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: colors.mutedForeground,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  sheetTitle: {
    flex: 1,
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.foreground,
    marginRight: spacing.sm,
  },
  closeButton: {
    fontSize: typography.lg,
    color: colors.mutedForeground,
    padding: spacing.xs,
  },
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  courseTagEmoji: {
    fontSize: typography.xs,
  },
  courseTagText: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: "500",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionCard: {
    width: "31%",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: typography.xs,
    color: colors.foreground,
    fontWeight: "500",
    textAlign: "center",
  },
  deleteLabel: {
    color: colors.destructive,
  },
});
