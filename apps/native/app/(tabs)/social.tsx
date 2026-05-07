import { View, Text, ScrollView } from "react-native";
import { Users, MessageCircle, Trophy, Store } from "lucide-react-native";
import { Card, CardContent } from "../../components/ui/card";

export default function SocialScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-1">Social</Text>
        <Text className="text-muted-foreground mb-6">Connect with friends</Text>

        <View className="gap-3">
          {[
            { icon: MessageCircle, label: "Chat", desc: "Direct and group messages" },
            { icon: Trophy, label: "Leaderboard", desc: "See how you rank" },
            { icon: Users, label: "Study Groups", desc: "Join or create study groups" },
            { icon: Store, label: "Store", desc: "Browse educational resources" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-secondary/10 items-center justify-center">
                  <item.icon className="w-5 h-5 text-secondary" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">{item.label}</Text>
                  <Text className="text-sm text-muted-foreground">{item.desc}</Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
