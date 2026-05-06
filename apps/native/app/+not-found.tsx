import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-2xl font-bold text-foreground mb-2">404</Text>
      <Text className="text-muted-foreground mb-6">This page doesn't exist</Text>
      <Pressable className="bg-primary rounded-lg px-6 py-3" onPress={() => router.replace("/")}>
        <Text className="text-primary-foreground font-medium">Go Home</Text>
      </Pressable>
    </View>
  );
}
