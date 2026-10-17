import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { ACTIVE_BG, isWeb, PILL_W } from "./constants";
import { styles } from "./styles";
import type { SlidingIndicatorProps } from "@/interface/layout";

export function SlidingIndicator({ activeIndex, tabCount, islandWidth }: SlidingIndicatorProps) {
  const activeTranslation = useSharedValue(activeIndex);

  useEffect(() => {
    activeTranslation.set(
      withSpring(activeIndex, {
        damping: 24,
        stiffness: 260,
        mass: 0.8,
      })
    );
  }, [activeIndex, activeTranslation]);

  // La isla tiene un padding horizontal total de 24 (12 por lado)
  const contentWidth = islandWidth - 24;
  const tabWidth = contentWidth / tabCount;

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const centerX = (activeTranslation.get() + 0.5) * tabWidth;
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
