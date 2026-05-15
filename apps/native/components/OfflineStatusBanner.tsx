import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { WifiOff, Wifi } from "lucide-react-native";
import { useNetInfo } from "../hooks/useNetInfo";

export function OfflineStatusBanner() {
  const { isOnline, wasOffline } = useNetInfo();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOnline || (isOnline && wasOffline)) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!visible) return null;

  const showReconnecting = isOnline && wasOffline;

  return (
    <View className="overflow-hidden">
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
    </View>
  );
}