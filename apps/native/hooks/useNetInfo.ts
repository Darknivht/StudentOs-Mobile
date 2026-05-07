import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

interface NetInfoState {
  isOnline: boolean;
  wasOffline: boolean;
  isConnected: boolean | null;
}

export function useNetInfo(): NetInfoState {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [wasOffline, setWasOffline] = useState(false);
  const [wasOfflineTimer, setWasOfflineTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;

      if (!online && isConnected === true) {
        setWasOffline(true);
      }

      if (online && wasOffline) {
        if (wasOfflineTimer) clearTimeout(wasOfflineTimer);
        const timer = setTimeout(() => setWasOffline(false), 3000);
        setWasOfflineTimer(timer);
      }

      setIsConnected(online);
    });

    return () => {
      unsubscribe();
      if (wasOfflineTimer) clearTimeout(wasOfflineTimer);
    };
  }, [isConnected, wasOffline, wasOfflineTimer]);

  return {
    isOnline: isConnected === true,
    wasOffline,
    isConnected,
  };
}
