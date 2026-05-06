import { View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAppColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuthContext";
import { appStorage } from "../../services/app-storage";

export default function ProfileScreen() {
  const { theme, toggleColorScheme, isDark } = useAppColorScheme();
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          appStorage.removeItemSync("onboarding_seen");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      {user?.email && (
        <Text className="text-muted-foreground mb-6">{user.email}</Text>
      )}
      <Text className="text-2xl font-bold text-foreground mb-8">Profile</Text>

      <Pressable
        className="mb-4 px-6 py-3 bg-secondary rounded-lg w-full max-w-sm"
        onPress={toggleColorScheme}
      >
        <Text className="text-secondary-foreground text-center font-medium">
          {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Text>
      </Pressable>

      <Pressable
        className="mt-4 px-6 py-3 bg-destructive rounded-lg w-full max-w-sm"
        onPress={handleSignOut}
      >
        <Text className="text-destructive-foreground text-center font-medium">Sign Out</Text>
      </Pressable>
    </View>
  );
}
