import './src/global.css';
import { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayout({ children }: { children: ReactNode }) {
  const { effectiveMode } = useTheme();
  
  return (
    <>
      <StatusBar style={effectiveMode === 'dark' ? 'light' : 'dark'} />
      {children}
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootLayout>
              {/* Test screen will go here */}
              <TestScreen />
            </RootLayout>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Temporary test screen for Phase 1 acceptance
function TestScreen() {
  const { theme, effectiveMode, toggleMode } = useTheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 32, color: theme.foreground, marginBottom: 8 }}>
        StudentOS
      </Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: theme.mutedForeground, marginBottom: 24 }}>
        Design System Test
      </Text>
      
      {/* Primary Button */}
      <Pressable
        onPress={toggleMode}
        style={{
          backgroundColor: theme.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: theme.primaryForeground }}>
          Toggle Dark Mode
        </Text>
      </Pressable>
      
      {/* Current mode indicator */}
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: theme.mutedForeground }}>
        Current mode: {effectiveMode}
      </Text>
    </View>
  );
}

import { View, Text, Pressable } from 'react-native';