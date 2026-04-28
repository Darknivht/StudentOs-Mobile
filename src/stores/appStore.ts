import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import { persist, createJSONStorage } from "zustand/middleware";

type ThemeMode = "dark" | "light" | "system";

interface AppState {
  theme: ThemeMode;
  onboardingSeen: boolean;
  dailyStudyTarget: number; // minutes

  setTheme: (theme: ThemeMode) => void;
  setOnboardingSeen: (seen: boolean) => void;
  setDailyStudyTarget: (minutes: number) => void;
}

const mmkvStorage = createJSONStorage(() => {
  const mmkv = createMMKV({ id: "app-settings" });
  return {
    getItem: (key: string) => mmkv.getString(key) ?? null,
    setItem: (key: string, value: string) => mmkv.set(key, value),
    removeItem: (key: string) => {
      mmkv.remove(key);
    },
  };
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      onboardingSeen: false,
      dailyStudyTarget: 60,

      setTheme: (theme) => set({ theme }),
      setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),
      setDailyStudyTarget: (minutes) => set({ dailyStudyTarget: minutes }),
    }),
    {
      name: "app-settings",
      storage: mmkvStorage,
    },
  ),
);
