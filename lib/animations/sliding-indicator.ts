import type { SharedValue } from "react-native-reanimated";
import { Easing, withTiming } from "react-native-reanimated";

// Un solo timing (no dos springs independientes): x y width llegan juntos,
// así los bordes de la píldora se mueven coherentes en vez de estirarse
// y rebotar desfasados entre badges de distinto ancho.
const SLIDING_TIMING = {
  duration: 220,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

export function syncSlidingIndicator(
  indicatorX: SharedValue<number>,
  indicatorW: SharedValue<number>,
  layout: { x: number; width: number },
  animate: boolean
) {
  if (animate) {
    indicatorX.value = withTiming(layout.x, SLIDING_TIMING);
    indicatorW.value = withTiming(layout.width, SLIDING_TIMING);
  } else {
    indicatorX.value = layout.x;
    indicatorW.value = layout.width;
  }
}
