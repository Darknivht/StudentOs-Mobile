import { NavigationContainer } from "@react-navigation/native";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAuth } from "../hooks/useAuth";
import {
  BiometricLockScreen,
  PINLockScreen,
  PINSetupScreen,
  BlockedScreen,
} from "../screens";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../lib/theme";
import { useState, useCallback } from "react";

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
  } = useAuth();
  const [lockMode, setLockMode] = useState<LockMode>("none");
  const [needsPinSetup, setNeedsPinSetup] = useState(false);

  const handlePinSetupComplete = useCallback(() => {
    setNeedsPinSetup(false);
    setLockMode("pin");
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
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
