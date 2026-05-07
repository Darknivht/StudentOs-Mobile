import { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useNetInfo } from "../hooks/useNetInfo";

export function SyncIndicator() {
  const { isOnline, wasOffline } = useNetInfo();
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = isOnline && wasOffline;

  useEffect(() => {
    if (show) {
      height.value = withTiming(36, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });

      timerRef.current = setTimeout(() => {
        height.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
      }, 3000);
    } else {
      height.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  if (!show) return null;

  return (
    <Animated.View style={animatedStyle} className="overflow-hidden z-40">
      <View className="bg-secondary/10 px-4 py-2 flex-row items-center justify-center gap-2">
        <ActivityIndicator size="small" color="hsl(var(--secondary))" />
        <Text className="text-secondary text-sm">Syncing data...</Text>
      </View>
    </Animated.View>
  );
}
