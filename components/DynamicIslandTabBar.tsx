import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import React, { useEffect, useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const PC_ONLY_ROUTES = ["resumen"] as const;

/* ─── Digital Atelier — Tab Bar Colors ─────────────────────────── */
const ACTIVE_BG = "#ea580c";
const ACTIVE_ICON_COLOR = "#ffffff";

const THEME = {
  light: {
    barBg: "rgba(255,255,255,0.72)",
    border: "rgba(0,0,0,0.06)",
    shadow: "#1A1A1A",
    shadowOpacity: 0.12,
    webShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.04)",
    inactiveIcon: "#9CA3AF",
    inactiveLabel: "#9CA3AF",
    pcBadgeBg: "rgba(234,88,12,0.08)",
    pcBadgeText: "#c2410c",
  },
  dark: {
    barBg: "rgba(20,24,32,0.72)",
    border: "rgba(255,255,255,0.08)",
    shadow: "#000000",
    shadowOpacity: 0.5,
    webShadow: "0 12px 48px rgba(0,0,0,0.4), 0 1px 6px rgba(0,0,0,0.2)",
    inactiveIcon: "#5A6478",
    inactiveLabel: "#5A6478",
    pcBadgeBg: "rgba(249,115,22,0.12)",
    pcBadgeText: "#f97316",
  },
} as const;

const COLOR_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

const ICON_MAP: Record<string, IconSymbolName> = {
  ventas: "cart.fill",
  productos: "bag.fill",
  history: "clock.fill",
  resumen: "doc.text",
};

interface TabConfig {
  routeName: string;
  routeKey: string;
  label: string;
  icon: IconSymbolName;
  pcOnly?: boolean;
}

const ESTIMATED_ISLAND_HEIGHT = 72;
const PILL_H = 40;
const PILL_BORDER_RADIUS = 20;
const isWeb = Platform.OS === "web";

export function DynamicIslandTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
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
        const pcOnly = PC_ONLY_ROUTES.includes(
          route.name as (typeof PC_ONLY_ROUTES)[number],
        );
        return {
          routeName: route.name,
          routeKey: route.key,
          label: typeof title === "string" ? title : route.name,
          icon: ICON_MAP[route.name] ?? "doc.text",
          pcOnly,
        };
      }),
    [state.routes, descriptors],
  );

  const activeIndex = state.index;
  const islandWidth = Math.min(width - 32, isWeb ? 480 : 380);

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(22).stiffness(280).mass(0.8)}
      style={[
        styles.wrapper,
        {
          paddingBottom: isWeb ? insets.bottom + 24 : insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={isDark ? 50 : 65}
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
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                }
              : {
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: theme.shadowOpacity,
                  shadowRadius: 24,
                  elevation: 16,
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

function SlidingIndicator({
  activeIndex,
  tabCount,
  islandWidth,
}: {
  activeIndex: number;
  tabCount: number;
  islandWidth: number;
}) {
  const prevIndex = useSharedValue(activeIndex);
  const activeTranslation = useSharedValue(activeIndex);

  useEffect(() => {
    prevIndex.value = activeTranslation.value;
    activeTranslation.value = withSpring(activeIndex, {
      damping: 18,
      stiffness: 140,
      mass: 0.8,
    });
  }, [activeIndex, activeTranslation, prevIndex]);

  const contentWidth = islandWidth - 20;
  const tabWidth = contentWidth / tabCount;

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const centerX = (activeTranslation.value + 0.5) * tabWidth;
    const x = centerX - PILL_H / 2 - 2;

    return {
      transform: [
        { translateX: x },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.slidingPill,
        {
          backgroundColor: ACTIVE_BG,
          ...(isWeb
            ? {
                boxShadow: "0 4px 16px rgba(234,88,12,0.35)",
              }
            : {
                shadowColor: ACTIVE_BG,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
              }),
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
}

type ThemeColors = (typeof THEME)["light"] | (typeof THEME)["dark"];

interface TabItemProps {
  tab: TabConfig;
  isFocused: boolean;
  isCompact: boolean;
  theme: ThemeColors;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem = React.memo(function TabItem({
  tab,
  isFocused,
  isCompact,
  theme,
  onPress,
  onLongPress,
}: TabItemProps) {
  const scale = useSharedValue(1);
  const iconScale = useDerivedValue(() => {
    return withSpring(isFocused ? 1.15 : 1, { damping: 12, stiffness: 200 });
  });

  const iconColor = isFocused ? ACTIVE_ICON_COLOR : theme.inactiveIcon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * iconScale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={[styles.tabItemInner, animatedStyle]}>
        <IconSymbol
          size={isCompact ? 20 : 22}
          name={tab.icon}
          color={iconColor}
        />
      </Animated.View>
    </Pressable>
  );
});

const PcOnlyBadge = React.memo(function PcOnlyBadge({
  tab,
  visible,
  theme,
}: {
  tab: TabConfig;
  visible: boolean;
  theme: ThemeColors;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!tab?.pcOnly) return null;

  return (
    <Animated.View
      style={[
        styles.pcBadge,
        animatedStyle,
        { backgroundColor: theme.pcBadgeBg },
      ]}
    >
      <Text style={[styles.pcBadgeText, { color: theme.pcBadgeText }]}>
        Solo en PC
      </Text>
    </Animated.View>
  );
});

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
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingVertical: 6,
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
    width: PILL_H,
    height: PILL_H,
    borderRadius: PILL_BORDER_RADIUS,
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
    paddingVertical: 2,
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  pcBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pcBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
