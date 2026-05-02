import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Text, Pressable, Share, Alert, StyleSheet } from "react-native";
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

  const actions = [
    {
      icon: "👁️",
      label: "View & Edit",
      onPress: () => {
        sheetRef.current?.dismiss();
        onEdit(note.id);
      },
    },
    {
      icon: "📝",
      label: "Generate Summary",
      onPress: () => {
        sheetRef.current?.dismiss();
        onGenerateSummary(note.id);
      },
    },
    {
      icon: "🃏",
      label: "Generate Flashcards",
      onPress: () => {
        sheetRef.current?.dismiss();
        onGenerateFlashcards(note.id);
      },
    },
    {
      icon: "❓",
      label: "Generate Quiz",
      onPress: () => {
        sheetRef.current?.dismiss();
        onGenerateQuiz(note.id);
      },
    },
    {
      icon: "🎓",
      label: "Ask AI Tutor",
      onPress: () => {
        sheetRef.current?.dismiss();
        onAskTutor(note.id);
      },
    },
    {
      icon: "🔗",
      label: "Share",
      onPress: async () => {
        sheetRef.current?.dismiss();
        try {
          const plainText = note.content.replace(/<[^>]*>/g, "");
          await Share.share({
            title: note.title,
            message: `${note.title}\n\n${plainText.slice(0, 500)}`,
          });
        } catch {}
      },
    },
    {
      icon: "🗑️",
      label: "Delete",
      destructive: true,
      onPress: () => {
        sheetRef.current?.dismiss();
        Alert.alert("Delete Note?", "This cannot be undone.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(note.id),
          },
        ]);
      },
    },
  ];

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["50%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle} numberOfLines={1}>
            {note.title || "Untitled"}
          </Text>
          {note.courseName && (
            <View style={styles.courseTag}>
              {note.courseEmoji && (
                <Text style={styles.courseTagEmoji}>{note.courseEmoji}</Text>
              )}
              <Text style={styles.courseTagText}>{note.courseName}</Text>
            </View>
          )}
        </View>
        <View style={styles.divider} />
        {actions.map((action) => (
          <Pressable
            key={action.label}
            style={styles.actionRow}
            onPress={action.onPress}
            android_ripple={{ color: colors.muted }}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text
              style={[
                styles.actionLabel,
                action.destructive && styles.actionLabelDestructive,
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
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
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}22`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  courseTagEmoji: {
    fontSize: typography.xs,
  },
  courseTagText: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    gap: spacing.md,
  },
  actionIcon: {
    fontSize: typography.lg,
    width: 28,
    textAlign: "center",
  },
  actionLabel: {
    fontSize: typography.base,
    color: colors.foreground,
    flex: 1,
  },
  actionLabelDestructive: {
    color: colors.destructive,
  },
});
