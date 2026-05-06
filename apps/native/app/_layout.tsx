import "../global.css";
import { Stack, useSegments, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../hooks/useAuthContext";
import { envParseError } from "../lib/env";
import { EnvErrorScreen } from "../components/EnvErrorScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  if (envParseError) {
    return <EnvErrorScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
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

  useEffect(() => {
    if (!authReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onOnboarding = segments[0] === "onboarding";

    if (!session && !inAuthGroup && !onOnboarding) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, authReady, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
