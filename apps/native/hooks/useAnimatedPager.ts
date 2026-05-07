import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useCallback } from "react";

interface PagerOptions {
  stiffness?: number;
  damping?: number;
}

export function useAnimatedPager(options: PagerOptions = {}) {
  const { stiffness = 250, damping = 28 } = options;

  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const enterFromRight = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const enter = useCallback((direction: number) => {
    translateX.value = direction > 0 ? 300 : -300;
    scale.value = 0.9;
    opacity.value = 0;
    translateX.value = withSpring(0, { stiffness, damping });
    scale.value = withSpring(1, { stiffness, damping });
    opacity.value = withTiming(1, { duration: 250 });
  }, []);

  const exit = useCallback((direction: number) => {
    translateX.value = withSpring(direction < 0 ? 300 : -300, { stiffness, damping });
    scale.value = withSpring(0.9, { stiffness, damping });
    opacity.value = withTiming(0, { duration: 250 });
  }, []);

  return { animatedStyle: enterFromRight, enter, exit };
}
