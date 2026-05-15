import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthProvider } from "../../hooks/useAuthContext";
import { Gradients } from "../../theme/colors";

export default function AuthLayout() {
  return (
    <AuthProvider>
      <View className="flex-1">
        <LinearGradient
          colors={Gradients.auth}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
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
