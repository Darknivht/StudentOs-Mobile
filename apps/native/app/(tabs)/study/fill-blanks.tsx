import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  GraduationCap,
} from "lucide-react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ErrorFallback } from "../../../components/ErrorFallback";
import { streamAIChat } from "../../../lib/ai";
import { parseFillBlanksResponse, type FillBlank } from "../../../lib/parseAIResponse";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

export default function FillBlanksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notes, setNotes] = useState<
    { id: string; title: string; course_id: string | null }[]
  >([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [blanks, setBlanks] = useState<FillBlank[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("notes")
      .select("id, title, course_id")
      .eq("user_id", user?.id || "")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotes(data || []);
  };

  const generateBlanks = async (noteId: string) => {
    setSelectedNote(noteId);
    setLoading(true);

    try {
      const { data: note } = await supabase
        .from("notes")
        .select("content")
        .eq("id", noteId)
        .single();

      if (!note?.content) throw new Error("No content");

      let fullResponse = "";
      await streamAIChat({
        messages: [],
        mode: "fill_blanks",
        content: note.content,
        onDelta: (chunk) => {
          fullResponse += chunk;
        },
        onDone: () => {
          try {
            const parsedBlanks = parseFillBlanksResponse(fullResponse);
            setBlanks(parsedBlanks);
            setUserAnswers(new Array(parsedBlanks.length).fill(""));
          } catch {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to generate exercises. Please try again.",
            });
          }
          setLoading(false);
        },
        onError: (err) => {
          Toast.show({ type: "error", text1: "Error", text2: err });
          setLoading(false);
        },
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load note",
      });
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    const correct =
      answer.toLowerCase().trim() ===
      blanks[currentIndex].blank.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore((s) => s + 1);

    const updated = [...userAnswers];
    updated[currentIndex] = answer.trim();
    setUserAnswers(updated);
  };

  const nextQuestion = () => {
    if (currentIndex < blanks.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setShowResult(false);
    } else {
      setComplete(true);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" className="text-primary mb-4" />
        <Text className="text-muted-foreground">
          Generating fill-in-the-blanks...
        </Text>
      </View>
    );
  }

  if (complete) {
    const percentage = Math.round((score / blanks.length) * 100);
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Animated.View entering={FadeIn} className="items-center gap-4">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
            <Sparkles size={48} className="text-primary-foreground" />
          </View>
          <Text className="text-2xl font-bold text-foreground">
            {percentage >= 80
              ? "Excellent!"
              : percentage >= 60
              ? "Good job!"
              : "Keep practicing!"}
          </Text>
          <Text className="text-muted-foreground">
            You got {score} out of {blanks.length} correct
          </Text>
          <Text className="text-5xl font-bold text-primary">
            {percentage}%
          </Text>
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="w-full max-w-xs mt-4"
          >
            <Text className="text-foreground">Back to Study Tools</Text>
          </Button>
        </Animated.View>
      </View>
    );
  }

  if (blanks.length > 0) {
    const current = blanks[currentIndex];
    return (
      <View className="flex-1 bg-background p-6 gap-5">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm text-primary font-medium">← Exit</Text>
          </Pressable>
          <Text className="text-sm text-muted-foreground">
            {currentIndex + 1} / {blanks.length}
          </Text>
        </View>

        <View className="h-2 bg-muted rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{
              width: `${((currentIndex + 1) / blanks.length) * 100}%`,
            }}
          />
        </View>

        <Animated.View entering={SlideInRight.duration(200)} className="gap-5">
          <Text className="text-lg text-foreground">{current.sentence}</Text>
          <Text className="text-sm text-muted-foreground">
            Hint: {current.hint}
          </Text>

          <TextInput
            value={answer}
            onChangeText={setAnswer}
            placeholder="Type your answer..."
            editable={!showResult}
            onSubmitEditing={checkAnswer}
            className="bg-card border border-border rounded-xl p-3 text-foreground text-base"
            returnKeyType="done"
          />

          {showResult && (
            <View
              className={`p-4 rounded-2xl flex-row items-center gap-3 ${
                isCorrect ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}
            >
              {isCorrect ? (
                <CheckCircle size={20} className="text-emerald-500" />
              ) : (
                <XCircle size={20} className="text-red-500" />
              )}
              <Text
                className={isCorrect ? "text-emerald-700" : "text-red-700"}
              >
                {isCorrect
                  ? "Correct!"
                  : `The answer was: ${current.blank}`}
              </Text>
            </View>
          )}

          {!showResult ? (
            <Button
              onPress={checkAnswer}
              disabled={!answer.trim()}
              className="bg-primary"
            >
              <Text className="text-primary-foreground font-medium">
                Check Answer
              </Text>
            </Button>
          ) : (
            <Button onPress={nextQuestion} className="bg-primary">
              <Text className="text-primary-foreground font-medium">
                {currentIndex < blanks.length - 1 ? "Next" : "See Results"}
              </Text>
            </Button>
          )}
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm text-primary font-medium">← Back</Text>
          </Pressable>
          <View>
            <Text className="text-xl font-bold text-foreground">
              Fill in the Blanks
            </Text>
            <Text className="text-sm text-muted-foreground">
              AI removes key terms for you to fill
            </Text>
          </View>
        </View>

        <Text className="text-sm font-medium text-muted-foreground">
          Select a note:
        </Text>
        {notes.map((note) => (
          <Pressable key={note.id} onPress={() => generateBlanks(note.id)}>
            <Card>
              <CardContent className="p-4">
                <Text className="font-medium text-foreground">
                  {note.title}
                </Text>
              </CardContent>
            </Card>
          </Pressable>
        ))}
        {notes.length === 0 && (
          <Text className="text-center text-muted-foreground py-8">
            No notes yet. Create notes first!
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
