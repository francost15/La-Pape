import { AppColors } from "@/constants/colors";
import type { IconSymbolName } from "@/interface/ui/icons";

export const TAB_BAR_THEME = {
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

export type TabTheme = (typeof TAB_BAR_THEME)["light"] | (typeof TAB_BAR_THEME)["dark"];

export interface LayoutStore {
  viewportWidth: number;
  isMobile: boolean;
  setViewportWidth: (width: number) => void;
}

export interface TabConfig {
  routeName: string;
  routeKey: string;
  label: string;
  icon: IconSymbolName;
  pcOnly?: boolean;
}

export interface SlidingIndicatorProps {
  activeIndex: number;
  tabCount: number;
  islandWidth: number;
}

export interface TabItemProps {
  tab: TabConfig;
  isFocused: boolean;
  isCompact: boolean;
  theme: TabTheme;
  onPress: () => void;
  onLongPress: () => void;
}

export interface PcOnlyBadgeProps {
  tab: TabConfig;
  visible: boolean;
  theme: TabTheme;
}
