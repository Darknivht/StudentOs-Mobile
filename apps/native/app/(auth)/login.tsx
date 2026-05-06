import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-3xl font-bold text-foreground mb-2">Welcome back</Text>
      <Text className="text-muted-foreground mb-8">Sign in to your account</Text>

      {error && (
        <View className="bg-destructive/10 p-3 rounded-lg mb-4 w-full max-w-sm">
          <Text className="text-destructive text-sm">{error}</Text>
        </View>
      )}

      <TextInput
        className="bg-input border border-border rounded-lg p-3 mb-3 w-full max-w-sm text-foreground"
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        className="bg-input border border-border rounded-lg p-3 mb-6 w-full max-w-sm text-foreground"
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator className="mb-4" />
      ) : (
        <>
          <Pressable className="bg-primary rounded-lg p-3 w-full max-w-sm mb-3">
            <Text className="text-primary-foreground text-center font-semibold">
              Sign In
            </Text>
          </Pressable>

          <Pressable className="bg-secondary rounded-lg p-3 w-full max-w-sm mb-4">
            <Text className="text-secondary-foreground text-center font-semibold">
              Sign Up
            </Text>
          </Pressable>
        </>
      )}

      <Pressable onPress={() => router.push("/(auth)/reset-password")}>
        <Text className="text-primary text-sm">Forgot password?</Text>
      </Pressable>
    </View>
  );
}
