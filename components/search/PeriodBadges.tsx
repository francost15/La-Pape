import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useRef } from "react";
import { LayoutChangeEvent, Platform, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
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

function PeriodBadges({ periodo, onSelect, isMobile }: PeriodBadgesProps) {
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
    [indicatorX, indicatorW]
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
    [periodo, syncIndicator]
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
    borderRadius: 8,
  }));

  const handlePress = useCallback(
    (p: Periodo) => {
      haptic();
      onSelect(p);
    },
    [haptic, onSelect]
  );

  return (
    <View className="relative flex-row rounded-xl bg-gray-100 p-1 dark:bg-neutral-800">
      <Animated.View
        style={[
          indicatorStyle,
          {
            backgroundColor: "#ea580c",
            ...(Platform.OS === "web"
              ? { boxShadow: "0 1px 6px rgba(234,88,12,0.3)" }
              : {
                  shadowColor: "#ea580c",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.45 : 0.3,
                  shadowRadius: 4,
                  elevation: 3,
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
            // Mobile: flex-1 para ocupar todo el ancho
            // Desktop: ancho natural según el texto + padding
            style={{ zIndex: 1, ...(isMobile ? { flex: 1 } : {}) }}
            className={`items-center justify-center ${isMobile ? "py-2.5" : "px-4 py-2"}`}
            accessibilityLabel={`Período ${LABELS[p]}`}
            accessibilityRole="tab"
            accessibilityHint="Aplica este período al resumen"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`text-[13px] font-semibold ${
                isSelected ? "text-white" : "text-gray-500 dark:text-gray-400"
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

export default React.memo(PeriodBadges);
