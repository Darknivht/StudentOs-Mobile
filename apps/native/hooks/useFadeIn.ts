import { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";

export function useFadeIn(delay = 0, duration = 400, translateY = 0) {
  const opacity = useSharedValue(0);
  const offsetY = useSharedValue(translateY);

  const style = useAnimatedStyle(() => ({
    opacity: withDelay(delay, withTiming(opacity.value, { duration })),
    transform: [{ translateY: withDelay(delay, withTiming(offsetY.value, { duration })) }],
  }));

  const play = () => {
    opacity.value = 1;
    offsetY.value = 0;
  };

  return { style, play };
}
