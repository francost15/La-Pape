import { AppColors } from "@/constants/colors";

export type Theme = "light" | "dark" | "system";

/** Paleta resuelta del tema actual; usada en props que reciben `colors` sin el hook. */
export type ThemeColors = typeof AppColors.light | typeof AppColors.dark;

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
