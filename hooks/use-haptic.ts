import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Platform } from "react-native";

export function useHaptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
) {
  return useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(style);
  }, [style]);
}
