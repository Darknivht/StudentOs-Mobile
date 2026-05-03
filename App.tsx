import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/providers/AuthProvider";
import { AIProviderFactory } from "./src/services/ai/providerFactory";
import { View } from "react-native";
import { colors } from "./src/lib/theme";

const aiProvider = process.env.EXPO_PUBLIC_AI_PROVIDER || "gemini";
const aiApiKey = process.env.EXPO_PUBLIC_AI_API_KEY || "";
const aiBaseUrl = process.env.EXPO_PUBLIC_AI_BASE_URL || "";
const aiModel = process.env.EXPO_PUBLIC_AI_MODEL || "gemini-2.0-flash";

if (aiApiKey && aiApiKey !== "your-ai-api-key") {
  AIProviderFactory.initialize({
    provider: aiProvider as "openai" | "gemini" | "custom",
    apiKey: aiApiKey,
    baseURL: aiBaseUrl,
    model: aiModel,
  });
}

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
