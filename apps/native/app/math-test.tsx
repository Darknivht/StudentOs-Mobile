import { View, Text, ScrollView } from "react-native";
import { MathExpression } from "../components/MathView";

const MATH_EXPRESSIONS = [
  "E = mc^2",
  "\\frac{a}{b}",
  "\\sqrt{x^2 + y^2}",
  "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}",
  "\\int_0^\\infty e^{-x} dx = 1",
];

export default function MathTestScreen() {
  return (
    <ScrollView className="flex-1 bg-background p-6">
      <Text className="text-2xl font-bold text-foreground mb-4">KaTeX Rendering Test</Text>
      <Text className="text-muted-foreground mb-6">
        These expressions verify math rendering. In Phase 3-4, react-native-math-view or a WebView-based renderer will replace this placeholder.
      </Text>
      {MATH_EXPRESSIONS.map((expr, i) => (
        <View key={i} className="mb-3">
          <Text className="text-sm text-muted-foreground mb-1">Expression {i + 1}:</Text>
          <MathExpression math={expr} />
        </View>
      ))}
    </ScrollView>
  );
}
