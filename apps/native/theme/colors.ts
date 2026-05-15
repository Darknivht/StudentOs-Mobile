export const Colors = {
  // Light theme
  background: "#F8FAFC",
  foreground: "#0F172A",
  primary: "#6D28D9",
  primaryForeground: "#FFFFFF",
  secondary: "#0EA5E9",
  secondaryForeground: "#FFFFFF",
  accent: "#EC4899",
  accentForeground: "#FFFFFF",
  success: "#22C55E",
  successForeground: "#FFFFFF",
  warning: "#F59E0B",
  warningForeground: "#FFFFFF",
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  card: "#FFFFFF",
  cardForeground: "#0F172A",
  border: "#E2E8F0",
  input: "#E2E8F0",
  ring: "#6D28D9",

  // Dark theme
  darkBackground: "#0F172A",
  darkForeground: "#F8FAFC",
  darkCard: "#1E293B",
  darkCardForeground: "#F8FAFC",
  darkMuted: "#1E293B",
  darkMutedForeground: "#94A3B8",
  darkBorder: "#334155",
  darkInput: "#334155",
  darkRing: "#8B5CF6",

  // Gradient colors
  gradientStart: "#6D28D9",
  gradientMid: "#8B5CF6",
  gradientEnd: "#EC4899",

  // Auth specific
  authBackground: "#0F172A",
  authSecondary: "#1E293B",

  // Social
  socialBackground: "#F8FAFC",
  chartPrimary: "#6D28D9",
  chartSecondary: "#8B5CF6",

  // Focus mode
  focusBackground: "#1E293B",

  // Tab bar
  tabActive: "#6D28D9",
  tabInactive: "#64748B",
};

export const Gradients = {
  auth: ["#0F172A", "#1E293B"] as const,
  primary: ["#6D28D9", "#8B5CF6"] as const,
  main: ["#F8FAFC", "#F1F5F9"] as const,
  surface: ["#FFFFFF", "#F8FAFC"] as const,
  card: ["#FFFFFF", "#F8FAFC"] as const,
};