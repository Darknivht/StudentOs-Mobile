import { Component, type ReactNode, type ErrorInfo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export class WidgetBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `WidgetBoundary[${this.props.label}]:`,
      error.message,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.text}>
            {this.props.label
              ? `${this.props.label} unavailable`
              : "Widget unavailable"}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    padding: spacing.lg,
    alignItems: "center",
  },
  text: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
});
