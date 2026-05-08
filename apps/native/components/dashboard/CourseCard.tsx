import { View, Text, Pressable, Alert } from "react-native";
import { MoreVertical, Trash2 } from "lucide-react-native";
import { Progress } from "../ui/progress";
import Animated, { useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import { useScalePress } from "../../hooks/useScalePress";

interface CourseCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  onDelete: (id: string) => void;
  onPress: () => void;
  index: number;
}

export function CourseCard({ id, name, icon, color, progress, onDelete, onPress, index }: CourseCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = useScalePress(0.97);

  const handleLongPress = () => {
    Alert.alert("Delete Course", `Remove "${name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(id),
      },
    ]);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      delayLongPress={500}
    >
      <Animated.View style={animatedStyle}>
        <View
          className="p-5 rounded-2xl border border-border/50 bg-card"
          style={{
            borderLeftColor: color,
            borderLeftWidth: 3,
          }}
        >
          <View
            className="w-14 h-14 rounded-xl items-center justify-center mb-4"
            style={{ backgroundColor: `${color}20` }}
          >
            <Text className="text-2xl">{icon}</Text>
          </View>

          <Text className="font-semibold text-foreground mb-3 pr-6" numberOfLines={1}>
            {name}
          </Text>

          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-muted-foreground">Progress</Text>
              <Text className="text-xs font-medium" style={{ color }}>
                {progress}%
              </Text>
            </View>
            <Progress value={progress} className="h-2" />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
