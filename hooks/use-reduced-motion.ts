import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

/**
 * useReducedMotion — respeta la preferencia del sistema de "reducir movimiento".
 *
 * Reduced motion NO significa cero animación: significa menos movimiento y más
 * suave. La convención en la app es conservar transiciones de opacidad/color
 * (ayudan a comprender el cambio de estado) y eliminar los transforms de
 * posición/escala. Cada componente decide cómo degradar consultando este flag.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const update = () => setReduceMotion(media.matches);
      update();
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}
