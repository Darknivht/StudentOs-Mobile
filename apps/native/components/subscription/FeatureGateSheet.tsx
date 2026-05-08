import React from "react";
import { View, Text } from "react-native";
import { Lock, Crown, Check } from "lucide-react-native";
import { Sheet } from "../ui/sheet";
import { Button } from "../ui/button";
import { SUBSCRIPTION_ENABLED } from "../../lib/subscriptionConfig";

interface FeatureGateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentUsage: number;
  limit: number;
  isLifetime?: boolean;
  requiredTier?: "plus" | "pro";
}

const tiers = [
  {
    name: "Free",
    highlight: false,
    features: ["5 AI/day", "2 notes/day", "2 jobs/mo"],
  },
  {
    name: "Plus",
    highlight: true,
    features: ["20 AI/day", "8 notes/day", "10 jobs/mo"],
  },
  {
    name: "Pro",
    highlight: false,
    features: ["Unlimited", "Unlimited", "Unlimited"],
  },
];

export default function FeatureGateSheet({
  open,
  onOpenChange,
  feature,
  currentUsage,
  limit,
  isLifetime = false,
  requiredTier = "plus",
}: FeatureGateSheetProps) {
  if (!SUBSCRIPTION_ENABLED) return null;

  const tierLabel = requiredTier === "pro" ? "Pro" : "Plus";
  const usagePercent =
    limit > 0 ? Math.min((currentUsage / limit) * 100, 100) : 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset =
    circumference - (usagePercent / 100) * circumference;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={["60%"]}>
      <View className="p-6 items-center gap-4">
        <View className="w-20 h-20 items-center justify-center relative">
          <View className="absolute inset-0 items-center justify-center">
            <Lock size={24} className="text-destructive" />
          </View>
        </View>

        <Text className="text-lg font-bold text-foreground text-center">
          {isLifetime ? "Lifetime Limit Reached" : "Limit Reached"}
        </Text>

        <Text className="text-sm text-muted-foreground text-center">
          You've used{" "}
          <Text className="font-bold text-foreground">
            {currentUsage}/{limit}
          </Text>{" "}
          {feature}.
          {isLifetime
            ? " Upgrade to unlock more capacity."
            : " Upgrade now for more."}
        </Text>

        <View className="flex-row gap-2 w-full">
          {tiers.map((t) => (
            <View
              key={t.name}
              className={`flex-1 rounded-xl p-2.5 items-center gap-1.5 ${
                t.highlight
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-muted/50 border border-border"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  t.highlight ? "text-primary" : "text-foreground"
                }`}
              >
                {t.name}
              </Text>
              {t.features.map((f, i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-1"
                >
                  <Check size={10} className="text-primary" />
                  <Text className="text-[10px] text-muted-foreground">
                    {f}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <Button
          className="w-full flex-row items-center justify-center gap-2"
          onPress={() => onOpenChange(false)}
        >
          <Crown size={16} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-semibold">
            Upgrade to {tierLabel}
          </Text>
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onPress={() => onOpenChange(false)}
        >
          <Text className="text-muted-foreground">Maybe later</Text>
        </Button>
      </View>
    </Sheet>
  );
}
