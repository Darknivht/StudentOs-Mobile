import { View, Text, Alert, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Moon, Sun, LogOut, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../hooks/useThemeContext";
import { useAuth } from "../../hooks/useAuthContext";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { ErrorFallback } from "../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

export default function ProfileScreen() {
  const { isDark, toggleColorScheme } = useTheme();
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
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-6">Profile</Text>

        <Card className="mb-4">
          <CardContent className="p-4 flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-primary font-bold text-lg">
                {user?.email?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">{user?.user_metadata?.full_name ?? "Student"}</Text>
              <Text className="text-sm text-muted-foreground">{user?.email ?? ""}</Text>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                {isDark ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
                <Text className="text-foreground">{isDark ? "Dark Mode" : "Light Mode"}</Text>
              </View>
              <Switch value={isDark} onValueChange={toggleColorScheme} />
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-0">
            <Pressable className="flex-row items-center justify-between p-4 active:bg-accent">
              <Text className="text-foreground">Subscription</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-muted-foreground">Free</Text>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </View>
            </Pressable>
            <Separator />
            <Pressable className="flex-row items-center justify-between p-4 active:bg-accent">
              <Text className="text-foreground">Parental Controls</Text>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Pressable>
            <Separator />
            <Pressable className="flex-row items-center justify-between p-4 active:bg-accent">
              <Text className="text-foreground">Help & Support</Text>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Pressable>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full mt-4" onPress={handleSignOut}>
          <LogOut className="w-4 h-4 text-destructive-foreground" />
          <Text className="text-destructive-foreground font-semibold">Sign Out</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
