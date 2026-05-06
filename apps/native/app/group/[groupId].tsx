import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-xl text-foreground">Group: {groupId}</Text>
    </View>
  );
}
