import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import {
  Brain,
  CheckCircle,
  XCircle,
  Zap,
  Trophy,
  Sparkles,
  Loader2,
  GraduationCap,
} from "lucide-react-native";

import { useAuth } from "../../hooks/useAuthContext";
import { supabase } from "../../services/supabase";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const questionPool: Question[] = [
  { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"], correct: 1, category: "Biology" },
  { question: "What is 15% of 200?", options: ["25", "30", "35", "20"], correct: 1, category: "Math" },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], correct: 1, category: "Literature" },
  { question: "What planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2, category: "Science" },
  { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2, category: "Chemistry" },
  { question: "What is the square root of 144?", options: ["10", "11", "12", "14"], correct: 2, category: "Math" },
  { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, category: "History" },
  { question: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, category: "Biology" },
  { question: "What is 7 × 8?", options: ["54", "56", "58", "48"], correct: 1, category: "Math" },
  { question: "What is H₂O commonly known as?", options: ["Hydrogen peroxide", "Water", "Heavy water", "Salt water"], correct: 1, category: "Chemistry" },
  { question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Da Vinci", "Raphael", "Van Gogh"], correct: 1, category: "Art" },
  { question: "What does DNA stand for?", options: ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nucleic Acid"], correct: 1, category: "Biology" },
  { question: "What is the derivative of x²?", options: ["x", "2x", "x²", "2"], correct: 1, category: "Math" },
  { question: "Which element has the symbol 'Fe'?", options: ["Fluorine", "Iron", "Francium", "Fermium"], correct: 1, category: "Chemistry" },
  { question: "What is the capital of Japan?", options: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"], correct: 2, category: "Geography" },
  { question: "Who discovered gravity?", options: ["Einstein", "Newton", "Galileo", "Hawking"], correct: 1, category: "Physics" },
  { question: "What is 3⁴?", options: ["12", "27", "81", "64"], correct: 2, category: "Math" },
  { question: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2, category: "Math" },
  { question: "What is the boiling point of water in °C?", options: ["90", "100", "110", "120"], correct: 1, category: "Science" },
  { question: "What continent is Egypt in?", options: ["Asia", "Europe", "Africa", "Middle East"], correct: 2, category: "Geography" },
  { question: "What is the formula for area of a circle?", options: ["2πr", "πr²", "πd", "2πr²"], correct: 1, category: "Math" },
  { question: "What is the SI unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], correct: 2, category: "Physics" },
  { question: "How many chromosomes do humans have?", options: ["23", "44", "46", "48"], correct: 2, category: "Biology" },
  { question: "What is the Pythagorean theorem?", options: ["a+b=c", "a²+b²=c²", "a×b=c", "a/b=c"], correct: 1, category: "Math" },
];

function getRandomQuestions(count: number): Question[] {
  const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface DailyQuizChallengeProps {
  onComplete?: () => void;
}

export function DailyQuizChallenge({ onComplete }: DailyQuizChallengeProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [quizState, setQuizState] = useState<"idle" | "loading" | "playing" | "result">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [answered, setAnswered] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    try {
      const Storage = require("expo-sqlite/kv-store");
      const today = new Date().toISOString().split("T")[0];
      const lastQuiz = Storage.getItemSync("daily_quiz_date");
      if (lastQuiz === today && isMounted.current) {
        setAlreadyDone(true);
      }
    } catch {}
  }, []);

  const startQuiz = async () => {
    if (!isMounted.current) return;
    setScore(0);
    scoreRef.current = 0;
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setQuestions(getRandomQuestions(5));
    setQuizState("playing");
  };

  const handleAnswer = (idx: number) => {
    if (answered || !isMounted.current) return;
    
    const q = questions[currentQ];
    if (!q) return;
    
    setSelected(idx);
    setAnswered(true);
    
    if (idx === q.correct) {
      scoreRef.current += 1;
      setScore((s) => s + 1);
    }
  };

  const finishQuiz = async () => {
    if (!isMounted.current) return;
    
    const finalScore = scoreRef.current;
    setQuizState("result");
    
    try {
      const Storage = require("expo-sqlite/kv-store");
      const today = new Date().toISOString().split("T")[0];
      Storage.setItemSync("daily_quiz_date", today);
    } catch {}
    
    if (isMounted.current) {
      setAlreadyDone(true);
    }

    if (!user) return;
    
    const xpEarned = finalScore * 10;
    try {
      if (xpEarned > 0) {
        await supabase.rpc("increment_xp" as any, { user_id_input: user.id, xp_amount: xpEarned } as any);
      }
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        score: finalScore,
        total_questions: questions.length,
        quiz_data: questions.map((q) => ({
          question: q.question,
          correct: q.correct,
          category: q.category,
        })),
      });

      Toast.show({
        type: "success",
        text1: "Daily Quiz Complete!",
        text2: `You scored ${finalScore}/${questions.length} and earned ${xpEarned} XP!`,
      });

      onComplete?.();
    } catch (e) {
      console.error("Error saving quiz:", e);
    }
  };

  const goToNextQuestion = () => {
    if (!isMounted.current) return;
    
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      finishQuiz();
    }
  };

  if (alreadyDone && quizState === "idle") {
    return (
      <View className="p-4 rounded-2xl border border-border bg-emerald-500/5">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-emerald-500/20 items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </View>
          <View>
            <Text className="font-semibold text-foreground text-sm">Daily Brain Boost</Text>
            <Text className="text-xs text-muted-foreground">Completed today! Come back tomorrow 🎉</Text>
          </View>
        </View>
      </View>
    );
  }

  if (quizState === "idle") {
    return (
      <View className="p-4 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-foreground text-sm">Daily Brain Boost</Text>
            <Text className="text-xs text-muted-foreground">5 questions · 10 XP each · Updates streak</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <Text className="text-xs font-medium text-primary">50 XP</Text>
          </View>
        </View>
        <Pressable 
          onPress={startQuiz} 
          className="w-full h-9 bg-primary rounded-xl flex-row items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-primary-foreground mr-2" />
          <Text className="text-primary-foreground font-semibold text-sm">Start Quiz</Text>
        </Pressable>
      </View>
    );
  }

  if (quizState === "loading") {
    return (
      <View className="p-5 rounded-2xl border border-border bg-card items-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-sm font-medium text-foreground mt-3">Generating quiz from your notes...</Text>
        <Text className="text-xs text-muted-foreground mt-1">AI is creating personalized questions</Text>
      </View>
    );
  }

  if (quizState === "result") {
    const finalScore = scoreRef.current;
    return (
      <View className="p-5 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 items-center">
        <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-primary" />
        </View>
        <Text className="text-lg font-bold text-foreground">Quiz Complete!</Text>
        <Text className="text-3xl font-bold text-primary mt-1">{finalScore}/{questions.length}</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          You earned <Text className="font-semibold text-primary">{finalScore * 10} XP</Text>
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/study")}
          className="w-full mt-3 h-9 bg-secondary rounded-xl flex-row items-center justify-center"
        >
          <GraduationCap className="w-4 h-4 text-secondary-foreground mr-2" />
          <Text className="text-secondary-foreground font-semibold text-sm">Review with AI Tutor</Text>
        </Pressable>
        <Text className="text-xs text-muted-foreground mt-2">Streak updated! Come back tomorrow. 🔥</Text>
      </View>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <View className="p-4 rounded-2xl border border-border bg-card">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-medium text-muted-foreground">{q.category}</Text>
        <Text className="text-xs font-medium text-primary">{currentQ + 1}/{questions.length}</Text>
      </View>
      <View className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </View>

      <Text className="font-semibold text-foreground text-sm mb-3">{q.question}</Text>
      <View className="gap-2">
        {q.options.map((opt, i) => {
          let optBg = "bg-background";
          let optBorder = "border-border";
          let textColor = "text-foreground";
          
          if (answered) {
            if (i === q.correct) {
              optBg = "bg-emerald-500/10";
              optBorder = "border-emerald-500";
            } else if (i === selected && i !== q.correct) {
              optBg = "bg-red-500/10";
              optBorder = "border-red-500";
            } else {
              optBg = "bg-muted/30";
              optBorder = "border-border";
              textColor = "text-muted-foreground";
            }
          } else if (i === selected) {
            optBg = "bg-primary/10";
            optBorder = "border-primary";
          }

          return (
            <Pressable
              key={i}
              onPress={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full p-3 rounded-xl border ${optBg} ${optBorder} flex-row items-center`}
            >
              <View className="w-6 h-6 rounded-full border border-current items-center justify-center mr-2">
                <Text className={`text-xs font-medium ${textColor}`}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text className={`text-sm flex-1 ${textColor}`}>{opt}</Text>
              {answered && i === q.correct && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              {answered && i === selected && i !== q.correct && <XCircle className="w-4 h-4 text-red-500" />}
            </Pressable>
          );
        })}
      </View>

      {answered && (
        <Pressable 
          onPress={goToNextQuestion}
          className="w-full mt-3 h-9 rounded-xl bg-primary flex-row items-center justify-center"
        >
          <Text className="text-primary-foreground font-semibold text-sm">
            {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}