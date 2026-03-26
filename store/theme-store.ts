import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",

      setTheme: (theme) => {
        set({ theme });
        const isDark = get().isDark;
        set({ isDark: !isDark });
        set({
          isDark:
            theme === "system"
              ? window.matchMedia("(prefers-color-scheme: dark)").matches
              : theme === "dark",
        });
      },

      isDark:
        typeof window !== "undefined"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : false,
    }),
    {
      name: "theme-preference",
    }
  )
);
