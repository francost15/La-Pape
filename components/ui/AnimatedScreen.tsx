import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsFocused } from "expo-router";
import React, { useEffect, useRef } from "react";
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

  // La entrada solo se anima la primera vez: re-animar toda la pantalla en cada
  // cambio de tab competía con la píldora de la tab bar y hacía sentir el
  // cambio trabado. Al volver a un tab ya visitado la transición es instantánea.
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    if (!isFocused) return;
    if (reduceMotion || hasEnteredRef.current) {
      hasEnteredRef.current = true;
      opacity.set(1);
      translateY.set(0);
      return;
    }
    hasEnteredRef.current = true;
    opacity.set(withTiming(1, TIMING_CONFIG));
    translateY.set(withTiming(0, TIMING_CONFIG));
  }, [isFocused, opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle, style]} className={className}>
      {children}
    </Animated.View>
  );
}
