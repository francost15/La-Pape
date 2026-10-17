import type { Periodo } from "@/interface";
import type { PeriodBadgesProps } from "@/interface/product-search";
import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import { syncSlidingIndicator } from "@/lib/animations/sliding-indicator";
import React, { useCallback, useEffect, useRef } from "react";
import { LayoutChangeEvent, Platform, Pressable, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const PERIODOS: Periodo[] = ["semana", "mes", "año", "personalizado"];

const LABELS: Record<Periodo, string> = {
  semana: "Semana",
  mes: "Mes",
  año: "Año",
  personalizado: "Personalizado",
};

// Mismo timing que la píldora (syncSlidingIndicator) para que el color del
// label acompañe su llegada en vez de saltar de golpe antes que ella
const LABEL_TIMING = { duration: 220, easing: Easing.bezier(0.25, 1, 0.5, 1) };

const BadgeLabel = React.memo(function BadgeLabel({
  label,
  selected,
  isDark,
}: {
  label: string;
  selected: boolean;
  isDark: boolean;
}) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(selected ? 1 : 0, LABEL_TIMING));
  }, [selected, progress]);

  const colorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [isDark ? "#9ca3af" : "#6b7280", "#ffffff"]),
  }));

  return (
    <Animated.Text className="text-[13px] font-semibold" style={colorStyle}>
      {label}
    </Animated.Text>
  );
});

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
      syncSlidingIndicator(indicatorX, indicatorW, layout, animate);
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
    <View className="relative flex-row rounded-xl bg-canvas p-1">
      <Animated.View
        style={[
          indicatorStyle,
          {
            backgroundColor: AppColors.primary,
            ...(Platform.OS === "web"
              ? { boxShadow: "0 1px 6px rgba(234,88,12,0.3)" }
              : {
                  shadowColor: AppColors.primary,
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
            style={{
              zIndex: 1,
              // Mobile: flex-1 reparte ancho para touch targets más grandes; desktop mantiene ancho natural
              ...(isMobile ? { flex: 1 } : {}),
            }}
            className={`items-center justify-center ${isMobile ? "py-2.5" : "px-4 py-2"}`}
            accessibilityLabel={`Período ${LABELS[p]}`}
            accessibilityRole="tab"
            accessibilityHint="Aplica este período al resumen"
            accessibilityState={{ selected: isSelected }}
          >
            <BadgeLabel label={LABELS[p]} selected={isSelected} isDark={isDark} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default React.memo(PeriodBadges);
