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
      <Stack.Screen name="pomodoro" options={{ title: "Pomodoro Timer" }} />
      <Stack.Screen name="cheat-sheet" options={{ title: "Cheat Sheet" }} />
      <Stack.Screen name="mnemonic" options={{ title: "Mnemonic Generator" }} />
      <Stack.Screen name="cram-mode" options={{ title: "Cram Mode" }} />
      <Stack.Screen name="fill-blanks" options={{ title: "Fill in the Blanks" }} />
      <Stack.Screen name="debate" options={{ title: "Debate Partner" }} />
      <Stack.Screen name="concept-linking" options={{ title: "Mind Map" }} />
      <Stack.Screen name="math-solver" options={{ title: "Math Solver" }} />
      <Stack.Screen name="code-debugger" options={{ title: "Code Debugger" }} />
      <Stack.Screen name="translator" options={{ title: "Translator" }} />
      <Stack.Screen name="youtube-summarizer" options={{ title: "YouTube Summarizer" }} />
      <Stack.Screen name="ocr-latex" options={{ title: "OCR to LaTeX" }} />
      <Stack.Screen name="diagram-interpreter" options={{ title: "Diagram Interpreter" }} />
      <Stack.Screen name="book-scanner" options={{ title: "Book Scanner" }} />
    </Stack>
  );
}
