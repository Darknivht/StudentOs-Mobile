import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Alert,
  Clipboard,
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

type TabType = "content" | "summary";

interface QuickActionProps {
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function QuickAction({
  icon,
  label,
  sublabel,
  color,
  onPress,
  disabled,
  loading,
}: QuickActionProps) {
  return (
    <Pressable
      style={[styles.quickAction, disabled && styles.quickActionDisabled]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: `${color}22` }}
    >
      <View
        style={[styles.quickActionIconBox, { backgroundColor: `${color}18` }]}
      >
        {loading ? (
          <Text style={[styles.quickActionIcon, { fontSize: 18 }]}>...</Text>
        ) : (
          <Text style={styles.quickActionIcon}>{icon}</Text>
        )}
      </View>
      <View style={styles.quickActionText}>
        <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
        <Text style={styles.quickActionSublabel}>{sublabel}</Text>
      </View>
    </Pressable>
  );
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
  const { notes } = useNotes();
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
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");

  const handleEdit = useCallback(() => {
    navigation.navigate("NoteEditor", { noteId });
  }, [navigation, noteId]);

  const handleCopy = useCallback(() => {
    if (!note) return;
    const plainText = stripHtml(note.content);
    Clipboard.setString(plainText);
    Alert.alert("Copied", "Note content copied to clipboard");
  }, [note]);

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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>Note not found</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const plainContent = stripHtml(note.content);
  const hasContent = plainContent.trim().length > 0;
  const contentCharCount = plainContent.length;
  const sourceColor =
    note.sourceType === "pdf"
      ? colors.warning
      : note.sourceType === "docx"
        ? "#3b82f6"
        : note.sourceType === "image"
          ? colors.success
          : colors.mutedForeground;

  return (
    <BottomSheetModalProvider>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerBtn}
              onPress={handleEdit}
              hitSlop={8}
            >
              <Text style={styles.headerBtnIcon}>✏️</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>{note.title || "Untitled Note"}</Text>

          {/* Course tag */}
          {note.courseName && (
            <View style={styles.courseTagRow}>
              <View
                style={[
                  styles.courseTag,
                  note.courseColor
                    ? {
                        backgroundColor: `${note.courseColor}18`,
                        borderColor: `${note.courseColor}44`,
                      }
                    : undefined,
                ]}
              >
                {note.courseEmoji && (
                  <Text style={styles.courseEmoji}>{note.courseEmoji}</Text>
                )}
                <Text
                  style={[
                    styles.courseName,
                    note.courseColor ? { color: note.courseColor } : undefined,
                  ]}
                >
                  {note.courseName}
                </Text>
              </View>
            </View>
          )}

          {/* File info bar */}
          {note.originalFilename && (
            <View style={styles.fileInfoBar}>
              <View style={styles.fileInfoLeft}>
                <Text style={styles.fileIcon}>📎</Text>
                <Text style={styles.fileName} numberOfLines={1}>
                  {note.originalFilename}
                </Text>
              </View>
              <View style={styles.fileSourceBadge}>
                <View
                  style={[
                    styles.fileSourceDot,
                    { backgroundColor: sourceColor },
                  ]}
                />
                <Text style={styles.fileSourceLabel}>
                  {SOURCE_LABELS[note.sourceType] || "Manual"}
                </Text>
              </View>
            </View>
          )}

          {/* Quick Actions Grid */}
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="📝"
              label="AI Summary"
              sublabel="Get a quick overview"
              color={colors.primary}
              onPress={handleGenerateSummary}
              disabled={!hasContent}
              loading={isStreaming && activeTab === "summary"}
            />
            <QuickAction
              icon="🎓"
              label="Socratic Tutor"
              sublabel="Ask leading questions"
              color="#8b5cf6"
              onPress={handleStartSocratic}
              disabled={!hasContent}
              loading={isStreaming && socraticMessages.length > 0}
            />
            <QuickAction
              icon="🔗"
              label="Share"
              sublabel="Share with friends"
              color={colors.success}
              onPress={handleShare}
              disabled={!hasContent}
            />
            <Pressable
              style={styles.quickAction}
              onPress={handleCopy}
              disabled={!hasContent}
              android_ripple={{ color: colors.muted }}
            >
              <View
                style={[
                  styles.quickActionIconBox,
                  { backgroundColor: `${colors.mutedForeground}18` },
                ]}
              >
                <Text style={styles.quickActionIcon}>📋</Text>
              </View>
              <View style={styles.quickActionText}>
                <Text
                  style={[
                    styles.quickActionLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Copy Text
                </Text>
                <Text style={styles.quickActionSublabel}>
                  Copy to clipboard
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tab, activeTab === "content" && styles.tabActive]}
              onPress={() => setActiveTab("content")}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "content" && styles.tabLabelActive,
                ]}
              >
                Content
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "summary" && styles.tabActive]}
              onPress={() => setActiveTab("summary")}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "summary" && styles.tabLabelActive,
                ]}
              >
                Summary
              </Text>
              {note.summary ? (
                <View style={styles.summaryBadge} />
              ) : isStreaming ? (
                <View
                  style={[styles.summaryBadge, styles.summaryBadgeActive]}
                />
              ) : null}
            </Pressable>
          </View>

          {/* Tab Content */}
          {activeTab === "content" ? (
            <View style={styles.contentArea}>
              {hasContent ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentText}>{plainContent}</Text>
                </View>
              ) : (
                <View style={styles.emptyContent}>
                  <Text style={styles.emptyContentIcon}>📄</Text>
                  <Text style={styles.emptyContentText}>No text content</Text>
                  <Text style={styles.emptyContentSub}>
                    Extract text from a file to see content here
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.summaryArea}>
              {note.summary ? (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryBadge2}>
                      <Text style={styles.summaryBadgeIcon}>✨</Text>
                      <Text style={styles.summaryBadgeLabel}>AI Summary</Text>
                    </View>
                  </View>
                  <Text style={styles.summaryText}>{note.summary}</Text>
                  <Pressable
                    style={styles.regenerateBtn}
                    onPress={handleGenerateSummary}
                    android_ripple={{ color: colors.muted }}
                  >
                    <Text style={styles.regenerateBtnText}>Regenerate</Text>
                  </Pressable>
                </View>
              ) : isStreaming && summaryText ? (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <View
                      style={[
                        styles.summaryBadge2,
                        { backgroundColor: `${colors.primary}18` },
                      ]}
                    >
                      <Text style={styles.summaryBadgeIcon}>✨</Text>
                      <Text
                        style={[
                          styles.summaryBadgeLabel,
                          { color: colors.primary },
                        ]}
                      >
                        Streaming...
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.summaryText}>{summaryText}</Text>
                </View>
              ) : (
                <View style={styles.noSummaryState}>
                  <Text style={styles.noSummaryIcon}>🧠</Text>
                  <Text style={styles.noSummaryTitle}>No summary yet</Text>
                  <Text style={styles.noSummarySub}>
                    Generate an AI summary to get a quick overview of this note
                  </Text>
                  <Pressable
                    style={styles.generateBtn}
                    onPress={handleGenerateSummary}
                    disabled={!hasContent}
                  >
                    <Text style={styles.generateBtnText}>
                      ✨ Generate Summary
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Streaming AI summary result */}
              {!note.summary && isStreaming && !summaryText && (
                <View style={styles.streamingState}>
                  <Text style={styles.streamingDots}>● ● ●</Text>
                  <Text style={styles.streamingLabel}>Generating...</Text>
                </View>
              )}
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metadata}>
            <Text style={styles.metaItem}>
              {note.sourceType === "pdf" ||
              note.sourceType === "docx" ||
              note.sourceType === "image"
                ? `Source: ${SOURCE_LABELS[note.sourceType] || "File"}`
                : "Source: Manual entry"}
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItem}>{contentCharCount} characters</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItem}>
              {getRelativeDate(note.updatedAt)}
            </Text>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBtnIcon: {
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: 0,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  courseTagRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}14`,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
  },
  courseEmoji: {
    fontSize: typography.xs,
  },
  courseName: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: "600",
  },
  fileInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  fileInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  fileIcon: {
    fontSize: typography.sm,
  },
  fileName: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.foreground,
    fontWeight: "500",
  },
  fileSourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  fileSourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fileSourceLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minWidth: "47%",
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionLabel: {
    fontSize: typography.sm,
    fontWeight: "600",
    color: colors.foreground,
  },
  quickActionSublabel: {
    fontSize: typography.xs - 1,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: 10,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.card,
  },
  tabLabel: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: colors.foreground,
    fontWeight: "600",
  },
  summaryBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  summaryBadgeActive: {
    backgroundColor: colors.primary,
  },
  contentArea: {
    marginBottom: spacing.lg,
  },
  contentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentText: {
    fontSize: typography.base,
    color: colors.foreground,
    lineHeight: 28,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    gap: spacing.sm,
  },
  emptyContentIcon: {
    fontSize: 48,
  },
  emptyContentText: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.foreground,
  },
  emptyContentSub: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  summaryArea: {
    marginBottom: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryHeader: {
    marginBottom: spacing.md,
  },
  summaryBadge2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.success}18`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 4,
  },
  summaryBadgeIcon: {
    fontSize: typography.xs,
  },
  summaryBadgeLabel: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: "600",
  },
  summaryText: {
    fontSize: typography.base,
    color: colors.foreground,
    lineHeight: 26,
  },
  regenerateBtn: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
  },
  regenerateBtnText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: "600",
  },
  noSummaryState: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    gap: spacing.sm,
  },
  noSummaryIcon: {
    fontSize: 48,
  },
  noSummaryTitle: {
    fontSize: typography.xl,
    fontWeight: "600",
    color: colors.foreground,
  },
  noSummarySub: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  generateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  generateBtnText: {
    fontSize: typography.sm,
    color: colors.primaryForeground,
    fontWeight: "700",
  },
  streamingState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  streamingDots: {
    fontSize: typography.lg,
    color: colors.primary,
    letterSpacing: 4,
  },
  streamingLabel: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
  metaDot: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: typography.xl,
    fontWeight: "600",
    color: colors.foreground,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryBtnText: {
    fontSize: typography.base,
    color: colors.primaryForeground,
    fontWeight: "600",
  },
});
