export const Colors = {
  // Light theme - matching web app CSS variables
  background: "#FAFBFC", // hsl(240, 20%, 98%)
  foreground: "#1A1A2E", // hsl(240, 10%, 10%)
  primary: "#6D28D9", // hsl(262, 83%, 58%)
  primaryForeground: "#FFFFFF",
  secondary: "#0EA5E9", // hsl(199, 89%, 48%)
  secondaryForeground: "#FFFFFF",
  accent: "#EC4899", // hsl(340, 82%, 52%)
  accentForeground: "#FFFFFF",
  success: "#22C55E", // hsl(142, 71%, 45%)
  successForeground: "#FFFFFF",
  warning: "#F59E0B", // hsl(38, 92%, 50%)
  warningForeground: "#FFFFFF",
  destructive: "#EF4444", // hsl(0, 84%, 60%)
  destructiveForeground: "#FFFFFF",
  muted: "#E8E8ED", // hsl(240, 5%, 92%)
  mutedForeground: "#71717A", // hsl(240, 4%, 46%)
  card: "#FFFFFF", // hsl(0, 0%, 100%)
  cardForeground: "#1A1A2E",
  border: "#E4E4E7", // hsl(240, 6%, 90%)
  input: "#E4E4E7",
  ring: "#6D28D9",

  // Dark theme - matching web app CSS variables
  darkBackground: "#0D0D14", // hsl(240, 10%, 8%)
  darkForeground: "#F0F0F5", // hsl(240, 10%, 95%)
  darkCard: "#1A1A24", // hsl(240, 10%, 12%)
  darkCardForeground: "#F0F0F5",
  darkMuted: "#2D2D3A", // hsl(240, 5%, 20%)
  darkMutedForeground: "#8A8A9A", // hsl(240, 5%, 60%)
  darkBorder: "#2D2D3A", // hsl(240, 5%, 20%)
  darkInput: "#2D2D3A",
  darkRing: "#8B5CF6", // hsl(262, 83%, 65%)

  // Gradient colors - matching web app
  gradientStart: "#6D28D9",
  gradientMid: "#8B5CF6",
  gradientEnd: "#EC4899",

  // Auth specific
  authBackground: "#0D0D14",
  authSecondary: "#1A1A24",

  // Social
  socialBackground: "#FAFBFC",
  chartPrimary: "#6D28D9",
  chartSecondary: "#8B5CF6",

  // Focus mode
  focusBackground: "#1A1A24",

  // Tab bar
  tabActive: "#6D28D9",
  tabInactive: "#71717A",
};

export const Gradients = {
  auth: ["#0D0D14", "#1A1A24"] as const,
  primary: ["#6D28D9", "#8B5CF6"] as const,
  main: ["#FAFBFC", "#E8E8ED"] as const,
  surface: ["#FFFFFF", "#FAFBFC"] as const,
  card: ["#FFFFFF", "#FAFBFC"] as const,
};