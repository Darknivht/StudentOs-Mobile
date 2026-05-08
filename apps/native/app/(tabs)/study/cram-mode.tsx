import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Zap, ChevronRight, Trophy } from "lucide-react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { ErrorFallback } from "../../../components/ErrorFallback";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

export default function CramModeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<
    { front: string; back: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (user) fetchFlashcards();
  }, [user]);

  const fetchFlashcards = async () => {
    try {
      const { data } = await supabase
        .from("flashcards")
        .select("front, back")
        .eq("user_id", user?.id || "")
        .limit(50);

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load flashcards",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    setCardsReviewed((c) => c + 1);
    setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % flashcards.length);
    }, 200);
  }, [flashcards.length]);

  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-muted-foreground mt-4">
          Loading flashcards...
        </Text>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Zap size={64} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-bold text-foreground mb-2">
          No Flashcards Yet
        </Text>
        <Text className="text-muted-foreground text-center mb-4">
          Generate flashcards from your notes first!
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          <Text className="text-foreground">Back to Study Tools</Text>
        </Button>
      </View>
    );
  }

  const card = flashcards[currentIndex];

  return (
    <View className="flex-1 bg-background p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-primary font-medium">← Exit</Text>
        </Pressable>
        <View className="flex-row items-center gap-4">
          <Text className="text-sm text-muted-foreground">
            {cardsReviewed} reviewed
          </Text>
          <Text className="text-sm font-mono text-muted-foreground">
            {getElapsedTime()}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-2 mb-8">
        <Zap size={20} className="text-primary" />
        <Text className="font-bold text-primary text-lg">CRAM MODE</Text>
        <Zap size={20} className="text-primary" />
      </View>

      <Pressable
        onPress={() => (isFlipped ? nextCard() : setIsFlipped(true))}
        className="flex-1 items-center justify-center"
      >
        <Animated.View
          entering={SlideInRight.duration(200)}
          key={`${currentIndex}-${isFlipped}`}
          className="w-full aspect-[4/3] rounded-3xl items-center justify-center p-8"
          style={{
            backgroundColor: isFlipped
              ? "hsl(240, 10%, 15%)"
              : "hsl(240, 10%, 12%)",
            borderWidth: 1,
            borderColor: "hsl(240, 10%, 18%)",
          }}
        >
          <Text className="text-xl font-medium text-foreground text-center">
            {isFlipped ? card.back : card.front}
          </Text>
        </Animated.View>
      </Pressable>

      <View className="items-center gap-4 mt-6">
        <Text className="text-sm text-muted-foreground">
          {isFlipped ? "Tap to continue" : "Tap to reveal"}
        </Text>
        {isFlipped && (
          <Button onPress={nextCard} className="bg-primary">
            <View className="flex-row items-center gap-1">
              <Text className="text-primary-foreground font-medium">
                Next Card
              </Text>
              <ChevronRight size={16} className="text-primary-foreground" />
            </View>
          </Button>
        )}
        <Text className="text-xs text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </Text>
      </View>
    </View>
  );
}
