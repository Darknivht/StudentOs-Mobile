import { createContext, useContext, type ReactNode } from "react";
import { useAppColorScheme } from "./useColorScheme";

type ColorScheme = "light" | "dark";

interface ThemeContextType {
  theme: ColorScheme;
  isDark: boolean;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, isDark, toggleColorScheme } = useAppColorScheme();
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
