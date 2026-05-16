import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

type Preset = 'primary-accent' | 'primary-secondary' | 'success' | 'warning' | 'sunset' | 'dark';

interface GradientProps {
  preset?: Preset;
  children?: ReactNode;
  style?: ViewStyle;
  className?: string;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const presets: Record<Preset, (theme: any) => string[]> = {
  'primary-accent': (t) => [t.primary, t.accent],
  'primary-secondary': (t) => [t.primary, t.secondary],
  'success': (t) => [t.success, '#10b981'],
  'warning': (t) => [t.warning, t.accent],
  'sunset': () => ['#f97316', '#ec4899', '#6d28d9'],
  'dark': () => ['#0f172a', '#1e293b'],
};

export function Gradient({ 
  preset = 'primary-accent', 
  children, 
  style, 
  className,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  ...rest 
}: GradientProps) {
  const { theme } = useTheme();
  const colors = presets[preset](theme);
  
  return (
    <LinearGradient
      colors={colors as any}
      start={start}
      end={end}
      style={style}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}