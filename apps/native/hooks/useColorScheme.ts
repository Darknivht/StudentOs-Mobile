import { useColorScheme as useRNColorScheme } from "react-native";
import { useState, useEffect, useCallback } from "react";

type ColorScheme = "light" | "dark";

export function useAppColorScheme() {
  const systemScheme = useRNColorScheme();
  const [theme, setTheme] = useState<ColorScheme>(
    ((): ColorScheme => {
      try {
        const Storage = require("expo-sqlite/kv-store");
        const saved = Storage.getItemSync("theme");
        if (saved === "light" || saved === "dark") return saved;
      } catch {
        // kv-store not available yet (e.g. during setup)
      }
      return (systemScheme as ColorScheme) || "light";
    })()
  );

  useEffect(() => {
    try {
      const Storage = require("expo-sqlite/kv-store");
      Storage.setItemSync("theme", theme);
    } catch {
      // kv-store not available yet
    }
  }, [theme]);

  const toggleColorScheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return {
    theme,
    toggleColorScheme,
    isDark: theme === "dark",
  };
}
