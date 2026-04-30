import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAuthContext } from "../providers/AuthProvider";
import { useAppStore } from "../stores/appStore";
import {
  BiometricLockScreen,
  PINLockScreen,
  PINSetupScreen,
  BlockedScreen,
} from "../screens";
import { OnboardingScreen } from "../screens/onboarding";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../lib/theme";
import {
  useState,
  useCallback,
  useEffect,
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react";

type LockMode = "biometric" | "pin" | "none";

class ErrorBoundary extends Component<
  { children: ReactNode; label?: string },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `ErrorBoundary[${this.props.label || "root"}]:`,
      error.message,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.props.label ? `[${this.props.label}] ` : ""}
            {this.state.error?.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const RootStack = createNativeStackNavigator();

function RootStackScreen() {
  const {
    isAuthenticated,
    isLoading,
    isBlocked,
    isLocked,
    biometricEnabled,
    signOut,
  } = useAuthContext();

  const onboardingSeen = useAppStore((s) => s.onboardingSeen);

  const [forceLoaded, setForceLoaded] = useState(false);
  const [lockMode, setLockMode] = useState<LockMode>("none");

  useEffect(() => {
    if (isLoading && !forceLoaded) {
      const t = setTimeout(() => {
        console.warn("RootNavigator: force-bypassing loading after 4s");
        setForceLoaded(true);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [isLoading, forceLoaded]);

  const showLoading = isLoading && !forceLoaded;

  if (isBlocked) {
    return <BlockedScreen onSignOut={signOut} />;
  }

  if (showLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (!onboardingSeen) {
    return <OnboardingScreen />;
  }

  if (isLocked) {
    if (lockMode === "biometric" || biometricEnabled) {
      return <BiometricLockScreen onFallbackPin={() => setLockMode("pin")} />;
    }
    return (
      <PINLockScreen
        onFallbackBiometric={() => setLockMode("biometric")}
        biometricEnabled={biometricEnabled}
      />
    );
  }

  return (
    <RootStack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
      <RootStack.Screen
        name="MainApp"
        children={() => (
          <ErrorBoundary label="MainNavigator">
            <MainNavigator />
          </ErrorBoundary>
        )}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <ErrorBoundary label="RootStack">
        <RootStackScreen />
      </ErrorBoundary>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.destructive,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});
