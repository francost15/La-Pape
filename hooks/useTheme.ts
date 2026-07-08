import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/store/theme-store";

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // `useColorScheme` refleja el `Appearance` que el store ya fijó según la
  // preferencia (o el sistema cuando theme === "system"). Es la misma fuente
  // que lee `useThemeColors`, por lo que ambos hooks nunca divergen.
  const isDark = useColorScheme() === "dark";

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
