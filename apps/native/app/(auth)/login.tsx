import { View, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import { useAuth } from "../../hooks/useAuthContext";
import { ErrorFallback } from "../../components/ErrorFallback";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export { ErrorFallback as ErrorBoundary };

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, blockedMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpMode, setSignUpMode] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
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
      setError(authError.message.includes("Invalid login credentials")
        ? "Invalid email or password. Please try again."
        : authError.message);
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
    if (!fullName.trim()) {
      setError("Please enter your name");
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
        <Button className="w-full max-w-sm" onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-primary-foreground font-semibold">OK</Text>
        </Button>
      </View>
    );
  }

  if (resetSent) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background/90">
        <Text className="text-2xl font-bold text-white mb-2">Check Your Email</Text>
        <Text className="text-white/80 mb-8 text-center">
          We've sent a password reset link to {email}
        </Text>
        <Button variant="outline" className="w-full max-w-sm border-white/20" onPress={() => setResetSent(false)}>
          <Text className="text-white font-semibold">Back to Login</Text>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-sm">
          {forgotPassword ? (
            <>
              <Pressable onPress={() => { setForgotPassword(false); setError(null); }} className="mb-6 flex-row items-center gap-1">
                <ArrowLeft className="w-4 h-4 text-white/70" />
                <Text className="text-white/70 text-sm">Back</Text>
              </Pressable>
              <Text className="text-3xl font-bold text-white mb-2">Reset Password</Text>
              <Text className="text-white/80 mb-8">Enter your email and we'll send you a reset link</Text>

              {error && (
                <View className="bg-destructive/20 p-3 rounded-lg mb-4">
                  <Text className="text-white text-sm">{error}</Text>
                </View>
              )}

              <View className="mb-3">
                <Label className="text-white/80 mb-1">Email</Label>
                <Input
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </View>

              {loading ? (
                <ActivityIndicator className="mb-4" color="#fff" />
              ) : (
                <Button className="w-full bg-white" onPress={handleResetPassword}>
                  <Text className="text-purple-700 font-bold">Send Reset Link</Text>
                </Button>
              )}
            </>
          ) : (
            <>
              <View className="items-center mb-8">
                <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </View>
                <Text className="text-3xl font-bold text-white mb-2">
                  {signUpMode ? "Create Account" : "Welcome back"}
                </Text>
                <Text className="text-white/80">
                  {signUpMode ? "Sign up to get started" : "Sign in to your account"}
                </Text>
              </View>

              {error && (
                <View className="bg-destructive/20 p-3 rounded-lg mb-4">
                  <Text className="text-white text-sm">{error}</Text>
                </View>
              )}

              {signUpMode && (
                <View className="mb-3">
                  <Label className="text-white/80 mb-1">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </View>
              )}

              <View className="mb-3">
                <Label className="text-white/80 mb-1">Email</Label>
                <Input
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </View>

              <View className="mb-6">
                <Label className="text-white/80 mb-1">Password</Label>
                <View className="relative">
                  <Input
                    placeholder="••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                  />
                  <Pressable
                    className="absolute right-3 top-3"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-white/50" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/50" />
                    )}
                  </Pressable>
                </View>
              </View>

              {loading ? (
                <ActivityIndicator className="mb-4" color="#fff" />
              ) : (
                <>
                  <Button
                    className="w-full h-12 bg-white rounded-2xl"
                    onPress={signUpMode ? handleSignUp : handleSignIn}
                  >
                    <Text className="text-purple-700 font-bold text-base">
                      {signUpMode ? "Sign Up" : "Sign In"}
                    </Text>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full h-12 mt-3 border border-white/20 rounded-2xl"
                    onPress={() => {
                      setSignUpMode(!signUpMode);
                      setError(null);
                    }}
                  >
                    <Text className="text-white/80 text-sm">
                      {signUpMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </Text>
                  </Button>

                  {!signUpMode && (
                    <Button
                      variant="link"
                      className="w-full mt-2"
                      onPress={() => {
                        setForgotPassword(true);
                        setError(null);
                      }}
                    >
                      <Text className="text-white/60 text-sm">Forgot password?</Text>
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
