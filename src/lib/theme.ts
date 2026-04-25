// StudentOS design tokens — matches web app color palette
export const colors = {
  // Core palette
  background: '#0f0f23',        // Deep navy — matches web app
  foreground: '#ffffff',
  primary: '#7c3aed',           // Purple — matches PWA theme
  primaryForeground: '#ffffff',
  secondary: '#1e1e3a',
  secondaryForeground: '#a0a0c0',

  // Semantic
  muted: '#1a1a2e',
  mutedForeground: '#6b6b8a',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',

  // Borders and inputs
  border: '#2a2a4a',
  input: '#1a1a2e',
  ring: '#7c3aed',

  // Success / Warning
  success: '#22c55e',
  warning: '#f59e0b',

  // Surface variants
  card: '#12122a',
  popover: '#1a1a2e',
  accent: '#7c3aed',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const typography = {
  // Font sizes matching design system
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Theme-aware hook
export function useTheme() {
  // Returns the current theme colors
  // In Phase 18 (Profile), this will read from useAppStore
  // For now, return the dark theme constants
  return {
    colors,
    spacing,
    typography,
    isDark: true,
  };
}