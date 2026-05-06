import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuthContext";
import { ErrorFallback } from "../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, blockedMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpMode, setSignUpMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await signUp(email, password);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      Alert.alert("Check your email", "We've sent you a confirmation link.");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await resetPassword(email);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setResetSent(true);
    }
  };

  if (blockedMessage) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <View className="bg-destructive/10 p-4 rounded-lg w-full max-w-sm mb-4">
          <Text className="text-destructive text-center font-medium">{blockedMessage}</Text>
        </View>
        <Pressable
          className="bg-primary rounded-lg p-3 w-full max-w-sm"
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text className="text-primary-foreground text-center font-semibold">OK</Text>
        </Pressable>
      </View>
    );
  }

  if (resetSent) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="text-2xl font-bold text-foreground mb-2">Check Your Email</Text>
        <Text className="text-muted-foreground mb-8 text-center">
          We've sent a password reset link to {email}
        </Text>
        <Pressable
          className="bg-primary rounded-lg p-3 w-full max-w-sm"
          onPress={() => setResetSent(false)}
        >
          <Text className="text-primary-foreground text-center font-semibold">Back to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-3xl font-bold text-foreground mb-2">
        {signUpMode ? "Create Account" : "Welcome back"}
      </Text>
      <Text className="text-muted-foreground mb-8">
        {signUpMode ? "Sign up for a new account" : "Sign in to your account"}
      </Text>

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
          <Pressable
            className="bg-primary rounded-lg p-3 w-full max-w-sm mb-3"
            onPress={signUpMode ? handleSignUp : handleSignIn}
          >
            <Text className="text-primary-foreground text-center font-semibold">
              {signUpMode ? "Sign Up" : "Sign In"}
            </Text>
          </Pressable>

          <Pressable
            className="bg-secondary rounded-lg p-3 w-full max-w-sm mb-4"
            onPress={() => {
              setSignUpMode(!signUpMode);
              setError(null);
            }}
          >
            <Text className="text-secondary-foreground text-center font-semibold">
              {signUpMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Text>
          </Pressable>

          {!signUpMode && (
            <Pressable onPress={handleResetPassword}>
              <Text className="text-primary text-sm">Forgot password?</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
