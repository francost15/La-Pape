import { DesignSystem } from "@/constants/design-system";
import type { SharedValue } from "react-native-reanimated";
import { withSequence, withSpring, withTiming } from "react-native-reanimated";

export function playCartSuccessAnimation(
  successOpacity: SharedValue<number>,
  successScale: SharedValue<number>,
  reduceMotion: boolean
) {
  successOpacity.value = withTiming(1, { duration: DesignSystem.animations.fast });
  if (reduceMotion) {
    successScale.value = 1;
    return;
  }
  successScale.value = withSequence(
    withSpring(1.2, { damping: 5, stiffness: 300 }),
    withSpring(1, { damping: 6, stiffness: 350 })
  );
}

export function resetCartSuccessAnimation(
  successOpacity: SharedValue<number>,
  successScale: SharedValue<number>
) {
  successScale.value = 0.5;
  successOpacity.value = 0;
}

export function fadeCartListOut(listOpacity: SharedValue<number>) {
  listOpacity.value = withTiming(0, { duration: DesignSystem.animations.normal });
}

export function showCartList(listOpacity: SharedValue<number>) {
  listOpacity.value = 1;
}

export function springCartListIn(listOpacity: SharedValue<number>) {
  listOpacity.value = withSpring(1, { damping: 10, stiffness: 200 });
}
