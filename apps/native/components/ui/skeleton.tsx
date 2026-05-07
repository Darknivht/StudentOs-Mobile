import { View, type ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { cn } from "@studentos/shared";

export function Skeleton({ className, ...props }: ViewProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={cn("rounded-md bg-muted", className)}
      style={animatedStyle}
      {...props}
    />
  );
}
