import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Sparkles, BookOpen, Baby, Check, FileText } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuthContext";
import { streamSSE } from "../../services/sse-client";
import { env } from "../../lib/env";
import { Button } from "../ui/button";
import { Sheet } from "../ui/sheet";
import Toast from "react-native-toast-message";
import Markdown from "react-native-markdown-display";

type SummaryMode = "summarize" | "eli5";

interface Note {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
}

interface AISummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onUpdateSummary: (noteId: string, summary: string) => void;
  onViewNote?: () => void;
}

export function AISummarySheet({
  open,
  onOpenChange,
  note,
  onUpdateSummary,
  onViewNote,
}: AISummarySheetProps) {
  const { session } = useAuth();
  const [mode, setMode] = useState<SummaryMode>("summarize");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!note?.content || !session) return;

    setLoading(true);
    setResult("");

    try {
      let fullResponse = "";
      const prompt =
        mode === "summarize"
          ? "Summarize the following text concisely, highlighting key points:\n\n"
          : "Explain the following text like I'm 5 years old in simple language:\n\n";

      const generator = streamSSE(
        `${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stream-ai-chat`,
        {
          body: {
            messages: [],
            mode: mode === "summarize" ? "summarize" : "eli5",
            content: note.content,
            newMessage: prompt,
          },
          token: session.access_token,
        }
      );

      for await (const chunk of generator) {
        fullResponse += chunk;
        setResult(fullResponse);
      }

      if (mode === "summarize" && fullResponse && note.id) {
        onUpdateSummary(note.id, fullResponse);
        supabase
          .from("notes")
          .update({ summary: fullResponse })
          .eq("id", note.id)
          .then(() => {});
      }
    } catch {
      Toast.show({ type: "error", text1: "AI Error", text2: "Failed to generate content" });
    } finally {
      setLoading(false);
    }
  }, [note, session, mode, onUpdateSummary]);

  const handleSave = useCallback(async () => {
    if (!result || !note?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notes")
        .update({ summary: result })
        .eq("id", note.id);
      if (error) throw error;
      onUpdateSummary(note.id, result);
      Toast.show({ type: "success", text1: "Summary saved!" });
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to save summary." });
    } finally {
      setSaving(false);
    }
  }, [result, note, onUpdateSummary]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={["85%"]}>
      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <Text className="text-xl font-bold text-foreground">AI Study Tools</Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => setMode("summarize")}
            className={`flex-1 p-4 rounded-xl border ${
              mode === "summarize"
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
            style={mode === "summarize" ? { borderWidth: 2 } : undefined}
          >
            <BookOpen
              className={`w-6 h-6 mb-2 ${mode === "summarize" ? "text-primary" : "text-muted-foreground"}`}
            />
            <Text className="font-medium text-foreground">Summarize</Text>
            <Text className="text-xs text-muted-foreground">Get key points</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("eli5")}
            className={`flex-1 p-4 rounded-xl border ${
              mode === "eli5"
                ? "border-secondary bg-secondary/5"
                : "border-border bg-card"
            }`}
            style={mode === "eli5" ? { borderWidth: 2 } : undefined}
          >
            <Baby
              className={`w-6 h-6 mb-2 ${mode === "eli5" ? "text-secondary" : "text-muted-foreground"}`}
            />
            <Text className="font-medium text-foreground">Explain Like I'm 5</Text>
            <Text className="text-xs text-muted-foreground">Simple explanation</Text>
          </Pressable>
        </View>

        <Button
          onPress={handleGenerate}
          disabled={loading || !note?.content}
          className={`w-full ${mode === "summarize" ? "bg-primary" : "bg-secondary"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <Text className="text-white font-semibold">
                Generate {mode === "summarize" ? "Summary" : "Explanation"}
              </Text>
            </>
          )}
        </Button>

        {result ? (
          <Animated.View entering={FadeIn.duration(300)} className="p-4 rounded-xl bg-muted/50 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <Text className="text-sm font-medium text-emerald-500">
                  {mode === "summarize" ? "Summary generated!" : "Here you go!"}
                </Text>
              </View>
              {mode === "summarize" && (
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  className="flex-row items-center gap-1 px-2 py-1 rounded border border-border"
                >
                  {saving ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Check className="w-3 h-3 text-foreground" />
                  )}
                  <Text className="text-xs text-foreground">Save</Text>
                </Pressable>
              )}
            </View>
            <ScrollView className="max-h-[200px]">
              <Markdown
                style={{
                  body: { color: "hsl(var(--foreground))", fontSize: 14 },
                }}
              >
                {result}
              </Markdown>
            </ScrollView>
          </Animated.View>
        ) : null}

        {note && (
          <Pressable
            className="p-3 rounded-lg bg-muted/30 border border-border/50"
            onPress={onViewNote}
          >
            <Text className="text-xs text-muted-foreground mb-1">From note:</Text>
            <View className="flex-row items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                {note.title}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </Sheet>
  );
}
