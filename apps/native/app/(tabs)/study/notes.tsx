import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { Plus, FileText, Sparkles, Trash2, BookOpen, Brain, Upload } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNotes, useCreateNote, useDeleteNote, useUpdateNote } from "../../../hooks/useNotes";
import { useCourses } from "../../../hooks/useCourses";
import { useFlashcards } from "../../../hooks/useFlashcards";
import { useAuth } from "../../../hooks/useAuthContext";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Select } from "../../../components/ui/select";
import { Sheet } from "../../../components/ui/sheet";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { AISummarySheet } from "../../../components/notes/AISummarySheet";
import { NoteViewerSheet } from "../../../components/notes/NoteViewerSheet";
import { supabase } from "../../../services/supabase";
import { streamSSE } from "../../../services/sse-client";
import { env } from "../../../lib/env";
import Toast from "react-native-toast-message";
import { ErrorFallback } from "../../../components/ErrorFallback";
import * as DocumentPicker from "expo-document-picker";

export { ErrorFallback as ErrorBoundary };

interface NoteItem {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_type: string;
  course_id: string | null;
  created_at: string;
  file_url?: string | null;
  original_filename?: string | null;
}

export default function SmartNotesScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [filterCourseId, setFilterCourseId] = useState<string>("all");
  const { data: courses } = useCourses();
  const { data: notes, isLoading } = useNotes(filterCourseId === "all" ? null : filterCourseId);
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const updateNote = useUpdateNote();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("none");
  const [generatingFlashcards, setGeneratingFlashcards] = useState<string | null>(null);

  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const courseOptions = [
    { label: "No course", value: "none" },
    ...(courses || []).map((c) => ({ label: c.name, value: c.id })),
  ];

  const filterOptions = [
    { label: "All courses", value: "all" },
    ...(courses || []).map((c) => ({ label: c.name, value: c.id })),
  ];

  const handleCreateNote = useCallback(async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Toast.show({ type: "error", text1: "Missing content", text2: "Please add a title and some content." });
      return;
    }
    try {
      await createNote.mutateAsync({
        title: newTitle.trim(),
        content: newContent.trim(),
        source_type: "text",
        course_id: selectedCourseId === "none" ? null : selectedCourseId,
      });
      setNewTitle("");
      setNewContent("");
      setSelectedCourseId("none");
      setShowCreate(false);
      Toast.show({ type: "success", text1: "Note created! 📝", text2: "Your note has been saved." });
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to create note." });
    }
  }, [newTitle, newContent, selectedCourseId, createNote]);

  const handleDeleteNote = useCallback(
    (id: string) => {
      Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNote.mutateAsync(id);
              Toast.show({ type: "success", text1: "Note deleted" });
            } catch {
              Toast.show({ type: "error", text1: "Error", text2: "Failed to delete note." });
            }
          },
        },
      ]);
    },
    [deleteNote]
  );

  const handleUpdateSummary = useCallback(
    (noteId: string, summary: string) => {
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, summary });
      }
    },
    [selectedNote]
  );

  const extractJsonFromAI = (raw: string) => {
    const fence = raw.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fence?.[1]) return fence[1].trim();
    const trimmed = raw.trim();
    const arrStart = trimmed.indexOf("[");
    const arrEnd = trimmed.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      return trimmed.slice(arrStart, arrEnd + 1);
    }
    return trimmed;
  };

  const handleGenerateFlashcards = useCallback(
    async (note: NoteItem) => {
      if (!note.content || !user || !session) return;
      setGeneratingFlashcards(note.id);
      try {
        let fullResponse = "";
        const generator = streamSSE(
          `${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stream-ai-chat`,
          {
            body: {
              messages: [],
              mode: "flashcards",
              content: note.content,
              newMessage: "Generate flashcards from this content",
            },
            token: session.access_token,
          }
        );

        for await (const chunk of generator) {
          fullResponse += chunk;
        }

        const jsonStr = extractJsonFromAI(fullResponse);
        const parsed = JSON.parse(jsonStr);
        const flashcardsData = Array.isArray(parsed) ? parsed : parsed.flashcards || [];

        const flashcardsToInsert = flashcardsData
          .filter((fc: any) => fc?.front && fc?.back)
          .map((fc: { front: string; back: string }) => ({
            user_id: user.id,
            note_id: note.id,
            course_id: note.course_id,
            front: fc.front,
            back: fc.back,
          }));

        if (flashcardsToInsert.length > 0) {
          const { error } = await supabase.from("flashcards").insert(flashcardsToInsert);
          if (error) throw error;
        }

        Toast.show({
          type: "success",
          text1: `Created ${flashcardsToInsert.length} flashcards! 🎴`,
          text2: "Go to Flashcards to start studying.",
        });
      } catch (err) {
        console.error("Flashcard generation error:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to generate flashcards. Please try again.",
        });
      } finally {
        setGeneratingFlashcards(null);
      }
    },
    [user, session]
  );

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      Toast.show({
        type: "info",
        text1: "File selected",
        text2: `${file.name} — text extraction coming in v1.1`,
      });

      if (!newTitle && file.name) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to pick file" });
    }
  }, [newTitle]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Smart Notes</Text>
          <Button onPress={() => setShowCreate(true)} className="bg-primary" size="sm">
            <Plus className="w-4 h-4 text-primary-foreground" />
            <Text className="text-primary-foreground font-semibold text-sm">New Note</Text>
          </Button>
        </View>

        <View className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">AI-Powered Learning</Text>
              <Text className="text-sm text-muted-foreground">
                Generate summaries, flashcards, quizzes, or study with the AI tutor
              </Text>
            </View>
          </View>
        </View>

        {courses && courses.length > 0 && (
          <Select
            options={filterOptions}
            value={filterCourseId}
            onValueChange={setFilterCourseId}
            placeholder="Filter by course"
          />
        )}

        {isLoading ? (
          <View className="gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </View>
        ) : (notes || []).length === 0 ? (
          <View className="items-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-3" />
            <Text className="text-muted-foreground font-semibold">No notes yet</Text>
            <Text className="text-sm text-muted-foreground mt-1">Create your first note to get started</Text>
          </View>
        ) : (
          <View className="gap-3">
            {(notes || []).map((note) => {
              const course = courses?.find((c) => c.id === note.course_id);
              const isGenerating = generatingFlashcards === note.id;
              return (
                <Pressable
                  key={note.id}
                  onLongPress={() => handleDeleteNote(note.id)}
                  delayLongPress={500}
                  onPress={() => {
                    setSelectedNote(note as NoteItem);
                    setShowViewer(true);
                  }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <View className="flex-row items-start justify-between mb-2">
                        <Text className="font-semibold text-foreground flex-1" numberOfLines={1}>
                          {note.title}
                        </Text>
                        <Text className="text-xs text-muted-foreground ml-2">
                          {formatDate(note.created_at)}
                        </Text>
                      </View>
                      {note.content && (
                        <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                          {note.content}
                        </Text>
                      )}
                      <View className="flex-row items-center gap-2 mt-2">
                        {course && (
                          <Badge variant="secondary">
                            <Text className="text-xs text-secondary-foreground">{course.name}</Text>
                          </Badge>
                        )}
                        {note.summary && (
                          <Badge variant="outline">
                            <Text className="text-xs text-foreground">AI Summary</Text>
                          </Badge>
                        )}
                        {note.source_type === "file" && (
                          <Badge variant="outline">
                            <Text className="text-xs text-foreground">File</Text>
                          </Badge>
                        )}
                      </View>
                      <View className="flex-row gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onPress={(e: any) => {
                            e?.stopPropagation?.();
                            setSelectedNote(note as NoteItem);
                            setShowSummary(true);
                          }}
                        >
                          <Brain className="w-3 h-3 text-primary" />
                          <Text className="text-xs text-foreground">Summary</Text>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onPress={(e: any) => {
                            e?.stopPropagation?.();
                            router.push({
                              pathname: "/study/tutor",
                              params: { noteId: note.id, noteTitle: note.title },
                            } as any);
                          }}
                        >
                          <BookOpen className="w-3 h-3 text-primary" />
                          <Text className="text-xs text-foreground">Tutor</Text>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={isGenerating}
                          onPress={(e: any) => {
                            e?.stopPropagation?.();
                            handleGenerateFlashcards(note as NoteItem);
                          }}
                        >
                          {isGenerating ? (
                            <ActivityIndicator size="small" />
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-primary" />
                              <Text className="text-xs text-foreground">Cards</Text>
                            </>
                          )}
                        </Button>
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <Sheet open={showCreate} onOpenChange={setShowCreate} snapPoints={["80%"]}>
        <View className="gap-4">
          <Text className="text-xl font-bold text-foreground">Create Note</Text>

          <View>
            <Text className="text-sm font-medium text-foreground mb-1">Title</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Note title"
              placeholderTextColor="hsl(var(--muted-foreground))"
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-1">Course</Text>
            <Select
              options={courseOptions}
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              placeholder="Select course"
            />
          </View>

          <Button variant="outline" onPress={handlePickFile} className="w-full">
            <Upload className="w-4 h-4 text-foreground" />
            <Text className="text-foreground font-semibold">Upload File</Text>
          </Button>

          <Text className="text-center text-xs text-muted-foreground">or type below</Text>

          <View>
            <Text className="text-sm font-medium text-foreground mb-1">Content</Text>
            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              placeholder="Paste or type your notes here..."
              placeholderTextColor="hsl(var(--muted-foreground))"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              className="flex rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground min-h-[160px]"
            />
          </View>

          <Button
            onPress={handleCreateNote}
            disabled={!newTitle.trim() || !newContent.trim() || createNote.isPending}
            className="w-full bg-primary"
          >
            {createNote.isPending ? (
              <ActivityIndicator color="hsl(var(--primary-foreground))" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                <Text className="text-primary-foreground font-semibold">Save Note</Text>
              </>
            )}
          </Button>
        </View>
      </Sheet>

      {selectedNote && (
        <AISummarySheet
          open={showSummary}
          onOpenChange={setShowSummary}
          note={selectedNote}
          onUpdateSummary={handleUpdateSummary}
          onViewNote={() => {
            setShowSummary(false);
            setShowViewer(true);
          }}
        />
      )}

      {selectedNote && (
        <NoteViewerSheet
          open={showViewer}
          onOpenChange={setShowViewer}
          note={selectedNote}
          courses={(courses || []).map((c) => ({ id: c.id, name: c.name, icon: c.icon || "📚" }))}
          onCourseChange={(courseId) => {
            if (!selectedNote) return;
            supabase
              .from("notes")
              .update({ course_id: courseId })
              .eq("id", selectedNote.id)
              .then(({ error }) => {
                if (error) {
                  Toast.show({ type: "error", text1: "Error", text2: "Failed to update course." });
                } else {
                  Toast.show({ type: "success", text1: "Course updated" });
                  setSelectedNote({ ...selectedNote, course_id: courseId });
                }
              });
          }}
          onTutor={() => {
            setShowViewer(false);
            router.push({
              pathname: "/study/tutor",
              params: { noteId: selectedNote.id, noteTitle: selectedNote.title },
            } as any);
          }}
          onGenerateFlashcards={() => {
            setShowViewer(false);
            handleGenerateFlashcards(selectedNote);
          }}
          onGenerateQuiz={() => {
            setShowViewer(false);
            router.push({
              pathname: "/study/quizzes",
              params: { noteId: selectedNote.id },
            } as any);
          }}
          onSummarize={() => {
            setShowViewer(false);
            setShowSummary(true);
          }}
        />
      )}
    </ScrollView>
  );
}
