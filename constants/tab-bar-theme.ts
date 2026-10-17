import { AppColors } from "@/constants/colors";

/**
 * Valores (colores/sombras) del tab bar por tema. Vive en constants/ porque es
 * dato, no tipo; el tipo derivado `TabTheme` permanece en interface/layout.
 */
export const TAB_BAR_THEME = {
  light: {
    barBg: "rgba(255,255,255,0.72)",
    border: "rgba(0,0,0,0.06)",
    shadow: AppColors.light.textPrimary,
    shadowOpacity: 0.12,
    webShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.04)",
    inactiveIcon: AppColors.light.textMuted,
    inactiveLabel: AppColors.light.textMuted,
  },
  dark: {
    barBg: "rgba(20,24,32,0.72)",
    border: "rgba(255,255,255,0.08)",
    shadow: "#000000",
    shadowOpacity: 0.5,
    webShadow: "0 12px 48px rgba(0,0,0,0.4), 0 1px 6px rgba(0,0,0,0.2)",
    inactiveIcon: AppColors.dark.textMuted,
    inactiveLabel: AppColors.dark.textMuted,
  },
} as const;
