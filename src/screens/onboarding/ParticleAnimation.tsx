import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface ParticleAnimationProps {
  color: string;
  count?: number;
  sizeRange?: [number, number];
}

interface ParticleData {
  id: number;
  startX: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  opacityMin: number;
  opacityMax: number;
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function ParticleAnimation({
  color,
  count = 15,
  sizeRange = [4, 12],
}: ParticleAnimationProps) {
  const particles = useMemo<ParticleData[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        startX: randomInRange(0, 380),
        startY: randomInRange(0, 700),
        size: randomInRange(sizeRange[0], sizeRange[1]),
        duration: randomInRange(3000, 8000),
        delay: randomInRange(0, 2000),
        driftX: randomInRange(-60, 60),
        opacityMin: 0.2,
        opacityMax: 0.6,
      })),
    [count, sizeRange[0], sizeRange[1]],
  );

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
      pointerEvents="none"
    >
      {particles.map((p) => (
        <Particle key={p.id} color={color} data={p} />
      ))}
    </View>
  );
}

function Particle({ color, data }: { color: string; data: ParticleData }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(data.opacityMin);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      data.delay,
      withRepeat(
        withTiming(-200, { duration: data.duration, easing: Easing.ease }),
        -1,
        false,
      ),
    );

    translateX.value = withDelay(
      data.delay,
      withRepeat(
        withSequence(
          withTiming(data.driftX, {
            duration: data.duration / 2,
            easing: Easing.ease,
          }),
          withTiming(-data.driftX, {
            duration: data.duration / 2,
            easing: Easing.ease,
          }),
        ),
        -1,
        true,
      ),
    );

    opacity.value = withDelay(
      data.delay,
      withRepeat(
        withSequence(
          withTiming(data.opacityMax, {
            duration: data.duration / 2,
          }),
          withTiming(data.opacityMin, {
            duration: data.duration / 2,
          }),
        ),
        -1,
        true,
      ),
    );

    scale.value = withDelay(
      data.delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: data.duration / 2 }),
          withTiming(0.8, { duration: data.duration / 2 }),
        ),
        -1,
        true,
      ),
    );
  }, [data.delay, data.driftX, data.duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute" as const,
      left: data.startX,
      top: data.startY,
      width: data.size,
      height: data.size,
      borderRadius: data.size / 2,
      backgroundColor: color,
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
      ] as any,
    };
  });

  return <Animated.View style={animatedStyle} />;
}
