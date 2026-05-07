import "../global.css";
import { Stack, useSegments, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../hooks/useAuthContext";
import { ThemeProvider, useTheme } from "../hooks/useThemeContext";
import { envParseError } from "../lib/env";
import { EnvErrorScreen } from "../components/EnvErrorScreen";
import { OfflineStatusBanner } from "../components/OfflineStatusBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
});

function useOnboardingSeen() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const Storage = require("expo-sqlite/kv-store");
      const value = Storage.getItemSync("onboarding_seen");
      setSeen(value === "true");
    } catch {
      setSeen(true);
    }
  }, []);

  const markSeen = () => {
    try {
      const Storage = require("expo-sqlite/kv-store");
      Storage.setItemSync("onboarding_seen", "true");
    } catch {}
    setSeen(true);
  };

  return { onboardingSeen: seen, markOnboardingSeen: markSeen };
}

export default function RootLayout() {
  if (envParseError) {
    return <EnvErrorScreen />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <ThemedContent />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function ThemedContent() {
  const { isDark } = useTheme();

  return (
    <View className={isDark ? "dark" : ""} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OfflineStatusBanner />
      <RootLayoutNav />
    </View>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fef2f2" }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: "#dc2626", marginBottom: 8 }}>
        Something went wrong
      </Text>
      {__DEV__ && (
        <Text style={{ fontSize: 12, color: "#991b1b", fontFamily: "monospace" }}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { session, authReady } = useAuth();
  const { onboardingSeen, markOnboardingSeen } = useOnboardingSeen();

  useEffect(() => {
    if (!authReady || onboardingSeen === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onOnboarding = segments[0] === "onboarding";

    if (!onboardingSeen && !onOnboarding) {
      router.replace("/onboarding");
    } else if (!session && !inAuthGroup && !onOnboarding) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, authReady, segments, onboardingSeen]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export { useOnboardingSeen };
