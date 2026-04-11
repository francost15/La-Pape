import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
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
const PILL_W = 48; // Forma de lozenge en lugar de círculo perfecto para un look más "Digital Atelier"
const isWeb = Platform.OS === "web";

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
      entering={FadeInDown.springify().damping(22).stiffness(280).mass(0.8)}
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

function SlidingIndicator({
  activeIndex,
  tabCount,
  islandWidth,
}: {
  activeIndex: number;
  tabCount: number;
  islandWidth: number;
}) {
  const activeTranslation = useSharedValue(activeIndex);

  useEffect(() => {
    activeTranslation.value = withSpring(activeIndex, {
      damping: 24,
      stiffness: 260,
      mass: 0.8,
    });
  }, [activeIndex, activeTranslation]);

  // La isla tiene un padding horizontal total de 24 (12 por lado)
  const contentWidth = islandWidth - 24;
  const tabWidth = contentWidth / tabCount;

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const centerX = (activeTranslation.value + 0.5) * tabWidth;
    const x = centerX - PILL_W / 2;

    return {
      transform: [{ translateX: x }],
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
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.45,
                shadowRadius: 12,
                elevation: 10,
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
    opacity.value = withTiming(visible ? 1 : 0, { duration: 250, easing: COLOR_EASING });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withTiming(visible ? 0 : 4, { duration: 250 }) }],
  }));

  if (!tab?.pcOnly) return null;

  return (
    <Animated.View style={[styles.pcBadge, animatedStyle, { backgroundColor: theme.pcBadgeBg }]}>
      <Text style={[styles.pcBadgeText, { color: theme.pcBadgeText }]}>Solo en PC</Text>
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
    borderRadius: 28,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabsRowWrapper: {
    flex: 1,
    position: "relative",
    flexDirection: "row",
    height: PILL_H, // Constraint to exactly contain the pill
  },
  slidingPill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2, // Perfect pill curve
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
    height: PILL_H, // Exactly spans the wrapper height
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  pcBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  pcBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
