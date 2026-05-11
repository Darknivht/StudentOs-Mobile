import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthContext";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();
  const router = useRouter();
  const { updatePassword, setSessionFromTokens } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.access_token && params.refresh_token) {
      setSessionFromTokens(params.access_token, params.refresh_token)
        .then(() => setSessionReady(true))
        .catch((err) => setError(err.message));
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
    const { error: updateError } = await updatePassword(newPassword);
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      Alert.alert("Password Updated", "Your password has been changed successfully.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    }
  };

  if (!sessionReady && !params.access_token) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="text-2xl font-bold text-white mb-2">Reset Password</Text>
        <Text className="text-white/80 mb-8">
          Check your email for a password reset link
        </Text>
        <Pressable
          className="bg-primary rounded-lg px-6 py-3"
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text className="text-primary-foreground font-medium">Back to Login</Text>
        </Pressable>
      </View>
    );
  }

  if (!sessionReady && params.access_token) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator />
        <Text className="text-white/70 mt-4">Setting up session...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-2xl font-bold text-white mb-2">Set New Password</Text>
      <Text className="text-white/80 mb-8">Enter your new password</Text>

      {error && (
        <View className="bg-white/20 p-3 rounded-lg mb-4 w-full max-w-sm">
          <Text className="text-white text-sm">{error}</Text>
        </View>
      )}

      <TextInput
        className="bg-white/10 border border-white/20 rounded-lg p-3 mb-3 w-full max-w-sm text-white"
        placeholder="New password"
        placeholderTextColor="#ffffff40"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        className="bg-white/10 border border-white/20 rounded-lg p-3 mb-6 w-full max-w-sm text-white"
        placeholder="Confirm password"
        placeholderTextColor="#ffffff40"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Pressable
          className="bg-primary rounded-lg p-3 w-full max-w-sm"
          onPress={handleUpdatePassword}
        >
          <Text className="text-primary-foreground text-center font-semibold">
            Update Password
          </Text>
        </Pressable>
      )}
    </View>
  );
}
