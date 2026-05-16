import './src/global.css';
import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, Library, Calendar, Users, Briefcase } from 'lucide-react-native';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();

function DashboardScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: theme.foreground }}>Dashboard</Text>
    </View>
  );
}

function StudyScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: theme.foreground }}>Study</Text>
    </View>
  );
}

function StoreScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: theme.foreground }}>Store</Text>
    </View>
  );
}

function PlanScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: theme.foreground }}>Plan</Text>
    </View>
  );
}

function SocialScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: theme.foreground }}>Social</Text>
    </View>
  );
}

function CareerScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: theme.foreground }}>Career</Text>
    </View>
  );
}

function MainTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Study" 
        component={StudyScreen}
        options={{
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Store" 
        component={StoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Plan" 
        component={PlanScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Social" 
        component={SocialScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Career" 
        component={CareerScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

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

  return <MainTabs />;
}

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
          style={{ backgroundColor: theme.card, color: theme.foreground, padding: 16, borderRadius: 12, marginBottom: 12 }}
        />
      )}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={theme.mutedForeground}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ backgroundColor: theme.card, color: theme.foreground, padding: 16, borderRadius: 12, marginBottom: 12 }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={theme.mutedForeground}
        secureTextEntry
        style={{ backgroundColor: theme.card, color: theme.foreground, padding: 16, borderRadius: 12, marginBottom: 16 }}
      />

      {error ? (
        <Text style={{ color: theme.destructive, fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
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
        onPress={() => setIsSignUp(!isSignUp)}
        style={{ padding: 8 }}
      >
        <Text style={{ color: theme.primary, fontSize: 14, textAlign: 'center' }}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
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
              <NavigationContainer>
                <StatusBar style="auto" />
                <AuthGate />
              </NavigationContainer>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}