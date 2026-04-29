import { create } from "zustand";

type ThemeMode = "dark" | "light" | "system";

interface AppState {
  theme: ThemeMode;
  onboardingSeen: boolean;
  dailyStudyTarget: number;

  setTheme: (theme: ThemeMode) => void;
  setOnboardingSeen: (seen: boolean) => void;
  setDailyStudyTarget: (minutes: number) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  theme: "dark",
  onboardingSeen: false,
  dailyStudyTarget: 60,

  setTheme: (theme) => set({ theme }),
  setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),
  setDailyStudyTarget: (minutes) => set({ dailyStudyTarget: minutes }),
}));
