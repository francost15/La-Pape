import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "@/store/theme-store";

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const systemDark = useColorScheme() === "dark";

  const isDark = theme === "system" ? systemDark : theme === "dark";

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return { theme, isDark, setTheme, toggleTheme };
}
