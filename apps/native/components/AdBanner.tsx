import { View, Text } from "react-native";
import { useAuth } from "../hooks/useAuthContext";

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  const { user } = useAuth();
  const tier = (user?.app_metadata?.tier ?? "free") as string;

  if (tier !== "free") return null;

  return (
    <View
      className={`bg-muted border border-border rounded-lg items-center justify-center py-3 px-4 ${className ?? ""}`}
    >
      <Text className="text-muted-foreground text-xs">Ad Space</Text>
    </View>
  );
}
