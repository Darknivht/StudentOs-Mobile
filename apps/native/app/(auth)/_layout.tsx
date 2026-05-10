import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { AuthProvider } from "../../hooks/useAuthContext";

export default function AuthLayout() {
  return (
    <AuthProvider>
      <View className="flex-1 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-800 dark:via-purple-800 dark:to-indigo-900">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
              animation: "slide_from_right",
            }}
          />
        </ScrollView>
      </View>
    </AuthProvider>
  );
}
