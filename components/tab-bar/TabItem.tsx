import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { Pressable, View } from "react-native";
import { ACTIVE_ICON_COLOR, type TabConfig, type TabTheme } from "./constants";
import { styles } from "./styles";

interface TabItemProps {
  tab: TabConfig;
  isFocused: boolean;
  isCompact: boolean;
  theme: TabTheme;
  onPress: () => void;
  onLongPress: () => void;
}

export const TabItem = React.memo(function TabItem({
  tab,
  isFocused,
  isCompact,
  theme,
  onPress,
  onLongPress,
}: TabItemProps) {
  const iconColor = isFocused ? ACTIVE_ICON_COLOR : theme.inactiveIcon;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={tab.label}
    >
      <View style={styles.tabItemInner}>
        <IconSymbol size={isCompact ? 20 : 22} name={tab.icon} color={iconColor} />
      </View>
    </Pressable>
  );
});
