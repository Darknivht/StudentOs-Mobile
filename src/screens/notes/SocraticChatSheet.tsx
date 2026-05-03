import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import type { SocraticMessage } from "../../services/notes/aiSocratic";
import { colors, spacing, typography } from "../../lib/theme";

interface SocraticChatSheetProps {
  messages: SocraticMessage[];
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onDismiss: () => void;
}

export const SocraticChatSheet = forwardRef(function SocraticChatSheet(
  {
    messages,
    isStreaming,
    error,
    onSendMessage,
    onDismiss,
  }: SocraticChatSheetProps,
  ref,
) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

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

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInputText("");
  }, [inputText, isStreaming, onSendMessage]);

  const renderMessage = useCallback(
    ({ item, index }: { item: SocraticMessage; index: number }) => {
      const isUser = item.role === "user";
      const isLast = index === messages.length - 1 && isStreaming;

      if (isUser) {
        return (
          <View style={styles.userMessageRow}>
            <View style={styles.userMessageSpacer} />
            <LinearGradient
              colors={["#7c3aed", "#ec4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userBubble}
            >
              <Text style={styles.userMessageText}>{item.content}</Text>
            </LinearGradient>
          </View>
        );
      }

      return (
        <View style={styles.assistantMessageRow}>
          <View style={styles.assistantAvatar}>
            <Text style={styles.assistantAvatarText}>🎓</Text>
          </View>
          <View style={styles.assistantBubble}>
            <View style={styles.assistantBubbleHeader}>
              <Text style={styles.assistantLabel}>Socratic Tutor</Text>
            </View>
            <Text style={styles.assistantMessageText}>
              {item.content}
              {isLast && <Text style={styles.cursor}>|</Text>}
            </Text>
          </View>
        </View>
      );
    },
    [messages.length, isStreaming],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerEmoji}>🎓</Text>
            <Text style={styles.sheetTitle}>Socratic Tutor</Text>
          </View>
          <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={12}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderMessage}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted={false}
        />

        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
            <View style={styles.streamingRow}>
              <Text style={styles.streamingText}>Tutor is thinking...</Text>
            </View>
          )}

        {error && (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about this note..."
            placeholderTextColor={colors.mutedForeground}
            editable={!isStreaming}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
          >
            <Text style={styles.sendIcon}>↑</Text>
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
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerEmoji: {
    fontSize: 20,
  },
  sheetTitle: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.foreground,
  },
  closeButton: {
    fontSize: typography.lg,
    color: colors.mutedForeground,
    padding: spacing.xs,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  userMessageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  userMessageSpacer: {
    flex: 1,
  },
  userBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userMessageText: {
    fontSize: typography.base,
    color: "#ffffff",
    lineHeight: 24,
  },
  assistantMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    maxWidth: "85%",
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  assistantAvatarText: {
    fontSize: 16,
  },
  assistantBubble: {
    flex: 1,
    backgroundColor: colors.muted,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: spacing.md,
  },
  assistantBubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  assistantLabel: {
    fontSize: typography.xs,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  assistantMessageText: {
    fontSize: typography.base,
    color: colors.foreground,
    lineHeight: 24,
  },
  cursor: {
    opacity: 0,
  },
  streamingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  streamingText: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  errorRow: {
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.destructive,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.muted,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.foreground,
    fontSize: typography.base,
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: typography.xl,
    color: colors.primaryForeground,
    fontWeight: "700",
  },
});
