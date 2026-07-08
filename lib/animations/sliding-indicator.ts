import type { SharedValue } from "react-native-reanimated";
import { withSpring } from "react-native-reanimated";

const SLIDING_SPRING = { damping: 18, stiffness: 200, mass: 0.8 };

export function syncSlidingIndicator(
  indicatorX: SharedValue<number>,
  indicatorW: SharedValue<number>,
  layout: { x: number; width: number },
  animate: boolean
) {
  if (animate) {
    indicatorX.value = withSpring(layout.x, SLIDING_SPRING);
    indicatorW.value = withSpring(layout.width, SLIDING_SPRING);
  } else {
    indicatorX.value = layout.x;
    indicatorW.value = layout.width;
  }
}
