import { View, type ViewProps } from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue, withRepeat } from "react-native-reanimated";
import { useEffect } from "react";
import { cn } from "@studentos/shared";

export interface ProgressProps extends ViewProps {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.max(0, Math.min(100, value)), { duration: 400 });
  }, [value]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <Animated.View
        className="h-full bg-primary"
        style={indicatorStyle}
      />
    </View>
  );
}
