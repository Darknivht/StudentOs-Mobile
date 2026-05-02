import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { useNotes } from "../../hooks/useNotes";
import { useNoteQuota } from "../../hooks/useNoteQuota";
import { useCourses } from "../../hooks/useCourses";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useNotesEditorStore } from "../../stores/notesStore";
import { FileUploadProgress } from "./FileUploadProgress";
import { CameraOCRButton } from "./CameraOCRButton";
import { AttachFileButton } from "./AttachFileButton";
import { colors, spacing, typography } from "../../lib/theme";

interface NoteEditorScreenProps {
  navigation: any;
  route: {
    params?: {
      noteId?: string;
      courseId?: string;
    };
  };
}

export function NoteEditorScreen({ navigation, route }: NoteEditorScreenProps) {
  const insets = useSafeAreaInsets();
  const noteId = route.params?.noteId;
  const initialCourseId = route.params?.courseId;

  const { notes, createNote, updateNote } = useNotes();
  const { isQuotaExceeded, quotaLimit, notesCreatedToday } = useNoteQuota();
  const { courses } = useCourses();
  const fileUpload = useFileUpload();
  const {
    isDirty,
    isSaving,
    lastSavedAt,
    setDirty,
    setSaved,
    setSaving,
    reset,
  } = useNotesEditorStore();

  const existingNote = noteId ? notes.find((n) => n.id === noteId) : null;

  const [title, setTitle] = useState(existingNote?.title ?? "");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    existingNote?.courseId ?? initialCourseId ?? null,
  );
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isFirstSave, setIsFirstSave] = useState(!noteId);

  const richTextRef = useRef<RichEditor>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContentRef = useRef({
    title: existingNote?.title ?? "",
    content: existingNote?.content ?? "",
  });
  const currentNoteIdRef = useRef(noteId ?? null);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleContentChange = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      const currentTitle = title.trim();

      if (
        currentTitle === lastSavedContentRef.current.title &&
        trimmedContent === lastSavedContentRef.current.content.trim()
      ) {
        return;
      }

      setDirty(true);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      autoSaveTimerRef.current = setTimeout(async () => {
        await performSave(currentTitle, content);
      }, 3000);
    },
    [title, noteId],
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      setDirty(true);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      autoSaveTimerRef.current = setTimeout(async () => {
        const content = (await richTextRef.current?.getContentHtml?.()) ?? "";
        await performSave(newTitle, content);
      }, 3000);
    },
    [noteId],
  );

  const performSave = useCallback(
    async (currentTitle: string, currentContent: string) => {
      const trimmedTitle = currentTitle.trim() || "Untitled";
      const trimmedContent = currentContent.trim();

      if (
        trimmedTitle === lastSavedContentRef.current.title &&
        trimmedContent === lastSavedContentRef.current.content.trim()
      ) {
        return;
      }

      if (isFirstSave && isQuotaExceeded) {
        Alert.alert(
          "Daily note limit reached",
          `You've used ${notesCreatedToday}/${quotaLimit === Infinity ? "∞" : quotaLimit} notes today. Upgrade for more.`,
          [{ text: "OK" }],
        );
        return;
      }

      setSaving(true);
      try {
        if (isFirstSave || !currentNoteIdRef.current) {
          const result = await createNote({
            title: trimmedTitle,
            content: trimmedContent,
            courseId: selectedCourseId,
          });
          if (result) {
            currentNoteIdRef.current = result.id;
            setIsFirstSave(false);
          }
        } else {
          await updateNote(currentNoteIdRef.current, {
            title: trimmedTitle,
            content: trimmedContent,
            courseId: selectedCourseId,
          });
        }

        lastSavedContentRef.current = {
          title: trimmedTitle,
          content: trimmedContent,
        };
        setSaved();
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    },
    [
      isFirstSave,
      isQuotaExceeded,
      notesCreatedToday,
      quotaLimit,
      selectedCourseId,
      createNote,
      updateNote,
      setSaving,
      setSaved,
    ],
  );

  const handleDone = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (isDirty) {
      const content = (await richTextRef.current?.getContentHtml?.()) ?? "";
      await performSave(title, content);
    }

    reset();
    navigation.goBack();
  }, [isDirty, title, performSave, reset, navigation]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  useEffect(() => {
    if (
      !fileUpload.isUploading &&
      fileUpload.progress >= 100 &&
      fileUpload.extractedText
    ) {
      const html = `<p>${fileUpload.extractedText.replace(/\n/g, "</p><p>")}</p>`;
      richTextRef.current?.insertHTML?.(html);
      fileUpload.reset();
    }
  }, [fileUpload.isUploading, fileUpload.progress, fileUpload.extractedText]);

  function getSaveStatusText(): string {
    if (isSaving) return "Saving...";
    if (isDirty) return "Unsaved";
    if (lastSavedAt) return "Saved ✓";
    return "";
  }

  function getSaveStatusColor(): string {
    if (isSaving) return colors.warning;
    if (isDirty) return colors.mutedForeground;
    return colors.success;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>

        <Pressable
          style={styles.courseSelector}
          onPress={() => setShowCourseModal(true)}
        >
          {selectedCourse ? (
            <View style={styles.courseSelectorContent}>
              {selectedCourse.emoji ? (
                <Text style={styles.courseSelectorEmoji}>
                  {selectedCourse.emoji}
                </Text>
              ) : null}
              <Text style={styles.courseSelectorText} numberOfLines={1}>
                {selectedCourse.title}
              </Text>
            </View>
          ) : (
            <Text style={styles.courseSelectorPlaceholder}>Select course</Text>
          )}
          <Text style={styles.courseSelectorChevron}>▾</Text>
        </Pressable>

        <Pressable onPress={handleDone} hitSlop={12}>
          <Text style={styles.doneButton}>Done</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={handleTitleChange}
        placeholder="Note title..."
        placeholderTextColor={colors.mutedForeground}
        maxLength={200}
      />

      <ScrollView
        horizontal
        style={styles.toolbarContainer}
        showsHorizontalScrollIndicator={false}
      >
        <RichToolbar
          editor={richTextRef}
          selectedIconTint={colors.primary}
          iconTint={colors.mutedForeground}
          unselectedButtonStyle={styles.toolbarButton}
          selectedButtonStyle={styles.toolbarButtonSelected}
          style={styles.toolbar}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.heading1,
            actions.heading2,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.code,
          ]}
        />
      </ScrollView>

      <View style={styles.editorContainer}>
        <RichEditor
          ref={richTextRef}
          style={styles.editor}
          editorStyle={{
            backgroundColor: colors.card,
            color: colors.foreground,
            caretColor: colors.primary,
            placeholderColor: colors.mutedForeground,
            contentCSSText: `font-size: 16px; line-height: 1.6;`,
          }}
          placeholder="Start writing..."
          initialContentHTML={existingNote?.content ?? ""}
          onChange={handleContentChange}
          initialHeight={400}
          useContainer={false}
        />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomActions}>
          <CameraOCRButton
            onCameraPress={fileUpload.handleCameraOCR}
            onGalleryPress={fileUpload.handleGalleryOCR}
            isUploading={fileUpload.isUploading}
          />
          <AttachFileButton
            onPress={fileUpload.handleDocumentUpload}
            isUploading={fileUpload.isUploading}
          />
        </View>
        <Text style={[styles.saveStatus, { color: getSaveStatusColor() }]}>
          {getSaveStatusText()}
        </Text>
      </View>
      <FileUploadProgress state={fileUpload} />

      <Modal
        visible={showCourseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCourseModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCourseModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Course</Text>
              <Pressable onPress={() => setShowCourseModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <FlatList
              data={[{ id: null, title: "No course", emoji: null }, ...courses]}
              keyExtractor={(item) => item.id ?? "__none__"}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.courseOption,
                    selectedCourseId === item.id && styles.courseOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedCourseId(item.id);
                    setShowCourseModal(false);
                  }}
                >
                  <Text style={styles.courseOptionEmoji}>
                    {item.emoji ?? "📝"}
                  </Text>
                  <Text
                    style={[
                      styles.courseOptionText,
                      selectedCourseId === item.id &&
                        styles.courseOptionTextSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {selectedCourseId === item.id && (
                    <Text style={styles.courseOptionCheck}>✓</Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    fontSize: typography.xl,
    color: colors.foreground,
    fontWeight: "600",
  },
  courseSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flex: 1,
    marginHorizontal: spacing.sm,
    maxWidth: 200,
  },
  courseSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  courseSelectorEmoji: {
    fontSize: typography.sm,
  },
  courseSelectorText: {
    fontSize: typography.sm,
    color: colors.foreground,
    flex: 1,
  },
  courseSelectorPlaceholder: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    flex: 1,
  },
  courseSelectorChevron: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    marginLeft: spacing.xs,
  },
  doneButton: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: "600",
  },
  titleInput: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.foreground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  toolbarContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toolbar: {
    backgroundColor: colors.card,
  },
  toolbarButton: {
    backgroundColor: "transparent",
  },
  toolbarButtonSelected: {
    backgroundColor: `${colors.primary}22`,
  },
  editorContainer: {
    flex: 1,
  },
  editor: {
    flex: 1,
    backgroundColor: colors.card,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  bottomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  saveStatus: {
    fontSize: typography.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.foreground,
  },
  modalClose: {
    fontSize: typography.lg,
    color: colors.mutedForeground,
  },
  courseOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  courseOptionSelected: {
    backgroundColor: `${colors.primary}11`,
  },
  courseOptionEmoji: {
    fontSize: typography.lg,
  },
  courseOptionText: {
    fontSize: typography.base,
    color: colors.foreground,
    flex: 1,
  },
  courseOptionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  courseOptionCheck: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: "700",
  },
});
