import { DesignSystem } from "@/constants/design-system";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { Easing, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };
const DISMISS_THRESHOLD = 80;

export function animateSheetOpen(
  translateY: SharedValue<number>,
  backdropOpacity: SharedValue<number>,
  height: number,
  reduceMotion: boolean
) {
  backdropOpacity.set(withTiming(1, { duration: 250 }));
  if (reduceMotion) {
    translateY.set(0);
    return;
  }
  translateY.set(height);
  translateY.set(withSpring(0, SPRING_CONFIG));
}

export function animateSheetClose(
  translateY: SharedValue<number>,
  backdropOpacity: SharedValue<number>,
  height: number,
  onClosed: () => void
) {
  backdropOpacity.set(withTiming(0, { duration: 250 }));
  translateY.set(
    withTiming(
      height,
      { duration: 250, easing: Easing.bezier(...DesignSystem.easingCurve.strongOut) },
      () => {
        scheduleOnRN(onClosed);
      }
    )
  );
}

export function createSheetPanGesture(
  translateY: SharedValue<number>,
  dragOffset: SharedValue<number>,
  onDismiss: () => void
) {
  return Gesture.Pan()
    .onStart(() => {
      dragOffset.set(translateY.get());
    })
    .onUpdate((e) => {
      translateY.set(Math.max(0, dragOffset.get() + e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 500) {
        scheduleOnRN(onDismiss);
      } else {
        translateY.set(withSpring(0, SPRING_CONFIG));
      }
    });
}
