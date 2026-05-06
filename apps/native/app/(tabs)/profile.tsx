import { View, Text, Pressable } from "react-native";
import { useAppColorScheme } from "../../hooks/useColorScheme";

export default function ProfileScreen() {
  const { theme, toggleColorScheme, isDark } = useAppColorScheme();

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-2xl font-bold text-foreground mb-8">Profile</Text>

      <Pressable
        className="mb-4 px-6 py-3 bg-secondary rounded-lg w-full max-w-sm"
        onPress={toggleColorScheme}
      >
        <Text className="text-secondary-foreground text-center font-medium">
          {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Text>
      </Pressable>

      <Pressable className="mt-4 px-6 py-3 bg-destructive rounded-lg w-full max-w-sm">
        <Text className="text-destructive-foreground text-center font-medium">Sign Out</Text>
      </Pressable>
    </View>
  );
}
