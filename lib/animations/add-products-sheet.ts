import { DesignSystem } from "@/constants/design-system";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { Easing, runOnJS, withSpring, withTiming } from "react-native-reanimated";

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };
const DISMISS_THRESHOLD = 80;

export function animateSheetOpen(
  translateY: SharedValue<number>,
  backdropOpacity: SharedValue<number>,
  height: number,
  reduceMotion: boolean
) {
  backdropOpacity.value = withTiming(1, { duration: 250 });
  if (reduceMotion) {
    translateY.value = 0;
    return;
  }
  translateY.value = height;
  translateY.value = withSpring(0, SPRING_CONFIG);
}

export function animateSheetClose(
  translateY: SharedValue<number>,
  backdropOpacity: SharedValue<number>,
  height: number,
  onClosed: () => void
) {
  backdropOpacity.value = withTiming(0, { duration: 250 });
  translateY.value = withTiming(
    height,
    { duration: 250, easing: Easing.bezier(...DesignSystem.easingCurve.strongOut) },
    () => {
      runOnJS(onClosed)();
    }
  );
}

export function createSheetPanGesture(
  translateY: SharedValue<number>,
  dragOffset: SharedValue<number>,
  onDismiss: () => void
) {
  return Gesture.Pan()
    .onStart(() => {
      dragOffset.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, dragOffset.value + e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 500) {
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });
}
