import { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Layers, RotateCcw, CheckCircle, XCircle, Minus, Brain } from "lucide-react-native";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useFlashcards, useDueFlashcards, useUpdateFlashcard } from "../../../hooks/useFlashcards";
import { useCourses } from "../../../hooks/useCourses";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { ErrorFallback } from "../../../components/ErrorFallback";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

type StudyView = "overview" | "studying" | "review-missed";

function sm2(quality: number, card: { repetitions: number; ease_factor: number; interval_days: number }) {
  if (quality < 3) {
    return { repetitions: 0, interval_days: 0, ease_factor: Math.max(1.3, card.ease_factor - 0.2) };
  }
  let { repetitions, ease_factor, interval_days } = card;
  if (repetitions === 0) interval_days = 1;
  else if (repetitions === 1) interval_days = 6;
  else interval_days = Math.round(interval_days * ease_factor);
  repetitions += 1;
  ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { repetitions, interval_days, ease_factor };
}

export default function FlashcardsScreen() {
  const router = useRouter();
  const { data: dueCards, isLoading: dueLoading } = useDueFlashcards();
  const { data: allCards, isLoading: allLoading } = useFlashcards();
  const { data: courses } = useCourses();
  const updateFlashcard = useUpdateFlashcard();

  const [view, setView] = useState<StudyView>("overview");
  const [studyQueue, setStudyQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missedCards, setMissedCards] = useState<any[]>([]);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const flipAnim = useSharedValue(0);
  const flipFrontStyle = useAnimatedStyle(() => ({
    opacity: flipAnim.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 1000 }, { rotateY: `${flipAnim.value * 180}deg` }],
  }));
  const flipBackStyle = useAnimatedStyle(() => ({
    opacity: flipAnim.value >= 0.5 ? 1 : 0,
    transform: [{ perspective: 1000 }, { rotateY: `${(flipAnim.value - 1) * 180}deg` }],
  }));

  const handleFlip = useCallback(() => {
    if (flipped) {
      flipAnim.value = withTiming(0, { duration: 300 });
    } else {
      flipAnim.value = withTiming(1, { duration: 300 });
    }
    setFlipped(!flipped);
  }, [flipped, flipAnim]);

  const startStudy = useCallback(() => {
    const cards = dueCards || [];
    if (cards.length === 0) return;
    setStudyQueue(cards);
    setCurrentIndex(0);
    setFlipped(false);
    flipAnim.value = 0;
    setMissedCards([]);
    setStats({ correct: 0, total: 0 });
    setView("studying");
  }, [dueCards, flipAnim]);

  const handleGrade = useCallback(
    async (quality: number) => {
      if (!studyQueue[currentIndex]) return;
      const card = studyQueue[currentIndex];
      const result = sm2(quality, {
        repetitions: card.repetitions,
        ease_factor: card.ease_factor,
        interval_days: card.interval_days,
      });

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + result.interval_days);

      try {
        await updateFlashcard.mutateAsync({
          id: card.id,
          repetitions: result.repetitions,
          ease_factor: result.ease_factor,
          interval_days: result.interval_days,
          next_review: nextReview.toISOString(),
        });
      } catch {}

      const isCorrect = quality >= 3;
      setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
      if (!isCorrect) setMissedCards((prev) => [...prev, card]);

      if (currentIndex < studyQueue.length - 1) {
        setCurrentIndex((i) => i + 1);
        setFlipped(false);
        flipAnim.value = 0;
      } else {
        setView("review-missed");
      }
    },
    [studyQueue, currentIndex, updateFlashcard, flipAnim]
  );

  const currentCard = studyQueue[currentIndex];

  if (view === "overview") {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-4">
          <Text className="text-2xl font-bold text-foreground">Flashcards</Text>

          {(dueLoading || allLoading) ? (
            <ActivityIndicator color=""#6D28D9"" />
          ) : (
            <>
              <Pressable onPress={startStudy}>
                <View className="p-6 rounded-2xl bg-primary overflow-hidden relative">
                  <View className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -top-16 right-[-16]" />
                  <View className="relative z-10">
                    <View className="flex-row items-center gap-3 mb-2">
                      <Layers className="w-6 h-6 text-primary-foreground" />
                      <Text className="text-lg font-bold text-primary-foreground">Study Now</Text>
                    </View>
                    <Text className="text-primary-foreground/80">
                      {dueCards?.length || 0} cards due for review
                    </Text>
                  </View>
                </View>
              </Pressable>

              <View className="flex-row gap-3">
                <Card className="flex-1">
                  <CardContent className="p-4 items-center">
                    <Text className="text-2xl font-bold text-foreground">{allCards?.length || 0}</Text>
                    <Text className="text-xs text-muted-foreground">Total Cards</Text>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardContent className="p-4 items-center">
                    <Text className="text-2xl font-bold text-foreground">{dueCards?.length || 0}</Text>
                    <Text className="text-xs text-muted-foreground">Due Today</Text>
                  </CardContent>
                </Card>
              </View>

              <View className="gap-3">
                <Text className="font-semibold text-foreground">All Cards</Text>
                {(allCards || []).map((card) => {
                  const course = courses?.find((c) => c.id === card.course_id);
                  return (
                    <Card key={card.id}>
                      <CardContent className="p-4">
                        <Text className="font-medium text-foreground mb-1" numberOfLines={1}>{card.front}</Text>
                        <Text className="text-sm text-muted-foreground" numberOfLines={1}>{card.back}</Text>
                        {course && (
                          <Badge variant="secondary" className="mt-2">
                            <Text className="text-xs text-secondary-foreground">{course.name}</Text>
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {allCards?.length === 0 && (
                  <Text className="text-muted-foreground text-center py-8">No flashcards yet. Generate some from your notes!</Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  if (view === "studying" && currentCard) {
    const progressPercent = ((currentIndex + 1) / studyQueue.length) * 100;
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-2">
            <Pressable onPress={() => setView("overview")}>
              <Text className="text-primary font-medium">Back</Text>
            </Pressable>
            <Text className="text-sm text-muted-foreground">{currentIndex + 1} / {studyQueue.length}</Text>
          </View>
          <Progress value={progressPercent} className="h-1" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Pressable onPress={handleFlip} className="w-full">
            <View className="w-full min-h-[280px] rounded-2xl border border-border bg-card items-center justify-center p-6">
              {!flipped ? (
                <Animated.View style={flipFrontStyle} className="items-center justify-center">
                  <Text className="text-lg font-semibold text-foreground text-center">{currentCard.front}</Text>
                  <Text className="text-sm text-muted-foreground mt-4">Tap to reveal answer</Text>
                </Animated.View>
              ) : (
                <Animated.View style={flipBackStyle} className="items-center justify-center">
                  <Text className="text-lg text-foreground text-center">{currentCard.back}</Text>
                </Animated.View>
              )}
            </View>
          </Pressable>
        </View>

        {flipped && (
          <View className="px-6 pb-8 gap-3">
            <Text className="text-center text-sm text-muted-foreground mb-2">How well did you know this?</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleGrade(1)}
                className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 items-center"
              >
                <XCircle className="w-5 h-5 text-red-500" />
                <Text className="text-sm font-medium text-red-500 mt-1">Again</Text>
              </Pressable>
              <Pressable
                onPress={() => handleGrade(3)}
                className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center"
              >
                <Minus className="w-5 h-5 text-amber-500" />
                <Text className="text-sm font-medium text-amber-500 mt-1">Hard</Text>
              </Pressable>
              <Pressable
                onPress={() => handleGrade(5)}
                className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 items-center"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <Text className="text-sm font-medium text-emerald-500 mt-1">Easy</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  }

  if (view === "review-missed") {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-primary" />
        </View>
        <Text className="text-2xl font-bold text-foreground mb-2">Session Complete!</Text>
        <Text className="text-4xl font-bold text-primary mb-1">
          {stats.correct}/{stats.total}
        </Text>
        <Text className="text-muted-foreground mb-6">
          {stats.correct === stats.total ? "Perfect! 🎉" : `${missedCards.length} card${missedCards.length !== 1 ? "s" : ""} to review`}
        </Text>

        {missedCards.length > 0 && (
          <Button
            onPress={() => {
              setStudyQueue(missedCards);
              setCurrentIndex(0);
              setFlipped(false);
              flipAnim.value = 0;
              setMissedCards([]);
              setStats({ correct: 0, total: 0 });
              setView("studying");
            }}
            className="w-full mb-3 bg-primary"
          >
            <RotateCcw className="w-4 h-4 text-primary-foreground" />
            <Text className="text-primary-foreground font-semibold">Review Missed Cards</Text>
          </Button>
        )}

        <Button
          onPress={() => router.push("/study/tutor")}
          variant="outline"
          className="w-full mb-3"
        >
          <Brain className="w-4 h-4 text-foreground" />
          <Text className="text-foreground font-semibold">Review with AI Tutor</Text>
        </Button>

        <Button
          onPress={() => setView("overview")}
          variant="outline"
          className="w-full"
        >
          <Text className="text-foreground font-semibold">Back to Overview</Text>
        </Button>
      </View>
    );
  }

  return null;
}
