import { useState, useCallback, useRef } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import {
  BookOpen,
  Brain,
  Layers,
  Clock,
  Trophy,
  Users,
  Rocket,
  ArrowRight,
  Sparkles,
} from "lucide-react-native";
import { Button } from "../components/ui/button";
import { FloatingParticles } from "../components/FloatingParticles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 8000;

const slides = [
  {
    title: "Welcome to StudentOS",
    description: "The smartest way to study. Built by students, for students.",
    icon: BookOpen,
    bgColors: ["#7c3aed", "#9333ea", "#4338ca"],
    iconBg: ["#8b5cf6", "#a855f7"],
    particles: ["#A78BFA", "#C4B5FD", "#818CF8"],
  },
  {
    title: "AI-Powered Learning",
    description: "Smart notes, AI tutor, math solver — AI that actually understands your homework.",
    icon: Brain,
    bgColors: ["#2563eb", "#0891b2", "#0d9488"],
    iconBg: ["#60a5fa", "#22d3ee"],
    particles: ["#67E8F9", "#22D3EE", "#06B6D4"],
  },
  {
    title: "Never Forget Again",
    description: "Spaced-repetition flashcards and quizzes that adapt to how you learn.",
    icon: Layers,
    bgColors: ["#059669", "#16a34a", "#0d9488"],
    iconBg: ["#34d399", "#4ade80"],
    particles: ["#6EE7B7", "#34D399", "#10B981"],
  },
  {
    title: "Stay in the Zone",
    description: "Pomodoro timer, lofi radio, and app blocking to keep distractions away.",
    icon: Clock,
    bgColors: ["#f97316", "#f59e0b", "#eab308"],
    iconBg: ["#fb923c", "#fbbf24"],
    particles: ["#FCD34D", "#FBBF24", "#F59E0B"],
  },
  {
    title: "Track Your Growth",
    description: "Streaks, XP, levels, and achievements — watch yourself level up every day.",
    icon: Trophy,
    bgColors: ["#db2777", "#f43f5e", "#ef4444"],
    iconBg: ["#f472b6", "#fb7185"],
    particles: ["#FDA4AF", "#FB7185", "#F43F5E"],
  },
  {
    title: "Study Together",
    description: "Join study groups, challenge friends, and climb the global leaderboard.",
    icon: Users,
    bgColors: ["#4f46e5", "#2563eb", "#7c3aed"],
    iconBg: ["#818cf8", "#60a5fa"],
    particles: ["#A5B4FC", "#818CF8", "#6366F1"],
  },
  {
    title: "Ready to Begin?",
    description: "Join thousands of students already crushing their goals with StudentOS.",
    icon: Rocket,
    bgColors: ["#c026d3", "#9333ea", "#6d28d9"],
    iconBg: ["#e879f9", "#d946ef"],
    particles: ["#E879F9", "#D946EF", "#C026D3"],
  },
];

function useOnboardingPager() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const contentOpacity = useSharedValue(1);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= slides.length || index === current) return;
    setDirection(index > current ? 1 : -1);
    contentOpacity.value = 0;
    scale.value = 0.9;
    setTimeout(() => {
      setCurrent(index);
      contentOpacity.value = 1;
      scale.value = 1;
    }, 200);
  }, [current]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return { current, direction, next, prev, goTo, contentStyle };
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { current, next, prev, goTo, contentStyle } = useOnboardingPager();
  const isLast = current === slides.length - 1;
  const slide = slides[current];
  const Icon = slide.icon;

  const finish = useCallback(() => {
    try {
      const Storage = require("expo-sqlite/kv-store");
      Storage.setItemSync("onboarding_seen", "true");
    } catch {}
    router.replace("/(auth)/login");
  }, [router]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      const swipe = Math.abs(event.translationX) * event.velocityX;
      if (swipe < -SWIPE_THRESHOLD) {
        runOnJS(next)();
      } else if (swipe > SWIPE_THRESHOLD) {
        runOnJS(prev)();
      }
    });

  const bgGradient = `linear-gradient(135deg, ${slide.bgColors[0]}, ${slide.bgColors[1]}, ${slide.bgColors[2]})`;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 relative overflow-hidden" style={{ backgroundColor: slide.bgColors[0] }}>
        <FloatingParticles colors={slide.particles} />

        <View
          className="absolute inset-0"
          style={{
            backgroundColor: slide.bgColors[0],
          }}
        />

        <View className="w-full px-6 pt-12 pb-4 z-10">
          <View className="h-1 bg-white/20 rounded-full overflow-hidden mb-4">
            <Animated.View
              className="h-full bg-white/80 rounded-full"
              style={{ width: `${((current + 1) / slides.length) * 100}%` }}
            />
          </View>
          <View className="flex-row justify-end">
            <Pressable onPress={finish}>
              <Text className="text-sm text-white/70 font-medium">Skip</Text>
            </Pressable>
          </View>
        </View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1, justifyContent: "center", alignItems: "center" }, contentStyle]}>
            <View className="items-center gap-8 px-6">
              <View className="relative">
                <View
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
                  style={{
                    backgroundColor: slide.particles[0],
                  }}
                />
                <View
                  className="relative w-32 h-32 rounded-3xl items-center justify-center shadow-2xl"
                  style={{
                    backgroundColor: slide.iconBg[0],
                  }}
                >
                  <Icon className="w-16 h-16 text-white" />
                  <View className="absolute -top-2 -right-2">
                    <Sparkles className="w-6 h-6 text-white/80" />
                  </View>
                </View>
              </View>

              <View className="items-center gap-3">
                <Text className="text-3xl font-bold text-white text-center drop-shadow-md">
                  {slide.title}
                </Text>
                <Text className="text-white/80 text-base leading-relaxed text-center max-w-xs">
                  {slide.description}
                </Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>

        <View className="w-full px-6 pb-10 z-10 gap-6">
          <View className="flex-row items-center justify-center gap-2">
            {slides.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => goTo(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? "w-8 h-2.5 bg-white"
                    : "w-2.5 h-2.5 bg-white/30"
                }`}
              />
            ))}
          </View>

          <View className="flex-row gap-3">
            {current > 0 && (
              <Button
                variant="ghost"
                className="h-12 px-5 text-base text-white/80 border border-white/20 rounded-2xl"
                onPress={prev}
              >
                <Text className="text-white/80 font-medium">Back</Text>
              </Button>
            )}
            {isLast ? (
              <Button
                className="flex-1 h-14 bg-white rounded-2xl shadow-xl"
                onPress={finish}
              >
                <Text className="text-purple-700 font-bold text-lg">Get Started</Text>
                <Rocket className="w-5 h-5 text-purple-700 ml-2" />
              </Button>
            ) : (
              <Button
                className="flex-1 h-12 bg-white/20 border border-white/20 rounded-2xl"
                onPress={next}
              >
                <Text className="text-white font-medium text-base">Next</Text>
                <ArrowRight className="w-5 h-5 text-white ml-2" />
              </Button>
            )}
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
