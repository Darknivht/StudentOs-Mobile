import { View, Text, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";

interface MathExpressionProps {
  math: string;
  style?: ViewStyle;
}

export function MathExpression({ math, style }: MathExpressionProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.math}>{math}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    marginVertical: 4,
  },
  math: {
    fontFamily: "monospace",
    fontSize: 16,
    color: "#1e293b",
  },
});
