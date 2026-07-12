import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

interface StaggeredEntranceOptions {
  /** Desplazamiento vertical inicial en px (se anima hasta 0). */
  distance?: number;
  /** Duración de la transición en ms. */
  duration?: number;
  /** Retardo por posición: `index * stagger` ms. */
  stagger?: number;
}

/**
 * Entrada escalonada (fade + slide-up) para filas/cards de una lista.
 *
 * Devuelve el `animatedStyle` listo para pasar a un `Animated.View`. Respeta
 * "reducir movimiento": conserva la opacidad final pero omite el desplazamiento.
 * Unifica el bloque duplicado de KpiGrid y VentasPorUsuario.
 */
export function useStaggeredEntrance(
  index: number,
  { distance = 12, duration = 260, stagger = 50 }: StaggeredEntranceOptions = {}
) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(distance);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const delay = index * stagger;
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withTiming(0, { duration }));
  }, [index, opacity, translateY, reduceMotion, duration, stagger]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
