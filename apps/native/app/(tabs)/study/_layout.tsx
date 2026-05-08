import { Stack } from "expo-router";
import { useTheme } from "../../../hooks/useThemeContext";

export default function StudyStackLayout() {
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
    </Stack>
  );
}
