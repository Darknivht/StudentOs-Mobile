import { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useCallback } from "react";

export function useScalePress(scaleTo = 0.95) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleTo, { stiffness: 400, damping: 20 });
  }, []);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { stiffness: 400, damping: 20 });
  }, []);

  return { animatedStyle, onPressIn, onPressOut };
}
