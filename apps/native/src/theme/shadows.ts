import { Platform, ViewStyle } from 'react-native';

type ShadowName = 'glow' | 'glowLg' | 'elevated' | 'card';

const iosShadows: Record<ShadowName, ViewStyle> = {
  glow: {
    shadowColor: 'hsl(262, 83%, 58%)',
    shadowOpacity: 0.3,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  glowLg: {
    shadowColor: 'hsl(262, 83%, 58%)',
    shadowOpacity: 0.4,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 20 },
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
};

const androidElevation: Record<ShadowName, number> = {
  glow: 12,
  glowLg: 16,
  elevated: 8,
  card: 4,
};

export function shadow(name: ShadowName): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation: androidElevation[name] };
  }
  return iosShadows[name];
}

export const shadows = { iosShadows, androidElevation, shadow };