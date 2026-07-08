import { useHaptic } from "@/hooks/use-haptic";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";
import { PcOnlyBadge } from "./tab-bar/PcOnlyBadge";
import { SlidingIndicator } from "./tab-bar/SlidingIndicator";
import { TabItem } from "./tab-bar/TabItem";
import {
  ESTIMATED_ISLAND_HEIGHT,
  ICON_MAP,
  isWeb,
  PC_ONLY_ROUTES,
  type TabConfig,
  THEME,
} from "./tab-bar/constants";
import { styles } from "./tab-bar/styles";

export function DynamicIslandTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const haptic = useHaptic();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const theme = isDark ? THEME.dark : THEME.light;
  const isCompact = width < 640;
  const onHeightChange = React.useContext(BottomTabBarHeightCallbackContext);

  const totalHeight = ESTIMATED_ISLAND_HEIGHT + insets.bottom + 20;
  useEffect(() => {
    onHeightChange?.(totalHeight);
  }, [onHeightChange, totalHeight]);

  const tabs: TabConfig[] = useMemo(
    () =>
      state.routes.map((route) => {
        const opts = descriptors[route.key].options;
        const title = opts.title ?? route.name;
        const pcOnly = PC_ONLY_ROUTES.includes(route.name as (typeof PC_ONLY_ROUTES)[number]);
        return {
          routeName: route.name,
          routeKey: route.key,
          label: typeof title === "string" ? title : route.name,
          icon: ICON_MAP[route.name] ?? "doc.text",
          pcOnly,
        };
      }),
    [state.routes, descriptors]
  );

  const activeIndex = state.index;
  const islandWidth = Math.min(width - 32, isWeb ? 480 : 380);

  return (
    <Animated.View
      entering={FadeInDown.springify()
        .damping(22)
        .stiffness(280)
        .mass(0.8)
        .reduceMotion(ReduceMotion.System)}
      style={[
        styles.wrapper,
        {
          paddingBottom: isWeb ? insets.bottom + 24 : insets.bottom + 12,
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={isDark ? 55 : 75}
        tint={isDark ? "dark" : "light"}
        style={[
          styles.island,
          {
            width: islandWidth,
            borderColor: theme.border,
            backgroundColor: isWeb ? theme.barBg : "transparent",
            ...(isWeb
              ? {
                  boxShadow: theme.webShadow,
                  backdropFilter: "blur(32px) saturate(200%)",
                  WebkitBackdropFilter: "blur(32px) saturate(200%)",
                }
              : {
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 16 },
                  shadowOpacity: theme.shadowOpacity,
                  shadowRadius: 32,
                  elevation: 20,
                }),
          },
        ]}
      >
        <View style={styles.tabsRowWrapper}>
          <SlidingIndicator
            activeIndex={activeIndex}
            tabCount={tabs.length}
            islandWidth={islandWidth}
          />
          <View style={styles.tabsRow}>
            {tabs.map((tab, index) => (
              <TabItem
                key={tab.routeKey}
                tab={tab}
                isFocused={activeIndex === index}
                isCompact={isCompact}
                theme={theme}
                onPress={() => {
                  haptic();
                  const event = navigation.emit({
                    type: "tabPress",
                    target: tab.routeKey,
                    canPreventDefault: true,
                  });
                  if (!event.defaultPrevented) {
                    navigation.navigate(tab.routeName);
                  }
                }}
                onLongPress={() => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: tab.routeKey,
                  });
                }}
              />
            ))}
          </View>
        </View>
      </BlurView>
      {!isWeb && tabs[activeIndex] ? (
        <PcOnlyBadge
          tab={tabs[activeIndex]}
          visible={tabs[activeIndex]?.pcOnly === true}
          theme={theme}
        />
      ) : null}
    </Animated.View>
  );
}
