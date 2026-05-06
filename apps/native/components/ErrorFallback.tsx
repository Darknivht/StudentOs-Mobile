import { View, Text, Pressable, ScrollView } from "react-native";
import type { ErrorBoundaryProps } from "expo-router";

export function ErrorFallback({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Text className="text-lg font-semibold text-destructive">Something went wrong</Text>
      {__DEV__ && (
        <ScrollView className="mt-2 max-h-40 w-full max-w-sm">
          <Text className="text-sm text-muted-foreground font-mono">{error.message}</Text>
        </ScrollView>
      )}
      {retry && (
        <Pressable
          onPress={retry}
          className="mt-4 px-6 py-3 bg-primary rounded-lg"
        >
          <Text className="text-primary-foreground font-medium">Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}
