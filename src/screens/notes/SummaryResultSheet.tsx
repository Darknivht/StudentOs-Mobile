import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { colors, spacing, typography } from "../../lib/theme";
import type { SummaryLength } from "../../services/notes/aiSummary";

interface SummaryResultSheetProps {
  summaryText: string;
  isStreaming: boolean;
  error: string | null;
  onLengthChange: (length: SummaryLength) => void;
  currentLength: SummaryLength;
  onRetry: () => void;
  onDismiss: () => void;
}

export const SummaryResultSheet = forwardRef(function SummaryResultSheet(
  {
    summaryText,
    isStreaming,
    error,
    onLengthChange,
    currentLength,
    onRetry,
    onDismiss,
  }: SummaryResultSheetProps,
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

  const lengthOptions: { key: SummaryLength; label: string }[] = [
    { key: "short", label: "Short" },
    { key: "medium", label: "Medium" },
    { key: "long", label: "Long" },
  ];

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["70%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>AI Summary</Text>
          <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={12}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.lengthSelector}>
          {lengthOptions.map((opt) => (
            <Pressable
              key={opt.key}
              style={[
                styles.lengthButton,
                currentLength === opt.key && styles.lengthButtonActive,
              ]}
              onPress={() => onLengthChange(opt.key)}
              disabled={isStreaming}
            >
              <Text
                style={[
                  styles.lengthLabel,
                  currentLength === opt.key && styles.lengthLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <BottomSheetScrollView style={styles.resultScroll}>
            {isStreaming && !summaryText ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Generating summary...</Text>
              </View>
            ) : (
              <View style={styles.resultCard}>
                <Text style={styles.resultText}>
                  {summaryText || "Waiting for response..."}
                </Text>
                {isStreaming && (
                  <View style={styles.streamingIndicator}>
                    <View style={styles.streamingDot} />
                  </View>
                )}
              </View>
            )}
          </BottomSheetScrollView>
        )}
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
  lengthSelector: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lengthButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.muted,
    alignItems: "center",
  },
  lengthButtonActive: {
    backgroundColor: colors.primary,
  },
  lengthLabel: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  lengthLabelActive: {
    color: colors.primaryForeground,
  },
  resultScroll: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resultText: {
    fontSize: typography.base,
    color: colors.foreground,
    lineHeight: 24,
  },
  streamingIndicator: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  streamingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["2xl"],
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.base,
    color: colors.destructive,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryLabel: {
    color: colors.primaryForeground,
    fontWeight: "600",
    fontSize: typography.sm,
  },
});
