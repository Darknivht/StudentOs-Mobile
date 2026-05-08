import { Stack } from "expo-router";
import { useTheme } from "../../../hooks/useThemeContext";

export default function ExamsStackLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? "hsl(240, 10%, 10%)" : "hsl(0, 0%, 100%)",
        },
        headerTintColor: isDark ? "hsl(0, 0%, 98%)" : "hsl(240, 10%, 10%)",
        headerTitleStyle: {
          fontWeight: "600" as const,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: isDark ? "hsl(240, 10%, 10%)" : "hsl(0, 0%, 100%)",
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="subjects"
        options={{ title: "Subjects" }}
      />
      <Stack.Screen
        name="practice"
        options={{ title: "Practice" }}
      />
      <Stack.Screen
        name="mock"
        options={{ title: "Mock Exam" }}
      />
      <Stack.Screen
        name="multi-cbt"
        options={{ title: "CBT Simulation" }}
      />
      <Stack.Screen
        name="performance"
        options={{ title: "Performance" }}
      />
      <Stack.Screen
        name="weakness"
        options={{ title: "Weak Topics" }}
      />
      <Stack.Screen
        name="bookmarks"
        options={{ title: "Bookmarks" }}
      />
      <Stack.Screen
        name="study-plan"
        options={{ title: "Study Plan" }}
      />
      <Stack.Screen
        name="guided-learning"
        options={{ title: "Guided Learning" }}
      />
    </Stack>
  );
}
