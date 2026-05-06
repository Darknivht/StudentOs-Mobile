import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function CourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-xl text-foreground">Course: {courseId}</Text>
    </View>
  );
}
