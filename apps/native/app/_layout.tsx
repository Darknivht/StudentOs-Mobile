import "../global.css";
import { Stack, useSegments, useRouter } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const onOnboarding = segments[0] === "onboarding";

    if (!inAuthGroup && !onOnboarding && segments.length > 0) {
      // Auth redirect will be wired in Plan 01-03 when useAuth is ready
      // For now, allow navigation to all routes
    }
  }, [segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
