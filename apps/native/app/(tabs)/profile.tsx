import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  LogOut,
  User,
  School,
  GraduationCap,
  Save,
  Sparkles,
  Trophy,
  ChevronRight,
  AtSign,
  AlertCircle,
  Crown,
  Moon,
  Sun,
  RefreshCw,
} from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useAuth } from "../../hooks/useAuthContext";
import { useTheme } from "../../hooks/useThemeContext";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { supabase } from "../../services/supabase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { AvatarUpload } from "../../components/profile/AvatarUpload";
import { StreakCalendar, GRADE_OPTIONS } from "../../components/study/StreakCalendar";
import { ErrorFallback } from "../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

const STUDY_PERSONAS = [
  { id: "chill", name: "Chill Bro", emoji: "😎", description: "Relaxed and encouraging" },
  { id: "strict", name: "Strict Prof", emoji: "👨‍🏫", description: "Disciplined and focused" },
  { id: "fun", name: "Fun Tutor", emoji: "🎉", description: "Playful and engaging" },
  { id: "motivator", name: "Motivator", emoji: "💪", description: "Pumped and inspiring" },
];

const GRADE_SELECT_OPTIONS = GRADE_OPTIONS.filter((o) => o.value !== "");

export default function ProfileScreen() {
  const { user, authReady, signOut } = useAuth();
  const { isDark, toggleColorScheme } = useTheme();
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [studyPersona, setStudyPersona] = useState("chill");
  const [saving, setSaving] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setSchoolName(profile.school_name || "");
      setGradeLevel(profile.grade_level || "");
      setStudyPersona(profile.study_persona || "chill");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  useEffect(() => {
    if (authReady && user) fetchAchievementStats();
  }, [user, authReady]);

  const fetchAchievementStats = async () => {
    try {
      const { count } = await supabase
        .from("user_achievements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      setAchievementCount(count || 0);
    } catch {
      // ignore
    }
  };

  const checkUsernameAvailability = async (name: string): Promise<boolean> => {
    if (!name.trim() || name.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setUsernameError("Only letters, numbers, and underscores allowed");
      return false;
    }
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", name.toLowerCase())
      .neq("user_id", user?.id || "")
      .maybeSingle();
    if (data) {
      setUsernameError("Username is taken");
      setUsernameSuggestions([
        `${name}${Math.floor(Math.random() * 100)}`,
        `${name}_${Math.floor(Math.random() * 100)}`,
        `${name}${new Date().getFullYear() % 100}`,
      ]);
      return false;
    }
    setUsernameError("");
    setUsernameSuggestions([]);
    return true;
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (username && !(await checkUsernameAvailability(username))) {
        setSaving(false);
        return;
      }
      await updateProfile({
        full_name: fullName,
        username: username.toLowerCase() || null,
        school_name: schoolName,
        grade_level: gradeLevel,
        study_persona: studyPersona,
      });
      Toast.show({
        type: "success",
        text1: "Profile updated!",
        text2: "Your changes have been saved.",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }, [username, fullName, schoolName, gradeLevel, studyPersona, updateProfile]);

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

  const subscriptionTier = (profile?.subscription_tier || "free").trim().toLowerCase();
  const totalXP = profile?.total_xp || 0;
  const tierLabel =
    subscriptionTier === "lifetime"
      ? "Lifetime Member"
      : subscriptionTier === "pro"
        ? "Pro Member"
        : subscriptionTier === "plus"
          ? "Plus Member"
          : "Free Tier";
  const tierDesc =
    subscriptionTier === "lifetime"
      ? "Forever access, no monthly fees"
      : subscriptionTier === "pro"
        ? "Unlimited access"
        : subscriptionTier === "plus"
          ? "Enhanced access"
          : "Limited features";
  const isPaid =
    subscriptionTier === "pro" ||
    subscriptionTier === "plus" ||
    subscriptionTier === "lifetime";

  if (profileLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12 pb-24 gap-6">
        <Animated.View entering={FadeIn.duration(300)}>
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Customize your experience
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(300).delay(50)}
          className="items-center"
        >
          {user && (
            <AvatarUpload
              userId={user.id}
              currentUrl={avatarUrl}
              fallback={fullName ? fullName.charAt(0).toUpperCase() : "?"}
              onUploaded={(url) => setAvatarUrl(url)}
              size="lg"
            />
          )}
          <Text className="text-sm text-muted-foreground mt-3">
            {user?.email ?? ""}
          </Text>
          <Text className="text-primary font-semibold">{totalXP} XP</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <Pressable
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex-row items-center justify-between active:bg-amber-500/20"
            onPress={() => router.push("/achievements")}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl bg-amber-500/20 items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-500" />
              </View>
              <View>
                <Text className="font-semibold text-foreground">Achievements</Text>
                <Text className="text-sm text-muted-foreground">
                  {achievementCount} unlocked
                </Text>
              </View>
            </View>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(150)}>
          <Pressable
            className={cn2(
              "p-3 rounded-xl border",
              isPaid
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-muted border-border"
            )}
            onPress={() => {
              if (!isPaid) {
                Toast.show({
                  type: "info",
                  text1: "Upgrade coming soon!",
                });
              }
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className={cn2(
                    "w-10 h-10 rounded-xl items-center justify-center",
                    isPaid ? "bg-amber-500/20" : "bg-primary/10"
                  )}
                >
                  <Crown
                    className={cn2(
                      "w-5 h-5",
                      isPaid ? "text-amber-500" : "text-primary"
                    )}
                  />
                </View>
                <View>
                  <Text className="font-medium text-foreground">{tierLabel}</Text>
                  <Text className="text-xs text-muted-foreground">{tierDesc}</Text>
                </View>
              </View>
              {!isPaid && (
                <Button
                  size="sm"
                  className="bg-primary"
                  onPress={() =>
                    Toast.show({
                      type: "info",
                      text1: "Upgrade coming soon!",
                    })
                  }
                >
                  <Text className="text-primary-foreground font-semibold text-sm">
                    Upgrade
                  </Text>
                </Button>
              )}
            </View>
          </Pressable>
        </Animated.View>

        <Card>
          <CardContent className="p-0">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-foreground" />
                )}
                <Text className="text-foreground">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </Text>
              </View>
              <Switch value={isDark} onValueChange={toggleColorScheme} />
            </View>
            <Separator />
            <Pressable className="flex-row items-center justify-between p-4 active:bg-accent">
              <Text className="text-foreground">Help & Support</Text>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Pressable>
          </CardContent>
        </Card>

        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <StreakCalendar />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(300).delay(250)}
          className="gap-4"
        >
          <View>
            <View className="flex-row items-center gap-2 mb-1.5">
              <AtSign size={14} className="text-muted-foreground" />
              <Text className="text-sm font-medium text-foreground">Username</Text>
            </View>
            <Input
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError("");
                setUsernameSuggestions([]);
              }}
              onBlur={() => username && checkUsernameAvailability(username)}
              placeholder="legend11"
              autoCapitalize="none"
              className={usernameError ? "border-destructive" : ""}
            />
            {usernameError ? (
              <View className="flex-row items-center gap-1 mt-1.5">
                <AlertCircle className="w-3 h-3 text-destructive" />
                <Text className="text-xs text-destructive">{usernameError}</Text>
              </View>
            ) : null}
            {usernameSuggestions.length > 0 ? (
              <View className="flex-row flex-wrap gap-2 mt-2">
                <Text className="text-xs text-muted-foreground">Try:</Text>
                {usernameSuggestions.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => {
                      setUsername(s);
                      setUsernameError("");
                      setUsernameSuggestions([]);
                    }}
                  >
                    <Text className="text-xs text-primary">{s}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View>
            <View className="flex-row items-center gap-2 mb-1.5">
              <User size={14} className="text-muted-foreground" />
              <Text className="text-sm font-medium text-foreground">Full Name</Text>
            </View>
            <Input
              value={fullName}
              onChangeText={setFullName}
              placeholder="Alex Johnson"
            />
          </View>

          <View>
            <View className="flex-row items-center gap-2 mb-1.5">
              <School size={14} className="text-muted-foreground" />
              <Text className="text-sm font-medium text-foreground">School Name</Text>
            </View>
            <Input
              value={schoolName}
              onChangeText={setSchoolName}
              placeholder="Lincoln High School"
            />
          </View>

          <View>
            <View className="flex-row items-center gap-2 mb-1.5">
              <GraduationCap size={14} className="text-muted-foreground" />
              <Text className="text-sm font-medium text-foreground">Grade Level</Text>
            </View>
            <Select
              value={gradeLevel}
              onValueChange={setGradeLevel}
              placeholder="Select grade level"
              options={GRADE_SELECT_OPTIONS}
            />
            <Text className="text-xs text-muted-foreground mt-1">
              This adjusts AI responses to match your level
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <View className="flex-row items-center gap-2 mb-3">
            <Sparkles size={14} className="text-muted-foreground" />
            <Text className="text-sm font-medium text-foreground">
              AI Study Persona
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {STUDY_PERSONAS.map((persona) => (
              <Pressable
                key={persona.id}
                onPress={() => setStudyPersona(persona.id)}
                className={cn2(
                  "flex-1 min-w-[45%] p-4 rounded-xl border",
                  studyPersona === persona.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
                style={studyPersona === persona.id ? { borderWidth: 2 } : undefined}
              >
                <Text className="text-2xl">{persona.emoji}</Text>
                <Text
                  className={cn2(
                    "font-medium mt-2",
                    studyPersona === persona.id
                      ? "text-foreground"
                      : "text-foreground"
                  )}
                >
                  {persona.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {persona.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(300).delay(350)}
          className="gap-3 pt-4"
        >
          <Button className="w-full bg-primary" onPress={handleSave} disabled={saving}>
            <Save className="w-4 h-4 text-primary-foreground" />
            <Text className="text-primary-foreground font-semibold">
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Refreshing...",
                text2: "Reloading app data.",
              });
              setTimeout(() => {
                router.replace("/");
              }, 500);
            }}
          >
            <RefreshCw className="w-4 h-4 text-foreground" />
            <Text className="text-foreground font-semibold">Refresh App</Text>
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onPress={handleSignOut}
          >
            <LogOut className="w-4 h-4 text-destructive" />
            <Text className="text-destructive font-semibold">Sign Out</Text>
          </Button>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function cn2(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(" ");
}
