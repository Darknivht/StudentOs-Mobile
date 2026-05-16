import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage implementation that uses SecureStore for sensitive data
// and AsyncStorage for everything else
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      // Try SecureStore first for sensitive data
      if (key.includes('auth') || key.includes('token')) {
        const value = await SecureStore.getItemAsync(key);
        return value;
      }
      // Fall back to AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Use SecureStore for sensitive data
      if (key.includes('auth') || key.includes('token')) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      // Remove from both stores to be safe
      if (key.includes('auth') || key.includes('token')) {
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});