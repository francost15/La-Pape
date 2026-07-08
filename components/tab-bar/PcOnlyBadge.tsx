import { useReducedMotion } from "@/hooks/use-reduced-motion";
import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { COLOR_EASING } from "./constants";
import { styles } from "./styles";
import type { PcOnlyBadgeProps } from "@/interface/layout";

export const PcOnlyBadge = React.memo(function PcOnlyBadge({
  tab,
  visible,
  theme,
}: PcOnlyBadgeProps) {
  const opacity = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 250, easing: COLOR_EASING });
  }, [visible, opacity]);

  // Reduced motion: conservamos el fade (comunica el cambio de estado) pero
  // eliminamos el desplazamiento vertical dejando la posición final directa
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: reduceMotion ? 0 : withTiming(visible ? 0 : 4, { duration: 250 }) }],
  }));

  if (!tab?.pcOnly) return null;

  return (
    <Animated.View style={[styles.pcBadge, animatedStyle, { backgroundColor: theme.pcBadgeBg }]}>
      <Text style={[styles.pcBadgeText, { color: theme.pcBadgeText }]}>Solo en PC</Text>
    </Animated.View>
  );
});
