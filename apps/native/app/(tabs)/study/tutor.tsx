import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send, BookOpen, FileText, Brain, Loader2 } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../hooks/useAuthContext";
import { useChatMessages, useInsertChatMessage } from "../../../hooks/useChatMessages";
import { useCourses } from "../../../hooks/useCourses";
import { useNotes } from "../../../hooks/useNotes";
import { useProfile } from "../../../hooks/useProfile";
import { streamSSE } from "../../../services/sse-client";
import { supabase } from "../../../services/supabase";
import { env } from "../../../lib/env";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ErrorFallback } from "../../../components/ErrorFallback";
import Markdown from "react-native-markdown-display";

export { ErrorFallback as ErrorBoundary };

type TutorMode = "course" | "note";

export default function AITutorScreen() {
  const { user, session } = useAuth();
  const params = useLocalSearchParams();
  const { data: courses } = useCourses();
  const { data: profile } = useProfile();

  const [mode, setMode] = useState<TutorMode>("course");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [tutorActive, setTutorActive] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const effectiveTargetId = mode === "course" ? selectedCourseId : selectedNoteId;
  const { data: messages } = useChatMessages(mode, effectiveTargetId);
  const insertMessage = useInsertChatMessage();

  const { data: courseNotes } = useNotes(selectedCourseId);

  useEffect(() => {
    if (params.noteId && params.noteId !== "undefined") {
      setMode("note");
      setSelectedNoteId(params.noteId as string);
      setTutorActive(true);
    } else if (params.courseId && params.courseId !== "undefined") {
      setMode("course");
      setSelectedCourseId(params.courseId as string);
      setTutorActive(true);
    }
  }, [params]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd?.({ animated: true });
  }, [messages, streamingText]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user || !effectiveTargetId || isStreaming) return;

    const userMessage = input.trim();
    setInput("");

    try {
      await insertMessage.mutateAsync({
        role: "user",
        content: userMessage,
        course_id: mode === "course" ? effectiveTargetId : null,
        note_id: mode === "note" ? effectiveTargetId : null,
      });
    } catch {}

    setIsStreaming(true);
    setStreamingText("");

    try {
      const chatHistory = (messages || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      let context = "";
      if (mode === "note" && selectedNoteId) {
        const { data: note } = await supabase
          .from("notes")
          .select("content, title")
          .eq("id", selectedNoteId)
          .single();
        if (note?.content) context = note.content.slice(0, 3000);
      } else if (mode === "course" && selectedCourseId) {
        const course = courses?.find((c) => c.id === selectedCourseId);
        if (course) context = `Course: ${course.name}`;
      }

      const persona = profile?.study_persona || "friendly";
      let fullResponse = "";

      const generator = streamSSE(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stream-ai-chat`, {
        body: {
          messages: chatHistory,
          mode: "socratic",
          content: context,
          persona,
          newMessage: userMessage,
        },
        token: session?.access_token,
      });

      for await (const chunk of generator) {
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }

      if (fullResponse) {
        await insertMessage.mutateAsync({
          role: "assistant",
          content: fullResponse,
          course_id: mode === "course" ? effectiveTargetId : null,
          note_id: mode === "note" ? effectiveTargetId : null,
        });
      }
    } catch (err) {
      setStreamingText("Sorry, I couldn't connect. Please try again.");
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [input, user, effectiveTargetId, isStreaming, messages, mode, selectedNoteId, selectedCourseId, courses, profile, session, insertMessage]);

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);
  const selectedNote = courseNotes?.find((n) => n.id === selectedNoteId);

  if (!tutorActive) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-4">
          <Text className="text-2xl font-bold text-foreground">AI Tutor</Text>
          <Text className="text-muted-foreground mb-2">Choose a mode to start chatting</Text>

          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setMode("course")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                mode === "course" ? "bg-primary border-primary" : "border-border bg-card"
              }`}
            >
              <Text className={`text-sm font-medium text-center ${mode === "course" ? "text-primary-foreground" : "text-foreground"}`}>
                Course Mode
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("note")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                mode === "note" ? "bg-primary border-primary" : "border-border bg-card"
              }`}
            >
              <Text className={`text-sm font-medium text-center ${mode === "note" ? "text-primary-foreground" : "text-foreground"}`}>
                Note Mode
              </Text>
            </Pressable>
          </View>

          {mode === "course" ? (
            <View className="gap-3">
              <Text className="font-semibold text-foreground">Select a Course</Text>
              {(courses || []).map((course) => (
                <Pressable
                  key={course.id}
                  onPress={() => {
                    setSelectedCourseId(course.id);
                    setTutorActive(true);
                  }}
                >
                  <Card>
                    <CardContent className="p-4 flex-row items-center gap-3">
                      <View
                        className="w-10 h-10 rounded-lg items-center justify-center"
                        style={{ backgroundColor: `${course.color || "#8B5CF6"}20` }}
                      >
                        <Text className="text-lg">{course.icon || "📚"}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-foreground">{course.name}</Text>
                      </View>
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Pressable>
              ))}
              {courses?.length === 0 && (
                <Text className="text-muted-foreground text-center py-8">No courses yet. Add one from the Home tab.</Text>
              )}
            </View>
          ) : (
            <View className="gap-3">
              <Text className="font-semibold text-foreground">Select a Note</Text>
              {(courseNotes || []).length === 0 && (
                <Text className="text-muted-foreground text-center py-8">No notes yet. Create one in Smart Notes.</Text>
              )}
              {(courseNotes || []).map((note) => (
                <Pressable
                  key={note.id}
                  onPress={() => {
                    setSelectedNoteId(note.id);
                    setTutorActive(true);
                  }}
                >
                  <Card>
                    <CardContent className="p-4 flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-lg bg-secondary/10 items-center justify-center">
                        <FileText className="w-5 h-5 text-secondary" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-foreground" numberOfLines={1}>{note.title}</Text>
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                          {new Date(note.created_at || "").toLocaleDateString()}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  const allMessages = [
    ...(messages || []),
    ...(streamingText ? [{ role: "assistant", content: streamingText, id: "streaming", user_id: "", created_at: "" }] : []),
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Pressable onPress={() => setTutorActive(false)}>
            <Text className="text-primary font-medium">Back</Text>
          </Pressable>
          <Text className="font-semibold text-foreground text-sm" numberOfLines={1}>
            {mode === "course" ? selectedCourse?.name || "Course" : selectedNote?.title || "Note"}
          </Text>
          <Badge variant="secondary">
            <Brain className="w-3 h-3 text-secondary-foreground" />
            <Text className="text-xs text-secondary-foreground ml-1">Socratic</Text>
          </Badge>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd?.({ animated: true })}
        >
          <View className="gap-3">
            {allMessages.map((msg, i) => (
              <View
                key={msg.id || i}
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "self-end bg-primary rounded-br-sm"
                    : "self-start bg-card border border-border rounded-bl-sm"
                }`}
              >
                <Markdown
                  style={{
                    body: {
                      color: msg.role === "user" ? ""#FFFFFF"" : ""#FFFFFF"",
                      fontSize: 14,
                    },
                  }}
                >
                  {msg.content}
                </Markdown>
              </View>
            ))}
            {isStreaming && !streamingText && (
              <View className="self-start bg-card border border-border p-3 rounded-2xl rounded-bl-sm">
                <ActivityIndicator size="small" color=""#6D28D9"" />
              </View>
            )}
          </View>
        </ScrollView>

        <View className="flex-row items-center gap-2 px-4 py-3 border-t border-border bg-background">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your tutor..."
            placeholderTextColor=""#94A3B8""
            className="flex-1 h-10 rounded-full border border-input bg-background px-4 text-sm text-foreground"
            editable={!isStreaming}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-primary-foreground" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
