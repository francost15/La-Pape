import { TAB_BAR_THEME } from "@/constants/tab-bar-theme";
import type { IconSymbolName } from "@/interface/ui/icons";

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
