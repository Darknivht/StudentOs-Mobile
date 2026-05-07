import { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated";

interface SlideInOptions {
  direction?: "left" | "right" | "bottom" | "top";
  delay?: number;
  stiffness?: number;
  damping?: number;
}

export function useSlideIn(options: SlideInOptions = {}) {
  const { direction = "bottom", delay = 0, stiffness = 250, damping = 28 } = options;

  const initialValues: Record<string, number> = {
    left: 300,
    right: -300,
    bottom: 300,
    top: -300,
  };

  const translateX = useSharedValue(direction === "left" || direction === "right" ? initialValues[direction] : 0);
  const translateY = useSharedValue(direction === "bottom" || direction === "top" ? initialValues[direction] : 0);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: withDelay(delay, withSpring(translateX.value, { stiffness, damping })) },
      { translateY: withDelay(delay, withSpring(translateY.value, { stiffness, damping })) },
    ],
  }));

  const play = () => {
    translateX.value = 0;
    translateY.value = 0;
  };

  return { style, play };
}
