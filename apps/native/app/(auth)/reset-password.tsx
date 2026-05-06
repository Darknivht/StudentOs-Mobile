import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.access_token && params.refresh_token) {
      // Supabase session will be set via useAuth in Plan 01-03
      setSessionReady(true);
    }
  }, [params.access_token, params.refresh_token]);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    // Password update will be wired in Plan 01-03 with supabase.auth.updateUser
    setLoading(false);
  };

  if (!sessionReady && !params.access_token) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="text-2xl font-bold text-foreground mb-2">Reset Password</Text>
        <Text className="text-muted-foreground mb-8">
          Check your email for a password reset link
        </Text>
        <Pressable className="bg-primary rounded-lg px-6 py-3" onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-primary-foreground font-medium">Back to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-2xl font-bold text-foreground mb-2">Set New Password</Text>
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
        editable={!loading}
      />

      <TextInput
        className="bg-input border border-border rounded-lg p-3 mb-6 w-full max-w-sm text-foreground"
        placeholder="Confirm password"
        placeholderTextColor="#9ca3af"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Pressable className="bg-primary rounded-lg p-3 w-full max-w-sm" onPress={handleUpdatePassword}>
          <Text className="text-primary-foreground text-center font-semibold">
            Update Password
          </Text>
        </Pressable>
      )}
    </View>
  );
}
