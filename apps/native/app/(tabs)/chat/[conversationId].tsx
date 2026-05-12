import { useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";
import { ArrowLeft, Send } from "lucide-react-native";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

export default function ConversationScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Chat</Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-2">
          Chat Coming Soon
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          Realtime chat with friends and study groups will be available soon.
        </Text>
        <Pressable onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-xl">
          <Text className="text-primary-foreground font-medium">Go Back</Text>
        </Pressable>
      </View>
    </View>
  );
}