import { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, Theme, ThemeMode } from './tokens';

// MMKV setup
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV({ id: 'theme' });

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
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = storage.getString('mode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  });

  const effectiveMode: 'light' | 'dark' = mode === 'system' 
    ? (systemScheme ?? 'light') 
    : mode;

  const theme = tokens[effectiveMode] as Theme;

  const setMode = (newMode: ThemeMode) => {
    storage.set('mode', newMode);
    setModeState(newMode);
  };

  const toggleMode = () => {
    const next = effectiveMode === 'light' ? 'dark' : 'light';
    setMode(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, effectiveMode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);