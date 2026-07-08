import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { DesignSystem } from "@/constants/design-system";
import { Platform } from "react-native";
import { Easing } from "react-native-reanimated";

export const PC_ONLY_ROUTES = ["resumen"] as const;

/* ─── Digital Atelier — Tab Bar Colors ─────────────────────────── */
export const ACTIVE_BG = AppColors.primary;
export const ACTIVE_ICON_COLOR = "#ffffff";

export const THEME = {
  light: {
    barBg: "rgba(255,255,255,0.72)",
    border: "rgba(0,0,0,0.06)",
    shadow: AppColors.light.textPrimary,
    shadowOpacity: 0.12,
    webShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.04)",
    inactiveIcon: AppColors.light.textMuted,
    inactiveLabel: AppColors.light.textMuted,
    pcBadgeBg: "rgba(234,88,12,0.08)",
    pcBadgeText: AppColors.primaryDark,
  },
  dark: {
    barBg: "rgba(20,24,32,0.72)",
    border: "rgba(255,255,255,0.08)",
    shadow: "#000000",
    shadowOpacity: 0.5,
    webShadow: "0 12px 48px rgba(0,0,0,0.4), 0 1px 6px rgba(0,0,0,0.2)",
    inactiveIcon: AppColors.dark.textMuted,
    inactiveLabel: AppColors.dark.textMuted,
    pcBadgeBg: "rgba(249,115,22,0.12)",
    pcBadgeText: AppColors.primaryLight,
  },
} as const;

export type TabTheme = (typeof THEME)["light"] | (typeof THEME)["dark"];

// Curva ease-out fuerte del design system: el movimiento entra rápido y desacelera
// suavemente, en lugar del ease débil simétrico anterior
export const COLOR_EASING = Easing.bezier(...DesignSystem.easingCurve.strongOut);

export const ICON_MAP: Record<string, IconSymbolName> = {
  ventas: "cart.fill",
  productos: "bag.fill",
  history: "clock.fill",
  resumen: "doc.text",
};

export interface TabConfig {
  routeName: string;
  routeKey: string;
  label: string;
  icon: IconSymbolName;
  pcOnly?: boolean;
}

export const ESTIMATED_ISLAND_HEIGHT = 72;
export const PILL_H = 40;
export const PILL_W = 48; // Forma de lozenge en lugar de círculo perfecto para un look más "Digital Atelier"
export const isWeb = Platform.OS === "web";
