import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Paleta resuelta del tema actual; útil para tipar props de componentes que
// reciben `colors` desde useThemeColors sin reimportar el hook.
export type ThemeColors = typeof AppColors.light | typeof AppColors.dark;

/**
 * Retorna los colores del tema actual (light/dark) y el flag isDark.
 * Elimina el boilerplate repetido de useColorScheme + isDark + colors
 * que antes aparecía en cada componente.
 */
export function useThemeColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? AppColors.dark : AppColors.light;
  return { isDark, colors };
}
