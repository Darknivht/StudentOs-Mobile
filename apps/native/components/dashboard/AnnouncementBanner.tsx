import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { X, Megaphone, AlertTriangle, Gift } from "lucide-react-native";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuthContext";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
}

const typeConfig: Record<string, { IconComponent: typeof Megaphone; bgClass: string; textClass: string; borderClass: string }> = {
  info: { IconComponent: Megaphone, bgClass: "bg-primary/10", textClass: "text-primary", borderClass: "border-primary/20" },
  warning: { IconComponent: AlertTriangle, bgClass: "bg-amber-500/10", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/20" },
  promo: { IconComponent: Gift, bgClass: "bg-green-500/10", textClass: "text-green-600 dark:text-green-400", borderClass: "border-green-500/20" },
};

export function AnnouncementBanner() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchAnnouncements = async () => {
      try {
        const { data } = await supabase
          .from("announcements")
          .select("id, title, content, type")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(3);
        if (data) setAnnouncements(data as Announcement[]);
      } catch {}
    };
    fetchAnnouncements();
  }, [user]);

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <View className="gap-2">
      {visible.map((a) => {
        const config = typeConfig[a.type] || typeConfig.info;
        const IconComp = config.IconComponent;
        return (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            key={a.id}
            className={`flex-row items-start gap-3 p-3 rounded-lg border ${config.bgClass} ${config.borderClass}`}
          >
            <View className="mt-0.5">
              <IconComp className={`w-4 h-4 ${config.textClass}`} />
            </View>
            <View className="flex-1">
              <Text className={`font-medium text-sm ${config.textClass}`}>{a.title}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{a.content}</Text>
            </View>
            <Pressable
              onPress={() => setDismissed((prev) => new Set(prev).add(a.id))}
              className="opacity-60"
            >
              <X className="w-4 h-4 text-foreground" />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
