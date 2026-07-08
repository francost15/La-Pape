import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { AnimatedScreenProps } from "@/interface/ui";

const TIMING_CONFIG = {
  duration: 260,
  // Ease-out fuerte (no el débil `ease` de CSS): arranca rápido para dar
  // respuesta inmediata en el frame que el usuario más mira.
  easing: Easing.bezier(0.23, 1, 0.32, 1),
};

export default function AnimatedScreen({ children, style, className }: AnimatedScreenProps) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (isFocused) {
      if (reduceMotion) {
        opacity.value = 1;
        translateY.value = 0;
      } else {
        opacity.value = 0;
        translateY.value = 6;
        opacity.value = withTiming(1, TIMING_CONFIG);
        translateY.value = withTiming(0, TIMING_CONFIG);
      }
    }
  }, [isFocused, opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle, style]} className={className}>
      {children}
    </Animated.View>
  );
}
