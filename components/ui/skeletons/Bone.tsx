import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SkeletonProps } from "@/interface/ui";
import React, { useEffect } from "react";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/**
 * Bone — bloque base para skeletons compuestos.
 *
 * Mismo pulso de opacidad que components/ui/Skeleton.tsx, pero además respeta
 * "reducir movimiento": en ese caso el bloque queda estático a opacidad media
 * (el placeholder sigue comunicando "cargando" sin parpadear).
 */
export function Bone({ style, className, width, height, borderRadius = 8 }: SkeletonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 0.5 : 0.3);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(opacity);
      opacity.value = 0.5;
      return;
    }
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
      -1, // Infinito
      true
    );
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Base neutra por tema: gris claro en light, surfaceHover en dark (igual que Skeleton.tsx)
  const backgroundColor = isDark ? AppColors.dark.surfaceHover : "#E5E7EB";

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}
