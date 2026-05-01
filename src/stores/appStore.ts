import { create } from "zustand";
import { Platform } from "react-native";

type ThemeMode = "dark" | "light" | "system";

interface AppState {
  theme: ThemeMode;
  onboardingSeen: boolean;
  dailyStudyTarget: number;

  setTheme: (theme: ThemeMode) => void;
  setOnboardingSeen: (seen: boolean) => void;
  setDailyStudyTarget: (minutes: number) => void;
}

let SecureStore: typeof import("expo-secure-store") | null = null;
if (Platform.OS !== "web") {
  try {
    SecureStore = require("expo-secure-store");
  } catch {}
}

const persistOnboardingSeen = async (seen: boolean) => {
  if (SecureStore) {
    try {
      await SecureStore.setItemAsync("app_onboarding_seen", seen ? "1" : "0");
    } catch {}
  }
};

const loadOnboardingSeen = async (): Promise<boolean> => {
  if (SecureStore) {
    try {
      const val = await SecureStore.getItemAsync("app_onboarding_seen");
      return val === "1";
    } catch {}
  }
  return false;
};

let _hydrated = false;
const _hydrationCallbacks: Array<() => void> = [];

export const useAppStore = create<AppState>()((set) => ({
  theme: "dark",
  onboardingSeen: false,
  dailyStudyTarget: 60,

  setTheme: (theme) => set({ theme }),
  setOnboardingSeen: (seen) => {
    set({ onboardingSeen: seen });
    persistOnboardingSeen(seen);
  },
  setDailyStudyTarget: (minutes) => set({ dailyStudyTarget: minutes }),
}));

loadOnboardingSeen().then((seen) => {
  useAppStore.setState({ onboardingSeen: seen });
  _hydrated = true;
  _hydrationCallbacks.forEach((cb) => cb());
  _hydrationCallbacks.length = 0;
});

export function onAppStoreHydrated(): Promise<void> {
  if (_hydrated) return Promise.resolve();
  return new Promise((resolve) => {
    _hydrationCallbacks.push(resolve);
  });
}
