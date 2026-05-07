import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

interface FloatingParticlesProps {
  colors: string[];
  count?: number;
}

function Particle({ color, index, total }: { color: string; index: number; total: number }) {
  const y = useSharedValue(0);
  const x = useSharedValue(0);
  const particleOpacity = useSharedValue(0.2);
  const particleScale = useSharedValue(1);

  useEffect(() => {
    const duration = 3000 + (index % 5) * 1000;
    const delay = (index % 3) * 1000;

    y.value = withRepeat(
      withSequence(
        withTiming(-30 - (index % 4) * 10, { duration }),
        withTiming(0, { duration }),
      ),
      -1,
      false,
    );

    x.value = withRepeat(
      withSequence(
        withTiming(((index % 2) - 0.5) * 30, { duration: duration + 500 }),
        withTiming(0, { duration: duration + 500 }),
      ),
      -1,
      false,
    );

    particleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: duration / 2 }),
        withTiming(0.2, { duration: duration / 2 }),
      ),
      -1,
      false,
    );

    particleScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration }),
        withTiming(1, { duration }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { translateX: x.value },
      { scale: particleScale.value },
    ],
    opacity: particleOpacity.value,
  }));

  const size = 3 + (index % 4) * 1.5;

  return (
    <Animated.View
      style={[{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        left: `${((index * 37) % 100)}%`,
        top: `${((index * 53) % 100)}%`,
      }, animatedStyle]}
    />
  );
}

export function FloatingParticles({ colors, count = 20 }: FloatingParticlesProps) {
  return (
    <View className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <Particle
          key={i}
          color={colors[i % colors.length]}
          index={i}
          total={count}
        />
      ))}
    </View>
  );
}
