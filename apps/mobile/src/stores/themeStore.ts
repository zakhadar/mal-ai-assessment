import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeState, Theme } from "@mal-assessment/shared";

interface ThemeStore extends ThemeState {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Theme colors (token-based)
export const themeColors = {
  light: {
    background: "#FFFFFF",
    surface: "#F5F5F5",
    text: "#000000",
    textSecondary: "#666666",
    border: "#E0E0E0",
    primary: "#007AFF",
    error: "#FF3B30",
    success: "#34C759",
  },
  dark: {
    background: "#1C1C1E",
    surface: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "#999999",
    border: "#444444",
    primary: "#0A84FF",
    error: "#FF453A",
    success: "#32D74B",
  },
};

export const getThemeColors = (theme: Theme) => themeColors[theme];
