import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  FileText,
  Sparkles,
  BookOpen,
  Brain,
  MessageCircle,
  ClipboardList,
} from "lucide-react-native";
import Markdown from "react-native-markdown-display";
import { Sheet } from "../ui/sheet";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import Toast from "react-native-toast-message";

interface Note {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_type: string;
  course_id: string | null;
  file_url?: string | null;
  original_filename?: string | null;
}

interface Course {
  id: string;
  name: string;
  icon: string;
}

interface NoteViewerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onTutor?: () => void;
  onGenerateFlashcards?: () => void;
  onGenerateQuiz?: () => void;
  onSummarize?: () => void;
  courses?: Course[];
  onCourseChange?: (courseId: string | null) => void;
}

type ViewTab = "content" | "summary";

export function NoteViewerSheet({
  open,
  onOpenChange,
  note,
  onTutor,
  onGenerateFlashcards,
  onGenerateQuiz,
  onSummarize,
  courses = [],
  onCourseChange,
}: NoteViewerSheetProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>("content");

  const courseOptions = [
    { label: "No Course", value: "none" },
    ...courses.map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id })),
  ];

  const hasContent = !!note?.content && note.content.length > 50;

  const quickActions = [
    {
      label: "Socratic Tutor",
      icon: MessageCircle,
      onPress: onTutor,
      disabled: !hasContent || !onTutor,
      color: "bg-blue-500/10",
      textColor: "text-blue-600",
    },
    {
      label: "Generate Flashcards",
      icon: BookOpen,
      onPress: onGenerateFlashcards,
      disabled: !hasContent || !onGenerateFlashcards,
      color: "bg-green-500/10",
      textColor: "text-green-600",
    },
    {
      label: "Take Quiz",
      icon: ClipboardList,
      onPress: onGenerateQuiz,
      disabled: !hasContent || !onGenerateQuiz,
      color: "bg-purple-500/10",
      textColor: "text-purple-600",
    },
    {
      label: "AI Summary",
      icon: Brain,
      onPress: onSummarize,
      disabled: !hasContent || !onSummarize,
      color: "bg-orange-500/10",
      textColor: "text-orange-600",
    },
  ];

  if (!note) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={["85%"]}>
      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <Text className="text-lg font-bold text-foreground flex-1" numberOfLines={1}>
            {note.title}
          </Text>
        </View>

        {onCourseChange && courses.length > 0 && (
          <Select
            value={note.course_id || "none"}
            onValueChange={(v) => onCourseChange(v === "none" ? null : v)}
            options={courseOptions}
            placeholder="Select course"
          />
        )}

        {note.original_filename && (
          <View className="flex-row items-center gap-2 p-2.5 rounded-lg bg-muted">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <Text className="text-sm font-medium text-foreground flex-1" numberOfLines={1}>
              {note.original_filename}
            </Text>
          </View>
        )}

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setActiveTab("content")}
            className={`flex-1 py-2 px-3 rounded-lg border ${
              activeTab === "content"
                ? "bg-primary border-primary"
                : "border-border bg-card"
            }`}
          >
            <Text
              className={`text-sm font-medium text-center ${
                activeTab === "content" ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              Content
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("summary")}
            className={`flex-1 py-2 px-3 rounded-lg border ${
              activeTab === "summary"
                ? "bg-primary border-primary"
                : "border-border bg-card"
            }`}
          >
            <Text
              className={`text-sm font-medium text-center ${
                activeTab === "summary" ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              Summary
            </Text>
          </Pressable>
        </View>

        <ScrollView className="max-h-[250px] rounded-lg border border-border p-3">
          {activeTab === "content" ? (
            note.content ? (
              <Text className="text-sm text-foreground whitespace-pre-wrap">
                {note.content}
              </Text>
            ) : (
              <Text className="text-muted-foreground text-center py-8">
                No text content available
              </Text>
            )
          ) : note.summary ? (
            <Markdown
              style={{
                body: { color: "hsl(var(--foreground))", fontSize: 14 },
              }}
            >
              {note.summary}
            </Markdown>
          ) : (
            <View className="items-center justify-center py-8">
              <Brain className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <Text className="font-semibold text-foreground mb-1">No summary yet</Text>
              <Text className="text-sm text-muted-foreground text-center mb-4">
                Generate an AI summary to get a quick overview
              </Text>
              <Button onPress={onSummarize} disabled={!hasContent} size="sm" className="bg-primary">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                <Text className="text-primary-foreground font-semibold text-sm">
                  Generate Summary
                </Text>
              </Button>
            </View>
          )}
        </ScrollView>

        <View className="flex-row items-center gap-3">
          <Text className="text-xs text-muted-foreground">
            Source: {note.source_type === "file" ? "Uploaded file" : "Manual entry"}
          </Text>
          <Text className="text-xs text-muted-foreground">|</Text>
          <Text className="text-xs text-muted-foreground">
            {note.content?.length || 0} characters
          </Text>
        </View>

        <View>
          <View className="flex-row items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <Text className="text-sm font-semibold text-foreground">Quick Actions</Text>
          </View>
          <View className="gap-2">
            {quickActions.map((action) => (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
                className={`p-3 rounded-lg ${action.color} border border-transparent active:opacity-70 disabled:opacity-50`}
              >
                <View className="flex-row items-center gap-3">
                  <action.icon className={`w-5 h-5 ${action.textColor}`} />
                  <View>
                    <Text className={`font-medium text-sm ${action.textColor}`}>
                      {action.label}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {!hasContent && (
          <View className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Text className="text-xs text-amber-600">
              Tip: Add more content to your note to enable AI features.
            </Text>
          </View>
        )}
      </View>
    </Sheet>
  );
}
