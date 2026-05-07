import { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from "react-native-reanimated";
import { WifiOff, Wifi } from "lucide-react-native";
import { useNetInfo } from "../hooks/useNetInfo";

export function OfflineStatusBanner() {
  const { isOnline, wasOffline } = useNetInfo();
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isOnline) {
      height.value = withTiming(44, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else if (isOnline && wasOffline) {
      height.value = withTiming(44, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      height.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOnline, wasOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  const showReconnecting = isOnline && wasOffline;

  return (
    <Animated.View
      style={animatedStyle}
      className="overflow-hidden z-50"
    >
      {!isOnline && (
        <View className="bg-amber-500 px-4 py-2 flex-row items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-950" />
          <Text className="text-amber-950 text-sm">
            You're offline. Some features may be limited.
          </Text>
        </View>
      )}
      {showReconnecting && (
        <View className="bg-green-500 px-4 py-2 flex-row items-center gap-2">
          <Wifi className="w-4 h-4 text-green-950" />
          <Text className="text-green-950 text-sm">
            You're back online! Syncing data...
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
