import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const PC_ONLY_ROUTES = ["resumen"] as const;

const ACTIVE_BG = "#ea580c";
const ACTIVE_ICON_COLOR = "#ffffff";
const INACTIVE_COLOR_LIGHT = "#78716c";
const INACTIVE_COLOR_DARK = "#a8a29e";
const COLOR_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

const ICON_MAP: Record<string, IconSymbolName> = {
  ventas: "cart.fill",
  productos: "bag.fill",
  history: "clock.fill",
  resumen: "doc.text",
};

interface TabConfig {
  routeName: string;
  label: string;
  icon: IconSymbolName;
  pcOnly?: boolean;
}

const ESTIMATED_ISLAND_HEIGHT = 80;

export function DynamicIslandTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";
  const isCompact = width < 640;
  const onHeightChange = React.useContext(BottomTabBarHeightCallbackContext);

  const totalHeight = ESTIMATED_ISLAND_HEIGHT + insets.bottom + 24;
  useEffect(() => {
    onHeightChange?.(totalHeight);
  }, [onHeightChange, totalHeight]);

  const inactiveColor = isDark ? INACTIVE_COLOR_DARK : INACTIVE_COLOR_LIGHT;
  const bgBar = isDark ? "rgba(28,28,30,0.97)" : "rgba(255,255,255,0.97)";
  const shadowColor = isDark ? "#000" : "#1c1917";

  const tabs: TabConfig[] = useMemo(
    () =>
      state.routes.map((route) => {
        const opts = descriptors[route.key].options;
        const title = opts.title ?? route.name;
        const pcOnly = PC_ONLY_ROUTES.includes(
          route.name as (typeof PC_ONLY_ROUTES)[number],
        );
        return {
          routeName: route.name,
          label: typeof title === "string" ? title : route.name,
          icon: ICON_MAP[route.name] ?? "doc.text",
          pcOnly,
        };
      }),
    [state.routes, descriptors],
  );

  const islandWidth = Math.min(width - 32, isWeb ? 520 : 400);

  const webShadow = isDark
    ? "0 4px 32px 0 rgba(0,0,0,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.35)"
    : "0 4px 32px 0 rgba(0,0,0,0.12), 0 1.5px 8px 0 rgba(0,0,0,0.06)";

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(20).stiffness(260).mass(0.9)}
      style={[
        styles.wrapper,
        {
          paddingBottom:
            Platform.OS === "web"
              ? insets.bottom + 28
              : insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.island,
          {
            backgroundColor: bgBar,
            width: islandWidth,
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
            ...(isWeb
              ? { boxShadow: webShadow }
              : {
                  shadowColor,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: isDark ? 0.5 : 0.18,
                  shadowRadius: 32,
                  elevation: 20,
                }),
          },
        ]}
      >
        <View style={styles.tabsRowWrapper}>
          <SlidingIndicator
            activeIndex={state.index}
            tabCount={tabs.length}
            islandWidth={islandWidth}
          />
          <View style={styles.tabsRow}>
            {tabs.map((tab, index) => (
              <TabItem
                key={tab.routeName}
                tab={tab}
                isFocused={state.index === index}
                isCompact={isCompact}
                inactiveColor={inactiveColor}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  const event = navigation.emit({
                    type: "tabPress",
                    target: state.routes[index].key,
                    canPreventDefault: true,
                  });
                  if (!event.defaultPrevented) {
                    navigation.navigate(
                      state.routes[index].name,
                      state.routes[index].params,
                    );
                  }
                }}
                onLongPress={() => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: state.routes[index].key,
                  });
                }}
              />
            ))}
          </View>
        </View>
      </View>
      {!isWeb && state.routes[state.index] ? (
        <PcOnlyBadge
          tab={tabs[state.index]}
          visible={tabs[state.index]?.pcOnly === true}
        />
      ) : null}
    </Animated.View>
  );
}

function SlidingIndicator({
  activeIndex,
  tabCount,
  islandWidth,
}: {
  activeIndex: number;
  tabCount: number;
  islandWidth: number;
}) {
  const progress = useSharedValue(activeIndex);

  useEffect(() => {
    progress.value = withTiming(activeIndex, {
      duration: 280,
      easing: COLOR_EASING,
    });
  }, [activeIndex, progress]);

  const pillSize = 38;
  const contentWidth = islandWidth - 20;
  const tabWidth = contentWidth / tabCount;

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const centerX = (progress.value + 0.5) * tabWidth;
    const x = centerX - pillSize / 2 - 2;
    return {
      transform: [{ translateX: x }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.slidingPill,
        { backgroundColor: ACTIVE_BG },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
}

interface TabItemProps {
  tab: TabConfig;
  isFocused: boolean;
  isCompact: boolean;
  inactiveColor: string;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({
  tab,
  isFocused,
  isCompact,
  inactiveColor,
  onPress,
  onLongPress,
}: TabItemProps) {
  const color = isFocused ? ACTIVE_ICON_COLOR : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={tab.label}
    >
      <View style={styles.iconWrapper}>
        <IconSymbol size={isCompact ? 22 : 24} name={tab.icon} color={color} />
      </View>
      {!isCompact ? (
        <Text
          style={[styles.label, { color }, isFocused && styles.labelActive]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

function PcOnlyBadge({ tab, visible }: { tab: TabConfig; visible: boolean }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!tab?.pcOnly) return null;

  return (
    <Animated.View style={[styles.pcBadge, animatedStyle]}>
      <Text style={styles.pcBadgeText}>Solo en PC</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  island: {
    borderRadius: 30,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tabsRowWrapper: {
    flex: 1,
    position: "relative",
    flexDirection: "row",
  },
  slidingPill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 3,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: "700",
  },
  pcBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(234,88,12,0.2)",
    borderRadius: 8,
  },
  pcBadgeText: {
    fontSize: 11,
    color: ACTIVE_BG,
    fontWeight: "600",
  },
});
