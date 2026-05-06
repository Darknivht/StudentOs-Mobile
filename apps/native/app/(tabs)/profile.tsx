import { View, Text, Pressable } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Profile</Text>
      <Pressable className="mt-4 px-6 py-3 bg-destructive rounded-lg">
        <Text className="text-destructive-foreground font-medium">Sign Out</Text>
      </Pressable>
    </View>
  );
}
