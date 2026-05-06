import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-3xl font-bold text-foreground mb-2">Welcome to StudentOS</Text>
      <Text className="text-muted-foreground mb-8 text-center">
        Your smart study companion
      </Text>

      <Pressable
        className="bg-primary rounded-lg p-4 w-full max-w-sm"
        onPress={() => {
          router.replace("/(auth)/login");
        }}
      >
        <Text className="text-primary-foreground text-center font-semibold text-lg">
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
