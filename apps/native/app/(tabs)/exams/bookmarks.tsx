import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bookmark, Trash2 } from "lucide-react-native";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { Button } from "../../../components/ui/button";
import Toast from "react-native-toast-message";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

export default function BookmarksScreen() {
  const { examTypeId, subjectId, subjectName } = useLocalSearchParams<{
    examTypeId: string;
    subjectId: string;
    subjectName: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: bks } = await supabase
        .from("exam_bookmarks")
        .select("question_id")
        .eq("user_id", user.id);

      if (!bks || bks.length === 0) {
        setLoading(false);
        return;
      }

      const ids = bks.map((b: any) => b.question_id);
      const { data: questions } = await supabase
        .from("exam_questions")
        .select("*")
        .in("id", ids)
        .eq("exam_type_id", examTypeId)
        .eq("subject_id", subjectId)
        .eq("is_active", true);

      setBookmarks(questions || []);
      setLoading(false);
    };
    fetch();
  }, [user, examTypeId, subjectId]);

  const removeBookmark = async (questionId: string) => {
    if (!user) return;
    await supabase
      .from("exam_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", questionId);
    setBookmarks((prev) => prev.filter((q) => q.id !== questionId));
    Toast.show({ type: "success", text1: "Bookmark removed" });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-primary font-medium">← Back</Text>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Bookmark size={18} className="text-foreground" />
          <Text className="text-lg font-bold text-foreground">
            Bookmarked — {subjectName}
          </Text>
        </View>

        {bookmarks.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">🔖</Text>
            <Text className="font-semibold text-foreground">
              No bookmarks yet
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Bookmark questions during practice to review them here.
            </Text>
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="mt-4"
            >
              <Text className="text-foreground">Go Back</Text>
            </Button>
          </View>
        ) : (
          <View className="gap-3">
            {bookmarks.map((q: any) => {
              const opts = Array.isArray(q.options) ? q.options : [];
              const revealed = showAnswer[q.id];
              return (
                <View
                  key={q.id}
                  className="p-4 rounded-xl border border-border bg-card gap-3"
                >
                  <View className="flex-row items-start justify-between">
                    <Text className="text-sm font-medium text-foreground flex-1">
                      {q.question}
                    </Text>
                    <Pressable
                      onPress={() => removeBookmark(q.id)}
                      className="h-7 w-7 items-center justify-center shrink-0"
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Pressable>
                  </View>
                  <View className="gap-1">
                    {opts.map((opt: string, oi: number) => (
                      <Text
                        key={oi}
                        className={`text-xs p-1.5 rounded ${
                          revealed && oi === q.correct_index
                            ? "bg-green-500/10 text-green-600 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                      </Text>
                    ))}
                  </View>
                  <Button
                    variant="outline"
                    onPress={() =>
                      setShowAnswer((prev) => ({
                        ...prev,
                        [q.id]: !prev[q.id],
                      }))
                    }
                    className="self-start"
                  >
                    <Text className="text-xs text-foreground">
                      {revealed ? "Hide Answer" : "Show Answer"}
                    </Text>
                  </Button>
                  {revealed && q.explanation && (
                    <View className="p-2 rounded-lg bg-muted/50">
                      <Text className="text-xs font-semibold text-muted-foreground mb-1">
                        Explanation
                      </Text>
                      <Text className="text-xs text-foreground">
                        {q.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
