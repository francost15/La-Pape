import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useRef } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { Periodo } from "./PeriodFilter";

const PERIODOS: Periodo[] = ["semana", "mes", "año", "personalizado"];

const LABELS: Record<Periodo, string> = {
  semana: "Semana",
  mes: "Mes",
  año: "Año",
  personalizado: "Personalizado",
};

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

export interface PeriodBadgesProps {
  periodo: Periodo;
  onSelect: (p: Periodo) => void;
  isMobile: boolean;
}

export default function PeriodBadges({
  periodo,
  onSelect,
  isMobile,
}: PeriodBadgesProps) {
  const colorScheme = useColorScheme();
  const isDark = (colorScheme ?? "light") === "dark";

  const haptic = useHaptic();
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  const layoutsRef = useRef<Record<string, { x: number; width: number }>>({});
  const initializedRef = useRef(false);

  const syncIndicator = useCallback(
    (p: Periodo, animate: boolean) => {
      const layout = layoutsRef.current[p];
      if (!layout) return;
      if (animate) {
        indicatorX.value = withSpring(layout.x, SPRING_CONFIG);
        indicatorW.value = withSpring(layout.width, SPRING_CONFIG);
      } else {
        indicatorX.value = layout.x;
        indicatorW.value = layout.width;
      }
    },
    [indicatorX, indicatorW],
  );

  const handleLayout = useCallback(
    (p: Periodo) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      layoutsRef.current[p] = { x, width };
      if (!initializedRef.current) {
        const allMeasured = PERIODOS.every((k) => layoutsRef.current[k]);
        if (allMeasured) {
          initializedRef.current = true;
          syncIndicator(periodo, false);
        }
      }
    },
    [periodo, syncIndicator],
  );

  useEffect(() => {
    if (initializedRef.current) syncIndicator(periodo, true);
  }, [periodo, syncIndicator]);

  const indicatorStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: indicatorX.value,
    width: indicatorW.value,
    top: 0,
    bottom: 0,
    borderRadius: isMobile ? 10 : 12,
  }));

  const handlePress = useCallback(
    (p: Periodo) => {
      haptic();
      onSelect(p);
    },
    [haptic, onSelect],
  );

  return (
    <View
      className={`flex-row relative ${
        isMobile
          ? "rounded-xl p-1 bg-gray-100 dark:bg-neutral-800"
          : "rounded-2xl p-1.5 bg-gray-100 dark:bg-neutral-800/80"
      }`}
    >
      <Animated.View
        style={[
          indicatorStyle,
          {
            backgroundColor: "#ea580c",
            ...(Platform.OS === "web"
              ? { boxShadow: "0 2px 8px rgba(234,88,12,0.35)" }
              : {
                  shadowColor: "#ea580c",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.5 : 0.35,
                  shadowRadius: 6,
                  elevation: 4,
                }),
          },
        ]}
      />
      {PERIODOS.map((p) => {
        const isSelected = periodo === p;
        return (
          <Pressable
            key={p}
            onLayout={handleLayout(p)}
            onPress={() => handlePress(p)}
            style={{ flex: 1, zIndex: 1 }}
            className={`items-center justify-center ${
              isMobile ? "py-2.5" : "py-3 px-5"
            }`}
            accessibilityLabel={`Filtrar por ${LABELS[p]}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`font-semibold ${isMobile ? "text-[13px]" : "text-sm"} ${
                isSelected
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {LABELS[p]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
