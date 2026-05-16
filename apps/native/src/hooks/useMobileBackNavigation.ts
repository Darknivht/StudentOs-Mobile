import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';

let lastBackPress = 0;

export function useMobileBackNavigation() {
  const nav = useNavigation();
  const isAtRoot = useNavigationState((s) => s.index === 0);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (nav.canGoBack()) {
        nav.goBack();
        return true;
      }
      // double-tap to exit at root
      const now = Date.now();
      if (now - lastBackPress < 2000) return false; // OS exits
      lastBackPress = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Tap back again to exit', ToastAndroid.SHORT);
      }
      return true;
    });
    return () => sub.remove();
  }, [nav, isAtRoot]);
}