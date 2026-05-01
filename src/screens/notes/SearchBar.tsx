import { useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../lib/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalRef = useRef(value);

  useEffect(() => {
    internalRef.current = value;
  }, [value]);

  function handleChange(text: string) {
    internalRef.current = text;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChangeText(text);
    }, 300);
  }

  function handleClear() {
    internalRef.current = "";
    if (timerRef.current) clearTimeout(timerRef.current);
    onChangeText("");
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder="Search notes..."
        placeholderTextColor={colors.mutedForeground}
        onChangeText={handleChange}
        defaultValue={value}
        returnKeyType="search"
      />
      {internalRef.current.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  icon: {
    fontSize: typography.base,
  },
  input: {
    flex: 1,
    fontSize: typography.base,
    color: colors.foreground,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
});
