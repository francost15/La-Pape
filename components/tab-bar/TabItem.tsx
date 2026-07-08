import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { Pressable, View } from "react-native";
import { ACTIVE_ICON_COLOR } from "./constants";
import { styles } from "./styles";
import type { TabItemProps } from "@/interface/layout";

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
