import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokens, Theme, ThemeMode } from './tokens';

const THEME_KEY = '@theme_mode';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  effectiveMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  const effectiveMode: 'light' | 'dark' = mode === 'system' 
    ? (systemScheme ?? 'light') 
    : mode;

  const theme = tokens[effectiveMode] as Theme;

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode).catch(console.error);
  };

  const toggleMode = () => {
    const next = effectiveMode === 'light' ? 'dark' : 'light';
    setMode(next);
  };

  // Don't render until we've loaded the saved theme
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, effectiveMode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);