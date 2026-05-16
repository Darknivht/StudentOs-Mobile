import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'StudentOS',
  slug: 'studentos',
  scheme: 'studentos',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#9333ea',
  },
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.studentoss.app',
    supportsTablet: false,
  },
  android: {
    package: 'com.studentoss.app',
    permissions: [
      'NOTIFICATIONS',
      'PACKAGE_USAGE_STATS',
      'SYSTEM_ALERT_WINDOW',
      'FOREGROUND_SERVICE',
      'RECEIVE_BOOT_COMPLETED',
      'POST_NOTIFICATIONS',
    ],
  },
  plugins: [
    'expo-notifications',
    'expo-secure-store',
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'YOUR_EAS_ID',
    },
  },
};

export default config;