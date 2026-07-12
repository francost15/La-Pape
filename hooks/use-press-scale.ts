import { animatePressIn, animatePressOut } from "@/lib/animations/press-scale";
import { useCallback } from "react";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

/** Wrapper de press-scale para botones con feedback de escala. */
export function usePressScale(reduceMotion: boolean, pressedScale = 0.97) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    if (reduceMotion) return;
    animatePressIn(scale, pressedScale);
  }, [reduceMotion, pressedScale, scale]);

  const onPressOut = useCallback(() => {
    if (reduceMotion) return;
    animatePressOut(scale);
  }, [reduceMotion, scale]);

  return { animatedStyle, onPressIn, onPressOut, scale };
}
