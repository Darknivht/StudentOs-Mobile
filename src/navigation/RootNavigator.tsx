import { NavigationContainer } from "@react-navigation/native";
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
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../lib/theme";
import { useState, useCallback, useEffect } from "react";

type LockMode = "biometric" | "pin" | "none";

export function RootNavigator() {
  const {
    isAuthenticated,
    isLoading,
    isBlocked,
    isLocked,
    biometricEnabled,
    pinSet,
    signOut,
  } = useAuthContext();

  const [forceLoaded, setForceLoaded] = useState(false);

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

  const [lockMode, setLockMode] = useState<LockMode>("none");
  const [needsPinSetup, setNeedsPinSetup] = useState(false);

  const handlePinSetupComplete = useCallback(() => {
    setNeedsPinSetup(false);
    setLockMode("pin");
  }, []);

  if (showLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (forceLoaded && !isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (isBlocked) {
    return <BlockedScreen onSignOut={signOut} />;
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  const onboardingSeen = useAppStore.getState().onboardingSeen;
  if (!onboardingSeen) {
    return <OnboardingScreen />;
  }

  if (needsPinSetup && !pinSet) {
    return (
      <NavigationContainer>
        <PINSetupScreen onComplete={handlePinSetupComplete} />
      </NavigationContainer>
    );
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
    <NavigationContainer>
      <MainNavigator />
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
});
