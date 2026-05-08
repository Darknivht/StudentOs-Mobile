import { useState, useEffect, ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, Check, Lock } from "lucide-react-native";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import FeatureGateSheet from "../subscription/FeatureGateSheet";
import Toast from "react-native-toast-message";
import Markdown from "react-native-markdown-display";

function extractContentTitle(content: string, fallback: string): string {
  if (!content) return fallback;
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].replace(/[*_`#]/g, "").trim().slice(0, 80);
  const h2 = content.match(/^##\s+(.+)$/m);
  if (h2) return h2[1].replace(/[*_`#]/g, "").trim().slice(0, 80);
  const bold = content.match(/\*\*(.{5,60}?)\*\*/);
  if (bold) return bold[1].trim();
  const firstLine = content
    .split("\n")
    .find((l) => l.trim().length > 10 && !l.startsWith("```"));
  if (firstLine) return firstLine.replace(/[#*_`>]/g, "").trim().slice(0, 80);
  return fallback;
}

interface AIToolLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  onBack?: () => void;
  children: ReactNode;
  result?: string;
  loading?: boolean;
  requiresPro?: boolean;
  featureType?: "ai" | "quiz" | "flashcard" | "note";
}

export default function AIToolLayout({
  title,
  description,
  icon,
  onBack,
  children,
  result,
  loading,
  requiresPro = false,
  featureType = "ai",
}: AIToolLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription, checkLimit, getRemainingUses, incrementUsage } =
    useSubscription();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  const [gateData, setGateData] = useState<any>(null);

  useEffect(() => {
    if (subscription) {
      const canUse = checkLimit(featureType);
      const remaining = getRemainingUses(featureType);
      setIsBlocked(!canUse);
      setRemainingUses(remaining);
    }
  }, [subscription, featureType]);

  const saveAsNote = async () => {
    if (!user || !result) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title: `${title} - ${new Date().toLocaleDateString()}`,
        content: result,
        source_type: "ai_tool",
      });
      if (error) throw error;
      setSaved(true);
      Toast.show({ type: "success", text1: "Saved!", text2: "Result saved to your notes." });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to save note." });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = onBack || (() => router.back());

  if (isBlocked || (requiresPro && subscription?.tier === "free")) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-5">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={handleBack}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">{title}</Text>
              <Text className="text-sm text-muted-foreground">{description}</Text>
            </View>
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
              {icon}
            </View>
          </View>
          <View className="items-center py-12">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Lock size={40} className="text-primary" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              {requiresPro ? "Pro Feature" : "Daily Limit Reached"}
            </Text>
            <Text className="text-muted-foreground text-center mb-6 max-w-xs">
              {requiresPro
                ? "This feature is only available on the Pro plan."
                : `You've used all your free ${featureType} uses for today. Upgrade for unlimited access.`}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={handleBack}>
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">{title}</Text>
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
          <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
            {icon}
          </View>
        </View>

        {subscription?.tier === "free" &&
          remainingUses !== null &&
          remainingUses < 999 && (
            <View className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex-row items-center justify-between">
              <Text className="text-sm text-foreground">
                {remainingUses} {featureType} uses remaining today
              </Text>
            </View>
          )}

        <View className="gap-4">{children}</View>

        {(loading || result) && (
          <Card>
            <View className="p-3 bg-muted border-b border-border flex-row items-center justify-between">
              <Text className="font-medium text-sm text-foreground">
                {loading ? "Analyzing..." : "Result"}
              </Text>
              {result && !loading && (
                <View className="flex-row items-center gap-2">
                  <Pressable onPress={saveAsNote} disabled={saving || saved}>
                    {saved ? (
                      <View className="flex-row items-center gap-1">
                        <Check size={14} className="text-green-500" />
                        <Text className="text-xs text-green-500">Saved</Text>
                      </View>
                    ) : saving ? (
                      <ActivityIndicator size="small" className="text-primary" />
                    ) : (
                      <View className="flex-row items-center gap-1">
                        <Save size={14} className="text-foreground" />
                        <Text className="text-xs text-foreground">Save</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
            <CardContent className="p-4">
              {loading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" className="text-primary" />
                </View>
              ) : (
                <Markdown
                  style={{
                    body: { color: "transparent" },
                    paragraph: { color: undefined },
                    heading1: { color: undefined },
                    heading2: { color: undefined },
                    heading3: { color: undefined },
                  }}
                >
                  {result || ""}
                </Markdown>
              )}
            </CardContent>
          </Card>
        )}
      </View>
    <FeatureGateSheet
      open={!!gateData}
      onOpenChange={() => setGateData(null)}
        feature="AI tool uses"
        currentUsage={gateData?.currentUsage || 0}
        limit={gateData?.limit || 0}
        isLifetime={gateData?.isLifetime}
        requiredTier={gateData?.requiredTier}
      />
    </ScrollView>
  );
}
