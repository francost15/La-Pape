import type { SharedValue } from "react-native-reanimated";
import { withSpring } from "react-native-reanimated";

const PRESS_SPRING = { damping: 15, stiffness: 400, mass: 0.5 };

export function animateCircleButtonPressIn(scale: SharedValue<number>) {
  scale.value = withSpring(0.94, PRESS_SPRING);
}

export function animateCircleButtonPressOut(scale: SharedValue<number>) {
  scale.value = withSpring(1, PRESS_SPRING);
}
