import type { SharedValue } from "react-native-reanimated";
import { withSpring } from "react-native-reanimated";

const PRESS_SPRING = { damping: 15, stiffness: 400, mass: 0.5 };

export function animatePressIn(scale: SharedValue<number>, pressedScale = 0.97) {
  scale.value = withSpring(pressedScale, PRESS_SPRING);
}

export function animatePressOut(scale: SharedValue<number>) {
  scale.value = withSpring(1, PRESS_SPRING);
}
