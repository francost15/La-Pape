import { AppColors } from "@/constants/colors";
import { TAB_BAR_THEME } from "@/constants/tab-bar-theme";
import type { IconSymbolName } from "@/interface/ui/icons";
import { Platform } from "react-native";

export type { TabTheme } from "@/interface/layout";

export const ACTIVE_BG = AppColors.primary;
export const ACTIVE_ICON_COLOR = "#ffffff";

export const THEME = TAB_BAR_THEME;

export const ICON_MAP: Record<string, IconSymbolName> = {
  ventas: "cart.fill",
  productos: "bag.fill",
  history: "clock.fill",
  resumen: "doc.text",
};

export const ESTIMATED_ISLAND_HEIGHT = 72;
export const PILL_H = 40;
export const PILL_W = 48;
export const isWeb = Platform.OS === "web";
