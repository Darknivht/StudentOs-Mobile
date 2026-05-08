import { View, Text, ScrollView, Pressable } from "react-native";
import { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, RotateCcw } from "lucide-react-native";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface ReviewQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  difficulty: string;
  topic_id: string | null;
  selectedAnswer: number;
  isCorrect: boolean;
}

interface SessionReviewProps {
  questions: ReviewQuestion[];
  score: number;
  subjectName: string;
  onBack: () => void;
  onRetryWeak?: (topicId: string) => void;
}

export default function SessionReview({
  questions,
  score,
  subjectName,
  onBack,
  onRetryWeak,
}: SessionReviewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const pct =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-4">
        <View className="p-5 rounded-2xl bg-card border border-border items-center">
          <Text className="text-5xl mb-2">
            {pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "💪"}
          </Text>
          <Text className="text-2xl font-bold text-foreground">
            {pct}% Score
          </Text>
          <Text className="text-muted-foreground text-sm">
            {score} / {questions.length} correct — {subjectName}
          </Text>
          <Progress value={pct} className="mt-3 w-48" />
        </View>

        <Text className="text-sm font-semibold text-foreground">
          Question Review
        </Text>

        <View className="gap-2">
          {questions.map((q, i) => (
            <View
              key={q.id}
              className="rounded-xl border border-border overflow-hidden"
            >
              <Pressable
                onPress={() =>
                  setExpandedIndex(expandedIndex === i ? null : i)
                }
                className="flex-row items-center gap-3 p-3"
              >
                {q.isCorrect ? (
                  <CheckCircle2
                    size={18}
                    className="text-green-500 shrink-0"
                  />
                ) : (
                  <XCircle
                    size={18}
                    className="text-destructive shrink-0"
                  />
                )}
                <Text
                  className="text-sm text-foreground flex-1"
                  numberOfLines={1}
                >
                  <Text className="text-muted-foreground">Q{i + 1}. </Text>
                  {q.question}
                </Text>
                {expandedIndex === i ? (
                  <ChevronUp
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                )}
              </Pressable>

              {expandedIndex === i && (
                <View className="px-3 pb-3 gap-2 border-t border-border pt-2">
                  <Text className="text-sm text-foreground font-medium">
                    {q.question}
                  </Text>
                  <View className="gap-1">
                    {q.options.map((opt, oi) => {
                      let textStyle = "text-muted-foreground";
                      if (oi === q.correct_index)
                        textStyle = "text-green-600 font-medium";
                      else if (oi === q.selectedAnswer && !q.isCorrect)
                        textStyle = "text-destructive line-through";
                      return (
                        <Text key={oi} className={`text-xs ${textStyle}`}>
                          {String.fromCharCode(65 + oi)}. {opt}
                          {oi === q.correct_index && " ✓"}
                          {oi === q.selectedAnswer &&
                            oi !== q.correct_index &&
                            " ✗"}
                        </Text>
                      );
                    })}
                  </View>
                  {q.explanation && (
                    <View className="p-2 rounded-lg bg-muted/50">
                      <Text className="text-xs font-semibold text-muted-foreground mb-1">
                        Explanation
                      </Text>
                      <Text className="text-xs text-foreground">
                        {q.explanation}
                      </Text>
                    </View>
                  )}
                  {!q.isCorrect && q.topic_id && onRetryWeak && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="self-start flex-row items-center gap-1"
                      onPress={() => onRetryWeak(q.topic_id!)}
                    >
                      <RotateCcw size={12} />
                      <Text className="text-xs">Practice Similar</Text>
                    </Button>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <Button onPress={onBack} className="w-full">
          Back to Subjects
        </Button>
      </View>
    </ScrollView>
  );
}
