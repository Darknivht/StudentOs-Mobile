import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/providers/AuthProvider";
import { View } from "react-native";
import { colors } from "./src/lib/theme";

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </View>
  );
}
