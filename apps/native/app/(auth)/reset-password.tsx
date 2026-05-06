import { View, Text, TextInput, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-2xl font-bold text-foreground mb-2">Reset Password</Text>
      <Text className="text-muted-foreground mb-8">Enter your new password</Text>

      {error && (
        <View className="bg-destructive/10 p-3 rounded-lg mb-4 w-full max-w-sm">
          <Text className="text-destructive text-sm">{error}</Text>
        </View>
      )}

      <TextInput
        className="bg-input border border-border rounded-lg p-3 mb-3 w-full max-w-sm text-foreground"
        placeholder="New password"
        placeholderTextColor="#9ca3af"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        className="bg-input border border-border rounded-lg p-3 mb-6 w-full max-w-sm text-foreground"
        placeholder="Confirm password"
        placeholderTextColor="#9ca3af"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable className="bg-primary rounded-lg p-3 w-full max-w-sm">
        <Text className="text-primary-foreground text-center font-semibold">
          Update Password
        </Text>
      </Pressable>
    </View>
  );
}
