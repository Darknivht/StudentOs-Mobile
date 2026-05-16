import './src/global.css';
import { ReactNode, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { linking } from '@/navigation/linking';
import RootNavigator from '@/navigation/RootNavigator';

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
            <AuthProvider>
              <NavigationContainer linking={linking}>
                <RootLayout>
                  <AuthGate />
                </RootLayout>
              </NavigationContainer>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Auth gate - shows login or main app
function AuthGate() {
  const { user, loading, authReady } = useAuth();
  const { theme } = useTheme();

  if (loading || !authReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <RootNavigator />;
}

// Login screen
function LoginScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 32, color: theme.foreground, marginBottom: 8, textAlign: 'center' }}>
        StudentOS
      </Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: theme.mutedForeground, marginBottom: 32, textAlign: 'center' }}>
        {isSignUp ? 'Create your account' : 'Welcome back'}
      </Text>

      {isSignUp && (
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor={theme.mutedForeground}
          style={{ backgroundColor: theme.card, color: theme.foreground, padding: 16, borderRadius: 12, marginBottom: 12, fontFamily: 'Inter_400Regular', fontSize: 16 }}
        />
      )}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={theme.mutedForeground}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ backgroundColor: theme.card, color: theme.foreground, padding: 16, borderRadius: 12, marginBottom: 12, fontFamily: 'Inter_400Regular', fontSize: 16 }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={theme.mutedForeground}
        secureTextEntry
        style={{ backgroundColor: theme.card, color: theme.foreground, padding: 16, borderRadius: 12, marginBottom: 16, fontFamily: 'Inter_400Regular', fontSize: 16 }}
      />

      {error ? (
        <Text style={{ color: theme.destructive, fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{ backgroundColor: theme.primary, padding: 16, borderRadius: 12, marginBottom: 12, opacity: loading ? 0.7 : 1 }}
      >
        <Text style={{ color: theme.primaryForeground, fontFamily: 'Inter_600SemiBold', fontSize: 16, textAlign: 'center' }}>
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleGoogle}
        disabled={loading}
        style={{ backgroundColor: theme.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}
      >
        <Text style={{ color: theme.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 16, textAlign: 'center' }}>
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setIsSignUp(!isSignUp)}
        style={{ padding: 8 }}
      >
        <Text style={{ color: theme.primary, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' }}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </Text>
      </Pressable>
    </View>
  );
}