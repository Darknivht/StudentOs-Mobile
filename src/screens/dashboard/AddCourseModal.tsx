import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { colors, spacing, typography } from "../../lib/theme";

const EMOJI_OPTIONS = [
  "📚",
  "🧮",
  "🔬",
  "🌍",
  "🎨",
  "💻",
  "📐",
  "🧪",
  "📖",
  "🎵",
  "🏛️",
  "🧠",
  "✍️",
  "📊",
  "🧬",
  "🔭",
];

const COLOR_OPTIONS = [
  "#7c3aed",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
  "#14b8a6",
  "#eab308",
  "#6366f1",
];

interface AddCourseModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateCourse: (params: {
    title: string;
    description?: string;
    color?: string;
    emoji?: string;
  }) => Promise<any>;
}

export function AddCourseModal({
  visible,
  onClose,
  onCreateCourse,
}: AddCourseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📚");
  const [selectedColor, setSelectedColor] = useState("#7c3aed");
  const [isCreating, setIsCreating] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setSelectedEmoji("📚");
    setSelectedColor("#7c3aed");
    setIsCreating(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleCreate() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert("Missing title", "Please enter a course name.");
      return;
    }

    setIsCreating(true);
    try {
      const result = await onCreateCourse({
        title: trimmedTitle,
        description: description.trim() || undefined,
        color: selectedColor,
        emoji: selectedEmoji,
      });

      if (result) {
        handleClose();
      } else {
        Alert.alert("Error", "Failed to create course. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Failed to create course. Please try again.");
    }
    setIsCreating(false);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Course</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.emojiRow}>
              {EMOJI_OPTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    selectedEmoji === emoji && styles.emojiOptionSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <Text style={styles.label}>Course Name</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Mathematics 101"
              placeholderTextColor={colors.mutedForeground}
              maxLength={100}
              autoFocus
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of this course"
              placeholderTextColor={colors.mutedForeground}
              maxLength={300}
              multiline
              numberOfLines={3}
            />

            <View style={styles.previewRow}>
              <View
                style={[styles.previewCard, { borderLeftColor: selectedColor }]}
              >
                <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
                <View style={styles.previewText}>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {title || "Course Name"}
                  </Text>
                  {description ? (
                    <Text style={styles.previewDesc} numberOfLines={1}>
                      {description}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <Pressable
              style={[
                styles.createButton,
                isCreating && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={isCreating}
            >
              <Text style={styles.createButtonText}>
                {isCreating ? "Creating..." : "Create Course"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.foreground,
  },
  closeButton: {
    fontSize: typography.lg,
    color: colors.mutedForeground,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  emojiOption: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: colors.muted,
  },
  emojiOptionSelected: {
    backgroundColor: `${colors.primary}33`,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  emojiText: {
    fontSize: 20,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.foreground,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  titleInput: {
    fontSize: typography.base,
    color: colors.foreground,
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  descriptionInput: {
    fontSize: typography.base,
    color: colors.foreground,
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    textAlignVertical: "top",
    minHeight: 80,
  },
  previewRow: {
    marginBottom: spacing.lg,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: spacing.md,
    gap: spacing.sm,
  },
  previewEmoji: {
    fontSize: 24,
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
  },
  previewDesc: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: typography.base,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
});
